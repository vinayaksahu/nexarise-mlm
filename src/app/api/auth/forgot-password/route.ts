import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !String(email).trim()) {
      return NextResponse.json({ error: 'Registered email address is required' }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    const user = await db.user.findFirst({
      where: { email: cleanEmail }
    });

    // Prevent account enumeration by returning standard response regardless
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent to your inbox.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
