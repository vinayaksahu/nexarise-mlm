import { db } from './db'

export async function logAudit(data: {
  adminId?: string
  action: string
  target?: string
  oldValue?: string
  newValue?: string
  ip?: string
}) {
  try {
    await db.auditLog.create({
      data: {
        adminId: data.adminId,
        action: data.action,
        target: data.target,
        oldValue: data.oldValue,
        newValue: data.newValue,
        ip: data.ip,
        createdAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Failed to log audit:', error)
  }
}

export async function logSecurityEvent(data: {
  userId?: string
  event: string
  ip?: string
  userAgent?: string
  details?: string
}) {
  try {
    await db.securityEvent.create({
      data: {
        userId: data.userId,
        event: data.event,
        ip: data.ip,
        userAgent: data.userAgent,
        details: data.details,
        createdAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}
