use axum::{
    extract::{FromRef, FromRequestParts, State},
    http::{HeaderMap, Method, StatusCode, request::Parts},
    middleware::Next,
    response::Response,
};
use axum_extra::extract::cookie::PrivateCookieJar;
use sqlx::FromRow;
use uuid::Uuid;

use crate::{AppState, error::AppError};

pub const SESSION_COOKIE: &str = "session";

#[derive(FromRow)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub password_hash: String,
    pub session_token: Option<Uuid>,
    pub active: bool,
}

pub struct AuthUser(pub User);

impl<S> FromRequestParts<S> for AuthUser
where
    AppState: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app = AppState::from_ref(state);
        let jar = PrivateCookieJar::from_headers(&parts.headers, app.cookie_key.clone());
        let token = jar
            .get(SESSION_COOKIE)
            .and_then(|cookie| Uuid::parse_str(cookie.value()).ok())
            .ok_or_else(AppError::unauthorized)?;

        sqlx::query_as(
            "SELECT id, username, password_hash, session_token, active \
             FROM users WHERE session_token = $1",
        )
        .bind(token)
        .fetch_optional(&app.pool)
        .await?
        .map(Self)
        .ok_or_else(AppError::unauthorized)
    }
}

pub async fn require_same_origin(
    State(state): State<AppState>,
    request: axum::extract::Request,
    next: Next,
) -> Result<Response, AppError> {
    if matches!(
        request.method(),
        &Method::POST | &Method::PUT | &Method::PATCH | &Method::DELETE
    ) && !has_origin(request.headers(), &state.origin)
    {
        return Err(AppError::new(StatusCode::BAD_REQUEST, "invalid origin"));
    }

    Ok(next.run(request).await)
}

fn has_origin(headers: &HeaderMap, expected: &str) -> bool {
    headers
        .get("origin")
        .and_then(|origin| origin.to_str().ok())
        == Some(expected)
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::http::HeaderValue;

    #[test]
    fn origin_requires_an_exact_match() {
        let mut headers = HeaderMap::new();
        headers.insert("origin", HeaderValue::from_static("https://coffee.example"));

        assert!(has_origin(&headers, "https://coffee.example"));
        assert!(!has_origin(&headers, "https://evil.example"));
        headers.clear();
        assert!(!has_origin(&headers, "https://coffee.example"));
    }
}
