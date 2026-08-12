import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const paymentMethodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['CRYPTO', 'BANKING', 'UPI']).default('CRYPTO'),
  network: z.string().optional().default(''),
  walletAddress: z.string().optional().default(''),
  bankName: z.string().optional().default(''),
  accountName: z.string().optional().default(''),
  accountNumber: z.string().optional().default(''),
  ifscCode: z.string().optional().default(''),
  branchName: z.string().optional().default(''),
  upiId: z.string().optional().default(''),
  payeeName: z.string().optional().default(''),
  qrCodeUrl: z.string().optional().default(''),
  instructions: z.string().optional().default(''),
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
        type: m.type || 'CRYPTO',
        network: detailsObj.network || '',
        walletAddress: detailsObj.walletAddress || '',
        bankName: detailsObj.bankName || '',
        accountName: detailsObj.accountName || '',
        accountNumber: detailsObj.accountNumber || '',
        ifscCode: detailsObj.ifscCode || '',
        branchName: detailsObj.branchName || '',
        upiId: detailsObj.upiId || '',
        payeeName: detailsObj.payeeName || '',
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

    // Specific validation based on type
    if (data.type === 'CRYPTO') {
      if (!data.walletAddress) {
        return NextResponse.json({ error: 'Wallet address is required for Crypto methods' }, { status: 400 })
      }
    } else if (data.type === 'BANKING') {
      if (!data.accountNumber || !data.bankName) {
        return NextResponse.json({ error: 'Bank Name and Account Number are required for Banking methods' }, { status: 400 })
      }
    } else if (data.type === 'UPI') {
      if (!data.upiId) {
        return NextResponse.json({ error: 'UPI ID (VPA) is required for UPI methods' }, { status: 400 })
      }
    }

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

    let defaultQr = ''
    if (data.type === 'UPI' && data.upiId) {
      const upiUrl = `upi://pay?pa=${encodeURIComponent(data.upiId)}&pn=${encodeURIComponent(data.payeeName || data.name)}`
      defaultQr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`
    } else if (data.type === 'CRYPTO' && data.walletAddress) {
      defaultQr = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.walletAddress)}`
    }

    const details = {
      network: data.network,
      walletAddress: data.walletAddress,
      bankName: data.bankName,
      accountName: data.accountName,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode,
      branchName: data.branchName,
      upiId: data.upiId,
      payeeName: data.payeeName,
      qrCodeUrl: data.qrCodeUrl || defaultQr,
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
