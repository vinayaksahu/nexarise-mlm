import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT', 'VIEWER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const defaultRewards = [
      { name: 'Silver', businessRequired: 5000, rewardAmount: 200, sortOrder: 1 },
      { name: 'Gold', businessRequired: 10000, rewardAmount: 400, sortOrder: 2 },
      { name: 'Platinum', businessRequired: 20000, rewardAmount: 700, sortOrder: 3 },
      { name: 'Diamond', businessRequired: 50000, rewardAmount: 1000, sortOrder: 4 },
    ];

    let rewards = await db.rewardDefinition.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });

    const isOutdated = rewards.length !== 4 || rewards.some(r => !['Silver', 'Gold', 'Platinum', 'Diamond'].includes(r.name));

    if (rewards.length === 0 || isOutdated) {
      await db.rewardDefinition.updateMany({
        data: { isActive: false }
      });

      for (const r of defaultRewards) {
        await db.rewardDefinition.upsert({
          where: { id: r.name.toLowerCase() },
          update: { ...r, isActive: true },
          create: { id: r.name.toLowerCase(), ...r, isActive: true, createdAt: new Date() }
        });
      }

      rewards = await db.rewardDefinition.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      });
    }

    return NextResponse.json({ rewards });
  } catch (error) {
    console.error('Fetch admin rewards error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
