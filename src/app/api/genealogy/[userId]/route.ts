import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import Decimal from 'decimal.js'

interface TreeNode {
  id: string
  name: string | null
  username: string
  referralCode: string
  status: string
  createdAt: Date
  activeInvestment: number
  children: TreeNode[]
}

async function buildTree(userId: string, depth: number, isSuperAdminSession: boolean): Promise<TreeNode[]> {
  if (depth > 4) return []

  const users = await db.user.findMany({
    where: { sponsorId: userId, role: 'USER' },
    select: {
      id: true,
      name: true,
      username: true,
      referralCode: true,
      status: true,
      createdAt: true,
      role: true,
    }
  })

  const treeNodes: TreeNode[] = []

  for (const user of users) {
    const investments = await db.investment.aggregate({
      where: { userId: user.id, status: 'ACTIVE' },
      _sum: { amount: true }
    })
    const activeInvestment = new Decimal(investments._sum.amount?.toString() || 0).toNumber()

    const children = await buildTree(user.id, depth + 1, isSuperAdminSession)

    const isSuper = user.role === 'SUPER_ADMIN' || user.username === 'superadmin'
    const displayUsername = (!isSuperAdminSession && isSuper) ? 'System' : user.username

    const effectiveStatus = (user.status === 'SUSPENDED' || user.status === 'BANNED')
      ? user.status
      : (activeInvestment > 0 ? 'ACTIVE' : 'INACTIVE')

    treeNodes.push({
      id: user.id,
      name: user.name,
      username: displayUsername,
      referralCode: user.referralCode,
      status: effectiveStatus,
      createdAt: user.createdAt,
      activeInvestment,
      children
    })
  }

  return treeNodes
}

async function isUserInDownline(sponsorId: string, targetId: string): Promise<boolean> {
  let currentUser = targetId
  
  while (currentUser) {
    const user = await db.user.findUnique({
      where: { id: currentUser },
      select: { sponsorId: true }
    })

    if (!user || !user.sponsorId) return false
    if (user.sponsorId === sponsorId) return true
    
    currentUser = user.sponsorId
  }
  
  return false
}

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isSuperAdminSession = session.role === 'SUPER_ADMIN'
  const { userId } = await params

  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.userId !== userId) {
    const inDownline = await isUserInDownline(session.userId, userId)
    if (!inDownline) {
      return NextResponse.json({ error: 'Unauthorized to view this tree' }, { status: 403 })
    }
  }

  try {
    const tree = await buildTree(userId, 1, isSuperAdminSession)
    return NextResponse.json({ tree })
  } catch (error) {
    console.error('Genealogy GET error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
