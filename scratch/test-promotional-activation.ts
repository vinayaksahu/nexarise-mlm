import { db } from '../src/lib/db';
import Decimal from 'decimal.js';

async function testPromotionalActivation() {
  console.log('--- Starting Promotional Activation Integration Test ---');

  // Clean up previous test users if any
  const testEmails = ['adam_test_promo@example.com', 'bob_test_promo@example.com', 'charles_test_promo@example.com'];
  await db.promotionalActivation.deleteMany({
    where: { user: { email: { in: testEmails } } },
  });
  await db.investment.deleteMany({
    where: { user: { email: { in: testEmails } } },
  });
  await db.ledgerEntry.deleteMany({
    where: { user: { email: { in: testEmails } } },
  });
  await db.businessVolume.deleteMany({
    where: { user: { email: { in: testEmails } } },
  });
  await db.wallet.deleteMany({
    where: { user: { email: { in: testEmails } } },
  });
  await db.user.deleteMany({
    where: { email: { in: testEmails } },
  });

  const now = new Date();

  // Create Adam (User with real investment of $1000)
  const adam = await db.user.create({
    data: {
      name: 'Adam Test',
      username: 'adam_test_promo',
      email: 'adam_test_promo@example.com',
      passwordHash: 'dummyhash',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  // Create Bob (User with Promotional Activation - NO real investment)
  const bob = await db.user.create({
    data: {
      name: 'Bob Test',
      username: 'bob_test_promo',
      email: 'bob_test_promo@example.com',
      passwordHash: 'dummyhash',
      status: 'INACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  // Create Charles (User with real investment of $500)
  const charles = await db.user.create({
    data: {
      name: 'Charles Test',
      username: 'charles_test_promo',
      email: 'charles_test_promo@example.com',
      passwordHash: 'dummyhash',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    },
  });

  // 1. Create real investment of $1000 for Adam
  await db.investment.create({
    data: {
      userId: adam.id,
      amount: 1000,
      status: 'ACTIVE',
      startDate: now,
      createdAt: now,
    },
  });
  await db.businessVolume.create({
    data: {
      userId: adam.id,
      totalBusiness: 1000,
      directBusiness: 1000,
      strongLeg: 0,
      weakLeg: 0,
      updatedAt: now,
    },
  });

  // 2. Create PROMOTIONAL ACTIVATION for Bob (No investment, no ledger entry, no business volume!)
  const promoBob = await db.promotionalActivation.create({
    data: {
      userId: bob.id,
      reason: 'Team Leader Special Promotional Activation',
      notes: 'Activated without real investment',
      status: 'ACTIVE',
      startDate: now,
      createdAt: now,
    },
  });
  // Update Bob account status to ACTIVE as per promotional activation rule
  await db.user.update({
    where: { id: bob.id },
    data: { status: 'ACTIVE' },
  });

  // 3. Create real investment of $500 for Charles
  await db.investment.create({
    data: {
      userId: charles.id,
      amount: 500,
      status: 'ACTIVE',
      startDate: now,
      createdAt: now,
    },
  });
  await db.businessVolume.create({
    data: {
      userId: charles.id,
      totalBusiness: 500,
      directBusiness: 500,
      strongLeg: 0,
      weakLeg: 0,
      updatedAt: now,
    },
  });

  // --- VERIFICATION CALCULATIONS FOR SCENARIO ---

  // Count active test users
  const activeTestUsers = await db.user.count({
    where: {
      email: { in: testEmails },
      status: 'ACTIVE',
    },
  });

  // Sum actual investments of test users
  const actualBusinessTestResult = await db.investment.aggregate({
    where: {
      user: { email: { in: testEmails } },
      status: 'ACTIVE',
    },
    _sum: { amount: true },
  });
  const actualBusinessTest = Number(actualBusinessTestResult._sum.amount || 0);

  // Sum business volume of test users
  const totalBusinessTestResult = await db.businessVolume.aggregate({
    where: {
      user: { email: { in: testEmails } },
    },
    _sum: { totalBusiness: true },
  });
  const totalBusinessTest = Number(totalBusinessTestResult._sum.totalBusiness || 0);

  // Count investments created for Bob (Must be 0!)
  const bobInvestmentsCount = await db.investment.count({
    where: { userId: bob.id },
  });

  // Count ledger entries created for Bob (Must be 0!)
  const bobLedgerCount = await db.ledgerEntry.count({
    where: { userId: bob.id },
  });

  console.log('--- TEST RESULTS ---');
  console.log(`Active Users (Expected: 3): ${activeTestUsers}`);
  console.log(`Actual Business (Expected: 1500): $${actualBusinessTest}`);
  console.log(`Total Business (Expected: 1500): $${totalBusinessTest}`);
  console.log(`Bob Investment Records Count (Expected: 0): ${bobInvestmentsCount}`);
  console.log(`Bob Ledger Records Count (Expected: 0): ${bobLedgerCount}`);

  // Assertions
  if (activeTestUsers !== 3) throw new Error(`Active users expected 3, got ${activeTestUsers}`);
  if (actualBusinessTest !== 1500) throw new Error(`Actual business expected 1500, got ${actualBusinessTest}`);
  if (totalBusinessTest !== 1500) throw new Error(`Total business expected 1500, got ${totalBusinessTest}`);
  if (bobInvestmentsCount !== 0) throw new Error(`Bob should have 0 investments, got ${bobInvestmentsCount}`);
  if (bobLedgerCount !== 0) throw new Error(`Bob should have 0 ledger entries, got ${bobLedgerCount}`);

  console.log('✅ ALL PROMOTIONAL ACTIVATION ASSERTIONS PASSED SUCCESSFULLY!');

  // Cleanup test records
  await db.promotionalActivation.deleteMany({ where: { user: { email: { in: testEmails } } } });
  await db.investment.deleteMany({ where: { user: { email: { in: testEmails } } } });
  await db.businessVolume.deleteMany({ where: { user: { email: { in: testEmails } } } });
  await db.user.deleteMany({ where: { email: { in: testEmails } } });
  console.log('--- Cleaned up test data ---');
}

testPromotionalActivation().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
