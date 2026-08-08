import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registerSchema } from '@/lib/validations';
import { hashPassword } from '@/lib/auth';

function generateReferralCode() {
  return 'NR' + Math.random().toString(36).substring(2, 8).toUpperCase() + Date.now().toString(36).substring(-4);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { name, username, email, mobile, password, referralCode } = result.data;

    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 400 });
    }

    let sponsorId: string | null = null;
    if (referralCode) {
      const sponsor = await db.user.findUnique({ where: { referralCode } });
      if (!sponsor) {
        return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
      }
      sponsorId = sponsor.id;
    }

    const passwordHash = await hashPassword(password);
    const newReferralCode = generateReferralCode();

    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          username,
          email,
          mobile,
          passwordHash,
          referralCode: newReferralCode,
          sponsorId,
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

      return newUser;
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
