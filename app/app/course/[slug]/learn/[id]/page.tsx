import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import LessonViewer from '@/components/lesson-viewer'

interface PageProps {
  params: {
    slug: string
    id: string
  }
}

export default async function LessonPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  
  // Obtener el curso por slug
  const course = await db.course.findUnique({
    where: { slug: params.slug },
    include: {
      modules: {
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' }
          }
        },
        orderBy: { orderIndex: 'asc' }
      },
      instructor: {
        select: {
          name: true,
          email: true,
          image: true
        }
      }
    }
  })

  if (!course) {
    notFound()
  }

  // Encontrar la lección actual
  const currentLesson = course.modules
    .flatMap(module => module.lessons)
    .find(lesson => lesson.id === params.id)

  if (!currentLesson) {
    notFound()
  }

  // Verificar si el usuario está inscrito
  let isEnrolled = false
  let userProgress: any[] = []
  let lessonProgress = null

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

    if (isEnrolled) {
      // Obtener progreso del usuario
      userProgress = await db.progress.findMany({
        where: {
          userId: session.user.id,
          lesson: {
            module: {
              courseId: course.id
            }
          }
        },
        select: {
          id: true,
          lessonId: true,
          isCompleted: true,
          secondsWatched: true,
          lastWatchedAt: true
        }
      })

      // Obtener progreso específico de esta lección
      lessonProgress = await db.progress.findUnique({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId: currentLesson.id
          }
        }
      })
    }
  }

  // Si no está inscrito y la lección no es vista previa gratuita, redirigir
  if (!isEnrolled && !currentLesson.isFreePreview) {
    redirect(`/course/${course.slug}`)
  }

  return (
    <LessonViewer
      course={course}
      currentLesson={currentLesson}
      userProgress={userProgress}
      lessonProgress={lessonProgress}
      isEnrolled={isEnrolled}
    />
  )
}
