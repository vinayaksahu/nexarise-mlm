import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { ADMIN_ROLES } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.includes(session.role as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isSuperAdminSession = session.role === 'SUPER_ADMIN';

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

    // For subordinate admins, completely filter out Superadmin rows from audit logs
    const auditLogs = rawLogs
      .filter((log) => {
        if (isSuperAdminSession) return true;
        const isSuperActor = !log.admin || log.admin.role === 'SUPER_ADMIN' || log.admin.username === 'superadmin';
        return !isSuperActor;
      })
      .map((log) => ({
        ...log,
        action: log.action.replace(/^SUPER_ADMIN_/g, 'SYSTEM_ADMIN_'),
        admin: log.admin ? { username: log.admin.username } : null
      }));

    // For subordinate admins, completely filter out Superadmin security events
    const securityEvents = rawEvents
      .filter((event) => {
        if (isSuperAdminSession) return true;
        const isSuperActor = !event.user || event.user.role === 'SUPER_ADMIN' || event.user.username === 'superadmin';
        return !isSuperActor;
      })
      .map((event) => ({
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
