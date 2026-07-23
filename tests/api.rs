use axum::{
    body::{Body, to_bytes},
    http::{Request, StatusCode, header},
};
use axum_extra::extract::cookie::Key;
use coffee_roulette::{AppState, MIGRATOR, router};
use serde_json::{Value, json};
use sqlx::{PgPool, postgres::PgPoolOptions};
use std::{env, path::PathBuf};
use tower::ServiceExt;
use uuid::Uuid;

const ORIGIN: &str = "http://localhost:5173";
const PASSWORD: &str = "ValidPassword123!";

async fn setup() -> (PgPool, axum::Router) {
    let url = env::var("TEST_DATABASE_URL")
        .or_else(|_| env::var("DATABASE_URL"))
        .expect("DATABASE_URL must point to an existing PostgreSQL test database");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&url)
        .await
        .unwrap();
    MIGRATOR.run(&pool).await.unwrap();
    let app = router(
        AppState {
            pool: pool.clone(),
            cookie_key: Key::from(&[7; 64]),
            origin: ORIGIN.into(),
            secure_cookies: false,
        },
        PathBuf::from("."),
    );
    (pool, app)
}

async fn request(
    app: &axum::Router,
    method: &str,
    path: &str,
    body: Value,
    cookie: Option<&str>,
    origin: Option<&str>,
) -> (StatusCode, Value, String) {
    let mut request = Request::builder()
        .method(method)
        .uri(path)
        .header(header::CONTENT_TYPE, "application/json");
    if let Some(cookie) = cookie {
        request = request.header(header::COOKIE, cookie);
    }
    if let Some(origin) = origin {
        request = request.header(header::ORIGIN, origin);
    }
    let response = app
        .clone()
        .oneshot(request.body(Body::from(body.to_string())).unwrap())
        .await
        .unwrap();
    let status = response.status();
    let cookie = response
        .headers()
        .get(header::SET_COOKIE)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.split(';').next())
        .unwrap_or("")
        .to_owned();
    let bytes = to_bytes(response.into_body(), usize::MAX).await.unwrap();
    (
        status,
        serde_json::from_slice(&bytes).unwrap_or(Value::Null),
        cookie,
    )
}

async fn signup(app: &axum::Router, username: &str, password: &str) -> (StatusCode, Value) {
    let (status, value, _) = request(
        app,
        "POST",
        "/api/users",
        json!({"username": username, "password": password, "password_confirmation": password}),
        None,
        Some(ORIGIN),
    )
    .await;
    (status, value)
}

async fn login(app: &axum::Router, username: &str, password: &str) -> (StatusCode, Value, String) {
    request(
        app,
        "POST",
        "/api/session",
        json!({"username": username, "password": password}),
        None,
        Some(ORIGIN),
    )
    .await
}

