import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, otpCode, newPassword } = await req.json();

    if (!email || !String(email).trim()) {
      return NextResponse.json({ error: 'Registered email address is required' }, { status: 400 });
    }

    if (!otpCode || String(otpCode).trim().length !== 6) {
      return NextResponse.json({ error: 'A valid 6-digit OTP code is required' }, { status: 400 });
    }

    if (!newPassword || String(newPassword).length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    const user = await db.user.findFirst({
      where: { email: cleanEmail }
    });

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email address' }, { status: 404 });
    }

    // Verify OTP Token
    const validOtp = await db.otpToken.findFirst({
      where: {
        email: cleanEmail,
        code: String(otpCode).trim(),
        purpose: 'PASSWORD_RESET',
        used: false,
        expiresAt: { gte: new Date() },
      },
    });

    if (!validOtp) {
      return NextResponse.json({ error: 'Invalid or expired OTP code. Please request a new OTP.' }, { status: 400 });
    }

    const newPasswordHash = await hashPassword(newPassword);

    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
          updatedAt: new Date(),
        },
      }),
      db.otpToken.update({
        where: { id: validOtp.id },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully. You can now sign in with your new password.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal Server Error. Please try again.' }, { status: 500 });
  }
}
