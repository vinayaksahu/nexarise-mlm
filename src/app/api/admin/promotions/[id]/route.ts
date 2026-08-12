import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'USER_MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.role, 'promotions.manage') && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, reason, notes, expiryDate } = body;

    const promo = await db.promotionalActivation.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!promo) {
      return NextResponse.json({ error: 'Promotional activation record not found' }, { status: 404 });
    }

    if (action === 'deactivate') {
      const updatedPromo = await db.$transaction(async (tx) => {
        // 1. Update Promotional Activation status to INACTIVE
        const updated = await tx.promotionalActivation.update({
          where: { id },
          data: {
            status: 'INACTIVE',
            updatedAt: new Date(),
          },
          include: {
            user: { select: { id: true, name: true, username: true, email: true, status: true } },
          },
        });

        // 2. Check if target user has any other active promotional activation or active investment
        const otherActivePromo = await tx.promotionalActivation.findFirst({
          where: {
            userId: promo.userId,
            status: 'ACTIVE',
            id: { not: id },
          },
        });

        const activeInvestment = await tx.investment.findFirst({
          where: {
            userId: promo.userId,
            status: 'ACTIVE',
          },
        });

        // If no other active promo and no active investment, update User status to INACTIVE
        if (!otherActivePromo && !activeInvestment && promo.user.status === 'ACTIVE') {
          await tx.user.update({
            where: { id: promo.userId },
            data: { status: 'INACTIVE' },
          });
        }

        // 3. Log AuditLog
        await tx.auditLog.create({
          data: {
            adminId: session.userId,
            action: 'DEACTIVATE_PROMOTIONAL_ACTIVATION',
            target: promo.userId,
            oldValue: 'ACTIVE',
            newValue: 'INACTIVE',
            ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
            createdAt: new Date(),
          },
        });

        return updated;
      });

      return NextResponse.json({ success: true, promotion: updatedPromo });
    } else if (action === 'activate') {
      const updatedPromo = await db.$transaction(async (tx) => {
        const updated = await tx.promotionalActivation.update({
          where: { id },
          data: {
            status: 'ACTIVE',
            updatedAt: new Date(),
          },
          include: {
            user: { select: { id: true, name: true, username: true, email: true, status: true } },
          },
        });

        await tx.user.update({
          where: { id: promo.userId },
          data: { status: 'ACTIVE' },
        });

        await tx.auditLog.create({
          data: {
            adminId: session.userId,
            action: 'ACTIVATE_PROMOTIONAL_ACTIVATION',
            target: promo.userId,
            oldValue: promo.status,
            newValue: 'ACTIVE',
            ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
            createdAt: new Date(),
          },
        });

        return updated;
      });

      return NextResponse.json({ success: true, promotion: updatedPromo });
    } else {
      // General update (reason, notes, expiryDate)
      const updateData: any = { updatedAt: new Date() };
      if (reason !== undefined) updateData.reason = reason.trim();
      if (notes !== undefined) updateData.notes = notes ? notes.trim() : null;
      if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;

      const updated = await db.$transaction(async (tx) => {
        const res = await tx.promotionalActivation.update({
          where: { id },
          data: updateData,
          include: {
            user: { select: { id: true, name: true, username: true, email: true, status: true } },
          },
        });

        await tx.auditLog.create({
          data: {
            adminId: session.userId,
            action: 'UPDATE_PROMOTIONAL_ACTIVATION',
            target: promo.userId,
            oldValue: JSON.stringify({ reason: promo.reason, notes: promo.notes }),
            newValue: JSON.stringify(updateData),
            ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
            createdAt: new Date(),
          },
        });

        return res;
      });

      return NextResponse.json({ success: true, promotion: updated });
    }
  } catch (error: any) {
    console.error('Update promotional activation error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