#[tokio::test]
async fn api_auth_profiles_sessions_and_origin() {
    let (pool, app) = setup().await;
    let name = format!(" User-{} ", Uuid::new_v4());
    let normalized = name.trim().to_lowercase();
    let (status, value) = signup(&app, &name, PASSWORD).await;
    assert_eq!(status, StatusCode::CREATED);
    assert_eq!(value["username"], normalized);
    assert_eq!(
        signup(&app, " ", PASSWORD).await.0,
        StatusCode::UNPROCESSABLE_ENTITY
    );
    assert_eq!(
        signup(&app, &normalized, PASSWORD).await.0,
        StatusCode::CONFLICT
    );
    assert_eq!(
        signup(&app, &format!("bad-{}", Uuid::new_v4()), "wrong")
            .await
            .0,
        StatusCode::UNPROCESSABLE_ENTITY
    );
    assert_eq!(request(&app, "POST", "/api/users", json!({"username": format!("mismatch-{}", Uuid::new_v4()), "password": PASSWORD, "password_confirmation": "DifferentPassword123!"}), None, Some(ORIGIN)).await.0, StatusCode::UNPROCESSABLE_ENTITY);
    assert_eq!(request(&app, "POST", "/api/users", json!({"username": format!("no-origin-{}", Uuid::new_v4()), "password": PASSWORD, "password_confirmation": PASSWORD}), None, None).await.0, StatusCode::BAD_REQUEST);
    assert_eq!(
        login(&app, &normalized, "wrong").await.0,
        StatusCode::UNAUTHORIZED
    );
    assert_eq!(
        login(&app, "unknown-user", PASSWORD).await.0,
        StatusCode::UNAUTHORIZED
    );
    let (_, _, cookie) = login(&app, &normalized, PASSWORD).await;
    assert!(!cookie.is_empty());
    let (status, me, _) = request(&app, "GET", "/api/me", json!(null), Some(&cookie), None).await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(me["username"], normalized);
    assert_eq!(
        request(
            &app,
            "PATCH",
            "/api/me",
            json!({"username": format!(" renamed-{} ", Uuid::new_v4()),"active":false}),
            Some(&cookie),
            Some(ORIGIN)
        )
        .await
        .0,
        StatusCode::OK
    );
    let (_, me, _) = request(&app, "GET", "/api/me", json!(null), Some(&cookie), None).await;
    let renamed = me["username"].as_str().unwrap().to_owned();
    assert!(renamed.starts_with("renamed-"));
    assert_eq!(me["active"], false);
    assert_eq!(request(&app, "PATCH", "/api/me", json!({"password":"NewPassword123!","password_confirmation":"NewPassword123!","current_password":PASSWORD}), Some(&cookie), Some(ORIGIN)).await.0, StatusCode::OK);
    assert_eq!(
        login(&app, &renamed, PASSWORD).await.0,
        StatusCode::UNAUTHORIZED
    );
    let (_, _, new_cookie) = login(&app, &renamed, "NewPassword123!").await;
    assert_eq!(
        request(
            &app,
            "DELETE",
            "/api/session",
            json!(null),
            Some(&new_cookie),
            Some(ORIGIN)
        )
        .await
        .0,
        StatusCode::NO_CONTENT
    );
    assert_eq!(
        request(&app, "GET", "/api/me", json!(null), Some(&new_cookie), None)
            .await
            .0,
        StatusCode::UNAUTHORIZED
    );
    assert_eq!(
        request(&app, "GET", "/api/matches", json!(null), None, None)
            .await
            .0,
        StatusCode::UNAUTHORIZED
    );
    assert_eq!(
        request(
            &app,
            "GET",
            "/api/matches",
            json!(null),
            Some(&new_cookie),
            None
        )
        .await
        .0,
        StatusCode::UNAUTHORIZED
    );
    assert_eq!(
        request(
            &app,
            "PATCH",
            "/api/me",
            json!({"active":true}),
            Some(&cookie),
            Some("http://evil")
        )
        .await
        .0,
        StatusCode::BAD_REQUEST
    );
    sqlx::query("DELETE FROM users WHERE username = $1 OR username = $2")
        .bind(&normalized)
        .bind(&renamed)
        .execute(&pool)
        .await
        .unwrap();
}

#[tokio::test]
async fn matches_are_newest_first_and_exclude_self() {
    let (pool, app) = setup().await;
    let suffix = Uuid::new_v4();
    let (user_ids, match_ids) = seed_matches(&pool, &app, suffix).await;
    let (_, _, cookie) = login(&app, &format!("match-{}-0", suffix), PASSWORD).await;
    let (status, value, _) = request(
        &app,
        "GET",
        "/api/matches",
        json!(null),
        Some(&cookie),
        None,
    )
    .await;
    assert_eq!(status, StatusCode::OK);
    assert_eq!(value[0]["participants"].as_array().unwrap().len(), 2);
    assert_eq!(
        value[0]["participants"][0]["username"],
        format!("match-{}-1", suffix)
    );
    assert_eq!(value.as_array().unwrap().len(), 2);
    sqlx::query("DELETE FROM matches WHERE id = ANY($1)")
        .bind(&match_ids)
        .execute(&pool)
        .await
        .unwrap();
    sqlx::query("DELETE FROM users WHERE id = ANY($1)")
        .bind(&user_ids)
        .execute(&pool)
        .await
        .unwrap();
}

async fn seed_matches(pool: &PgPool, app: &axum::Router, suffix: Uuid) -> (Vec<Uuid>, Vec<Uuid>) {
    let mut user_ids = Vec::new();
    for n in 0..3 {
        let username = format!("match-{}-{}", suffix, n);
        let (_, value) = signup(app, &username, PASSWORD).await;
        user_ids.push(value["id"].as_str().unwrap().parse().unwrap());
    }
    let mut match_ids = Vec::new();
    for (n, offset) in [(0, 0), (1, 1)] {
        let match_id: Uuid = sqlx::query_scalar("INSERT INTO matches (matched_at) VALUES (now() - ($1 * interval '1 day')) RETURNING id").bind(offset).fetch_one(pool).await.unwrap();
        match_ids.push(match_id);
        for id in &user_ids[..(if n == 0 { 3 } else { 2 })] {
            sqlx::query("INSERT INTO user_matches VALUES ($1,$2)")
                .bind(id)
                .bind(match_id)
                .execute(pool)
                .await
                .unwrap();
        }
    }
    (user_ids, match_ids)
}
