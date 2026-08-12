import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  type: z.enum(['CRYPTO', 'BANKING', 'UPI']).optional(),
  network: z.string().optional(),
  walletAddress: z.string().optional(),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  branchName: z.string().optional(),
  upiId: z.string().optional(),
  payeeName: z.string().optional(),
  qrCodeUrl: z.string().optional(),
  instructions: z.string().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number().optional(),
})

async function checkAdminAuth(sessionUserId: string) {
  const user = await db.user.findUnique({
    where: { id: sessionUserId },
    select: { role: true }
  })
  return user && ['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(user.role)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await checkAdminAuth(session.userId)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const existing = await db.paymentMethod.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    }

    const body = await request.json()
    const result = updateSchema.safeParse(body)
    if (!result.success) {
      const errorMsg = result.error.issues[0]?.message || 'Invalid data'
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    const updates = result.data
    const currentDetails = typeof existing.details === 'object' && existing.details !== null ? (existing.details as any) : {}

    // If making this method default, unset default on all other methods
    if (updates.isDefault === true) {
      const allMethods = await db.paymentMethod.findMany()
      for (const method of allMethods) {
        if (method.id !== id) {
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
    }

    const targetType = updates.type || existing.type || 'CRYPTO'
    const newWalletAddress = updates.walletAddress !== undefined ? updates.walletAddress : (currentDetails.walletAddress || '')
    const newUpiId = updates.upiId !== undefined ? updates.upiId : (currentDetails.upiId || '')
    const newPayeeName = updates.payeeName !== undefined ? updates.payeeName : (currentDetails.payeeName || '')

    let newQrCodeUrl = updates.qrCodeUrl !== undefined ? updates.qrCodeUrl : currentDetails.qrCodeUrl

    // Auto-generate QR code if needed
    if (!updates.qrCodeUrl) {
      if (targetType === 'UPI' && (updates.upiId || !currentDetails.qrCodeUrl)) {
        const upiUrl = `upi://pay?pa=${encodeURIComponent(newUpiId)}&pn=${encodeURIComponent(newPayeeName || updates.name || existing.name)}`
        newQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`
      } else if (targetType === 'CRYPTO' && (updates.walletAddress || !currentDetails.qrCodeUrl)) {
        newQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(newWalletAddress)}`
      }
    }

    const newDetails = {
      ...currentDetails,
      network: updates.network !== undefined ? updates.network : (currentDetails.network || ''),
      walletAddress: newWalletAddress,
      bankName: updates.bankName !== undefined ? updates.bankName : (currentDetails.bankName || ''),
      accountName: updates.accountName !== undefined ? updates.accountName : (currentDetails.accountName || ''),
      accountNumber: updates.accountNumber !== undefined ? updates.accountNumber : (currentDetails.accountNumber || ''),
      ifscCode: updates.ifscCode !== undefined ? updates.ifscCode : (currentDetails.ifscCode || ''),
      branchName: updates.branchName !== undefined ? updates.branchName : (currentDetails.branchName || ''),
      upiId: newUpiId,
      payeeName: newPayeeName,
      qrCodeUrl: newQrCodeUrl || '',
      instructions: updates.instructions !== undefined ? updates.instructions : (currentDetails.instructions || ''),
      isDefault: updates.isDefault !== undefined ? updates.isDefault : Boolean(currentDetails.isDefault),
      sortOrder: updates.sortOrder !== undefined ? updates.sortOrder : (currentDetails.sortOrder || 0),
    }

    const updatedMethod = await db.paymentMethod.update({
      where: { id },
      data: {
        name: updates.name !== undefined ? updates.name : existing.name,
        type: targetType,
        details: newDetails,
        isActive: updates.isActive !== undefined ? updates.isActive : existing.isActive,
      }
    })

    return NextResponse.json({
      method: {
        id: updatedMethod.id,
        name: updatedMethod.name,
        type: updatedMethod.type,
        ...newDetails,
        isActive: updatedMethod.isActive,
        createdAt: updatedMethod.createdAt,
      }
    })
  } catch (error) {
    console.error('Admin update payment method error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await checkAdminAuth(session.userId)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const existing = await db.paymentMethod.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 404 })
    }

    await db.paymentMethod.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin delete payment method error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
