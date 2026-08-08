# NexaRise Test Plan

## 1. Unit/Integration Tests
- Core Financial Services (ROI calc, Level Income tree traversal).
- Prisma transaction rollbacks on failure.
- Reward 50/50 qualification logic.

## 2. API Endpoint Testing
- Validate rate-limiting and authorization guards.
- Verify idempotency keys block duplicate requests for deposits/withdrawals.

## 3. Financial End-to-End Scenarios
- **Scenario A**: User invests $1000. Cron runs. User gets $10 ROI. Sponsor gets $3 Level 1 income.
- **Scenario B**: 50/50 Reward check. Sponsor has $2500 Leg A, $2500 Leg B. Reward is credited once. Re-running check does not re-credit.

## 4. Manual QA Checklist
- UI/UX layout across desktop/tablet/mobile.
- User flow: Register -> Deposit -> Admin Approve -> Invest -> Cron -> Withdraw.
- Dummy user generator testing without affecting production metrics.
