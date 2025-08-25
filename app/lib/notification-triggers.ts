import { NotificationService } from './notification-service';
import { prisma } from './db';

/**
 * Trigger notifications for new user registration
 */
export async function triggerWelcomeNotification(userId: string) {
  try {
    // Create default notification preferences for the user
    await prisma.notificationPreference.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        emailWelcome: true,
        emailCourseEnrollment: true,
        emailCourseCompletion: true,
        emailNewCourses: true,
        emailProgressReminders: true,
        emailCertificates: true,
        emailPromotions: true,
      }
    });

    // Send welcome notification
    await NotificationService.sendWelcomeNotification(userId);
  } catch (error) {
    console.error('Error triggering welcome notification:', error);
  }
}

/**
 * Trigger notifications for course enrollment
 */
export async function triggerEnrollmentNotification(
  userId: string,
  courseId: string
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true, slug: true }
    });

    if (course) {
      await NotificationService.sendEnrollmentNotification(
        userId,
        courseId,
        course.title,
        course.slug
      );
    }
  } catch (error) {
    console.error('Error triggering enrollment notification:', error);
  }
}

/**
 * Trigger notifications for course completion
 */
export async function triggerCompletionNotification(
  userId: string,
  courseId: string,
  certificateId?: string
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true }
    });

    if (course) {
      await NotificationService.sendCompletionNotification(
        userId,
        courseId,
        course.title,
        certificateId
      );
    }
  } catch (error) {
    console.error('Error triggering completion notification:', error);
  }
}

/**
 * Trigger notifications for certificate issuance
 */
export async function triggerCertificateNotification(
  userId: string,
  courseId: string,
  certificateId: string,
  certificateNumber: string
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true }
    });

    if (course) {
      await NotificationService.sendCertificateNotification(
        userId,
        courseId,
        course.title,
        certificateId,
        certificateNumber
      );
    }
  } catch (error) {
    console.error('Error triggering certificate notification:', error);
  }
}

/**
 * Trigger notifications for new course announcements
 */
export async function triggerNewCourseNotifications(
  courseId: string,
  excludeUserId?: string
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { 
        title: true, 
        slug: true, 
        description: true 
      }
    });

    if (!course) return;

    // Get all students (usuarios con role STUDENT según tu schema)
    const users = await prisma.user.findMany({
      where: {
        role: 'STUDENT', // ✅ Corregido: era 'USER' ahora es 'STUDENT'
        ...(excludeUserId && { id: { not: excludeUserId } })
      },
      select: { id: true }
    });

    // Send notifications to all users
    const notifications = users.map((user: { id: string }) =>
      NotificationService.sendNewCourseNotification(
        user.id,
        courseId,
        course.title,
        course.description || '',
        course.slug
      )
    );

    await Promise.all(notifications);

    console.log(`Sent new course notifications to ${users.length} users`);
  } catch (error) {
    console.error('Error triggering new course notifications:', error);
  }
}

/**
 * Trigger progress reminder notifications
 */
export async function triggerProgressReminders() {
  try {
    // Find users with incomplete courses who haven't been active in the last 7 days
    const inactiveEnrollments = await prisma.enrollment.findMany({
      where: {
        status: 'ACTIVE',
        enrolledAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            modules: {
              where: { isPublished: true },
              include: {
                lessons: {
                  where: { isPublished: true },
                  select: { id: true }
                }
              }
            }
          }
        }
      }
    });

    for (const enrollment of inactiveEnrollments) {
      try {
        // Calculate progress percentage
        const totalLessons = enrollment.course.modules.reduce(
          (total: number, module: any) => total + module.lessons.length,
          0
        );

        if (totalLessons === 0) continue; // Skip courses with no lessons

        const completedLessons = await prisma.progress.count({
          where: {
            userId: enrollment.userId,
            lesson: {
              module: {
                courseId: enrollment.courseId
              }
            },
            isCompleted: true
          }
        });

        const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

        // Only send reminder if progress is between 1% and 90%
        if (progressPercentage > 0 && progressPercentage < 90) {
          await NotificationService.sendProgressReminder(
            enrollment.userId,
            enrollment.courseId,
            enrollment.course.title,
            enrollment.course.slug,
            progressPercentage
          );

          console.log(`Progress reminder sent to user ${enrollment.userId} for course ${enrollment.course.title} (${progressPercentage}%)`);
        }
      } catch (enrollmentError) {
        console.error(`Error processing enrollment ${enrollment.id}:`, enrollmentError);
      }
    }

    console.log(`Processed progress reminders for ${inactiveEnrollments.length} enrollments`);
  } catch (error) {
    console.error('Error triggering progress reminders:', error);
  }
}

/**
 * Trigger notifications for all users about a specific announcement
 */
export async function triggerAnnouncementNotification(
  title: string,
  message: string,
  metadata?: any,
  sendEmail: boolean = true
) {
  try {
    // Get all active users
    const users = await prisma.user.findMany({
      where: {
        role: 'STUDENT'
      },
      select: { id: true }
    });

    const userIds = users.map(user => user.id);

    // Send bulk notification
    await NotificationService.sendBulkNotification(
      userIds,
      'SYSTEM_ANNOUNCEMENT',
      title,
      message,
      metadata,
      sendEmail
    );

    console.log(`Announcement sent to ${users.length} users: ${title}`);
  } catch (error) {
    console.error('Error triggering announcement notification:', error);
  }
}

/**
 * Schedule progress reminder job (would be called by a cron job or scheduler)
 */
export async function scheduleProgressReminders() {
  console.log('Running scheduled progress reminders...');
  await triggerProgressReminders();
}

/**
 * Clean up old notifications (would be called by a cron job)
 */
export async function scheduleNotificationCleanup(daysOld: number = 30) {
  console.log('Running notification cleanup...');
  const deletedCount = await NotificationService.deleteOldNotifications(daysOld);
  console.log(`Notification cleanup completed. Deleted ${deletedCount} old notifications.`);
}