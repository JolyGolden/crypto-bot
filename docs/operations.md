# Operations

## Reliability Rules

The target system must behave as if retries and duplicate provider responses are normal.

The minimum operational guarantees are:

- all sync jobs are idempotent,
- every external call has a timeout,
- every retriable failure uses bounded backoff,
- duplicate provider events do not create duplicate business records,
- alert delivery can resume after partial failure.

## Sync Invariants

- Wallet sync must be safe to retry.
- Provider pagination or cursors must be persisted.
- A failed job must not advance sync state incorrectly.
- Alerts must be derived from newly stored data, not from transient provider responses.

## Notification Delivery Model

The target design uses an outbox:

- alerts create `notification_outbox` rows,
- a sender worker owns delivery,
- Telegram flood control uses `retry_after`,
- `retry_after` must be translated into `not_before`,
- no blocking sleeps inside job handlers.

## Security And Configuration

- Store all provider keys and bot credentials in environment variables or a secret manager.
- Validate critical configuration at startup.
- Always use `TELEGRAM_WEBHOOK_SECRET` and verify the incoming header.
- Keep JWT secrets and expiration configurable.
- Never expose private credentials in logs.

## Timeouts, Retries, And Backoff

For all provider HTTP calls:

- set explicit timeouts,
- retry transient failures,
- cap total retry duration,
- record rate-limit events and provider errors.

For BullMQ:

- use `attempts`,
- use exponential or custom backoff,
- keep retry behavior explicit per queue.

## Monitoring

### Metrics

Track at minimum:

- `sync_lag_seconds` per wallet,
- `jobs_failed_total`,
- `jobs_retried_total`,
- `provider_429_total`,
- `telegram_send_errors_total`,
- `telegram_retry_after_seconds`.

### Logs

Log with enough context to reconstruct failures:

- HTTP correlation ID,
- queue job ID,
- wallet ID,
- provider name,
- partial raw provider payload where useful and size-bounded.

### Infra Alerts

Create operational alerts for:

- sync lag above 30 minutes,
- a sustained rise in provider `429` or `5xx`,
- notification backlog growth,
- failed Telegram sends above a threshold.

## Deployment Checklist

Before a production-like rollout:

- Postgres is provisioned with backups.
- Redis is provisioned.
- Schema migrations are applied.
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` are configured.
- provider API keys are configured.
- `JWT_SECRET` and token expiry are configured.
- API is reachable over HTTPS.
- Telegram webhook is set to `/v1/webhooks/telegram`.
- BullMQ workers run as a separate process or container.
- periodic schedulers are enabled.
- public API endpoints are rate limited.
- notification sender respects `retry_after`.

## Smoke Test

Minimum production smoke test:

1. Add a test wallet.
2. Confirm a portfolio snapshot exists.
3. Confirm transaction feed returns data.
4. Trigger or send a test Telegram alert.

## Runbook Topics

The project should maintain explicit instructions for:

- what to do when a provider returns repeated `429`,
- how to reduce sync lag,
- how to switch to a fallback provider,
- how to pause or resume periodic sync,
- how to inspect outbox backlog.

## Telegram Message Templates

Example incoming native transfer:

```text
Incoming transaction (Polygon)
Wallet: {label} ({addressShort})
Amount: +{amountNative} POL (~${amountUsd})
Tx: {txHashShort}
Block: {blockNumber}
Time: {timeLocal}
```

Example outgoing native transfer:

```text
Outgoing transaction
Wallet: {label} ({addressShort})
Amount: -{amountNative} POL (~${amountUsd})
To: {toShort}
Fee: {feeNative} POL (~${feeUsd})
Tx: {txHashShort}
```

Example token received:

```text
Token received
Wallet: {label} ({addressShort})
+{tokenAmount} {symbol} (~${tokenUsd})
From: {fromShort}
Tx: {txHashShort}
```

Example spam token notice:

```text
Spam token suspected
Wallet: {label} ({addressShort})
Token: {symbol} ({tokenAddressShort})
Reason: provider flagged as spam
```

## External Provider Notes

Provider comparison and cost assumptions are intentionally kept outside this file because they become stale quickly.
Use [Vendors](./vendors.md) as a dated appendix and re-verify before production decisions.
