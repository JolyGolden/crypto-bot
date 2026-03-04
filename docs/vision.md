# Vision

## Executive Summary

The goal is to build a read-only portfolio tracker for EVM wallets.
The initial network is Polygon PoS mainnet.

The user adds wallet addresses and receives:

- native balance,
- ERC-20 balances,
- USD valuation,
- transaction feed,
- Telegram alerts for configured rules.

The system must never manage private keys and must never sign transactions.

## Product Assumptions

These assumptions are part of the current target design:

- Initial network: Polygon PoS mainnet (Chain ID 137).
- Future direction: keep a chain adapter boundary for later EVM expansion.
- MVP authentication: Telegram linking via bot and one-time code.
- Sync model: asynchronous ingestion through Redis-backed queues.

## Why This Architecture

The project should not start by building a full indexer.
Instead, it should combine:

- a data provider for balances, transfers, history, and pricing,
- an RPC provider for precise verification and fallback.

This keeps the MVP tractable and avoids getting stuck in:

- log indexing,
- custom pagination logic,
- reorg edge cases,
- high RPC traffic,
- indexer maintenance.

The tradeoff is that the application must be disciplined about:

- rate limits,
- retries and backoff,
- caching,
- idempotency,
- fallback strategy.

## MVP Scope

### Wallet Management

- Add wallet.
- Delete or disable wallet tracking.
- Store an optional label.
- Select chain, while MVP runs only one chain in practice.

### Portfolio

- Native balance.
- ERC-20 balances.
- USD valuation from the data provider and optional fallback market data API.

### Transaction Feed

- Incoming and outgoing native transfers.
- ERC-20 transfers, at minimum via Transfer event data when the provider exposes it.

### Alerts

- `IN_TX >= X USD`
- `OUT_TX >= X USD`
- `TOKEN_RECEIVED`
- `TOKEN_SENT`
- Anti-duplicate logic
- Throttling to avoid spam

### Telegram Notifications

- Send message via `sendMessage`.
- Respect Bot API flood control through `retry_after`.
- Keep message length within Bot API constraints.

## Explicit Non-Goals For MVP

- No swap and DEX protocol classification by protocol-specific logs.
- No self-built chain indexer.
- No full multi-chain release in the first public iteration.

## Non-Functional Requirements

### Correctness

- Repeated sync must be idempotent.
- The same transaction or alert event must not be duplicated.

### Reliability

- Rate limits from providers and Telegram must be handled with backoff and retry.
- Network and provider failures must not corrupt sync state.

### Product-Level SLO Targets

- API: 99% successful responses over 24 hours.
- Sync lag: at most 10 minutes for active wallets.
- Alert latency: at most 2 minutes after a transaction becomes sufficiently confirmed.

## Working Definition Of "Sufficiently Confirmed"

For a read-only tracker on Polygon, recent chain data can still change because of probabilistic finality.
The target design therefore treats events as safe only after a configurable number of confirmations.

That rule must be reflected in:

- sync cursor behavior,
- alert emission timing,
- reorg recovery logic.
