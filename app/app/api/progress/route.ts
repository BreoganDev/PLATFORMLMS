
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { lessonId, isCompleted, secondsWatched = 0 } = body

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      )
    }

    // Verify user has access to this lesson
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          course: {
            enrollments: {
              some: {
                userId: session.user.id,
                status: 'ACTIVE'
              }
            }
          }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found or access denied' },
        { status: 404 }
      )
    }

    // Update or create progress record
    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId
        }
      },
      update: {
        isCompleted: isCompleted || false,
        secondsWatched: Math.max(secondsWatched, 0),
        completedAt: isCompleted ? new Date() : null,
        lastWatchedAt: new Date()
      },
      create: {
        userId: session.user.id,
        lessonId,
        isCompleted: isCompleted || false,
        secondsWatched: Math.max(secondsWatched, 0),
        completedAt: isCompleted ? new Date() : null,
        lastWatchedAt: new Date()
      }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    const progress = await prisma.progress.findMany({
      where: {
        userId: session.user.id,
        lesson: {
          module: {
            courseId
          }
        }
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            durationSeconds: true
          }
        }
      }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Progress fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
