export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// DELETE /api/admin/users/[id] - Eliminar usuario
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

    // No permitir que se elimine a sí mismo
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      )
    }

    // Verificar si el usuario existe
    const existingUser = await db.user.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            coursesInstructing: true,
            enrollments: true
          }
        },
        userPoints: true
      }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Si es instructor y tiene cursos, no permitir eliminar
    if (existingUser._count.coursesInstructing > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un instructor con cursos activos' },
        { status: 400 }
      )
    }

    // Eliminar usuario y datos relacionados en transacción
    await db.$transaction(async (tx) => {
      // Eliminar progreso
      await tx.progress.deleteMany({
        where: { userId: params.id }
      })

      // Eliminar inscripciones
      await tx.enrollment.deleteMany({
        where: { userId: params.id }
      })

      // Eliminar reseñas
      await tx.review.deleteMany({
        where: { userId: params.id }
      })

      // Eliminar certificados
      await tx.certificate.deleteMany({
        where: { userId: params.id }
      })

      // Eliminar compras
      await tx.purchase.deleteMany({
        where: { userId: params.id }
      })

      // Eliminar notificaciones
      await tx.notification.deleteMany({
        where: { userId: params.id }
      })

      // Eliminar preferencias de notificaciones
      await tx.notificationPreference.deleteMany({
        where: { userId: params.id }
      })

      // Eliminar datos de gamificación si existen
      await tx.userPoints.deleteMany({
        where: { userId: params.id }
      }).catch(() => {}) // Ignorar si no existe

      await tx.userBadge.deleteMany({
        where: { userId: params.id }
      })

      await tx.streak.deleteMany({
        where: { userId: params.id }
      })

      await tx.leaderboardEntry.deleteMany({
        where: { userId: params.id }
      })

      // Eliminar cuentas y sesiones de auth
      await tx.account.deleteMany({
        where: { userId: params.id }
      })

      await tx.session.deleteMany({
        where: { userId: params.id }
      })

      // Finalmente eliminar el usuario
      await tx.user.delete({
        where: { id: params.id }
      })
    })

    return NextResponse.json({ 
      message: 'Usuario eliminado exitosamente' 
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el usuario' },
      { status: 500 }
    )
  }
}