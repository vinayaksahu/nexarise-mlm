import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import Decimal from 'decimal.js';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT', 'VIEWER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { username: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [
      investments,
      totalCount,
      totalInvestedResult,
      activeCount,
      completedCount,
      cancelledCount,
      totalRoiResult,
      activePlan
    ] = await Promise.all([
      db.investment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          amount: true,
          status: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              status: true,
              sponsor: { select: { username: true } }
            }
          },
          planVersion: {
            select: {
              version: true,
              config: true
            }
          },
          roiTransactions: {
            select: { amount: true, createdAt: true }
          }
        }
      }),
      db.investment.count({ where }),
      db.investment.aggregate({ _sum: { amount: true } }),
      db.investment.count({ where: { status: 'ACTIVE' } }),
      db.investment.count({ where: { status: 'COMPLETED' } }),
      db.investment.count({ where: { status: 'CANCELLED' } }),
      db.ledgerEntry.aggregate({
        where: { type: 'SELF_ROI', status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      db.businessPlanVersion.findFirst({
        where: { isActive: true },
        select: { version: true }
      })
    ]);

    const totalInvested = Number(totalInvestedResult._sum.amount || 0);
    const totalRoi = Number(totalRoiResult._sum.amount || 0);

    return NextResponse.json({
      investments,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      page,
      stats: {
        totalInvested,
        activeCount,
        completedCount,
        cancelledCount,
        totalRoi,
        activePlanVersion: activePlan?.version || 1
      }
    });
  } catch (error) {
    console.error('Fetch admin investments error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { usernameOrId, amount } = body;

    if (!usernameOrId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid Username/Email and positive Amount are required' }, { status: 400 });
    }

    // Find target user
    const targetUser = await db.user.findFirst({
      where: {
        OR: [
          { username: { equals: usernameOrId.trim(), mode: 'insensitive' } },
          { email: { equals: usernameOrId.trim(), mode: 'insensitive' } },
          { id: usernameOrId.trim() }
        ]
      }
    });

    if (!targetUser) {
      return NextResponse.json({ error: `User "${usernameOrId}" not found` }, { status: 404 });
    }

    const investmentAmount = new Decimal(amount);

    // Find active plan version
    const plan = await db.businessPlanVersion.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
    });

    if (!plan) {
      return NextResponse.json({ error: 'No active business plan found' }, { status: 500 });
    }

    const newInvestment = await db.$transaction(async (tx) => {
      // Create Investment record directly
      const inv = await tx.investment.create({
        data: {
          userId: targetUser.id,
          amount: investmentAmount.toNumber(),
          status: 'ACTIVE',
          planVersionId: plan.id,
          startDate: new Date(),
          createdAt: new Date(),
        },
      });

      // Activate user if inactive
      if (targetUser.status !== 'ACTIVE') {
        await tx.user.update({
          where: { id: targetUser.id },
          data: { status: 'ACTIVE' },
        });
      }

      // Create LedgerEntry for Admin Package Activation
      await tx.ledgerEntry.create({
        data: {
          userId: targetUser.id,
          amount: investmentAmount.toNumber(),
          type: 'INVESTMENT',
          status: 'COMPLETED',
          balanceBefore: 0,
          balanceAfter: 0,
          referenceKey: `ADMIN-INV-${inv.id}`,
          relatedEntityId: inv.id,
          description: `Admin Activated Package ($${investmentAmount.toFixed(2)})`,
          createdAt: new Date(),
        },
      });

      // Update BusinessVolume
      let userVolume = await tx.businessVolume.findUnique({
        where: { userId: targetUser.id },
      });

      if (!userVolume) {
        await tx.businessVolume.create({
          data: {
            userId: targetUser.id,
            totalBusiness: investmentAmount.toNumber(),
            directBusiness: investmentAmount.toNumber(),
            strongLeg: 0,
            weakLeg: 0,
            updatedAt: new Date(),
          },
        });
      } else {
        await tx.businessVolume.update({
          where: { userId: targetUser.id },
          data: {
            totalBusiness: { increment: investmentAmount.toNumber() },
            directBusiness: { increment: investmentAmount.toNumber() },
            updatedAt: new Date(),
          },
        });
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          adminId: session.userId,
          action: 'ADMIN_CREATE_INVESTMENT',
          target: targetUser.username,
          newValue: `Amount: $${investmentAmount.toFixed(2)}, InvID: ${inv.id}`,
          createdAt: new Date(),
        },
      });

      return inv;
    });

    // Trigger Notifications for Target User
    await createNotification({
      userId: targetUser.id,
      title: 'Investment Created',
      message: `Your investment of $${investmentAmount.toFixed(2)} has been created successfully.`,
      type: 'INVESTMENT',
      link: '/investments',
      eventId: `inv_created_${newInvestment.id}`,
    });

    await createNotification({
      userId: targetUser.id,
      title: 'Investment Activated',
      message: `Your investment of $${investmentAmount.toFixed(2)} is now active.`,
      type: 'INVESTMENT',
      link: '/investments',
      eventId: `inv_activated_${newInvestment.id}`,
    });

    return NextResponse.json({ message: 'Package activated successfully', investment: newInvestment }, { status: 201 });
  } catch (error: any) {
    console.error('Admin create investment error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
