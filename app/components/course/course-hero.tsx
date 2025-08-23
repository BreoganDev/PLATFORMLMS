import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { BookOpen, User, Users, Clock, Star } from 'lucide-react'
import { formatPrice, capitalizeFirst } from '@/lib/utils'

interface CourseHeroProps {
  course: any
  isEnrolled: boolean
}

export function CourseHero({ course, isEnrolled }: CourseHeroProps) {
  const totalLessons = course?.modules?.reduce((acc: number, module: any) => {
    return acc + (module?.lessons?.length || 0)
  }, 0) || 0

  const totalDuration = course?.modules?.reduce((acc: number, module: any) => {
    return acc + (module?.lessons?.reduce((lessonAcc: number, lesson: any) => {
      return lessonAcc + (lesson?.durationSeconds || 0)
    }, 0) || 0)
  }, 0) || 0

  const durationHours = Math.floor(totalDuration / 3600)
  const durationMinutes = Math.floor((totalDuration % 3600) / 60)

  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{course?.category?.name}</Badge>
              <Badge variant="outline">{capitalizeFirst(course?.level?.toLowerCase())}</Badge>
              {isEnrolled && (
                <Badge className="bg-green-500 hover:bg-green-600">Inscrito</Badge>
              )}
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold">{course?.title}</h1>
              
              <div className="flex items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{course?.instructor?.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{course?._count?.enrollments} estudiantes</span>
                </div>
                {durationHours > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      {durationHours}h {durationMinutes > 0 ? `${durationMinutes}m` : ''}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {course?.description}
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              {course?.coverImage ? (
                <Image
                  src={course?.coverImage}
                  alt={course?.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <BookOpen className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}