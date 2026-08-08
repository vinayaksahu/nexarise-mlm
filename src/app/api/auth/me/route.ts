import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        referralCode: true,
        status: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
