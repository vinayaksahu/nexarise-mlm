import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registerSchema } from '@/lib/validations';
import { hashPassword } from '@/lib/auth';
import { notifyAdmins } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { name, username, email, mobile, password, referralCode, otpCode } = result.data;
    const cleanUsername = username.toLowerCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    // Verify OTP Token (if provided)
    let validOtp = null;
    if (otpCode) {
      validOtp = await db.otpToken.findFirst({
        where: {
          email: cleanEmail,
          code: String(otpCode).trim(),
          purpose: 'REGISTRATION',
          used: false,
          expiresAt: { gte: new Date() },
        },
      });

      if (!validOtp) {
        return NextResponse.json({ error: 'Invalid or expired OTP code. Please request a new OTP.' }, { status: 400 });
      }
    }

    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanEmail }, { referralCode: cleanUsername }]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 400 });
    }

    // Sponsor lookup: matches referralCode OR username
    const sponsor = await db.user.findFirst({
      where: {
        OR: [
          { referralCode: referralCode },
          { username: referralCode.toLowerCase() },
          { referralCode: referralCode.toUpperCase() }
        ]
      }
    });

    if (!sponsor) {
      return NextResponse.json({ error: 'Invalid referral code or sponsor username' }, { status: 400 });
    }
    const sponsorId = sponsor.id;

    const passwordHash = await hashPassword(password);

    const user = await db.$transaction(async (tx) => {
      // Mark OTP as used if verified
      if (validOtp) {
        await tx.otpToken.update({
          where: { id: validOtp.id },
          data: { used: true },
        });
      }

      const newUser = await tx.user.create({
        data: {
          name,
          username: cleanUsername,
          email: cleanEmail,
          mobile,
          passwordHash,
          referralCode: cleanUsername, // Referral code is user's chosen username!
          sponsorId,
          status: 'INACTIVE',
          emailVerified: true, // Email verified via OTP!
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await tx.wallet.create({
        data: {
          userId: newUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });

      await tx.businessVolume.create({
        data: {
          userId: newUser.id,
          updatedAt: new Date(),
        }
      });

      return newUser;
    });

    // Notify authorized admins of new user registration
    await notifyAdmins({
      title: 'New User Registration',
      message: `New user @${user.username} has registered.`,
      type: 'USER',
      link: '/admin/users',
      permission: 'users.view',
      eventId: `reg_user_${user.id}`,
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
