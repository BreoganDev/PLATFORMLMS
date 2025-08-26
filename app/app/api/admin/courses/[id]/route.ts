export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createSlug } from '@/lib/utils'

// Obtener todos los cursos
export async function GET() {
  try {
    const courses = await db.course.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ courses })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching courses' },
      { status: 500 }
    )
  }
}

// Actualizar un curso por id
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const updatedCourse = await db.course.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        price: body.price,
        isPublished: body.isPublished,
      },
    })

    return NextResponse.json({ course: updatedCourse })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error updating course' },
      { status: 500 }
    )
  }
}

// Eliminar un curso por id
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.course.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Course deleted' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error deleting course' },
      { status: 500 }
    )
  }
}