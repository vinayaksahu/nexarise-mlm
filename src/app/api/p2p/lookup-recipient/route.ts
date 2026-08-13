import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ found: false });
    }

    // Find recipient user by username, email, or referralCode
    const recipient = await db.user.findFirst({
      where: {
        OR: [
          { username: { equals: query, mode: 'insensitive' } },
          { email: { equals: query, mode: 'insensitive' } },
          { referralCode: { equals: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        sponsorId: true,
        status: true,
      },
    });

    if (!recipient) {
      return NextResponse.json({ found: false });
    }

    // Prevent transferring to self
    if (recipient.id === session.userId) {
      return NextResponse.json({
        found: true,
        isSelf: true,
        name: recipient.name,
        email: recipient.email,
        username: recipient.username,
        status: recipient.status,
      });
    }

    // Determine if recipient is in current user's downline & what level
    let currentSponsorId = recipient.sponsorId;
    let level = 0;
    let isTeam = false;

    for (let depth = 1; depth <= 25; depth++) {
      if (!currentSponsorId) break;
      if (currentSponsorId === session.userId) {
        isTeam = true;
        level = depth;
        break;
      }
      const uplineUser = await db.user.findUnique({
        where: { id: currentSponsorId },
        select: { sponsorId: true },
      });
      if (!uplineUser) break;
      currentSponsorId = uplineUser.sponsorId;
    }

    return NextResponse.json({
      found: true,
      isSelf: false,
      name: recipient.name,
      email: recipient.email,
      username: recipient.username,
      status: recipient.status,
      teamStatus: isTeam ? 'TEAM' : 'CROSS_TEAM',
      level: isTeam ? level : null,
      levelLabel: isTeam ? `Level #${level}` : 'CrossTeam Member',
    });
  } catch (error) {
    console.error('Error looking up P2P recipient:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
