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

      // Sync RewardDefinition records if achievementRewards is provided
      if (Array.isArray(body.achievementRewards) && body.achievementRewards.length > 0) {
        await tx.rewardDefinition.updateMany({
          data: { isActive: false }
        });

        for (let i = 0; i < body.achievementRewards.length; i++) {
          const item = body.achievementRewards[i];
          const idKey = item.name.toLowerCase().trim().replace(/\s+/g, '-');
          await tx.rewardDefinition.upsert({
            where: { id: idKey },
            update: {
              name: item.name,
              businessRequired: Number(item.volumeRequired || 0),
              rewardAmount: Number(item.rewardAmount || 0),
              sortOrder: i + 1,
              isActive: true,
            },
            create: {
              id: idKey,
              name: item.name,
              businessRequired: Number(item.volumeRequired || 0),
              rewardAmount: Number(item.rewardAmount || 0),
              sortOrder: i + 1,
              isActive: true,
              createdAt: new Date(),
            }
          });
        }
      }

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
