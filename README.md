# CoffeeRoulette

CoffeeRoulette matches active users for coffee and shows each user's match history.
The backend is Rust, the SPA is SolidJS, and PostgreSQL stores application data.

## Development

Requirements: Node.js 22+, Rust 1.88+, and Docker.

```sh
bin/setup
export DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/coffee_roulette
export APP_ORIGIN=http://localhost:5173
export APP_ENV=development
export COOKIE_SECRET=$(openssl rand -base64 64)

# terminal 1
cargo run -- serve
# terminal 2
npm run dev
```

The Vite server proxies `/api` and `/health` to Rust. To create daily matches:

```sh
bin/match
```

Build the production image with `docker build -t coffee-roulette .`. It serves the
built SPA and API on port 3000. Set `DATABASE_URL`, `APP_ORIGIN`, and a 64-byte
`COOKIE_SECRET` when running it. For the production image, set `APP_ORIGIN` to
the image's public URL (for example `http://localhost:3000`).

## Checks

```sh
cargo fmt --check
cargo test
npm run typecheck
npm run build
npm run lint
```

## API

- `POST /api/users` — sign up
- `POST /api/session` / `DELETE /api/session` — log in and out
- `GET /api/me` / `PATCH /api/me` — current profile and updates
- `GET /api/matches` — current user's match history
- `GET /health` — health check
