
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import VideoPlayer from '@/components/video-player'

export default async function LearnPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect(`/login?callbackUrl=/course/${params.slug}/learn`)
  }

  const course = await prisma.course.findUnique({
    where: { 
      slug: params.slug,
      isPublished: true 
    },
    include: {
      modules: {
        where: { isPublished: true },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { orderIndex: 'asc' },
            select: {
              id: true,
              title: true,
              content: true,
              vimeoVideoId: true,
              durationSeconds: true,
              orderIndex: true,
              isFreePreview: true,
              isPublished: true,
              resources: true
            }
          }
        },
        orderBy: { orderIndex: 'asc' }
      }
    }
  })

  if (!course) {
    notFound()
  }

  // Check if user is enrolled
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: session.user.id,
      courseId: course.id,
      status: 'ACTIVE'
    }
  })

  if (!enrollment) {
    redirect(`/course/${params.slug}`)
  }

  // Get user progress
  const progress = await prisma.progress.findMany({
    where: {
      userId: session.user.id,
      lesson: {
        module: {
          courseId: course.id
        }
      }
    }
  })

  const firstLesson = course.modules[0]?.lessons[0]

  if (!firstLesson) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Curso sin contenido
          </h1>
          <p className="text-gray-600">
            Este curso aún no tiene lecciones disponibles.
          </p>
        </div>
      </div>
    )
  }

  return (
    <VideoPlayer 
      course={course} 
      userProgress={progress}
      initialid={firstLesson.id}
    />
  )
}
