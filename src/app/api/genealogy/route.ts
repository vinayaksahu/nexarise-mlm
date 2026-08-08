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

async function buildTree(userId: string, depth: number): Promise<TreeNode[]> {
  if (depth > 4) return []

  const users = await db.user.findMany({
    where: { sponsorId: userId },
    select: {
      id: true,
      name: true,
      username: true,
      referralCode: true,
      status: true,
      createdAt: true
    }
  })

  const treeNodes: TreeNode[] = []

  for (const user of users) {
    const investments = await db.investment.aggregate({
      where: { userId: user.id, status: 'ACTIVE' },
      _sum: { amount: true }
    })
    const activeInvestment = new Decimal(investments._sum.amount?.toString() || 0).toNumber()

    const children = await buildTree(user.id, depth + 1)

    treeNodes.push({
      id: user.id,
      name: user.name,
      username: user.username,
      referralCode: user.referralCode,
      status: user.status,
      createdAt: user.createdAt,
      activeInvestment,
      children
    })
  }

  return treeNodes
}

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rootUser = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        username: true,
        referralCode: true,
        status: true,
        createdAt: true,
      }
    })

    const rootInvestments = await db.investment.aggregate({
      where: { userId: session.userId, status: 'ACTIVE' },
      _sum: { amount: true }
    })
    const rootActiveInvestment = new Decimal(rootInvestments._sum.amount?.toString() || 0).toNumber()

    const tree = await buildTree(session.userId, 1)

    return NextResponse.json({
      root: rootUser ? {
        ...rootUser,
        activeInvestment: rootActiveInvestment
      } : null,
      tree
    })
  } catch (error) {
    console.error('Genealogy GET error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
