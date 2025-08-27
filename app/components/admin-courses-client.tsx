// components/admin-courses-client.tsx - REEMPLAZAR COMPLETAMENTE
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Euro,
  Settings,
  Play
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  isPublished: boolean
  createdAt: Date | string
  category: {
    id: string
    name: string
    slug: string
  } | null
  instructor: {
    id: string
    name: string | null
    email: string
  }
  _count: {
    enrollments: number
    modules: number
    reviews?: number
  }
}

interface Category {
  id: string
  name: string
  slug: string
}

interface AdminCoursesClientProps {
  courses: Course[]
  categories: Category[]
}

export default function AdminCoursesClient({ 
  courses = [], 
  categories = [] 
}: AdminCoursesClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showPublishedOnly, setShowPublishedOnly] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    
    const matchesCategory = !selectedCategory || course.category?.id === selectedCategory
    
    const matchesPublished = !showPublishedOnly || course.isPublished
    
    return matchesSearch && matchesCategory && matchesPublished
  })

  const handleDelete = async (courseId: string, courseName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el curso "${courseName}"?\nEsta acción no se puede deshacer.`)) {
      return
    }

    setIsDeleting(courseId)
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Recargar la página para actualizar la lista
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al eliminar el curso')
      }
    } catch (error) {
      console.error('Error deleting course:', error)
      alert('Error al eliminar el curso')
    } finally {
      setIsDeleting(null)
    }
  }

  const togglePublished = async (courseId: string, currentStatus: boolean) => {
    try {
      const course = courses.find(c => c.id === courseId)
      if (!course) return

      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: course.title,
          description: course.description,
          price: course.price,
          isPublished: !currentStatus
        })
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al actualizar el curso')
      }
    } catch (error) {
      console.error('Error updating course:', error)
      alert('Error al actualizar el curso')
    }
  }

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
              <Link href="/" className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition-colors">
                Ir al Sitio
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Cursos</h1>
            <p className="text-gray-600">
              {courses.length} cursos totales • {courses.filter(c => c.isPublished).length} publicados
            </p>
          </div>
          
          <Link
            href="/admin/courses/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Curso
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showPublishedOnly}
                onChange={(e) => setShowPublishedOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Solo publicados</span>
            </label>

            <div className="text-sm text-gray-500 text-right">
              {filteredCourses.length} de {courses.length} cursos
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay cursos aún
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza creando tu primer curso para estudiantes.
            </p>
            <Link
              href="/admin/courses/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Crear Primer Curso
            </Link>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron cursos
            </h3>
            <p className="text-gray-600">
              Intenta ajustar tus filtros de búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Course Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        {course.isPublished ? (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            <Eye className="h-3 w-3 mr-1" />
                            Publicado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Borrador
                          </span>
                        )}
                        {course.category && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {course.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {course.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {course.description}
                    </p>
                  )}

                  {/* Course Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-900">{formatPrice(course.price)}</div>
                      <div className="text-gray-500 text-xs">Precio</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-900">{course._count.enrollments}</div>
                      <div className="text-gray-500 text-xs">Estudiantes</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-900">{course._count.modules}</div>
                      <div className="text-gray-500 text-xs">Módulos</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Instructor: {course.instructor.name || course.instructor.email}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Gestionar
                      </Link>
                      
                      <Link
                        href={`/admin/courses/${course.id}/edit`}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Editar
                      </Link>
                    </div>

                    <div className="flex space-x-1">
                      <button
                        onClick={() => togglePublished(course.id, course.isPublished)}
                        className={`p-1.5 rounded transition-colors ${
                          course.isPublished
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={course.isPublished ? 'Despublicar' : 'Publicar'}
                      >
                        {course.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      
                      <button
                        onClick={() => handleDelete(course.id, course.title)}
                        disabled={isDeleting === course.id}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar curso"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}