export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/admin/lessons/[id] - Obtener lección específica
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const lesson = await db.lesson.findUnique({
      where: { id: params.id },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true
              }
            }
          }
        },
        _count: {
          select: {
            progress: true
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

    return NextResponse.json({ lesson })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/lessons/[id] - Actualizar lección
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
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
    const { 
      title, 
      content, 
      vimeoVideoId, 
      durationSeconds, 
      isFreePreview,
      isPublished,
      orderIndex,
      resources 
    } = body

    if (!title) {
      return NextResponse.json(
        { error: 'El título es requerido' },
        { status: 400 }
      )
    }

    const lesson = await db.lesson.update({
      where: { id: params.id },
      data: {
        title,
        content: content || null,
        vimeoVideoId: vimeoVideoId || null,
        durationSeconds: durationSeconds ? parseInt(durationSeconds) : null,
        isFreePreview: isFreePreview || false,
        isPublished: isPublished || false,
        resources: resources || null,
        ...(orderIndex !== undefined && { orderIndex: parseInt(orderIndex) })
      }
    })

    return NextResponse.json({ lesson })
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la lección' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/lessons/[id] - Eliminar lección
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar si la lección existe
    const lesson = await db.lesson.findUnique({
      where: { id: params.id }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lección no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si hay progreso de estudiantes
    const progressCount = await db.progress.count({
      where: { lessonId: params.id }
    })

    if (progressCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una lección con progreso de estudiantes' },
        { status: 400 }
      )
    }

    // Eliminar lección y progreso relacionado
    await db.$transaction(async (tx) => {
      // Eliminar cualquier progreso
      await tx.progress.deleteMany({
        where: { lessonId: params.id }
      })

      // Eliminar la lección
      await tx.lesson.delete({
        where: { id: params.id }
      })
    })

    return NextResponse.json({ 
      message: 'Lección eliminada exitosamente' 
    })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la lección' },
      { status: 500 }
    )
  }
}