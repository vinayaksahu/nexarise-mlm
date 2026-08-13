import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loginSchema } from '@/lib/validations';
import { verifyPassword, createToken, setSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SUPPORT', 'VIEWER'];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { login, password } = result.data;
    const isAdminPortal = body.isAdminPortal === true;
    const cleanLogin = login.toLowerCase().trim();

    const user = await db.user.findFirst({
      where: {
        OR: [{ email: cleanLogin }, { username: cleanLogin }]
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid login credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid login credentials' }, { status: 401 });
    }

    const userIsAdmin = ADMIN_ROLES.includes(user.role);

    // Admin accounts can NEVER be suspended or blocked
    if (userIsAdmin && (user.status === 'SUSPENDED' || user.status === 'BANNED')) {
      await db.user.update({
        where: { id: user.id },
        data: { status: 'ACTIVE' }
      });
    } else if (!userIsAdmin && (user.status === 'SUSPENDED' || user.status === 'BANNED')) {
      return NextResponse.json({ error: 'Account is suspended or banned. Please contact support.' }, { status: 403 });
    }

    // Enforce Portal Isolation: Admins can ONLY log in via /admin/login
    if (isAdminPortal && !userIsAdmin) {
      return NextResponse.json({
        error: 'Access denied: Regular member accounts cannot log in from the Admin Portal. Please use the member login page.'
      }, { status: 403 });
    }

    if (!isAdminPortal && userIsAdmin) {
      return NextResponse.json({
        error: 'Admin Portal Access Required: Admin accounts must log in from /admin/login'
      }, { status: 403 });
    }

    const token = await createToken({ userId: user.id, role: user.role });
    await setSession(token);

    // Trigger New Login Notification
    await createNotification({
      userId: user.id,
      title: 'New Login Detected',
      message: 'A new login was detected on your NexaRise account.',
      type: 'SECURITY',
      link: userIsAdmin ? '/admin' : '/security',
      eventId: `login_${user.id}_${Date.now()}`,
    });

    const redirectUrl = userIsAdmin ? '/admin' : '/dashboard';

    return NextResponse.json({
      success: true,
      redirectUrl,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
