pub mod auth;
pub mod error;
pub mod matches;
pub mod users;

use std::path::{Path, PathBuf};

use axum::{
    Router,
    extract::FromRef,
    http::{HeaderMap, Method, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
    routing::{any, get},
};
use axum_extra::extract::cookie::Key;
use sqlx::{PgPool, migrate::Migrator};
use tower_http::{
    services::{ServeDir, ServeFile},
    trace::TraceLayer,
};

pub static MIGRATOR: Migrator = sqlx::migrate!();

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub cookie_key: Key,
    pub origin: String,
    pub secure_cookies: bool,
}

impl FromRef<AppState> for Key {
    fn from_ref(state: &AppState) -> Self {
        state.cookie_key.clone()
    }
}

pub fn router(state: AppState, static_dir: PathBuf) -> Router {
    let matches = matches::router().route_layer(axum::middleware::from_fn_with_state(
        state.clone(),
        require_auth,
    ));
    let api = users::router()
        .merge(matches)
        .fallback(api_not_found)
        .layer(axum::middleware::from_fn_with_state(
            state.clone(),
            auth::require_same_origin,
        ));
    let spa = Router::new()
        .fallback_service(ServeFile::new(static_dir.join("index.html")))
        .layer(axum::middleware::from_fn(html_navigation_only));
    let app = Router::new()
        .route("/health", get(health))
        .route("/health/", any(api_not_found))
        .route("/health/{*path}", any(api_not_found))
        .route("/api/", any(api_not_found))
        .nest("/api", api)
        .fallback_service(ServeDir::new(&static_dir).fallback(spa))
        .layer(TraceLayer::new_for_http());

    app.with_state(state)
}

async fn health() -> StatusCode {
    StatusCode::NO_CONTENT
}

async fn require_auth(
    auth::AuthUser(user): auth::AuthUser,
    mut request: axum::extract::Request,
    next: Next,
) -> Response {
    request.extensions_mut().insert(user.id);
    next.run(request).await
}

async fn api_not_found() -> error::AppError {
    error::AppError::new(StatusCode::NOT_FOUND, "not found")
}

async fn html_navigation_only(
    headers: HeaderMap,
    request: axum::extract::Request,
    next: Next,
) -> Response {
    let path = request.uri().path();
    let accepts_html = headers
        .get("accept")
        .and_then(|value| value.to_str().ok())
        .is_some_and(|value| {
            value
                .split(',')
                .any(|media| media.trim().starts_with("text/html"))
        });

    if request.method() == Method::GET
        && accepts_html
        && !path.starts_with("/assets/")
        && Path::new(path).extension().is_none()
    {
        next.run(request).await
    } else {
        api_not_found().await.into_response()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{body::Body, http::Request};
    use sqlx::postgres::PgPoolOptions;
    use tower::ServiceExt;

    fn state() -> AppState {
        AppState {
            pool: PgPoolOptions::new()
                .connect_lazy("postgres://localhost/coffee_roulette_test")
                .unwrap(),
            cookie_key: Key::from(&[0; 64]),
            origin: "http://localhost:3000".into(),
            secure_cookies: false,
        }
    }

    #[tokio::test]
    async fn health_is_available_without_a_database_round_trip() {
        let response = router(state(), PathBuf::from("dist"))
            .oneshot(Request::get("/health").body(Body::empty()).unwrap())
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::NO_CONTENT);
    }

    #[tokio::test]
    async fn spa_fallback_only_serves_html_navigations() {
        for (path, accept, expected) in [
            ("/main", Some("text/html"), StatusCode::OK),
            ("/main", Some("application/json"), StatusCode::NOT_FOUND),
            ("/api/", Some("text/html"), StatusCode::NOT_FOUND),
            ("/api/missing", Some("text/html"), StatusCode::NOT_FOUND),
            ("/health/", Some("text/html"), StatusCode::NOT_FOUND),
            ("/health/missing", Some("text/html"), StatusCode::NOT_FOUND),
            (
                "/assets/definitely-missing.js",
                Some("text/html"),
                StatusCode::NOT_FOUND,
            ),
        ] {
            let mut request = Request::get(path);
            if let Some(accept) = accept {
                request = request.header("accept", accept);
            }
            let response = router(state(), PathBuf::from("."))
                .oneshot(request.body(Body::empty()).unwrap())
                .await
                .unwrap();

            assert_eq!(response.status(), expected, "{path}");
        }
    }
}
