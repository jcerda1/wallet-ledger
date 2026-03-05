# Wallet Ledger Service

A small microservice that maintains a ledger-based wallet balance per user.
Built with NestJS + TypeScript, PostgreSQL, and Prisma ORM.

---

## Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: NestJS
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma (with typed SQL)
- **CI/CD**: GitHub Actions → Railway

---

## How to Run Locally

### Prerequisites

- Node.js 20+
- PostgreSQL running locally (or a postgres/Supabase connection string)
- Prisma CLI (`npm i -g prisma`)

### Setup

```bash
# 1. Clone the repo
git clone
cd wallet-ledger

# 2. Install dependencies
npm ci

# 3. Create a local .env file
cp .env.example .env
# Edit .env and set DATABASE_URL to your local Postgres connection string
# a DATABASE_SHADOW_URL is needed for migrations, two unique instances of a postgres db

# 4. Generate Prisma client
npm run prisma:generate

# 5. Run migrations
npx prisma migrate deploy

# 6. Generate typed SQL (requires a running DB with tables)
npm run prisma:generate:sql

# 7. Start the server
npm run start:dev
```

The server will start on `http://localhost:3000` by default.

---

## How to Run Migrations

### Development (creates migration files)

```bash
npx prisma migrate dev --name <migration-name>
```

### Production / CI (applies existing migrations only)

```bash
npx prisma migrate deploy
```

---

## API

All endpoints require the `x-user-id` header with a valid UUID.  
Returns `400` if the header is missing or not a valid UUID.

| Method | Path           | Description                    |
| ------ | -------------- | ------------------------------ |
| GET    | /api/items     | List available items           |
| POST   | /api/credits   | Add credits and return balance |
| POST   | /api/purchases | Purchase an item (debit)       |
| GET    | /api/balance   | Get current balance            |

### GET /api/items

```json
[
  { "id": "uuid", "name": "Car", "price": 9999 },
  { "id": "uuid", "name": "Bike", "price": 4999 }
]
```

### POST /api/credits

Request:

```json
{ "amount": 1000 }
```

Response `200`:

```json
{ "balance": 1000 }
```

- `amount` must be a positive integer > 0, otherwise `400`.

### POST /api/purchases

Request:

```json
{ "itemId": "uuid" }
```

- `404` if item does not exist.
- `409` if insufficient balance.
- `204 No Content` on success.

### GET /api/balance

Response `200`:

```json
{ "balance": 501 }
```

- Returns `{ "balance": 0 }` if the user has no transactions yet.

---

## Key Design Decisions

### Ledger-based Balance

The balance is never stored as a column. It is always calculated as:

```sql
SUM(CASE WHEN type = 'CREDIT' THEN amount WHEN type = 'DEBIT' THEN -amount END)
FROM ledger_transactions
WHERE user_id = $1
```

This ensures the balance is always derived from the source of truth (the ledger)
and supports full auditability.

### Price at Purchase Time

The `purchases` table stores `item_price` at the time of purchase. This means
even if the hardcoded item price changes in the future, the historical record
reflects the exact price that was charged. This satisfies the price history
requirement without needing a price history table.

---

## Concurrency Approach

Concurrent purchase requests for the same user are serialized using two
complementary mechanisms inside a single Prisma interactive transaction:

1. **Per-user advisory lock** — `pg_advisory_xact_lock(hash(user_id))` is
   acquired at the start of the transaction. This serializes all purchase
   requests for the same user, even when the user has no existing ledger rows
   (which would make `FOR UPDATE` ineffective).

2. **`SELECT ... FOR UPDATE`** — The balance query runs inside a subquery with
   `FOR UPDATE`, locking any existing ledger rows for the user for the duration
   of the transaction.

Together, these ensure that two concurrent requests cannot both pass the balance
check and both insert debits — the second request will wait until the first
commits, then re-read the updated balance.

The full flow inside `prisma.$transaction`:

1. Acquire advisory lock (blocks concurrent requests for same user).
2. Calculate balance using `getBalance` typed SQL (`FOR UPDATE`).
3. Reject with `409` if balance < item price.
4. Insert `DEBIT` ledger transaction.
5. Insert `purchases` record with `item_price` snapshot.
6. Commit — locks released automatically.

---

## Database Indexes

The Prisma schema defines two indexes on `ledger_transactions`:

