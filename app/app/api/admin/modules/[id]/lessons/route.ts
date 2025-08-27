export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/admin/modules/[id]/lessons
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

    const lessons = await db.lesson.findMany({
      where: { moduleId: params.id },
      orderBy: { orderIndex: 'asc' }
    })

    return NextResponse.json({ lessons })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/admin/modules/[id]/lessons
export async function POST(
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
      resources 
    } = body

    if (!title) {
      return NextResponse.json(
        { error: 'El título es requerido' },
        { status: 400 }
      )
    }

    // Obtener el siguiente orderIndex
    const lastLesson = await db.lesson.findFirst({
      where: { moduleId: params.id },
      orderBy: { orderIndex: 'desc' }
    })

    const orderIndex = (lastLesson?.orderIndex || 0) + 1

    const lesson = await db.lesson.create({
      data: {
        title,
        content: content || null,
        vimeoVideoId: vimeoVideoId || null,
        durationSeconds: durationSeconds || null,
        moduleId: params.id,
        orderIndex,
        isFreePreview: isFreePreview || false,
        isPublished: isPublished || false,
        resources: resources || null
      }
    })

    return NextResponse.json({ lesson })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { error: 'Error al crear la lección' },
      { status: 500 }
    )
  }
}