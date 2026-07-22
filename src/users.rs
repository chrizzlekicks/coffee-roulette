use argon2::{
    Algorithm, Argon2, Params, PasswordHash, PasswordHasher, PasswordVerifier, Version,
    password_hash::SaltString,
};
use axum::{
    Json, Router,
    extract::State,
    http::StatusCode,
    routing::{get, post},
};
use axum_extra::extract::cookie::{Cookie, PrivateCookieJar, SameSite};
use serde::{Deserialize, Serialize};
use sqlx::postgres::PgDatabaseError;
use time::Duration;
use uuid::Uuid;

use crate::{
    AppState,
    auth::{AuthUser, SESSION_COOKIE, User},
    error::{AppError, Result},
};

const SESSION_MAX_AGE: Duration = Duration::days(30);
const DUMMY_PASSWORD_HASH: &str =
    "$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHQ$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/users", post(create))
        .route("/session", post(login).delete(logout))
        .route("/me", get(me).patch(update))
}

#[derive(Deserialize)]
struct CreateUser {
    username: String,
    password: String,
    password_confirmation: String,
}

#[derive(Deserialize)]
struct Credentials {
    username: String,
    password: String,
}

#[derive(Deserialize)]
struct UpdateUser {
    username: Option<String>,
    password: Option<String>,
    password_confirmation: Option<String>,
    current_password: Option<String>,
    active: Option<bool>,
}

#[derive(Serialize)]
struct UserDto {
    id: Uuid,
    username: String,
    active: bool,
}

impl From<User> for UserDto {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            username: user.username,
            active: user.active,
        }
    }
}

async fn create(
    State(state): State<AppState>,
    Json(input): Json<CreateUser>,
) -> Result<(StatusCode, Json<UserDto>)> {
    let username = username(input.username)?;
    let password = confirmed_password(input.password, input.password_confirmation)?;
    let password_hash = password_hash(password).await?;

    sqlx::query_as(
        "INSERT INTO users (username, password_hash) VALUES ($1, $2) \
         RETURNING id, username, password_hash, session_token, active",
    )
    .bind(username)
    .bind(password_hash)
    .fetch_one(&state.pool)
    .await
    .map_err(write_error)
    .map(|user: User| (StatusCode::CREATED, Json(user.into())))
}

async fn login(
    State(state): State<AppState>,
    jar: PrivateCookieJar,
    Json(input): Json<Credentials>,
) -> Result<(PrivateCookieJar, Json<UserDto>)> {
    let username = username(input.username)?;
    let user: Option<User> = sqlx::query_as(
        "SELECT id, username, password_hash, session_token, active FROM users WHERE username = $1",
    )
    .bind(username)
    .fetch_optional(&state.pool)
    .await?;
    let hash = user
        .as_ref()
        .map_or(DUMMY_PASSWORD_HASH, |user| &user.password_hash)
        .to_owned();
    let password_matches = verify_password(input.password, hash).await?;
    let user = user
        .filter(|_| password_matches)
        .ok_or_else(AppError::unauthorized)?;

    let token = Uuid::new_v4();
    sqlx::query("UPDATE users SET session_token = $2 WHERE id = $1")
        .bind(user.id)
        .bind(token)
        .execute(&state.pool)
        .await?;
    let dto = UserDto::from(user);

    Ok((
        jar.add(session_cookie(token, state.secure_cookies)),
        Json(dto),
    ))
}

async fn logout(
    State(state): State<AppState>,
    jar: PrivateCookieJar,
    AuthUser(user): AuthUser,
) -> Result<(PrivateCookieJar, StatusCode)> {
    sqlx::query("UPDATE users SET session_token = NULL WHERE id = $1 AND session_token = $2")
        .bind(user.id)
        .bind(user.session_token)
        .execute(&state.pool)
        .await?;
    let cookie = Cookie::build((SESSION_COOKIE, ""))
        .path("/")
        .max_age(Duration::ZERO)
        .build();

    Ok((jar.remove(cookie), StatusCode::NO_CONTENT))
}

async fn me(user: AuthUser) -> Json<UserDto> {
    Json(user.0.into())
}

