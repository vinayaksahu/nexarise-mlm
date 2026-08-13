import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const filter = searchParams.get('filter') || 'all';

    const where: any = { userId: session.userId };
    if (filter === 'unread') {
      where.isRead = false;
    } else if (filter === 'read') {
      where.isRead = true;
    }

    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      db.notification.count({
        where: { userId: session.userId, isRead: false },
      }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Body can be empty for mark all read
    }

    if (body.id) {
      await db.notification.updateMany({
        where: { id: body.id, userId: session.userId },
        data: { isRead: true },
      });
    } else {
      await db.notification.updateMany({
        where: { userId: session.userId, isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
