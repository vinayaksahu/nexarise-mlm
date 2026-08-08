import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [auditLogs, securityEvents] = await Promise.all([
      db.auditLog.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { username: true } } }
      }),
      db.securityEvent.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true } } }
      })
    ]);

    return NextResponse.json({
      auditLogs,
      securityEvents
    });

  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