async fn update(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    Json(input): Json<UpdateUser>,
) -> Result<Json<UserDto>> {
    if input.username.is_none()
        && input.password.is_none()
        && input.password_confirmation.is_none()
        && input.active.is_none()
    {
        return Err(AppError::bad_request("no changes supplied"));
    }

    let username = input.username.map(username).transpose()?;
    let password_hash = match (input.password, input.password_confirmation) {
        (None, None) => None,
        (Some(password), Some(confirmation)) => {
            let password = confirmed_password(password, confirmation)?;
            let current = input.current_password.ok_or_else(|| {
                AppError::new(
                    StatusCode::UNPROCESSABLE_ENTITY,
                    "current password is required",
                )
            })?;
            if !verify_password(current, user.password_hash).await? {
                return Err(AppError::unauthorized());
            }
            Some(password_hash(password).await?)
        }
        _ => {
            return Err(AppError::new(
                StatusCode::UNPROCESSABLE_ENTITY,
                "password confirmation required",
            ));
        }
    };

    sqlx::query_as(
        "UPDATE users \
         SET username = COALESCE($2, username), password_hash = COALESCE($3, password_hash), \
             active = COALESCE($4, active) \
         WHERE id = $1 \
         RETURNING id, username, password_hash, session_token, active",
    )
    .bind(user.id)
    .bind(username)
    .bind(password_hash)
    .bind(input.active)
    .fetch_one(&state.pool)
    .await
    .map_err(write_error)
    .map(|user: User| Json(user.into()))
}

fn username(value: String) -> Result<String> {
    let value = value.trim().to_lowercase();
    if value.is_empty() {
        Err(AppError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "username is required",
        ))
    } else {
        Ok(value)
    }
}

fn confirmed_password(password: String, confirmation: String) -> Result<String> {
    valid_password(&password)?;
    if password != confirmation {
        return Err(AppError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "password confirmation does not match",
        ));
    }

    Ok(password)
}

async fn password_hash(password: String) -> Result<String> {
    tokio::task::spawn_blocking(move || {
        Argon2::new(Algorithm::Argon2id, Version::V0x13, Params::default())
            .hash_password(
                password.as_bytes(),
                &SaltString::encode_b64(Uuid::new_v4().as_bytes())
                    .map_err(|_| AppError::internal())?,
            )
            .map(|hash| hash.to_string())
            .map_err(|_| AppError::internal())
    })
    .await
    .map_err(|error| {
        tracing::error!(?error, "password hashing task failed");
        AppError::internal()
    })?
}

async fn verify_password(password: String, hash: String) -> Result<bool> {
    tokio::task::spawn_blocking(move || {
        let parsed = PasswordHash::new(&hash).map_err(|_| AppError::internal())?;
        Ok(
            Argon2::new(Algorithm::Argon2id, Version::V0x13, Params::default())
                .verify_password(password.as_bytes(), &parsed)
                .is_ok(),
        )
    })
    .await
    .map_err(|error| {
        tracing::error!(?error, "password verification task failed");
        AppError::internal()
    })?
}

fn valid_password(password: &str) -> Result<()> {
    let length = password.chars().count();
    if (12..=128).contains(&length)
        && password
            .chars()
            .any(|character| character.is_ascii_uppercase())
        && password.chars().any(|character| character.is_ascii_digit())
        && password
            .chars()
            .any(|character| r#"!@#$%^&*(),.?":{}|<>"#.contains(character))
    {
        Ok(())
    } else {
        Err(AppError::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "password must be 12 to 128 characters and contain an uppercase letter, number, and special character",
        ))
    }
}

fn session_cookie(token: Uuid, secure: bool) -> Cookie<'static> {
    Cookie::build((SESSION_COOKIE, token.to_string()))
        .http_only(true)
        .same_site(SameSite::Lax)
        .secure(secure)
        .path("/")
        .max_age(SESSION_MAX_AGE)
        .build()
}

