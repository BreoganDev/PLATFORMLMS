// app/api/admin/lessons/[id]/route.ts - CREAR NUEVO ARCHIVO
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// PUT - Actualizar lección
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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
      isPublished,
      resources
    } = await req.json()

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'El título es requerido' },
        { status: 400 }
      )
    }

    const lesson = await db.lesson.update({
      where: { id: params.id },
      data: {
        title: title.trim(),
        content: content?.trim() || null,
        vimeoVideoId: vimeoVideoId?.trim() || null,
        durationSeconds: durationSeconds ? parseInt(durationSeconds) : null,
        isFreePreview: isFreePreview || false,
        isPublished: isPublished || false,
        resources: resources || null
      }
    })

    return NextResponse.json(lesson)
  } catch (error) {
    console.error('Error updating lesson:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar lección
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await db.lesson.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting lesson:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}