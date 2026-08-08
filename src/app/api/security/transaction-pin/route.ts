import { NextRequest, NextResponse } from 'next/server'
import { getSession, verifyPassword, hashPin } from '@/lib/auth'
import { db } from '@/lib/db'
import { logSecurityEvent } from '@/lib/audit'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pin, currentPassword } = await req.json()

    if (!pin || !/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: 'PIN must be exactly 6 digits' }, { status: 400 })
    }

    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { passwordHash: true }
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isValidPassword = await verifyPassword(currentPassword, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
    }

    const transactionPinHash = await hashPin(pin)

    await db.user.update({
      where: { id: session.userId },
      data: { transactionPinHash }
    })

    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    await logSecurityEvent({
      userId: session.userId,
      event: 'TRANSACTION_PIN_UPDATED',
      ip,
      userAgent
    })

    return NextResponse.json({ message: 'Transaction PIN updated successfully' })
  } catch (error) {
    console.error('Update PIN Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
