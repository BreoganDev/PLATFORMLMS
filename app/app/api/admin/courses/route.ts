export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createSlug } from '@/lib/utils'

// GET /api/admin/courses - Listar todos los cursos
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const courses = await db.course.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            modules: true
          }
        }
      }
    })

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/admin/courses - Crear nuevo curso
export async function POST(req: Request) {
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

    // Crear slug único
    const baseSlug = createSlug(title)
    let slug = baseSlug
    let counter = 1
    
    while (await db.course.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    const course = await db.course.create({
      data: {
        title,
        description,
        price: Number(price) || 0,
        slug,
        // vimeoVideoId, // Removed because it's not in the Course model
        isPublished: isPublished || false,
        instructorId: session.user.id,
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
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Error al crear el curso' },
      { status: 500 }
    )
  }
}