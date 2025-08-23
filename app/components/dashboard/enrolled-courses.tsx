
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Play, User, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice, capitalizeFirst } from '@/lib/utils'

interface EnrolledCoursesProps {
  enrollments: any[]
}

export function EnrolledCourses({ enrollments }: EnrolledCoursesProps) {
  if (!enrollments || enrollments?.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mis Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes cursos inscritos</h3>
            <p className="text-muted-foreground mb-4">
              Explora nuestro catálogo y comienza tu viaje de aprendizaje
            </p>
            <Button asChild>
              <Link href="/courses">Explorar Cursos</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mis Cursos</h2>
        <Button variant="outline" asChild>
          <Link href="/courses">Explorar Más Cursos</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {enrollments?.map((enrollment) => {
          const course = enrollment?.course
          const progress = enrollment?.progress
          const isCompleted = progress?.progressPercentage === 100

          return (
            <Card key={enrollment?.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video bg-muted">
                {course?.coverImage ? (
                  <Image
                    src={course?.coverImage}
                    alt={course?.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary">{course?.category?.name}</Badge>
                </div>
                {isCompleted && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 hover:bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completado
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {capitalizeFirst(course?.level?.toLowerCase())}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {progress?.completedLessons || 0}/{progress?.totalLessons || 0} lecciones
                  </div>
                </div>
                <CardTitle className="line-clamp-2">{course?.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-1" />
                  {course?.instructor?.name}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progreso</span>
                      <span>{progress?.progressPercentage || 0}%</span>
                    </div>
                    <Progress value={progress?.progressPercentage || 0} className="h-2" />
                  </div>

                  <Button asChild className="w-full">
                    <Link href={`/course/${course?.slug}/learn`}>
                      <Play className="mr-2 h-4 w-4" />
                      {isCompleted ? 'Repasar Curso' : 'Continuar'}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
