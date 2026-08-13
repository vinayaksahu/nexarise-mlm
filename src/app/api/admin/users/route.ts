import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'USER_MANAGER', 'SUPPORT', 'VIEWER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isSuperAdminSession = session.role === 'SUPER_ADMIN';

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Strict filter: User management queries MUST ONLY fetch role: 'USER'
    const where: any = { role: 'USER' };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { referralCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [users, totalCount] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          mobile: true,
          role: true,
          status: true,
          referralCode: true,
          createdAt: true,
          defaultPayoutMethod: true,
          cryptoWalletAddress: true,
          cryptoNetwork: true,
          bankName: true,
          bankAccountName: true,
          bankAccountNumber: true,
          bankIfscCode: true,
          upiId: true,
          _count: {
            select: { downlines: true }
          },
          sponsor: {
            select: { username: true, role: true }
          },
          investments: {
            select: { amount: true, status: true }
          },
          promotionalActivations: {
            where: { status: 'ACTIVE' },
            select: { id: true }
          }
        }
      }),
      db.user.count({ where })
    ]);

    const mappedUsers = await Promise.all(users.map(async (user) => {
      const selfInvestmentSum = user.investments
        .reduce((sum, inv) => sum + Number(inv.amount), 0);
      const hasPromotionalActivation = user.promotionalActivations.length > 0;

      // Compute downline / team investment sum
      const downlines = await db.user.findMany({
        where: { sponsorId: user.id },
        select: {
          investments: { select: { amount: true } }
        }
      });

      const directTeamSum = downlines.reduce((sum, d) =>
        sum + d.investments.reduce((s, i) => s + Number(i.amount), 0), 0);

      // Sanitize sponsor username if sponsor is Superadmin and requesting user is NOT Superadmin
      let sponsorUsername = user.sponsor?.username || null;
      if (!isSuperAdminSession && (user.sponsor?.role === 'SUPER_ADMIN' || sponsorUsername === 'superadmin')) {
        sponsorUsername = 'System';
      }

      return {
        ...user,
        sponsor: sponsorUsername ? { username: sponsorUsername } : null,
        selfInvestmentSum,
        teamInvestmentSum: directTeamSum,
        hasPromotionalActivation,
      };
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      users: mappedUsers,
      totalCount,
      totalPages,
      page
    });

  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
