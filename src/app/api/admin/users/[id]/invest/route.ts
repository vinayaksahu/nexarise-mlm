import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { getBusinessConfig } from '@/lib/business-plan';
import Decimal from 'decimal.js';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid investment amount' }, { status: 400 });
    }

    const config = await getBusinessConfig();
    if (amount < config.minInvestment || amount > config.maxInvestment) {
      return NextResponse.json({ error: `Amount must be between $${config.minInvestment} and $${config.maxInvestment}` }, { status: 400 });
    }

    if (amount % config.investmentMultiple !== 0) {
      return NextResponse.json({ error: `Amount must be a multiple of $${config.investmentMultiple}` }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const plan = await db.businessPlanVersion.findFirst({
      where: { isActive: true },
      orderBy: { version: 'desc' },
    });

    if (!plan) {
      return NextResponse.json({ error: 'No active business plan found' }, { status: 500 });
    }

    const investmentAmount = new Decimal(amount);

    const investment = await db.$transaction(async (tx) => {
      // 1. Create Investment
      const newInvestment = await tx.investment.create({
        data: {
          userId: id,
          amount: investmentAmount.toNumber(),
          status: 'ACTIVE',
          planVersionId: plan.id,
          startDate: new Date(),
          createdAt: new Date(),
        },
      });

      // 2. Set User status to ACTIVE
      await tx.user.update({
        where: { id },
        data: { status: 'ACTIVE' },
      });

      // 3. Create Ledger Entry
      await tx.ledgerEntry.create({
        data: {
          userId: id,
          amount: investmentAmount.toNumber(),
          type: 'INVESTMENT',
          status: 'COMPLETED',
          balanceBefore: 0,
          balanceAfter: 0,
          referenceKey: `ADMIN-INV-${newInvestment.id}`,
          relatedEntityId: newInvestment.id,
          description: `Admin Activated Investment of $${amount}`,
          createdAt: new Date(),
        },
      });

      // 4. Update BusinessVolume
      let userVolume = await tx.businessVolume.findUnique({
        where: { userId: id },
      });

      if (!userVolume) {
        await tx.businessVolume.create({
          data: {
            userId: id,
            totalBusiness: investmentAmount.toNumber(),
            directBusiness: investmentAmount.toNumber(),
            strongLeg: 0,
            weakLeg: 0,
            updatedAt: new Date(),
          },
        });
      } else {
        await tx.businessVolume.update({
          where: { userId: id },
          data: {
            totalBusiness: { increment: investmentAmount.toNumber() },
            directBusiness: { increment: investmentAmount.toNumber() },
            updatedAt: new Date(),
          },
        });
      }

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          adminId: session.userId,
          action: 'ADMIN_CREATE_INVESTMENT',
          target: id,
          oldValue: targetUser.status,
          newValue: 'ACTIVE',
          ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
          createdAt: new Date(),
        },
      });

      return newInvestment;
    });

    return NextResponse.json({ success: true, investment });
  } catch (error: any) {
    console.error('Admin activate user investment error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
