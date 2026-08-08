# NexaRise Database Schema (Prisma)

Core models proposed for the `schema.prisma`:

- **User**: id, username, email, password_hash, transaction_pin_hash, role, status, sponsor_id (self-relation), created_at
- **BusinessPlanVersion**: version_id, min_investment, max_investment, roi_percent, active, created_at
- **Investment**: id, user_id, amount, status, start_date, end_date, plan_version_id
- **Wallet**: id, user_id, available_balance, roi_balance, level_balance, reward_balance, total_income
- **LedgerEntry**: id, user_id, amount, type (DEPOSIT, ROI, LEVEL_INCOME, REWARD, WITHDRAWAL, P2P), status, balance_before, balance_after, reference_key (unique), created_at
- **Withdrawal**: id, user_id, amount, fee, net_amount, status, created_at
- **Deposit**: id, user_id, amount, method, status, reference_image, created_at
- **AuditLog**: id, admin_id, action, target, old_value, new_value, ip, created_at

All financial values will use `Decimal` type.
