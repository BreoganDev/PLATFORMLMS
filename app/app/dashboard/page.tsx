
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { EnrolledCourses } from '@/components/dashboard/enrolled-courses'
import { UserStats } from '@/components/dashboard/user-stats'
import { db } from '@/lib/db'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  const enrollments = await db.enrollment.findMany({
    where: {
      userId: session?.user?.id,
      status: 'ACTIVE',
    },
    include: {
      course: {
        include: {
          category: true,
          instructor: true,
          modules: {
            include: {
              lessons: true,
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  })

  // Calculate progress for each course
  const enrollmentsWithProgress = await Promise.all(
    enrollments?.map(async (enrollment) => {
      const totalLessons = enrollment?.course?.modules?.reduce((acc, module) => {
        return acc + (module?.lessons?.length || 0)
      }, 0) || 0

      const completedLessons = await db.progress.count({
        where: {
          userId: session?.user?.id,
          lesson: {
            module: {
              courseId: enrollment?.course?.id,
            },
          },
          isCompleted: true,
        },
      })

      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

      // Get last accessed lesson
      const lastProgress = await db.progress.findFirst({
        where: {
          userId: session?.user?.id,
          lesson: {
            module: {
              courseId: enrollment?.course?.id,
            },
          },
        },
        include: {
          lesson: true,
        },
        orderBy: { completedAt: 'desc' },
      })

      return {
        ...enrollment,
        progress: {
          completedLessons,
          totalLessons,
          progressPercentage,
          lastAccessedLesson: lastProgress?.lesson || null,
        },
      }
    })
  )

  const stats = {
    totalCourses: enrollments?.length || 0,
    completedCourses: enrollmentsWithProgress?.filter(e => e?.progress?.progressPercentage === 100)?.length || 0,
    totalHours: enrollmentsWithProgress?.reduce((acc, enrollment) => {
      const courseDuration = enrollment?.course?.modules?.reduce((moduleAcc, module) => {
        return moduleAcc + (module?.lessons?.reduce((lessonAcc, lesson) => {
          return lessonAcc + (lesson?.durationSeconds || 0)
        }, 0) || 0)
      }, 0) || 0
      return acc + courseDuration
    }, 0) || 0,
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardHeader />
      
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Mi Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Bienvenido de vuelta, {session?.user?.name}
            </p>
          </div>

          <UserStats stats={stats} />
          
          <EnrolledCourses enrollments={enrollmentsWithProgress} />
        </div>
      </div>
    </div>
  )
}
