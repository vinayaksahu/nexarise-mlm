import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!['ACTIVE', 'SUSPENDED', 'BANNED', 'INACTIVE'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let targetStatus = status;
    if (status === 'ACTIVE') {
      const hasActiveInvestment = await db.investment.findFirst({
        where: { userId: id, status: 'ACTIVE' }
      });
      // If user has no active investment, status becomes INACTIVE instead of ACTIVE
      targetStatus = hasActiveInvestment ? 'ACTIVE' : 'INACTIVE';
    }

    await db.user.update({
      where: { id },
      data: { status: targetStatus }
    });

    await db.auditLog.create({
      data: {
        adminId: session.userId,
        action: 'UPDATE_USER_STATUS',
        target: id,
        oldValue: user.status,
        newValue: status,
        ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
        createdAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
