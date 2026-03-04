# API

This document describes the target REST API surface for the complete product.

## Global Conventions

- Base path: `/v1`
- Transport: JSON over HTTPS
- Auth header: `Authorization: Bearer <jwt>`
- Public machine-readable docs: OpenAPI / Swagger

## Error Shape

Target error format:

```json
{
  "errorCode": "VALIDATION_ERROR",
  "message": "Invalid address",
  "details": [
    {
      "field": "address",
      "reason": "not a valid EVM address"
    }
  ]
}
```

## Authentication Via Telegram Linking

### `POST /v1/auth/telegram/link/start`

Purpose:

- create a user,
- create a one-time Telegram linking code.

Request:

```json
{
  "device": {
    "platform": "ios|android",
    "deviceId": "uuid"
  }
}
```

Response:

```json
{
  "userId": "uuid",
  "linkCode": "A1B2C3",
  "expiresAt": "2026-03-04T12:00:00Z",
  "telegramDeepLink": "tg://resolve?domain=<bot>&start=A1B2C3"
}
```

### `GET /v1/auth/telegram/link/status?code=A1B2C3`

Pending response:

```json
{
  "status": "pending"
}
```

Linked response:

```json
{
  "status": "linked",
  "token": "<jwt>",
  "user": {
    "id": "uuid"
  }
}
```

## Telegram Webhook

### `POST /v1/webhooks/telegram`

Purpose:

- receive Telegram bot updates.

Validation:

- `X-Telegram-Bot-Api-Secret-Token` must match the configured secret.

Handler rules:

- parse Telegram `Update` payload as-is,
- if the message is `/start <code>`, resolve a pending link code,
- bind `telegram_chat_id` to the user,
- mark the link code as consumed,
- return `200` quickly and do no heavy sync work inside the webhook request.

## Wallets

### `POST /v1/wallets`

Request:

```json
{
  "chain": "polygon",
  "address": "0xabc...",
  "label": "Main"
}
```

Validation rules:

- `chain` must be `polygon` in MVP,
- `address` must be a valid EVM address,
- `address` must be normalized to lowercase before persistence.

Response:

```json
{
  "id": "uuid",
  "chain": "polygon",
  "address": "0xabc...",
  "label": "Main",
  "isActive": true,
  "createdAt": "..."
}
```

Side effect:

- enqueue `sync.init(walletId)`.

### `GET /v1/wallets`

- Return all wallets belonging to the authenticated user.

### `PATCH /v1/wallets/{walletId}`

Mutable fields:

- `label`
- `isActive`

### `DELETE /v1/wallets/{walletId}`

Target behavior:

- soft delete by setting `isActive = false`,
- disable scheduled sync for that wallet,
- preserve historical data unless a later archival policy says otherwise.

## Portfolio

### `GET /v1/portfolio/summary`

Purpose:

- return aggregate portfolio information across all active wallets.

Response:

```json
{
  "quoteCurrency": "USD",
  "totalUsd": 12345.67,
  "wallets": [
    {
      "walletId": "uuid",
      "label": "Main",
      "totalUsd": 10000.0,
      "asOfBlock": 12345678,
      "asOfTime": "..."
    }
  ]
}
```

### `GET /v1/wallets/{walletId}/balances`

Query parameters:

- `includeSpam=false`
- `limit=200`
- optional `cursor`

Response:

- latest portfolio snapshot plus token rows.

## Transactions

### `GET /v1/wallets/{walletId}/transactions`

Query parameters:

- either `cursor`
- or `page` and `limit`

Response:

```json
{
  "items": [
    {
      "txHash": "0x..",
      "time": "...",
      "direction": "in",
      "nativeValue": "...",
      "category": "transfer"
    }
  ],
  "nextCursor": "..."
}
```

## Alerts

### `POST /v1/alerts`

Request:

```json
{
  "walletId": "uuid",
  "type": "IN_TX",
  "minUsd": 100,
  "throttleSeconds": 300
}
```

Supported CRUD:

- `POST /v1/alerts`
- `GET /v1/alerts`
- `PATCH /v1/alerts/{id}`
- `DELETE /v1/alerts/{id}`

## Health And Documentation

### `GET /health`

- liveness and readiness probe endpoint.

### `GET /docs`

- Swagger UI backed by OpenAPI generated from the NestJS application.
