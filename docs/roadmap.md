# Roadmap

This roadmap describes the intended implementation sequence.
It is ordered so each step produces a visible artifact.

For actual implementation status, see [Current vs Target](./current-vs-target.md).

## Ten Iterations

| Iteration | Change | Ready-When Result |
| --- | --- | --- |
| 1 | Monorepo, base structure, linters, environment templates | Repository builds locally and CI is green |
| 2 | API health endpoint and Swagger | `/health`, `/docs` |
| 3 | Database migrations for users and wallets | Wallet CRUD with EVM validation |
| 4 | Data-provider balances integration | ERC-20 balances plus spot or USD pricing |
| 5 | Transaction history integration | Paginated transaction feed |
| 6 | BullMQ initial sync | New wallet triggers a job and fills balances and history |
| 7 | BullMQ periodic incremental sync | Active wallets refresh automatically every N minutes |
| 8 | Telegram webhook and chat linking | User can link Telegram and receive a test message |
| 9 | Alerts engine with anti-duplicate | Rule-based notification flow without duplicates |
| 10 | Expo mobile MVP | Wallet add, portfolio, transactions, and alerts on mobile |

## Illustrative Timeline

These dates are only an example if work starts on 2026-03-04.

| Date | Milestone |
| --- | --- |
| 2026-03-05 | Monorepo and configuration |
| 2026-03-07 | Health and Swagger |
| 2026-03-09 | Database and wallet CRUD |
| 2026-03-11 | Balances provider integration |
| 2026-03-13 | Transaction history integration |
| 2026-03-15 | BullMQ initial sync |
| 2026-03-17 | BullMQ incremental sync |
| 2026-03-19 | Telegram webhook and linking |
| 2026-03-21 | Alerts and anti-duplicate |
| 2026-03-23 | Expo mobile MVP |

## Delivery Principle

Each step should end with something demonstrable:

- an endpoint,
- a persisted data model,
- a queue flow,
- a notification,
- a working screen.

The goal is visible progress, not hidden refactoring only.
