# NexaRise Security Plan

## 1. Authentication & Authorization
- Strong password hashing (bcrypt/argon2).
- Transaction PIN required for sensitive operations (Withdrawal, P2P).
- Role-Based Access Control (RBAC): Super Admin, Admin, Finance, User.

## 2. Financial Security
- **Idempotency**: Strict unique constraints on `reference_key` for ledger entries to prevent double-spending or duplicate rewards.
- **Precision**: Database-level Decimal precision. No floating point math in JS.
- **Validation**: Strict server-side validation (Zod) for all amounts and user inputs.

## 3. Anti-Fraud & Rate Limiting
- Rate limit login, registration, and withdrawal endpoints.
- Basic fraud flags: identical IP, rapid sequential P2P transfers, self-referral blocks.

## 4. Audit
- All admin actions (changing business plan, approving deposits) recorded in `AuditLog`.
