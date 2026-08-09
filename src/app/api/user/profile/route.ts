import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        mobile: true,
        role: true,
        referralCode: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ profile: user });
  } catch (error) {
    console.error('Fetch profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, mobile } = body;

    const dataToUpdate: any = { updatedAt: new Date() };

    if (name !== undefined) dataToUpdate.name = String(name).trim();
    if (mobile !== undefined) dataToUpdate.mobile = String(mobile).trim();

    const updatedUser = await db.user.update({
      where: { id: session.userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        mobile: true,
      }
    });

    return NextResponse.json({ success: true, profile: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
