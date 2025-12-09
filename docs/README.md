Wallet Transactions API docs and examples

This small document contains example curl commands to exercise the API implemented in this project.

Base URL

http://localhost:8000

POST /api/transactions — Create a transaction

Example: Credit (adds to wallet)

```bash
curl -s -X POST http://localhost:8000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_id": 1,
    "type": "credit",
    "amount": 2500.50,
    "reference": "CREDIT-2025-0001",
    "idempotency_key": "idem-credit-001"
  }'
```

Example: Debit (subtracts from wallet)

```bash
curl -s -X POST http://localhost:8000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_id": 1,
    "type": "debit",
    "amount": 1500.00,
    "reference": "DEBIT-2025-0001",
    "idempotency_key": "idem-debit-001"
  }'
```

Idempotency example

- Use the same `idempotency_key` for retries. The first request will create the transaction. Repeating the same body/key will return the same response and will not create a duplicate transaction.

```bash
# First request (creates)
curl -s -X POST http://localhost:8000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_id": 1,
    "type": "debit",
    "amount": 1000.00,
    "reference": "DEBIT-REPEAT-001",
    "idempotency_key": "idem-repeat-001"
  }'

# Retry (uses same idempotency_key) - returns same response
curl -s -X POST http://localhost:8000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_id": 1,
    "type": "debit",
    "amount": 1000.00,
    "reference": "DEBIT-REPEAT-001",
    "idempotency_key": "idem-repeat-001"
  }'
```

GET /api/transactions — List and filter

- Pagination: `page`, `per_page`
- Search by reference: `q`
- Filter by `type` (credit|debit)
- Date range: `from` and `to` (ISO date)

Examples:

```bash
# Get first page, 10 per page
curl "http://localhost:8000/api/transactions?per_page=10&page=1"

# Search references containing "TX-2025"
curl "http://localhost:8000/api/transactions?q=TX-2025"

# Filter credits only from 2025-01-01 to 2025-12-31
curl "http://localhost:8000/api/transactions?type=credit&from=2025-01-01&to=2025-12-31"
```

OpenAPI spec

The full OpenAPI 3 spec is available at `docs/openapi.yaml` in this repository.
