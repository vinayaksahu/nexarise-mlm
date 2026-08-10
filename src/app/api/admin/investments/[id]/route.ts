import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(
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
    const { status } = body;

    if (!['ACTIVE', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid investment status' }, { status: 400 });
    }

    const existing = await db.investment.findUnique({
      where: { id },
      include: { user: { select: { username: true } } }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Investment record not found' }, { status: 404 });
    }

    const updated = await db.investment.update({
      where: { id },
      data: {
        status,
        endDate: status === 'COMPLETED' || status === 'CANCELLED' ? new Date() : existing.endDate
      }
    });

    // Record Audit Log
    await db.auditLog.create({
      data: {
        adminId: session.userId,
        action: 'ADMIN_UPDATE_INVESTMENT_STATUS',
        target: existing.user.username,
        oldValue: existing.status,
        newValue: status,
        createdAt: new Date(),
      }
    });

    return NextResponse.json({ message: 'Investment status updated successfully', investment: updated });
  } catch (error: any) {
    console.error('Update investment status error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
