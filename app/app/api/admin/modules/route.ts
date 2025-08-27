// app/api/admin/modules/route.ts - API consolidada para módulos
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/admin/modules - Listar todos los módulos (opcional)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const modules = await db.module.findMany({
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
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
      orderBy: [
        { course: { title: 'asc' } },
        { orderIndex: 'asc' }
      ]
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

// POST /api/admin/modules - Crear módulo (requiere courseId en el body)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { title, description, courseId, isPublished } = await req.json()

    if (!title?.trim() || !courseId) {
      return NextResponse.json(
        { error: 'Título y ID del curso son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el curso existe
    const course = await db.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      )
    }

    // Obtener el siguiente orden
    const lastModule = await db.module.findFirst({
      where: { courseId },
      orderBy: { orderIndex: 'desc' }
    })

    const orderIndex = (lastModule?.orderIndex || 0) + 1

    const module = await db.module.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        courseId,
        orderIndex,
        isPublished: isPublished || false
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        lessons: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    })

    return NextResponse.json({ module })
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
