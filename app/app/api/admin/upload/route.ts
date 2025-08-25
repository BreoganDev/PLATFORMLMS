export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// POST /api/admin/upload - Subir archivos (imágenes, PDFs, etc.)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'image', 'pdf', 'document', etc.

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha seleccionado ningún archivo' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = {
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      pdf: ['application/pdf'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      video: ['video/mp4', 'video/webm', 'video/ogg']
    }

    const fileType = type || 'image'
    const allowed = allowedTypes[fileType as keyof typeof allowedTypes] || allowedTypes.image

    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipo de archivo no permitido. Permitidos: ${allowed.join(', ')}` },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 10MB para imágenes, 50MB para PDFs/documentos)
    const maxSize = fileType === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024 // 10MB o 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Archivo demasiado grande. Máximo ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', fileType)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generar nombre único
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '')
    const fileName = `${timestamp}-${originalName}`
    const filePath = path.join(uploadDir, fileName)

    // Guardar archivo - FIX: Usar Uint8Array en lugar de Buffer
    const bytes = await file.arrayBuffer()
    const uint8Array = new Uint8Array(bytes)
    await writeFile(filePath, uint8Array)

    // URL pública del archivo
    const fileUrl = `/uploads/${fileType}/${fileName}`

    // Información del archivo
    const fileInfo = {
      url: fileUrl,
      filename: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Archivo subido exitosamente',
      file: fileInfo
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Error al subir el archivo' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/upload - Eliminar archivo
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json(
        { error: 'Ruta del archivo es requerida' },
        { status: 400 }
      )
    }

    // Verificar que la ruta está dentro de /uploads
    if (!filePath.startsWith('/uploads/')) {
      return NextResponse.json(
        { error: 'Ruta no válida' },
        { status: 400 }
      )
    }

    const fullPath = path.join(process.cwd(), 'public', filePath)

    // Verificar si el archivo existe
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'Archivo no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar archivo
    const { unlink } = await import('fs/promises')
    await unlink(fullPath)

    return NextResponse.json({
      message: 'Archivo eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el archivo' },
      { status: 500 }
    )
  }
}