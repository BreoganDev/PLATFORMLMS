export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/admin/courses/[courseId]/modules - Listar módulos
export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const modules = await db.module.findMany({
      where: { courseId: params.courseId },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            title: true,
            durationSeconds: true,
            isPublished: true,
            isFreePreview: true,
            orderIndex: true
          }
        }
      },
      orderBy: { orderIndex: 'asc' }
    })

    return NextResponse.json({ modules })
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/admin/courses/[courseId]/modules - Crear módulo
export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { title, description } = body

    if (!title) {
      return NextResponse.json(
        { error: 'El título es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el curso existe
    const course = await db.course.findUnique({
      where: { id: params.courseId }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      )
    }

    // Obtener el siguiente orderIndex
    const lastModule = await db.module.findFirst({
      where: { courseId: params.courseId },
      orderBy: { orderIndex: 'desc' }
    })

    const orderIndex = (lastModule?.orderIndex || 0) + 1

    const module = await db.module.create({
      data: {
        title,
        description,
        courseId: params.courseId,
        orderIndex,
        isPublished: false
      },
      include: {
        lessons: true
      }
    })

    return NextResponse.json({ module })
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json(
      { error: 'Error al crear el módulo' },
      { status: 500 }
    )
  }
}