import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ADMIN_ROLES } from '@/lib/permissions';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.userId },
      select: { role: true }
    });

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. SuperAdmin privileges required.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { role, status } = body;

    const targetAdmin = await db.user.findUnique({
      where: { id },
      select: { id: true, role: true, username: true, status: true }
    });

    if (!targetAdmin) {
      return NextResponse.json({ error: 'Administrator account not found' }, { status: 404 });
    }

    if (targetAdmin.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'SuperAdmin account cannot be modified or demoted' }, { status: 403 });
    }

    if (role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot elevate account to SuperAdmin' }, { status: 400 });
    }

    const updateData: any = {};
    if (role && ADMIN_ROLES.includes(role)) updateData.role = role;
    if (status && ['ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(status)) updateData.status = status;

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, username: true, email: true, role: true, status: true, createdAt: true }
    });

    try {
      await db.auditLog.create({
        data: {
          adminId: session.userId,
          action: 'SUPER_ADMIN_UPDATE_STAFF',
          target: targetAdmin.username,
          oldValue: `Role: ${targetAdmin.role}, Status: ${targetAdmin.status}`,
          newValue: `Role: ${updated.role}, Status: ${updated.status}`,
          createdAt: new Date(),
        }
      });
    } catch (auditErr) {
      console.warn('Audit log warning:', auditErr);
    }

    return NextResponse.json({ message: 'Administrator account updated successfully', admin: updated });
  } catch (error: any) {
    console.error('Update administrator error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.userId },
      select: { role: true }
    });

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. SuperAdmin privileges required.' }, { status: 403 });
    }

    const { id } = await params;
    const targetAdmin = await db.user.findUnique({
      where: { id },
      select: { id: true, role: true, username: true }
    });

    if (!targetAdmin) {
      return NextResponse.json({ error: 'Administrator account not found' }, { status: 404 });
    }

    if (targetAdmin.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'SuperAdmin account cannot be deleted' }, { status: 403 });
    }

    await db.user.update({
      where: { id },
      data: { status: 'INACTIVE' }
    });

    return NextResponse.json({ message: 'Administrator deactivated successfully' });
  } catch (error: any) {
    console.error('Delete administrator error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
