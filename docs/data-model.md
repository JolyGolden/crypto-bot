# Data Model

This document describes the target PostgreSQL schema for the full product, not only the currently implemented tables.

## Design Principles

- Deduplicate all provider-driven data at the database boundary.
- Make retries safe.
- Keep read paths fast for wallet, portfolio, and alert screens.
- Preserve enough raw data for debugging and audit.

## `users`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `created_at` | `timestamptz` | Default `now()` |
| `status` | `text` | `active` or `disabled` |

## `telegram_identities`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | FK to `users(id)`, unique |
| `telegram_chat_id` | `bigint` | `chat_id` can exceed 32 bits |
| `telegram_username` | `text` | Nullable |
| `connected_at` | `timestamptz` | Default `now()` |

## `auth_sessions`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | FK to `users(id)` |
| `jwt_jti` | `text` | Unique |
| `expires_at` | `timestamptz` | Indexed |
| `created_at` | `timestamptz` | Default `now()` |
| `revoked_at` | `timestamptz` | Nullable |

## `telegram_link_codes`

| Field | Type | Notes |
| --- | --- | --- |
| `code` | `text` | Primary key, short one-time code |
| `user_id` | `uuid` | FK to `users(id)` |
| `expires_at` | `timestamptz` | Indexed |
| `consumed_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` | Default `now()` |

## `wallets`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | FK to `users(id)` |
| `chain` | `text` | Enum-like string, MVP uses `polygon` |
| `address` | `text` | Normalized lowercase `0x...` |
| `label` | `text` | Nullable |
| `is_active` | `boolean` | Default `true` |
| `created_at` | `timestamptz` | Default `now()` |

Constraints and indexes:

- unique `(user_id, chain, address)`
- index `(user_id)`
- index `(chain, address)`

## `wallet_sync_state`

| Field | Type | Notes |
| --- | --- | --- |
| `wallet_id` | `uuid` | Primary key, FK to `wallets(id)` |
| `last_sync_at` | `timestamptz` | Nullable |
| `last_provider` | `text` | Example: `goldrush` or `moralis` |
| `cursor` | `text` | Nullable, provider-specific |
| `last_block_number` | `bigint` | Nullable |
| `last_block_hash` | `text` | Nullable |
| `reorg_window_blocks` | `int` | Default `64` |
| `confirmations_required` | `int` | Default `20` |

## `portfolio_snapshots`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `wallet_id` | `uuid` | FK to `wallets(id)` |
| `as_of_block` | `bigint` | Indexed |
| `as_of_time` | `timestamptz` | Indexed |
| `quote_currency` | `text` | Default `USD` |
| `total_usd` | `numeric(36, 12)` | Nullable |
| `provider_raw` | `jsonb` | Nullable debug or audit payload |

## `token_balances`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `snapshot_id` | `uuid` | FK to `portfolio_snapshots(id)` |
| `token_address` | `text` | Contract address or a special native marker |
| `symbol` | `text` | Nullable |
| `decimals` | `int` | Nullable |
| `balance` | `numeric(78, 0)` | Raw units |
| `balance_formatted` | `numeric(36, 12)` | Nullable |
| `usd_price` | `numeric(36, 12)` | Nullable |
| `usd_value` | `numeric(36, 12)` | Nullable |
| `is_spam` | `boolean` | Nullable |

## `transactions`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `wallet_id` | `uuid` | FK to `wallets(id)` |
| `tx_hash` | `text` | Unique per wallet |
| `block_number` | `bigint` | Indexed |
| `block_hash` | `text` | Nullable |
| `block_time` | `timestamptz` | Indexed |
| `from_address` | `text` | Indexed |
| `to_address` | `text` | Indexed |
| `native_value` | `numeric(78, 0)` | Raw units |
| `native_value_usd` | `numeric(36, 12)` | Nullable |
| `fee_native` | `numeric(78, 0)` | Nullable |
| `fee_usd` | `numeric(36, 12)` | Nullable |
| `status` | `text` | `success`, `failed`, or `unknown` |
| `direction` | `text` | `in`, `out`, `self`, or `unknown` |
| `category` | `text` | Example: `transfer`, `contract_call`, `swap_like` |
| `provider_raw` | `jsonb` | Nullable |

Constraint:

- unique `(wallet_id, tx_hash)`

## `token_transfers`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `tx_id` | `uuid` | FK to `transactions(id)` |
| `log_offset` | `int` | Nullable |
| `token_address` | `text` | Indexed |
| `from_address` | `text` | Indexed |
| `to_address` | `text` | Indexed |
| `amount` | `numeric(78, 0)` | Raw units |
| `amount_usd` | `numeric(36, 12)` | Nullable |

Constraint:

- unique `(tx_id, token_address, log_offset, from_address, to_address, amount)`

## `alert_rules`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | FK to `users(id)` |
| `wallet_id` | `uuid` | FK to `wallets(id)`, nullable for "all wallets" |
| `type` | `text` | `IN_TX`, `OUT_TX`, `TOKEN_RECEIVED`, `TOKEN_SENT` |
| `token_address` | `text` | Nullable |
| `min_usd` | `numeric(36, 12)` | Nullable |
| `is_enabled` | `boolean` | Default `true` |
| `throttle_seconds` | `int` | Default `300` |
| `created_at` | `timestamptz` | Default `now()` |

## `alert_events`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `rule_id` | `uuid` | FK to `alert_rules(id)` |
| `tx_hash` | `text` | Transaction identity for deduplication |
| `fired_at` | `timestamptz` | Default `now()` |
| `payload` | `jsonb` | Nullable |

Constraint:

- unique `(rule_id, tx_hash)`

## `notification_outbox`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | FK to `users(id)` |
| `channel` | `text` | MVP uses `telegram` |
| `telegram_chat_id` | `bigint` | Nullable |
| `message_text` | `text` | Prepared message |
| `parse_mode` | `text` | Nullable |
| `status` | `text` | `pending`, `sent`, `failed`, or `delayed` |
| `not_before` | `timestamptz` | Nullable, supports `retry_after` |
| `attempts` | `int` | Default `0` |
| `last_error` | `text` | Nullable |
| `created_at` | `timestamptz` | Default `now()` |

## Data Integrity Rules

These constraints are central to the design:

- transactions must deduplicate on wallet and hash,
- token transfers must deduplicate on tx and log-level identity,
- alert events must deduplicate on rule and transaction,
- notification sending must be resumable and retry-safe.
