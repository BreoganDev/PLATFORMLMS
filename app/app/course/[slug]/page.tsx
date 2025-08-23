
import { notFound } from 'next/navigation'
import { CourseHeader } from '@/components/course/course-header'
import { CourseHero } from '@/components/course/course-hero'
import { CourseContent } from '@/components/course/course-content'
import { CourseEnrollment } from '@/components/course/course-enrollment'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface CoursePageProps {
  params: { slug: string }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const session = await getServerSession(authOptions)
  
  const course = await db.course.findUnique({
    where: { 
      slug: params?.slug,
      isPublished: true 
    },
    include: {
      category: true,
      instructor: true,
      modules: {
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' }
          }
        },
        orderBy: { orderIndex: 'asc' }
      },
      _count: {
        select: { enrollments: true }
      }
    }
  })

  if (!course) {
    notFound()
  }

  let enrollment = null
  if (session?.user?.id) {
    enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session?.user?.id,
          courseId: course?.id
        }
      }
    })
  }

  const isEnrolled = !!enrollment

  return (
    <div className="min-h-screen">
      <CourseHeader />
      <CourseHero course={course} isEnrolled={isEnrolled} />
      
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CourseContent course={course} isEnrolled={isEnrolled} />
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <CourseEnrollment 
                course={course} 
                isEnrolled={isEnrolled}
                userId={session?.user?.id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
