// app/api/progress/route.ts
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id, completed, secondsWatched } = await req.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID de lección es requerido' },
        { status: 400 }
      )
    }

    // Verificar que la lección existe
    const lesson = await db.lesson.findUnique({
      where: { id: id },
      include: {
        module: {
          include: {
            course: {
              select: { id: true }
            }
          }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lección no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el usuario está inscrito en el curso
    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: lesson.module.course.id,
        status: 'ACTIVE'
      }
    })

    if (!enrollment && !lesson.isFreePreview) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta lección' },
        { status: 403 }
      )
    }

    // Actualizar o crear progreso
    const progress = await db.progress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId: id
        }
      },
      update: {
        isCompleted: completed || false,
        secondsWatched: secondsWatched || 0,
        lastWatchedAt: new Date(),
        ...(completed && { completedAt: new Date() })
      },
      create: {
        userId: session.user.id,
        id: id,
        isCompleted: completed || false,
        secondsWatched: secondsWatched || 0,
        lastWatchedAt: new Date(),
        ...(completed && { completedAt: new Date() })
      }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}