import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registerSchema } from '@/lib/validations';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { name, username, email, mobile, password, referralCode } = result.data;
    const cleanUsername = username.toLowerCase().trim();

    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: email.toLowerCase() }, { referralCode: cleanUsername }]
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
      const newUser = await tx.user.create({
        data: {
          name,
          username: cleanUsername,
          email: email.toLowerCase(),
          mobile,
          passwordHash,
          referralCode: cleanUsername, // Referral code is user's chosen username!
          sponsorId,
          status: 'INACTIVE',
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

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
