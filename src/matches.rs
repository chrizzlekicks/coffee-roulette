use axum::{
    Json, Router,
    extract::{Extension, State},
    routing::get,
};
use chrono::{DateTime, Utc};
use serde::Serialize;
use sqlx::{FromRow, PgPool};
use uuid::Uuid;

use crate::{AppState, error::Result};

const MATCHING_LOCK: i64 = 0x636f_6666_6565;

#[derive(Serialize)]
pub struct Match {
    pub id: Uuid,
    pub matched_at: DateTime<Utc>,
    pub participants: Vec<Participant>,
}

#[derive(Serialize)]
pub struct Participant {
    pub id: Uuid,
    pub username: String,
}

#[derive(FromRow)]
struct MatchRow {
    id: Uuid,
    matched_at: DateTime<Utc>,
    participant_id: Option<Uuid>,
    username: Option<String>,
}

pub fn router() -> Router<AppState> {
    Router::new().route("/matches", get(list))
}

/// The surrounding authenticated API router must put the signed-in user's UUID
/// in request extensions before this handler runs.
pub async fn list(
    State(state): State<AppState>,
    Extension(user_id): Extension<Uuid>,
) -> Result<Json<Vec<Match>>> {
    let rows = sqlx::query_as::<_, MatchRow>(
        "SELECT m.id, m.matched_at, other_user.id AS participant_id, other_user.username
         FROM matches m
         JOIN user_matches mine ON mine.match_id = m.id
         LEFT JOIN user_matches other ON other.match_id = m.id AND other.user_id <> mine.user_id
         LEFT JOIN users other_user ON other_user.id = other.user_id
         WHERE mine.user_id = $1
         ORDER BY m.matched_at DESC, m.id DESC, other_user.username",
    )
    .bind(user_id)
    .fetch_all(&state.pool)
    .await?;

    let mut matches: Vec<Match> = Vec::new();
    for row in rows {
        if matches.last().is_none_or(|current| current.id != row.id) {
            matches.push(Match {
                id: row.id,
                matched_at: row.matched_at,
                participants: Vec::new(),
            });
        }
        if let (Some(id), Some(username)) = (row.participant_id, row.username) {
            matches
                .last_mut()
                .unwrap()
                .participants
                .push(Participant { id, username });
        }
    }

    Ok(Json(matches))
}

/// Groups users that have already been shuffled. A lone eligible user is left
/// unmatched; an odd final user joins the preceding pair.
pub fn group_shuffled<T>(users: Vec<T>) -> Vec<Vec<T>> {
    let mut users = users.into_iter();
    let mut groups = Vec::new();

    while let Some(first) = users.next() {
        match users.next() {
            Some(second) => groups.push(vec![first, second]),
            None => {
                if let Some(group) = groups.last_mut() {
                    group.push(first);
                }
            }
        }
    }

    groups
}

/// Creates today's matches once. PostgreSQL picks a random order; the
/// transaction-level advisory lock makes concurrent invocations harmless.
pub async fn create_today(pool: &PgPool) -> sqlx::Result<usize> {
    let mut transaction = pool.begin().await?;
    sqlx::query("SELECT pg_advisory_xact_lock($1)")
        .bind(MATCHING_LOCK)
        .execute(&mut *transaction)
        .await?;

    let users = sqlx::query_scalar::<_, Uuid>(
        "SELECT u.id
         FROM users u
         WHERE u.active
           AND NOT EXISTS (
               SELECT 1
               FROM user_matches um
               JOIN matches m ON m.id = um.match_id
               WHERE um.user_id = u.id
                 AND (m.matched_at AT TIME ZONE 'UTC')::date = (now() AT TIME ZONE 'UTC')::date
           )
         ORDER BY random()",
    )
    .fetch_all(&mut *transaction)
    .await?;

    let groups = group_shuffled(users);
    for group in &groups {
        let match_id = sqlx::query_scalar::<_, Uuid>(
            "INSERT INTO matches (matched_at) VALUES (now()) RETURNING id",
        )
        .fetch_one(&mut *transaction)
        .await?;

        for user_id in group {
            sqlx::query("INSERT INTO user_matches (user_id, match_id) VALUES ($1, $2)")
                .bind(user_id)
                .bind(match_id)
                .execute(&mut *transaction)
                .await?;
        }
    }

    transaction.commit().await?;
    Ok(groups.len())
}

