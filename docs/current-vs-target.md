# Current vs Target

This document compares the current repository state to the target plan.
It is based on the code inspected on 2026-03-04.

## Summary

The repository already contains a working NestJS backend skeleton with:

- address CRUD,
- portfolio read endpoints,
- transaction reads,
- a BullMQ-based sync loop,
- Telegram alert sending,
- Swagger at `/api`.

It is still materially behind the target architecture in ownership, data modeling, notification reliability, API contract shape, and operational maturity.

## Gap Matrix

| Area | Current implementation | Target design | Main gap |
| --- | --- | --- | --- |
| Repository topology | Single NestJS app in `src/` | Nx monorepo with `apps/api`, `apps/worker`, `apps/mobile`, shared packages | No workspace split and no mobile app |
| Runtime processes | API, scheduler, and worker logic live in one app process | Separate API and worker processes or containers | No process isolation for jobs |
| API namespace | Routes are unversioned, Swagger is at `/api` | Base path `/v1`, docs at `/docs`, plus `/health` | Missing versioning and health endpoint |
| Authentication | No auth, no user model | Telegram linking, JWT sessions, per-user ownership | No identity or access boundary |
| Wallet ownership | `Address` is global and unique by address only | `Wallet` belongs to `User`, unique by `(user_id, chain, address)` | No multi-user model |
| Wallet lifecycle | Create, list, get, delete only | Add, list, patch label or `isActive`, soft delete | No patch API and no soft delete flow |
| Chain model | `chain` field exists, but sync is effectively Polygon-only | Polygon-first with explicit chain adapter boundary | Chain field is not yet a real adapter input |
| Data model | `addresses`, `transactions`, `token_balances`, `alerts` only | Users, sessions, sync state, snapshots, transfers, rules, outbox | Core planned tables are missing |
| Database lifecycle | TypeORM `synchronize` is intentionally still used in early development | Explicit migrations and schema versioning once the schema stabilizes | Migration discipline is intentionally deferred |
| Sync state | Last synced block is inferred from stored tx rows | Dedicated `wallet_sync_state` table with cursor, confirmations, reorg window | No robust sync cursor model |
| Portfolio storage | Portfolio reads live native balance from RPC and token rows from current table | Snapshot-based portfolio read model with USD totals and time anchors | No snapshot history or aggregate totals |
| Transaction ingestion | Native tx history only, no token transfer table | Native tx plus token transfers and richer categorization | ERC-20 transfer detail is incomplete |
| Finality and reorg | No confirmations threshold, no reorg window rescan | Safe tip, confirmation delay, reorg-aware rescan | Fresh-chain edge cases not handled |
| Alerting model | New tx immediately creates an alert record and directly calls Telegram | Rules engine, unique alert events, throttle, notification outbox | No user-defined rules, no outbox, no throttle |
| Notification retry | Telegram send is best-effort inside `AlertsService` | Dedicated sender worker using `retry_after` and delayed sends | No delivery state machine |
| Observability | Basic logs only | Health checks, metrics, correlation IDs, runbook-backed alerts | No operational visibility layer |
| Testing | Small unit tests only | Endpoint, worker, and integration coverage across critical flows | No e2e coverage for real flows |
| Mobile | No mobile client | Expo app in the monorepo | Entire mobile track not started |

## Current Backend Capabilities

What already exists in the code:

- NestJS app bootstrap with Swagger and global validation.
- Postgres integration through TypeORM.
- Redis integration through BullMQ.
- Scheduled sync every 5 minutes for active addresses.
- Sync processor that fetches ERC-20 balances and native transaction history.
- Telegram alert sending when new transactions are detected.

## Current Risks Relative To The Plan

- The application has no user boundary, so all tracked wallets are effectively global.
- Alert delivery still bypasses the planned outbox and sender worker model.
- There is no durable sync cursor model, so reorg-safe syncing is not implemented.
- Portfolio reads are current-state only and do not match the planned snapshot design.
- The API surface is not yet aligned with the planned `/v1` contract.

## Suggested Next Technical Sequence

1. Finish the user-owned wallet schema and keep `synchronize` for rapid iteration until the core model stops moving.
2. Add `/v1` prefixing, `/health`, and an explicit API error envelope.
3. Add `wallet_sync_state` and move sync progression out of ad hoc block inference.
4. Reintroduce migrations once the wallet, auth, and sync-state schema are stable enough to version.
5. Replace direct Telegram sends with `alert_rules`, `alert_events`, and `notification_outbox`.
6. Split worker responsibilities from the HTTP process once the queue contract stabilizes.
