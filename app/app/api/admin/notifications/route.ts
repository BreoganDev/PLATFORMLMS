
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NotificationService } from '@/lib/notification-service';
import { z } from 'zod';

const bulkNotificationSchema = z.object({
  type: z.enum(['NEW_COURSE_AVAILABLE', 'PROMOTION', 'SYSTEM_ANNOUNCEMENT']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  userIds: z.array(z.string()).optional(), // If empty, send to all users
  courseId: z.string().optional(),
  courseName: z.string().optional(),
  courseDescription: z.string().optional(),
  courseSlug: z.string().optional(),
  sendEmail: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = bulkNotificationSchema.parse(body);

    let targetUsers: string[] = [];

    if (validatedData.userIds && validatedData.userIds.length > 0) {
      targetUsers = validatedData.userIds;
    } else {
      // Send to all users if no specific users specified
      const users = await prisma.user.findMany({
        where: { role: 'USER' },
        select: { id: true }
      });
      targetUsers = users.map((user: { id: string }) => user.id);
    }

    const metadata = {
      courseId: validatedData.courseId,
      courseName: validatedData.courseName,
      courseDescription: validatedData.courseDescription,
      courseSlug: validatedData.courseSlug,
    };

    // Send notifications to all target users
    const notifications = await Promise.all(
      targetUsers.map(userId =>
        NotificationService.createNotification({
          userId,
          type: validatedData.type,
          title: validatedData.title,
          message: validatedData.message,
          metadata,
          sendEmail: validatedData.sendEmail,
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Notificaciones enviadas a ${targetUsers.length} usuarios`,
      count: targetUsers.length
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error sending bulk notifications:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const notifications = await prisma.notification.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const totalNotifications = await prisma.notification.count();

    return NextResponse.json({
      notifications,
      total: totalNotifications,
      hasMore: notifications.length === limit
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
