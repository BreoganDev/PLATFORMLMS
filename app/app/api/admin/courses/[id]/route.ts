export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createSlug } from '@/lib/utils'

// GET /api/admin/courses/[id] - Obtener curso específico
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

    const course = await db.course.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        modules: {
          include: {
            lessons: true
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/courses/[id] - Actualizar curso
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
    const { title, description, price, vimeoVideoId, isPublished, categoryId } = body

    if (!title) {
      return NextResponse.json(
        { error: 'El título es requerido' },
        { status: 400 }
      )
    }

    if (price < 0) {
      return NextResponse.json(
        { error: 'El precio no puede ser negativo' },
        { status: 400 }
      )
    }

    // Verificar si el curso existe
    const existingCourse = await db.course.findUnique({
      where: { id: params.id }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      )
    }

    // Crear nuevo slug solo si el título cambió
    let slug = existingCourse.slug
    if (title !== existingCourse.title) {
      const baseSlug = createSlug(title)
      slug = baseSlug
      let counter = 1
      
      // Buscar slug disponible excluyendo el curso actual
      while (await db.course.findFirst({ 
        where: { 
          slug, 
          id: { not: params.id } 
        } 
      })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
    }

    const course = await db.course.update({
      where: { id: params.id },
      data: {
        title,
        description,
        price: Number(price) || 0,
        slug,
        isPublished: isPublished || false,
        categoryId: categoryId || null,
      },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el curso' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/courses/[id] - Eliminar curso
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

    // Verificar si el curso existe
    const existingCourse = await db.course.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    })

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si tiene inscripciones activas
    if (existingCourse._count.enrollments > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un curso con inscripciones activas' },
        { status: 400 }
      )
    }

    // Eliminar curso y datos relacionados
    await db.$transaction(async (tx) => {
      // Eliminar lecciones de todos los módulos
      await tx.lesson.deleteMany({
        where: {
          module: {
            courseId: params.id
          }
        }
      })

      // Eliminar módulos
      await tx.module.deleteMany({
        where: {
          courseId: params.id
        }
      })

      // Eliminar reseñas
      await tx.review.deleteMany({
        where: {
          courseId: params.id
        }
      })

      // Eliminar el curso
      await tx.course.delete({
        where: { id: params.id }
      })
    })

    return NextResponse.json({ 
      message: 'Curso eliminado exitosamente' 
    })
  } catch (error) {
    console.error('Error deleting course:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el curso' },
      { status: 500 }
    )
  }
}