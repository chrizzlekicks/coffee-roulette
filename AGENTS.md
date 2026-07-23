# AGENTS.md

## Architecture

CoffeeRoulette is a Rust API and SolidJS/Vite single-page application backed by
PostgreSQL. Rust serves the built SPA, JSON endpoints under `/api`, and `/health`.

Authentication uses Argon2id password hashes and private, HTTP-only cookies. All
state-changing API requests require an exact `Origin` match. Matching runs from
the command line and uses a PostgreSQL transaction advisory lock.

## Development commands

```sh
bin/setup                                  # npm dependencies + PostgreSQL
export DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/coffee_roulette
export APP_ORIGIN=http://localhost:5173
export APP_ENV=development
export COOKIE_SECRET=$(openssl rand -base64 64)
cargo run -- serve                         # API + SPA/static server
npm run dev                                # Vite frontend with API proxy
bin/match                                  # create today's matches
```

## Checks

- `cargo fmt --check`
- `cargo test`
- `npm run typecheck`
- `npm run build`
- `npm run lint`

## Important paths

- `src/` — Rust API, authentication, users, and matching
- `migrations/` — SQLx PostgreSQL migrations
- `app/javascript/` — SolidJS components, pages, and API client
- `public/` — static files copied into the Vite build
- `Dockerfile` — Node frontend build and Rust runtime image
