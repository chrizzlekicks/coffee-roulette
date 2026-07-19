# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS web
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.ts tsconfig.json postcss.config.js tailwind.config.ts eslint.config.js ./
COPY app/javascript app/javascript
COPY public public
RUN npm run build

FROM rust:1.88-bookworm AS rust-build
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY migrations migrations
COPY src src
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update \
    && apt-get install --no-install-recommends -y ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --shell /usr/sbin/nologin app
WORKDIR /app
COPY --from=rust-build /app/target/release/coffee-roulette ./coffee-roulette
COPY --from=rust-build /app/migrations ./migrations
COPY --from=web /app/dist ./dist
COPY bin/docker-entrypoint ./bin/docker-entrypoint
RUN chmod +x bin/docker-entrypoint && chown -R app:app /app
USER app

ENV BIND_ADDR=0.0.0.0:3000 \
    STATIC_DIR=dist \
    APP_ENV=production
EXPOSE 3000
ENTRYPOINT ["/app/bin/docker-entrypoint"]
CMD ["serve"]
