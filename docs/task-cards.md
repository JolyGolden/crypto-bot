# Task Cards

This file turns the current technical gap into concrete implementation cards.
It is intentionally execution-oriented and can be used as a lightweight backlog.

## Card 1: Replace Global Addresses With User-Owned Wallets

- Status: in progress
- Goal: move from globally tracked addresses to wallets owned by a user
- Scope:
  - add `users` schema,
  - add `userId` on wallets,
  - use composite uniqueness `(userId, chain, address)`,
  - keep a temporary default-user bridge until auth exists,
  - route read access through a current-user boundary instead of raw wallet IDs
- Done when:
  - database supports user-owned wallets,
  - current CRUD still works in single-user mode,
  - transaction and alert reads no longer bypass ownership checks,
  - the remaining gap is real authentication, not global data access

## Card 2: Defer Migrations Until The Schema Stabilizes

- Status: deferred
- Goal: keep early-stage iteration fast while the schema is still moving
- Scope:
  - keep `TypeORM synchronize` enabled in early development,
  - avoid locking into migration churn while core entities are still changing,
  - reintroduce migrations after the wallet, auth, and sync-state schema settle
- Done when:
  - the team agrees the schema is stable enough to version explicitly,
  - `synchronize` can be turned off safely for shared environments,
  - migration history becomes the source of truth from that point forward

## Card 3: Add API Versioning And Health Endpoint

- Status: completed
- Goal: align HTTP surface with the target contract baseline
- Scope:
  - add `/v1` global prefix,
  - move docs to `/docs`,
  - add `/health`
- Done when:
  - public endpoints are versioned,
  - health checks exist for deployment and monitoring

## Card 4: Introduce `wallet_sync_state`

- Status: planned
- Goal: make sync progression explicit and reorg-safe
- Scope:
  - add `wallet_sync_state` table,
  - persist last sync metadata,
  - stop inferring sync state only from latest stored transaction
- Done when:
  - sync jobs read and write durable sync state,
  - reorg window and confirmations are configurable per wallet

## Card 5: Replace Direct Telegram Sends With Outbox Delivery

- Status: planned
- Goal: decouple alert generation from notification sending
- Scope:
  - add `alert_rules`,
  - add `alert_events`,
  - add `notification_outbox`,
  - move Telegram sending into a dedicated worker path
- Done when:
  - alerts are persisted before send,
  - retries use outbox state,
  - Telegram `retry_after` can delay delivery safely

## Card 6: Separate API And Worker Processes

- Status: planned
- Goal: isolate HTTP request handling from background workload
- Scope:
  - split runtime entrypoints,
  - run worker separately,
  - keep queue contracts stable
- Done when:
  - API can stay responsive while sync jobs run,
  - worker can be scaled or restarted independently
