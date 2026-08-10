import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const paymentMethodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().default('CRYPTO'),
  network: z.string().min(1, 'Network is required'),
  walletAddress: z.string().min(1, 'Wallet address is required').transform(val => val.trim()),
  qrCodeUrl: z.string().optional(),
  instructions: z.string().optional(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().default(0),
})

async function checkAdminAuth(sessionUserId: string) {
  const user = await db.user.findUnique({
    where: { id: sessionUserId },
    select: { role: true }
  })
  return user && ['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(user.role)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await checkAdminAuth(session.userId)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const methods = await db.paymentMethod.findMany({
      orderBy: { createdAt: 'asc' },
    })

    const parsedMethods = methods.map(m => {
      const detailsObj = typeof m.details === 'object' && m.details !== null ? (m.details as any) : {}
      return {
        id: m.id,
        name: m.name,
        type: m.type,
        network: detailsObj.network || 'BEP-20',
        walletAddress: detailsObj.walletAddress || '',
        qrCodeUrl: detailsObj.qrCodeUrl || '',
        instructions: detailsObj.instructions || '',
        isDefault: Boolean(detailsObj.isDefault),
        sortOrder: detailsObj.sortOrder || 0,
        isActive: m.isActive,
        createdAt: m.createdAt,
      }
    })

    // Sort default first
    parsedMethods.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1
      if (!a.isDefault && b.isDefault) return 1
      return (a.sortOrder || 0) - (b.sortOrder || 0)
    })

    return NextResponse.json({ methods: parsedMethods })
  } catch (error) {
    console.error('Admin fetch payment methods error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await checkAdminAuth(session.userId)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const result = paymentMethodSchema.safeParse(body)
    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || 'Invalid data'
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const data = result.data

    // If marked as default, unset default flag on all existing payment methods
    if (data.isDefault) {
      const allMethods = await db.paymentMethod.findMany()
      for (const method of allMethods) {
        const d = typeof method.details === 'object' && method.details !== null ? (method.details as any) : {}
        if (d.isDefault) {
          d.isDefault = false
          await db.paymentMethod.update({
            where: { id: method.id },
            data: { details: d }
          })
        }
      }
    }

    const details = {
      network: data.network,
      walletAddress: data.walletAddress,
      qrCodeUrl: data.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.walletAddress)}`,
      instructions: data.instructions || '',
      isDefault: data.isDefault,
      sortOrder: data.sortOrder,
    }

    const newMethod = await db.paymentMethod.create({
      data: {
        name: data.name,
        type: data.type,
        details,
        isActive: data.isActive,
        createdAt: new Date(),
      }
    })

    return NextResponse.json({
      method: {
        id: newMethod.id,
        name: newMethod.name,
        type: newMethod.type,
        ...details,
        isActive: newMethod.isActive,
        createdAt: newMethod.createdAt,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Admin create payment method error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
