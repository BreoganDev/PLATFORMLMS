export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/course/[slug] - Obtener curso público por slug
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    const course = await db.course.findUnique({
      where: { 
        slug: params.slug,
        isPublished: true // Solo cursos publicados
      },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        modules: {
          where: { isPublished: true },
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { orderIndex: 'asc' },
              select: {
                id: true,
                title: true,
                durationSeconds: true,
                isFreePreview: true,
                orderIndex: true,
                // Solo incluir contenido si es preview gratis o usuario está inscrito
                content: session?.user ? true : false
              }
            }
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true
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

    // Verificar si el usuario está inscrito
    let isEnrolled = false
    if (session?.user) {
      const enrollment = await db.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: course.id
          }
        }
      })
      isEnrolled = !!enrollment
    }

    // Calcular estadísticas
    let avgRating = 0
    if (course.reviews && course.reviews.length > 0) {
      avgRating = course.reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / course.reviews.length
    }

    const totalDuration = course.modules?.reduce((total: number, module: any) => 
      total + (module.lessons?.reduce((moduleTotal: number, lesson: any) => 
        moduleTotal + (lesson.durationSeconds || 0), 0) || 0)
    , 0) || 0

    const totalLessons = course.modules?.reduce((total: number, module: any) => 
      total + (module.lessons?.length || 0), 0
    ) || 0

    // Si no está inscrito, filtrar solo lecciones preview
    if (!isEnrolled && session?.user && course.modules) {
      course.modules = course.modules.map(module => ({
        ...module,
        lessons: module.lessons?.filter((lesson: any) => lesson.isFreePreview) || []
      }))
    }

    const responseData = {
      course: {
        ...course,
        averageRating: avgRating,
        totalDuration,
        totalLessons,
        isEnrolled
      }
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}