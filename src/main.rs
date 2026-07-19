use std::{env, io, net::SocketAddr, path::PathBuf};

use axum_extra::extract::cookie::Key;
use coffee_roulette::{AppState, MIGRATOR, matches, router};
use sqlx::postgres::PgPoolOptions;
use tokio::{net::TcpListener, signal};
use tracing_subscriber::EnvFilter;

#[derive(Clone, Copy)]
enum Command {
    Serve,
    Match,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "coffee_roulette=info,tower_http=info".into()),
        )
        .init();

    let command = parse_command(env::args().nth(1).as_deref())?;
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&env::var("DATABASE_URL")?)
        .await?;
    MIGRATOR.run(&pool).await?;

    match command {
        Command::Serve => {
            let secret = env::var("COOKIE_SECRET")?;
            if secret.len() < 64 {
                return Err(io::Error::new(
                    io::ErrorKind::InvalidInput,
                    "COOKIE_SECRET must be at least 64 bytes",
                )
                .into());
            }

            let address: SocketAddr = env::var("BIND_ADDR")
                .unwrap_or_else(|_| "0.0.0.0:3000".into())
                .parse()?;
            let static_dir =
                PathBuf::from(env::var("STATIC_DIR").unwrap_or_else(|_| "dist".into()));
            let app = router(
                AppState {
                    pool,
                    cookie_key: Key::from(secret.as_bytes()),
                    origin: env::var("APP_ORIGIN")?,
                    secure_cookies: env::var("APP_ENV").as_deref() != Ok("development"),
                },
                static_dir,
            );
            let listener = TcpListener::bind(address).await?;

            tracing::info!(%address, "listening");
            axum::serve(listener, app)
                .with_graceful_shutdown(shutdown_signal())
                .await?;
        }
        Command::Match => {
            let count = matches::create_today(&pool).await?;
            tracing::info!(count, "created matches");
        }
    }

    Ok(())
}

fn parse_command(command: Option<&str>) -> io::Result<Command> {
    match command {
        None | Some("serve") => Ok(Command::Serve),
        Some("match") => Ok(Command::Match),
        Some(command) => Err(io::Error::new(
            io::ErrorKind::InvalidInput,
            format!("unknown command {command:?}; expected serve or match"),
        )),
    }
}

async fn shutdown_signal() {
    let ctrl_c = async {
        signal::ctrl_c().await.expect("install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("install SIGTERM handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        () = ctrl_c => {},
        () = terminate => {},
    }

    tracing::info!("shutdown signal received");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn command_defaults_to_serve_and_rejects_unknown_values() {
        assert!(matches!(parse_command(None), Ok(Command::Serve)));
        assert!(matches!(parse_command(Some("match")), Ok(Command::Match)));
        assert!(parse_command(Some("worker")).is_err());
    }
}
