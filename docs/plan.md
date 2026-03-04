# Read-Only On-Chain Portfolio: Technical Plan

## Status

- Document type: target-state architecture and delivery plan.
- Current repository state: partial backend MVP, not the full target design.
- Gap analysis between the current code and the target design lives in [Current vs Target](./current-vs-target.md).
- This document was structurally normalized on 2026-03-04.

## Purpose

This plan defines the intended technical shape of a read-only portfolio tracker for EVM wallets.
It captures the product boundary, architectural direction, API surface, data model, operations baseline, and implementation roadmap.

The document describes the target state, not only what is already implemented.
When the code and the plan differ, treat the plan as the intended direction and [Current vs Target](./current-vs-target.md) as the source of truth for the current gap.

## Product Intent

- The product tracks one or more wallet addresses.
- It shows native balances, ERC-20 balances, transaction history, and USD valuation.
- It emits Telegram alerts for relevant activity.
- It is strictly read-only: no private keys, no signatures, no transaction sending.

## Core Architectural Direction

- Start with Polygon PoS mainnet (Chain ID 137).
- Keep a chain adapter boundary so other EVM chains can be added later.
- Do not build a custom indexer for MVP.
- Use one or two ready-made on-chain data providers for balances, transfers, and history.
- Use an RPC provider as a fallback and point-in-time verification source.
- Keep blockchain synchronization asynchronous through BullMQ and worker processes.
- Do not make heavy blockchain fetches inside HTTP request handlers.
- Use Telegram both for alerts and for MVP account linking.

## MVP Boundary

Included in MVP:

- Wallet management: add, remove, label, enable, disable, choose network.
- Portfolio: native balance, ERC-20 balances, USD valuation.
- Transactions: native transfers and ERC-20 transfers.
- Alerts: incoming and outgoing transaction thresholds, token-specific receive and send rules.
- Telegram notifications with anti-duplicate handling and flood-control-aware retries.

Explicitly out of MVP:

- DEX-level swap decoding by protocol-specific logs.
- A custom blockchain indexer.
- Full multi-chain support in the first release.

## Documentation Map

- [Vision](./vision.md): product scope, assumptions, non-goals, and SLO-level expectations.
- [Architecture](./architecture.md): repository layout, modules, sync pipeline, queues, reorg handling, and provider strategy.
- [Data Model](./data-model.md): target PostgreSQL schema and deduplication constraints.
- [API](./api.md): REST contract, request/response conventions, and target endpoints.
- [Operations](./operations.md): reliability rules, deployment checklist, monitoring, and runbook.
- [Vendors](./vendors.md): provider comparison, cost notes, and external dependency guidance.
- [Roadmap](./roadmap.md): staged implementation plan and illustrative timeline.
- [Task Cards](./task-cards.md): execution-oriented implementation cards derived from the technical gap.
- [Current vs Target](./current-vs-target.md): technical gap analysis against the code currently in this repository.

## How To Use This Documentation

- Use [plan.md](./plan.md) as the entry point.
- Use the linked documents as the canonical detailed reference.
- When implementing features, check [Current vs Target](./current-vs-target.md) first, then the target-state spec for the area you are changing.
- When a design choice is still open, document the final decision before widening the implementation.
