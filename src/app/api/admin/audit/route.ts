import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ADMIN_ROLES } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Only Super Admin can access audit logs' }, { status: 403 });
    }

    const [rawLogs, rawEvents] = await Promise.all([
      db.auditLog.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { id: true, username: true, role: true } } }
      }),
      db.securityEvent.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, username: true, role: true } } }
      })
    ]);

    const auditLogs = rawLogs.map((log) => ({
      ...log,
      admin: log.admin ? { username: log.admin.username } : null
    }));

    const securityEvents = rawEvents.map((event) => ({
      ...event,
      user: event.user ? { username: event.user.username } : null
    }));

    return NextResponse.json({
      auditLogs,
      securityEvents
    });

  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