fn write_error(error: sqlx::Error) -> AppError {
    if let sqlx::Error::Database(database) = &error
        && database
            .try_downcast_ref::<PgDatabaseError>()
            .is_some_and(|database| database.code() == "23505")
    {
        return AppError::conflict("username already exists");
    }

    tracing::error!(?error, "database write error");
    AppError::internal()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalizes_identity_and_enforces_password_complexity() {
        assert_eq!(username(" Alice ".into()).unwrap(), "alice");
        assert!(valid_password("Short1!").is_err());
        assert!(valid_password(&format!("A1!{}", "a".repeat(126))).is_err());
        assert!(valid_password("lowercase123!").is_err());
        assert!(valid_password("NoNumbersHere!").is_err());
        assert!(valid_password("NoSpecialChar123").is_err());
        assert!(valid_password("ValidPassword123!").is_ok());
    }

    #[tokio::test]
    async fn password_hashes_are_argon2id_and_verifiable() {
        let password =
            confirmed_password("ValidPassword123!".into(), "ValidPassword123!".into()).unwrap();
        let hash = password_hash(password).await.unwrap();
        assert!(hash.starts_with("$argon2id$"));
        assert!(
            verify_password("ValidPassword123!".into(), hash.clone())
                .await
                .unwrap()
        );
        assert!(
            !verify_password("wrong password".into(), hash)
                .await
                .unwrap()
        );
        assert!(
            !verify_password("wrong password".into(), DUMMY_PASSWORD_HASH.into())
                .await
                .unwrap()
        );
    }

    #[test]
    fn session_cookie_is_private_cookie_ready() {
        let cookie = session_cookie(Uuid::nil(), true);
        assert_eq!(cookie.http_only(), Some(true));
        assert_eq!(cookie.same_site(), Some(SameSite::Lax));
        assert_eq!(cookie.secure(), Some(true));
        assert_eq!(cookie.max_age(), Some(SESSION_MAX_AGE));
    }

    #[tokio::test]
    async fn password_change_requires_current_password_and_logout_revokes_session() {
        use axum::{
            body::Body,
            http::{Request, header},
        };
        use axum_extra::extract::cookie::Key;
        use sqlx::postgres::PgPoolOptions;
        use std::{env, path::PathBuf};
        use tower::ServiceExt;

        let Ok(url) = env::var("TEST_DATABASE_URL") else {
            return;
        };
        let pool = PgPoolOptions::new().connect(&url).await.unwrap();
        crate::MIGRATOR.run(&pool).await.unwrap();
        let username = format!("security-{}", Uuid::new_v4());
        let hash = password_hash("a secure pass".into()).await.unwrap();
        let user_id: Uuid = sqlx::query_scalar(
            "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id",
        )
        .bind(&username)
        .bind(hash)
        .fetch_one(&pool)
        .await
        .unwrap();
        let app = crate::router(
            AppState {
                pool: pool.clone(),
                cookie_key: Key::from(&[0; 64]),
                origin: "http://localhost".into(),
                secure_cookies: false,
            },
            PathBuf::from("."),
        );

        let response = app
            .clone()
            .oneshot(
                Request::post("/api/session")
                    .header(header::ORIGIN, "http://localhost")
                    .header(header::CONTENT_TYPE, "application/json")
                    .body(Body::from(format!(
                        r#"{{"username":"{username}","password":"a secure pass"}}"#
                    )))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);
        let cookie = response.headers()[header::SET_COOKIE]
            .to_str()
            .unwrap()
            .split(';')
            .next()
            .unwrap()
            .to_owned();

        let response = app
            .clone()
            .oneshot(
                Request::patch("/api/me")
                    .header(header::ORIGIN, "http://localhost")
                    .header(header::CONTENT_TYPE, "application/json")
                    .header(header::COOKIE, &cookie)
                    .body(Body::from(
                        r#"{"password":"NewValidPassword456!","password_confirmation":"NewValidPassword456!"}"#,
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::UNPROCESSABLE_ENTITY);

        let response = app
            .clone()
            .oneshot(
                Request::patch("/api/me")
                    .header(header::ORIGIN, "http://localhost")
                    .header(header::CONTENT_TYPE, "application/json")
                    .header(header::COOKIE, &cookie)
                    .body(Body::from(
                        r#"{"password":"NewValidPassword456!","password_confirmation":"NewValidPassword456!","current_password":"wrong password"}"#,
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);

        let response = app
            .clone()
            .oneshot(
                Request::patch("/api/me")
                    .header(header::ORIGIN, "http://localhost")
                    .header(header::CONTENT_TYPE, "application/json")
                    .header(header::COOKIE, &cookie)
                    .body(Body::from(
                        r#"{"password":"NewValidPassword456!","password_confirmation":"NewValidPassword456!","current_password":"a secure pass"}"#,
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::OK);

        let response = app
            .clone()
            .oneshot(
                Request::delete("/api/session")
                    .header(header::ORIGIN, "http://localhost")
                    .header(header::COOKIE, &cookie)
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::NO_CONTENT);

        let response = app
            .oneshot(
                Request::get("/api/me")
                    .header(header::COOKIE, cookie)
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::UNAUTHORIZED);

        sqlx::query("DELETE FROM users WHERE id = $1")
            .bind(user_id)
            .execute(&pool)
            .await
            .unwrap();
    }
}
