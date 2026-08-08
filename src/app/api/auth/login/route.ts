import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { loginSchema } from '@/lib/validations';
import { verifyPassword, createToken, setSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { login, password } = result.data;

    const user = await db.user.findFirst({
      where: {
        OR: [{ email: login }, { username: login }]
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account is not active' }, { status: 403 });
    }

    const token = await createToken({ userId: user.id, role: user.role });
    await setSession(token);

    return NextResponse.json({
      success: true,
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
