import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'USER_MANAGER', 'VIEWER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { username: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status && ['ACTIVE', 'INACTIVE', 'EXPIRED'].includes(status)) {
      where.status = status;
    }

    const [promotions, totalCount] = await Promise.all([
      db.promotionalActivation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              status: true,
              referralCode: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      }),
      db.promotionalActivation.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      promotions,
      totalCount,
      totalPages,
      page,
    });
  } catch (error: any) {
    console.error('Error fetching promotional activations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'USER_MANAGER'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!hasPermission(session.role, 'promotions.manage') && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, reason, notes, startDate, expiryDate } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'User selection is required' }, { status: 400 });
    }

    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return NextResponse.json({ error: 'Activation reason is required' }, { status: 400 });
    }

    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, status: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const parsedStartDate = startDate ? new Date(startDate) : new Date();
    const parsedExpiryDate = expiryDate ? new Date(expiryDate) : null;

    if (parsedExpiryDate && parsedExpiryDate <= parsedStartDate) {
      return NextResponse.json({ error: 'Expiry date must be after start date' }, { status: 400 });
    }

    const newPromotion = await db.$transaction(async (tx) => {
      // 1. Create Promotional Activation record
      const promo = await tx.promotionalActivation.create({
        data: {
          userId,
          reason: reason.trim(),
          notes: notes ? notes.trim() : null,
          startDate: parsedStartDate,
          expiryDate: parsedExpiryDate,
          status: 'ACTIVE',
          createdById: session.userId,
          createdAt: new Date(),
        },
        include: {
          user: {
            select: { id: true, name: true, username: true, email: true, status: true },
          },
          createdBy: {
            select: { id: true, name: true, username: true },
          },
        },
      });

      // 2. Set User status to ACTIVE (if not already active)
      if (targetUser.status !== 'ACTIVE') {
        await tx.user.update({
          where: { id: userId },
          data: { status: 'ACTIVE' },
        });
      }

      // 3. Log action in AuditLog
      await tx.auditLog.create({
        data: {
          adminId: session.userId,
          action: 'CREATE_PROMOTIONAL_ACTIVATION',
          target: userId,
          oldValue: targetUser.status,
          newValue: 'ACTIVE',
          ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
          createdAt: new Date(),
        },
      });

      return promo;
    });

    return NextResponse.json({ success: true, promotion: newPromotion }, { status: 201 });
  } catch (error: any) {
    console.error('Create promotional activation error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
