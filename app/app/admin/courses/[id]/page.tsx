import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'
import { BookOpen, ArrowLeft, Edit, Users, Eye, EyeOff, Euro } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default async function AdminCourseDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const course = await db.course.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      instructor: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      modules: {
        include: {
          lessons: {
            select: {
              id: true,
              title: true,
              durationSeconds: true,
              isFreePreview: true,
              isPublished: true
            }
          }
        }
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
    notFound()
  }

  const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0)
  const publishedLessons = course.modules.reduce(
    (total, module) => total + module.lessons.filter(lesson => lesson.isPublished).length, 
    0
  )
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Admin Panel</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/courses" className="text-gray-700 hover:text-blue-600 transition-colors">
                Cursos
              </Link>
              <Link href="/" className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition-colors">
                Ir al Sitio
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/admin" className="hover:text-blue-600">Admin</Link>
          <span>→</span>
          <Link href="/admin/courses" className="hover:text-blue-600">Cursos</Link>
          <span>→</span>
          <span className="text-gray-900 font-medium">{course.title}</span>
        </div>

        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                {course.isPublished ? (
                  <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <Eye className="w-4 h-4 mr-1" />
                    Publicado
                  </span>
                ) : (
                  <span className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    <EyeOff className="w-4 h-4 mr-1" />
                    Borrador
                  </span>
                )}
              </div>
              
              {course.description && (
                <p className="text-gray-600 text-lg leading-relaxed mb-4">
                  {course.description}
                </p>
              )}

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Euro className="w-4 h-4 mr-1" />
                  <span className="font-medium">{formatPrice(course.price)}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{course._count.enrollments} estudiantes</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>{publishedLessons}/{totalLessons} lecciones publicadas</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Link
                href={`/admin/courses/${course.id}/edit`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar Curso
              </Link>
              
              {course.isPublished && (
                <Link
                  href={`/course/${course.slug}`}
                  target="_blank"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors text-center"
                >
                  Ver como Usuario
                </Link>
              )}
            </div>
          </div>

          {/* Course Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Instructor</h3>
              <p className="text-gray-600">{course.instructor.name || course.instructor.email}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Categoría</h3>
              <p className="text-gray-600">{course.category?.name || 'Sin categoría'}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Nivel</h3>
              <p className="text-gray-600">
                {course.level === 'BEGINNER' ? 'Principiante' : 
                 course.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
              </p>
            </div>
          </div>
        </div>

        {/* Modules and Lessons */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Contenido del Curso</h2>
          
          {course.modules.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Este curso aún no tiene módulos.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Módulo {moduleIndex + 1}: {module.title}
                  </h3>
                  
                  {module.lessons.length === 0 ? (
                    <p className="text-gray-500 text-sm">Sin lecciones</p>
                  ) : (
                    <div className="space-y-2">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500 w-8">
                              {lessonIndex + 1}.
                            </span>
                            <span className="text-sm font-medium">{lesson.title}</span>
                            {lesson.isFreePreview && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                Vista previa
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            {lesson.durationSeconds && (
                              <span>{Math.ceil(lesson.durationSeconds / 60)} min</span>
                            )}
                            {lesson.isPublished ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Link
            href="/admin/courses"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Cursos
          </Link>
        </div>
      </div>
    </div>
  )
}