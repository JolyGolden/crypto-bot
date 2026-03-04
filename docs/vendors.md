# Vendors

This appendix contains provider and cost notes captured for planning.
These values are time-sensitive and must be re-verified before any production commitment.

Baseline verification date for this appendix: 2026-03-04.

## Data Providers

### Covalent GoldRush

What it covers:

- balances,
- quotes,
- transaction history,
- decoded log events.

Planning notes:

- credit-based billing,
- low-tier plans constrain request rate,
- useful when you want predictable request cost per endpoint.

Tradeoffs:

- strong fit for balance and history aggregation,
- cost planning matters because sync frequency multiplies credit use.

## Moralis Web3 APIs

What it covers:

- token balances,
- USD values,
- wallet history,
- optional categorized records,
- optional streams.

Planning notes:

- consumption-unit model,
- convenient when you want less custom classification logic.

Tradeoffs:

- easier application logic,
- ongoing need to watch rolling limits and CU spend.

## Alchemy

What it covers:

- JSON-RPC,
- transfer APIs,
- optional webhook and app tooling.

Planning notes:

- useful as RPC fallback,
- can also reduce the need for raw log scanning through transfer APIs.

Tradeoffs:

- flexible for a pet project,
- still requires separate handling for richer portfolio valuation in many cases.

## RPC Fallback Providers

### Alchemy

- viable for fallback and verification
- strong free tier for hobby-scale usage

### Ankr

- viable as a budget RPC provider
- easier paid upgrade path for simple throughput increases

## Price Data

### CoinGecko

Good as:

- pricing fallback,
- lightweight market charts,
- cached public price source.

Constraint:

- low free-tier limits mean caching is mandatory.

## Recommended Starting Combination

For a practical Polygon-first MVP:

- primary data provider: GoldRush,
- RPC fallback: Alchemy or Ankr,
- price fallback: CoinGecko with cache.

Alternative:

- use Moralis for balances plus categorized history if reducing custom classification work is more important than provider abstraction purity.

## Chain Choice Notes

### Polygon

Why it is the recommended starting chain:

- stable EVM target,
- strong provider support,
- clear fit for a wallet-tracking MVP,
- easier to reason about than building multi-chain too early.

### BSC

Why it is deferred:

- public endpoint constraints make raw RPC indexing even less attractive,
- the value of provider-based history becomes higher,
- it increases operational branching too early for MVP.

## Cost Tiers

### Local Zero-Cost Mode

- backend,
- worker,
- Postgres,
- Redis via local containers,
- provider free tiers or trials,
- Telegram bot only.

### Minimal Hosted Mode

- one VPS running API, worker, Postgres, and Redis,
- paid entry-level provider plan if free tiers become insufficient,
- caching required to avoid wasting provider quota.

### More Stable Hobby-Prod Mode

- larger VPS,
- explicit backup policy,
- paid provider plan with headroom,
- domain and HTTPS,
- separate operational monitoring.

## Procurement Rule

Treat provider and hosting prices as procurement data, not stable architecture.
Re-check limits, prices, and contract terms immediately before rollout or scaling changes.
