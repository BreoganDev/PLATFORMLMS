// app/api/admin/lessons/route.ts
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { 
      title, 
      content, 
      vimeoVideoId, 
      durationSeconds, 
      isFreePreview,
      moduleId
    } = await req.json()

    if (!title?.trim() || !moduleId) {
      return NextResponse.json(
        { error: 'Título y ID del módulo son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el módulo existe
    const module = await db.module.findUnique({
      where: { id: moduleId }
    })

    if (!module) {
      return NextResponse.json(
        { error: 'Módulo no encontrado' },
        { status: 404 }
      )
    }

    // Obtener el siguiente orden
    const lastLesson = await db.lesson.findFirst({
      where: { moduleId },
      orderBy: { orderIndex: 'desc' }
    })

    const orderIndex = (lastLesson?.orderIndex || 0) + 1

    const lesson = await db.lesson.create({
      data: {
        title: title.trim(),
        content: content?.trim() || null,
        vimeoVideoId: vimeoVideoId?.trim() || null,
        durationSeconds: durationSeconds ? parseInt(durationSeconds) : null,
        isFreePreview: isFreePreview || false,
        moduleId,
        orderIndex,
        isPublished: false
      }
    })

    return NextResponse.json(lesson)
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}