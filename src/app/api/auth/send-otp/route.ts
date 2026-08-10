import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendOtpEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email, purpose } = await req.json();

    if (!email || !String(email).trim()) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    if (!['REGISTRATION', 'PASSWORD_RESET'].includes(purpose)) {
      return NextResponse.json({ error: 'Invalid OTP purpose' }, { status: 400 });
    }

    // Check user existence based on purpose
    const existingUser = await db.user.findFirst({
      where: { email: cleanEmail },
    });

    if (purpose === 'REGISTRATION' && existingUser) {
      return NextResponse.json({ error: 'This email is already registered. Please sign in.' }, { status: 400 });
    }

    if (purpose === 'PASSWORD_RESET' && !existingUser) {
      return NextResponse.json({ error: 'No account found with this email address.' }, { status: 404 });
    }

    // Rate limiting: check recent OTP within 60s
    const recentOtp = await db.otpToken.findFirst({
      where: {
        email: cleanEmail,
        purpose,
        used: false,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentOtp) {
      return NextResponse.json({ error: 'Please wait 60 seconds before requesting another OTP.' }, { status: 429 });
    }

    // Invalidate old unused OTPs for this email and purpose
    await db.otpToken.updateMany({
      where: { email: cleanEmail, purpose, used: false },
      data: { used: true },
    });

    // Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.otpToken.create({
      data: {
        email: cleanEmail,
        code,
        purpose,
        expiresAt,
        used: false,
      },
    });

    await sendOtpEmail({ email: cleanEmail, code, purpose });

    const isSmtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${cleanEmail}.`,
      // For easy testing when SMTP is not configured in dev/staging
      ...(!isSmtpConfigured && process.env.NODE_ENV !== 'production' ? { devOtp: code } : {}),
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}
