
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, User, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice, capitalizeFirst } from '@/lib/utils'

interface CoursesListProps {
  searchParams: { category?: string; level?: string; search?: string }
}

export async function CoursesList({ searchParams }: CoursesListProps) {
  const { category, level, search } = searchParams

  const courses = await db.course.findMany({
    where: {
      isPublished: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(category && category !== 'all' && {
        category: { slug: category },
      }),
      ...(level && level !== 'all' && {
        level: level as any,
      }),
    },
    include: {
      category: true,
      instructor: true,
      _count: {
        select: { enrollments: true, modules: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!courses || courses?.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No se encontraron cursos</h3>
        <p className="text-muted-foreground">
          Prueba ajustando los filtros o busca con otros términos
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {search ? `Resultados para "${search}"` : 'Todos los Cursos'}
        </h2>
        <div className="text-sm text-muted-foreground">
          {courses?.length} curso{courses?.length !== 1 ? 's' : ''} encontrado{courses?.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <Card key={course?.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
              {course?.price === 0 && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-500 hover:bg-green-600">Gratis</Badge>
                </div>
              )}
            </div>

            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {capitalizeFirst(course?.level?.toLowerCase())}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  {course?._count?.enrollments}
                </div>
              </div>
              <CardTitle className="line-clamp-2">{course?.title}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-1" />
                {course?.instructor?.name}
              </div>
            </CardHeader>

            <CardContent>
              <CardDescription className="line-clamp-3 mb-4">
                {course?.description}
              </CardDescription>
              
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-primary">
                  {course?.price === 0 ? 'Gratis' : formatPrice(course?.price)}
                </div>
                <Button asChild size="sm">
                  <Link href={`/course/${course?.slug}`}>
                    Ver Curso
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
