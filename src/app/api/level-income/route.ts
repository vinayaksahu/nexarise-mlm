import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { getBusinessConfig } from '@/lib/business-plan';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await getBusinessConfig();

    const [wallet, transactions] = await Promise.all([
      db.wallet.findUnique({
        where: { userId: session.userId },
        select: { availableBalance: true, levelIncome: true }
      }),
      db.levelIncomeTransaction.findMany({
        where: { beneficiaryId: session.userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          sourceUser: {
            select: { name: true, username: true }
          },
          sourceRoi: {
            select: { amount: true }
          }
        }
      })
    ]);

    return NextResponse.json({
      wallet: {
        availableBalance: Number(wallet?.availableBalance || 0),
        levelIncome: Number(wallet?.levelIncome || 0),
      },
      config: {
        maxLevels: config.maxLevels || 11,
        levelIncomePercentages: config.levelIncomePercentages || [30, 20, 10, 5, 5, 5, 5, 2.5, 2.5, 2.5, 2.5],
      },
      transactions: transactions.map(t => ({
        id: t.id,
        level: t.level,
        percentage: Number(t.percentage),
        amount: Number(t.amount),
        referenceKey: t.referenceKey,
        createdAt: t.createdAt,
        sourceUser: t.sourceUser ? {
          name: t.sourceUser.name,
          username: t.sourceUser.username
        } : null,
        baseRoiAmount: t.sourceRoi ? Number(t.sourceRoi.amount) : null
      }))
    });
  } catch (error) {
    console.error('Fetch level income error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
