
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, DollarSign, Play, ArrowRight, Users, Clock, Star, GraduationCap, Euro } from 'lucide-react'
import SearchAndFilters from '../components/search-and-filters'

interface Course {
  id: string
  title: string
  slug: string
  description?: string | null
  price: number
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  instructor: { name: string | null }
  category?: { name: string; icon?: string | null } | null
  enrollments: { userId: string }[]
  modules: {
    lessons: { durationSeconds?: number | null }[]
  }[]
  reviews: { rating: number }[]
  averageRating: number
  totalReviews: number
}

interface Session {
  user: {
    id: string
    name?: string | null
    email?: string | null
    role?: string
  }
}

interface CoursesClientProps {
  courses: Course[]
  session: Session | null
}

export default function CoursesClient({ courses, session }: CoursesClientProps) {
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(courses)

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating) 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">LMS Basic</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Inicio
              </Link>
              {session ? (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Dashboard
                  </Link>
                  {session.user.role === 'ADMIN' && (
                    <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/api/auth/signout"
                    className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition-colors"
                  >
                    Cerrar Sesión
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Registro
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explora Nuestros Cursos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre nuestros cursos diseñados para acelerar tu aprendizaje
          </p>
        </div>

        {/* Search and Filters */}
        <SearchAndFilters
          courses={courses}
          onFilteredCoursesChange={setFilteredCourses}
        />

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">
              No se encontraron cursos
            </h2>
            <p className="text-gray-500">
              Prueba ajustando los filtros para encontrar más opciones
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const totalDurationMinutes = Math.ceil(
                course.modules.reduce(
                  (total, module) => 
                    total + module.lessons.reduce(
                      (lessonTotal, lesson) => lessonTotal + (lesson.durationSeconds || 0), 
                      0
                    ), 
                  0
                ) / 60
              )
              const totalLessons = course.modules.reduce(
                (total, module) => total + module.lessons.length, 
                0
              )

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Course Image Placeholder */}
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-48 flex items-center justify-center relative">
                    <Play className="h-16 w-16 text-white group-hover:scale-110 transition-transform duration-300" />
                    
                    {/* Category Badge */}
                    {course.category && (
                      <div className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                        <span className="mr-1">{course.category.icon}</span>
                        {course.category.name}
                      </div>
                    )}
                    
                    {/* Level Badge */}
                    <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                      {course.level === 'BEGINNER' ? 'Principiante' : 
                       course.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>{course.instructor?.name}</span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                      {course.title}
                    </h3>
                    
                    {course.description && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {course.description}
                      </p>
                    )}

                    {/* Course Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.enrollments.length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Play className="h-4 w-4" />
                        <span>{totalLessons} lecciones</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{totalDurationMinutes}m</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="flex items-center text-blue-600 font-bold text-lg">
                          <Euro className="h-5 w-5" />
                          <span>{course.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          o ${Math.round(course.price * 1.08 * 100) / 100} USD
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {course.totalReviews > 0 ? (
                          <div className="flex items-center gap-1">
                            {renderStars(course.averageRating)}
                            <span className="text-sm text-gray-600 ml-1">
                              {course.averageRating.toFixed(1)} ({course.totalReviews})
                            </span>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Sin reseñas</div>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/course/${course.slug}`}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 group"
                    >
                      Ver Curso
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