- `@@index([user_id], name: "idx_ledger_user_id")`
  - Purpose: fast lookup of all ledger rows for a given user.
  - Supports: balance calculations and queries like `SELECT ... FROM ledger_transactions WHERE user_id = $1`.
  - Trade-off: small write overhead on each ledger insert; large read performance gain for per-user queries.

- `@@index([user_id, created_at], name: "idx_ledger_user_id_created_at")`
  - Purpose: efficient time-range and ordered queries for a user's transactions.
  - Supports: queries like `SELECT ... FROM ledger_transactions WHERE user_id = $1 AND created_at BETWEEN $2 AND $3 ORDER BY created_at DESC`.
  - Trade-off: slightly higher write cost and index storage; enables fast range scans and time-ordered retrieval per user.

These indexes target the primary access patterns (per-user balance calc, purchase flow, transaction history). For extremely large tables you may consider alternative solutions.

**Future Considerations**
Two indexes on `ledger_transactions`
  @@index([user_id, type], name: "idx_ledger_user_id_type")
  @@index([created_at], name: "idx_ledger_created_at")

A future consideration to add these two indexes: 
The first would accelerate queries that filter a specific user and transaction type(e.g, only CREDITS or only DEBITS)

- Benefits: much faster scans when you frequently run type-scoped aggregates or lists (reduces rows scanned).
- Trade-offs: small additional write and storage cost on every ledger insert; if most queries always need both types together, the index gives little benefit.
- When to add: add if you observe many queries that explicitly filter by type (analytics, reporting, or separate credit/debit reconciliations).

The second index `idx_ledger_created_at` could speed up time ranges queries and assist in background tasks that scan by timestamp (cleanup, TTL(Idempotency))

- Benefits: efficient temporal scans without touching unrelated index structures; useful for retention jobs and backfill analytics.
- Trade-offs: extra write amplification and index bloat on high insert velocity; not useful for per-user queries unless combined with user_id.
- When to add: add if you have background jobs that scan by time, retention/archival requirements, or need to support global time-based analytics.
---

## Idempotency (Design Note)

To support idempotency for `POST /api/purchases` via an `x-idempotency-key`
header, I would add an `idempotency_keys` table with columns: `key` (unique
string), `user_id`, `response_status`, `created_at`, and optionally a
`transaction_id` foreign key. On each purchase request, before running the
ledger transaction, the service would attempt to insert a row with the provided
key inside the same database transaction. If the insert succeeds (key is new),
the purchase proceeds normally and the row is committed alongside the ledger
entries. If the insert fails due to a unique constraint violation (key already
exists), the service reads the stored response status and returns it directly
without creating a new transaction or affecting the balance. To prevent stale
keys from accumulating, rows older than a configurable TTL (e.g., 24 hours)
would be periodically cleaned up via a background job or a partial index with
`WHERE created_at > now() - interval '24 hours'`. This approach is
database-native, requires no external cache (Redis), and is safe under
concurrent requests because the unique constraint and transactional insert
guarantee exactly-once execution even if two identical requests arrive
simultaneously.

---

## Running Tests

```bash
# unit tests
npm test

# unit tests with coverage
npm run test:cov

# lint
npm run lint
```

---

## CI/CD

- **CI** (`ci.yml`): Runs on push/PR to `development`. Spins up a local
  Postgres service, generates Prisma client + typed SQL, runs migrations,
  builds, lints, and tests.
- **Deploy** (`prod.yml`): Runs on push to `main`. Generates client, runs
  production migrations against Supabase, builds, lints, tests, then deploys
  to Railway via CLI.

---

## Environment variables

Set environment variables in a local `.env` for development (do not commit), in GitHub Actions secrets for CI, and in Railway service variables for runtime deployment.

| Variable               | Required            | Purpose                                                                                                                                          |
| ---------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`         | Yes                 | PostgreSQL connection string (e.g. Supabase). Required for runtime and for Prisma commands that contact the DB (generate --sql, migrate deploy). |
| `DATABASE_SHADOW_URL`  | Optional (dev only) | Separate shadow database used by `prisma migrate dev`. Do not point this at your production DB.                                                  |
| `RAILWAY_TOKEN`        | Optional (CI only)  | Railway project token used by the Railway CLI in CI to deploy or manage variables. Store as a GitHub secret.                                     |
| `RAILWAY_SERVICE_NAME` | Optional (CI only)  | Railway service identifier used by the CLI in CI (store as a GitHub secret).                                                                     |

Notes:

- Railway variables are not required in the repo; add them in the Railway UI if you deploy the service there.
- For CI, keep secrets in GitHub Actions (or in a protected Environment) rather than in source
