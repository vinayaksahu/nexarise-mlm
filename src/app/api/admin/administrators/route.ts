import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, hashPassword } from '@/lib/auth';
import { ADMIN_ROLES } from '@/lib/permissions';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. SuperAdmin privileges required.' }, { status: 403 });
    }

    const admins = await db.user.findMany({
      where: {
        role: {
          in: ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'USER_MANAGER', 'PLAN_EDITOR', 'SUPPORT', 'VIEWER']
        }
      },
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
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. SuperAdmin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, username, email, password, role } = body;

    if (!name || !username || !email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Role safety check: Cannot create SUPER_ADMIN via API to protect root identity
    if (!ADMIN_ROLES.includes(role) || role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Invalid admin role. Cannot assign SuperAdmin.' }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    // Check duplicate
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
    await db.auditLog.create({
      data: {
        adminId: session.userId,
        action: 'SUPER_ADMIN_CREATE_STAFF',
        target: newAdmin.username,
        newValue: `Role: ${role}`,
        createdAt: new Date(),
      }
    });

    return NextResponse.json({ message: 'Administrator account created successfully', admin: newAdmin }, { status: 201 });
  } catch (error: any) {
    console.error('Create administrator error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
