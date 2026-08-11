import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, hashPassword } from '@/lib/auth';
import { ADMIN_ROLES } from '@/lib/permissions';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.userId },
      select: { role: true }
    });

    if (!currentUser || !['SUPER_ADMIN', 'ADMIN'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

    // Non-Superadmins MUST NOT see Superadmin accounts
    const whereCondition: any = isSuperAdmin
      ? { role: { not: 'USER' } }
      : { role: { notIn: ['USER', 'SUPER_ADMIN'] }, username: { not: 'superadmin' } };

    const admins = await db.user.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ admins });
  } catch (error) {
    console.error('Fetch administrators error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
      return NextResponse.json({ error: 'Unauthorized. Insufficient admin privileges.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, username, email, password, role } = body;

    if (!name || !username || !email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!ADMIN_ROLES.includes(role) || role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Invalid admin role.' }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    const existing = await db.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { email: cleanEmail }
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Username or Email already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newAdmin = await db.user.create({
      data: {
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        passwordHash: hashedPassword,
        role,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      }
    });

    // Audit Log
    try {
      await db.auditLog.create({
        data: {
          adminId: session.userId,
          action: 'CREATE_STAFF_ADMIN',
          target: newAdmin.username,
          newValue: `Role: ${role}`,
          createdAt: new Date(),
        }
      });
    } catch (auditErr) {
      console.warn('Audit log creation warning:', auditErr);
    }

    return NextResponse.json({ message: 'Administrator account created successfully', admin: newAdmin }, { status: 201 });
  } catch (error: any) {
    console.error('Create administrator error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
