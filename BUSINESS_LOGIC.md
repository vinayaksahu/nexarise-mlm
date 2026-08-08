# NexaRise Business Logic

## 1. Investment
- **Rules**: Min $5, Max $1000, whole numbers only.
- **Status**: Active, Completed, Cancelled.

## 2. Daily ROI
- **Calculation**: Investment amount * ROI% (default 1%).
- **Execution**: Daily via Cron Job.
- **Idempotency**: `reference_key` = `ROI_{investment_id}_{date}`.

## 3. Level Income
- **Trigger**: When ROI is distributed to a downline member.
- **Calculation**: Based on ROI amount. 
  - L1: 30%, L2: 20%, L3: 10%, L4-7: 5%, L8-11: 2.5%.
- **Idempotency**: `reference_key` = `LEVEL_{source_roi_id}_{recipient_id}`.

## 4. Rewards (Two-Leg System)
- **Tracking**: Direct referrals are split into Branch A and Branch B based on business volume.
- **Qualification**: 50/50 matching (configurable).
  - e.g. $5k business = $2500 Leg A + $2500 Leg B -> $200 Reward.
- **Execution**: Evaluated on new investments or via daily cron.

## 5. Wallet & Ledger
- **Rule**: NO SILENT BALANCE UPDATES. 
- Every change to wallet balance MUST have a corresponding `LedgerEntry`.
