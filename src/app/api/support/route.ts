import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createNotification, notifyAdmins } from '@/lib/notifications';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tickets = await db.supportTicket.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { category, subject, message } = await req.json();

    const ticket = await db.supportTicket.create({
      data: {
        userId: session.userId,
        category,
        subject,
        message,
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    const userObj = await db.user.findUnique({
      where: { id: session.userId },
      select: { username: true }
    });

    // Trigger Notifications
    await createNotification({
      userId: session.userId,
      title: 'Support Ticket Created',
      message: 'Your support ticket has been created successfully.',
      type: 'SUPPORT',
      link: '/support',
      eventId: `tkt_user_${ticket.id}`,
    });

    await notifyAdmins({
      title: 'New Support Ticket',
      message: `New support ticket from @${userObj?.username || 'user'} requires attention.`,
      type: 'SUPPORT',
      link: '/support',
      permission: 'support.view',
      eventId: `tkt_admin_${ticket.id}`,
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
