import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT', 'VIEWER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [investments, totalInvestedResult, activeCount, totalRoiResult, activePlan] = await Promise.all([
      db.investment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          user: {
            select: { name: true, username: true, email: true }
          },
          roiTransactions: {
            select: { amount: true }
          },
          planVersion: true
        }
      }),
      db.investment.aggregate({
        _sum: { amount: true }
      }),
      db.investment.count({
        where: { status: 'ACTIVE' }
      }),
      db.ledgerEntry.aggregate({
        where: { type: 'SELF_ROI', status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      db.businessPlanVersion.findFirst({
        where: { isActive: true },
        select: { version: true }
      })
    ]);

    return NextResponse.json({
      investments,
      stats: {
        totalInvested: Number(totalInvestedResult._sum.amount || 0),
        activeCount,
        totalRoi: Number(totalRoiResult._sum.amount || 0),
        activePlanVersion: activePlan?.version || 1
      }
    });
  } catch (error) {
    console.error('Fetch admin investments error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
