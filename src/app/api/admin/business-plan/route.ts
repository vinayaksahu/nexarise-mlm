import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { invalidateConfigCache } from '@/lib/business-plan';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'PLAN_EDITOR'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Invalidate cache
    invalidateConfigCache();

    await db.$transaction(async (tx) => {
      // Set all existing plans to inactive
      await tx.businessPlanVersion.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });

      // Create new plan
      const newPlan = await tx.businessPlanVersion.create({
        data: {
          config: body,
          isActive: true,
          createdAt: new Date(),
          createdById: session.userId,
        }
      });

      await tx.auditLog.create({
        data: {
          adminId: session.userId,
          action: 'CREATE_BUSINESS_PLAN',
          target: newPlan.id,
          newValue: JSON.stringify(body),
          ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
          createdAt: new Date(),
        }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating business plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
