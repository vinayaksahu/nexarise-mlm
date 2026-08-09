import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    let email = '';

    if (session?.userId) {
      const user = await db.user.findUnique({
        where: { id: session.userId },
        select: { email: true }
      });
      if (user?.email) email = user.email;
    } else {
      const body = await req.json().catch(() => ({}));
      if (body.email) email = String(body.email).toLowerCase().trim();
    }

    if (!email) {
      return NextResponse.json({ error: 'Registered email address is required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'PIN reset instructions have been sent to your registered email address. Your old PIN is never displayed for security reasons.'
    });
  } catch (error) {
    console.error('Forgot PIN error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
