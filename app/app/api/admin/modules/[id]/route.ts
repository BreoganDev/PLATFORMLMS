export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/admin/modules/[id] - Obtener módulo específico
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

    const module = await db.module.findUnique({
      where: { id: params.id },
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
          include: {
            _count: {
              select: {
                progress: true
              }
            }
          }
        }
      }
    })

    if (!module) {
      return NextResponse.json(
        { error: 'Módulo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ module })
  } catch (error) {
    console.error('Error fetching module:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/modules/[id] - Actualizar módulo
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
    const { title, description, isPublished, orderIndex } = body

    if (!title) {
      return NextResponse.json(
        { error: 'El título es requerido' },
        { status: 400 }
      )
    }

    const module = await db.module.update({
      where: { id: params.id },
      data: {
        title,
        description,
        isPublished: isPublished || false,
        ...(orderIndex !== undefined && { orderIndex })
      },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    })

    return NextResponse.json({ module })
  } catch (error) {
    console.error('Error updating module:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el módulo' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/modules/[id] - Eliminar módulo
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

    // Verificar si el módulo existe y contar las lecciones
    const module = await db.module.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            lessons: true
          }
        }
      }
    })

    if (!module) {
      return NextResponse.json(
        { error: 'Módulo no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si hay progreso de estudiantes en las lecciones
    const progressCount = await db.progress.count({
      where: {
        lesson: {
          moduleId: params.id
        }
      }
    })

    if (progressCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un módulo con progreso de estudiantes' },
        { status: 400 }
      )
    }

    // Eliminar módulo y lecciones relacionadas en transacción
    await db.$transaction(async (tx) => {
      // Eliminar todas las lecciones del módulo
      await tx.lesson.deleteMany({
        where: { moduleId: params.id }
      })

      // Eliminar el módulo
      await tx.module.delete({
        where: { id: params.id }
      })
    })

    return NextResponse.json({ 
      message: 'Módulo eliminado exitosamente' 
    })
  } catch (error) {
    console.error('Error deleting module:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el módulo' },
      { status: 500 }
    )
  }
}