#[cfg(test)]
mod tests {
    use super::{create_today, group_shuffled, list};
    use crate::{AppState, MIGRATOR};
    use axum::{Extension, Json, extract::State};
    use axum_extra::extract::cookie::Key;
    use sqlx::postgres::PgPoolOptions;
    use std::{collections::HashSet, env};
    use uuid::Uuid;

    #[test]
    fn grouping_handles_empty_and_single_users() {
        assert!(group_shuffled(Vec::<u8>::new()).is_empty());
        assert!(group_shuffled(vec![1]).is_empty());
    }

    #[test]
    fn grouping_pairs_even_users() {
        assert_eq!(group_shuffled(vec![1, 2]), vec![vec![1, 2]]);
        assert_eq!(
            group_shuffled(vec![1, 2, 3, 4, 5, 6]),
            vec![vec![1, 2], vec![3, 4], vec![5, 6]]
        );
    }

    #[test]
    fn grouping_merges_an_odd_final_user() {
        assert_eq!(group_shuffled(vec![1, 2, 3]), vec![vec![1, 2, 3]]);
        assert_eq!(
            group_shuffled(vec![1, 2, 3, 4, 5]),
            vec![vec![1, 2], vec![3, 4, 5]]
        );
    }

    #[test]
    fn grouping_preserves_each_eligible_user_once() {
        let groups = group_shuffled((0..101).collect());
        let users: HashSet<_> = groups.into_iter().flatten().collect();

        assert_eq!(users, (0..101).collect());
    }

    #[tokio::test]
    async fn database_matching_skips_inactive_and_already_matched_users() {
        let Ok(url) = env::var("TEST_DATABASE_URL") else {
            return;
        };
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(&url)
            .await
            .unwrap();
        MIGRATOR.run(&pool).await.unwrap();

        let suffix = Uuid::new_v4();
        let mut users = Vec::new();
        for number in 0..4 {
            users.push(
                sqlx::query_scalar::<_, Uuid>(
                    "INSERT INTO users (username, password_hash, active) \
                     VALUES ($1, 'hash', $2) RETURNING id",
                )
                .bind(format!("match-{suffix}-{number}"))
                .bind(number != 2)
                .fetch_one(&pool)
                .await
                .unwrap(),
            );
        }

        let prior_match =
            sqlx::query_scalar::<_, Uuid>("INSERT INTO matches DEFAULT VALUES RETURNING id")
                .fetch_one(&pool)
                .await
                .unwrap();
        sqlx::query("INSERT INTO user_matches (user_id, match_id) VALUES ($1, $2)")
            .bind(users[3])
            .bind(prior_match)
            .execute(&pool)
            .await
            .unwrap();

        assert_eq!(create_today(&pool).await.unwrap(), 1);
        assert_eq!(create_today(&pool).await.unwrap(), 0);

        for (user_id, expected) in [
            (users[0], 1_i64),
            (users[1], 1),
            (users[2], 0),
            (users[3], 1),
        ] {
            let count: i64 =
                sqlx::query_scalar("SELECT count(*) FROM user_matches WHERE user_id = $1")
                    .bind(user_id)
                    .fetch_one(&pool)
                    .await
                    .unwrap();
            assert_eq!(count, expected);
        }

        let state = AppState {
            pool: pool.clone(),
            cookie_key: Key::from(&[0; 64]),
            origin: "http://localhost".into(),
            secure_cookies: false,
        };
        let Json(matches) = list(State(state), Extension(users[0])).await.unwrap();
        assert_eq!(matches.len(), 1);
        assert_eq!(matches[0].participants.len(), 1);
        assert_eq!(matches[0].participants[0].id, users[1]);

        sqlx::query("DELETE FROM users WHERE id = ANY($1)")
            .bind(&users)
            .execute(&pool)
            .await
            .unwrap();
    }
}
