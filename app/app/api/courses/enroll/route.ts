
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { courseId } = await req.json()

    if (!courseId) {
      return NextResponse.json(
        { error: 'ID del curso es requerido' },
        { status: 400 }
      )
    }

    // Check if course exists and is free
    const course = await db.course.findUnique({
      where: { id: courseId, isPublished: true },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      )
    }

    if (course?.price > 0) {
      return NextResponse.json(
        { error: 'Este curso requiere pago' },
        { status: 400 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session?.user?.id,
          courseId: courseId,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Ya estás inscrito en este curso' },
        { status: 400 }
      )
    }

    // Create enrollment
    const enrollment = await db.enrollment.create({
      data: {
        userId: session?.user?.id,
        courseId: courseId,
        status: 'ACTIVE',
      },
    })

    return NextResponse.json({ enrollment })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
