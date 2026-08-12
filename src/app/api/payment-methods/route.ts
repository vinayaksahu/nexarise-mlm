import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const methods = await db.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    // Parse and sort methods so default method is first
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

    // Sort: isDefault first, then sortOrder, then createdAt
    parsedMethods.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1
      if (!a.isDefault && b.isDefault) return 1
      return (a.sortOrder || 0) - (b.sortOrder || 0)
    })

    return NextResponse.json({ methods: parsedMethods })
  } catch (error) {
    console.error('Fetch payment methods error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
