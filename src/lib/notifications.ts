import { db } from '@/lib/db';
import { hasPermission, Permission } from '@/lib/permissions';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  eventId?: string;
}

export interface NotifyAdminsParams {
  title: string;
  message: string;
  type: string;
  link?: string;
  permission?: Permission;
  rolesAllowed?: string[];
  eventId?: string;
}

/**
 * Creates a persistent notification for a specific user with duplicate prevention
 */
export async function createNotification({
  userId,
  title,
  message,
  type,
  link,
  eventId,
}: CreateNotificationParams) {
  try {
    if (!userId) return null;

    // Check duplicate eventId if provided
    if (eventId) {
      const existing = await db.notification.findFirst({
        where: { userId, eventId },
      });
      if (existing) {
        return existing;
      }
    }

    return await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
        eventId,
        isRead: false,
        createdAt: new Date(),
      },
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
}

/**
 * Sends notifications to admin users who hold the required permission or role
 */
export async function notifyAdmins({
  title,
  message,
  type,
  link,
  permission,
  rolesAllowed,
  eventId,
}: NotifyAdminsParams) {
  try {
    // Fetch all admin users in the system (SUPER_ADMIN, ADMIN, FINANCE, etc.)
    const adminUsers = await db.user.findMany({
      where: {
        role: {
          in: ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'USER_MANAGER', 'PLAN_EDITOR', 'SUPPORT', 'VIEWER'],
        },
        status: 'ACTIVE',
      },
      select: { id: true, role: true },
    });

    const eligibleAdmins = adminUsers.filter((admin) => {
      if (rolesAllowed && rolesAllowed.length > 0) {
        return rolesAllowed.includes(admin.role);
      }
      if (permission) {
        return hasPermission(admin.role, permission);
      }
      return true;
    });

    const createdNotifications = [];
    for (const admin of eligibleAdmins) {
      const adminEventId = eventId ? `${eventId}_admin_${admin.id}` : undefined;
      const notif = await createNotification({
        userId: admin.id,
        title,
        message,
        type,
        link,
        eventId: adminEventId,
      });
      if (notif) createdNotifications.push(notif);
    }

    return createdNotifications;
  } catch (err) {
    console.error('Failed to notify admins:', err);
    return [];
  }
}
