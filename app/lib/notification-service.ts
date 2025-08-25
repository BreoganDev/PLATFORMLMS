import { prisma } from './db';
import type { NotificationType, User } from '@prisma/client';

export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: any;
  sendEmail?: boolean;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class NotificationService {
  /**
   * Create and send a notification
   */
  static async createNotification(data: NotificationData): Promise<void> {
    try {
      // Create notification in database
      await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          metadata: data.metadata,
        },
      });

      // TODO: Implement email sending when email service is configured
      if (data.sendEmail) {
        console.log(`Email notification would be sent: ${data.title}`);
        // await this.sendEmailNotification(data);
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  /**
   * Send email notification based on type (PLACEHOLDER)
   */
  private static async sendEmailNotification(data: NotificationData): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        include: { notificationPreferences: true },
      });

      if (!user?.email) {
        console.log('User email not found, skipping email notification');
        return;
      }

      // Check user preferences
      const preferences = user.notificationPreferences;
      if (!this.shouldSendEmailForType(data.type, preferences)) {
        console.log(`User has disabled email notifications for ${data.type}`);
        return;
      }

      // TODO: Implement actual email sending
      console.log(`Would send email to ${user.email}: ${data.title}`);
      
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  /**
   * Check if email should be sent based on user preferences
   */
  private static shouldSendEmailForType(
    type: NotificationType,
    preferences: any
  ): boolean {
    if (!preferences) return true; // Default to sending if no preferences set

    const typeToPreferenceMap: Record<NotificationType, keyof typeof preferences> = {
      WELCOME: 'emailWelcome',
      COURSE_ENROLLMENT: 'emailCourseEnrollment',
      COURSE_COMPLETION: 'emailCourseCompletion',
      NEW_COURSE_AVAILABLE: 'emailNewCourses',
      PROGRESS_REMINDER: 'emailProgressReminders',
      CERTIFICATE_ISSUED: 'emailCertificates',
      PROMOTION: 'emailPromotions',
      SYSTEM_ANNOUNCEMENT: 'emailPromotions', // Use promotions setting for system announcements
    };

    const preferenceKey = typeToPreferenceMap[type];
    return preferences[preferenceKey] ?? true;
  }

  /**
   * Send welcome notification to new user
   */
  static async sendWelcomeNotification(userId: string): Promise<void> {
    await this.createNotification({
      userId,
      type: 'WELCOME',
      title: '¡Bienvenido a LMS Platform!',
      message: 'Te damos la bienvenida a nuestra plataforma de aprendizaje.',
      sendEmail: true,
    });
  }

  /**
   * Send course enrollment notification
   */
  static async sendEnrollmentNotification(
    userId: string,
    courseId: string,
    courseName: string,
    courseSlug: string
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'COURSE_ENROLLMENT',
      title: 'Nueva inscripción a curso',
      message: `Te has inscrito exitosamente en "${courseName}"`,
      metadata: { courseId, courseName, courseSlug },
      sendEmail: true,
    });
  }

  /**
   * Send course completion notification
   */
  static async sendCompletionNotification(
    userId: string,
    courseId: string,
    courseName: string,
    certificateId?: string
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'COURSE_COMPLETION',
      title: '¡Curso completado!',
      message: `¡Felicidades! Has completado "${courseName}"`,
      metadata: { courseId, courseName, certificateId },
      sendEmail: true,
    });
  }

  /**
   * Send certificate issued notification
   */
  static async sendCertificateNotification(
    userId: string,
    courseId: string,
    courseName: string,
    certificateId: string,
    certificateNumber: string
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'CERTIFICATE_ISSUED',
      title: 'Certificado emitido',
      message: `Tu certificado para "${courseName}" está listo`,
      metadata: { courseId, courseName, certificateId, certificateNumber },
      sendEmail: true,
    });
  }

  /**
   * Send new course available notification
   */
  static async sendNewCourseNotification(
    userId: string,
    courseId: string,
    courseName: string,
    courseDescription: string,
    courseSlug: string
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'NEW_COURSE_AVAILABLE',
      title: 'Nuevo curso disponible',
      message: `Echa un vistazo a nuestro nuevo curso: "${courseName}"`,
      metadata: { courseId, courseName, courseDescription, courseSlug },
      sendEmail: true,
    });
  }

  /**
   * Send progress reminder notification
   */
  static async sendProgressReminder(
    userId: string,
    courseId: string,
    courseName: string,
    courseSlug: string,
    progressPercentage: number
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'PROGRESS_REMINDER',
      title: 'Continúa tu aprendizaje',
      message: `Tienes un progreso del ${progressPercentage}% en "${courseName}"`,
      metadata: { courseId, courseName, courseSlug, progressPercentage },
      sendEmail: true,
    });
  }

  /**
   * Send bulk notifications (for admin)
   */
  static async sendBulkNotification(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    metadata?: any,
    sendEmail: boolean = true
  ): Promise<void> {
    try {
      // Create notifications for all users
      const notifications = userIds.map(userId => ({
        userId,
        type,
        title,
        message,
        metadata,
        isRead: false,
        sentAt: new Date(),
      }));

      await prisma.notification.createMany({
        data: notifications,
      });

      console.log(`Bulk notification sent to ${userIds.length} users: ${title}`);

      // TODO: Implement bulk email sending
      if (sendEmail) {
        console.log(`Bulk email would be sent to ${userIds.length} users`);
      }
    } catch (error) {
      console.error('Error sending bulk notification:', error);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true, readAt: new Date() },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Delete old notifications (cleanup job)
   */
  static async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          },
          isRead: true
        }
      });

      console.log(`Deleted ${result.count} old notifications`);
      return result.count;
    } catch (error) {
      console.error('Error deleting old notifications:', error);
      return 0;
    }
  }
}