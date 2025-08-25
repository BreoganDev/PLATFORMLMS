'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Star,
  Euro
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  isPublished: boolean
  createdAt: Date
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
    reviews: number
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

export default function AdminCoursesClient({ courses, categories }: AdminCoursesClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showPublishedOnly, setShowPublishedOnly] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || course.category?.id === selectedCategory
    
    const matchesPublished = !showPublishedOnly || course.isPublished
    
    return matchesSearch && matchesCategory && matchesPublished
  })

  const handleDelete = async (courseId: string, courseName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el curso "${courseName}"? Esta acción no se puede deshacer.`)) {
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
              <Link href="/admin/users" className="text-gray-700 hover:text-blue-600 transition-colors">
                Usuarios
              </Link>
              <Link href="/admin/enrollments" className="text-gray-700 hover:text-blue-600 transition-colors">
                Inscripciones
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
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Cursos</h1>
            <p className="text-gray-600 mt-2">Administra todos los cursos del sistema</p>
          </div>
          <Link
            href="/admin/courses/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Curso
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
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

            <div className="text-sm text-gray-500">
              {filteredCourses.length} de {courses.length} cursos
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                    {course.isPublished ? (
                      <Eye className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {course.description || 'Sin descripción'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Precio:</span>
                  <span className="font-medium flex items-center">
                    <Euro className="h-3 w-3 mr-1" />
                    {formatPrice(course.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Estudiantes:</span>
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {course._count.enrollments}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Módulos:</span>
                  <span>{course._count.modules}</span>
                </div>
                {course.category && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Categoría:</span>
                    <span className="text-blue-600">{course.category.name}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  href={`/admin/courses/${course.id}/edit`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Link>
                
                <button
                  onClick={() => togglePublished(course.id, course.isPublished)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    course.isPublished 
                      ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                      : 'bg-green-100 hover:bg-green-200 text-green-800'
                  }`}
                  title={course.isPublished ? 'Poner en borrador' : 'Publicar'}
                >
                  {course.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>

                <button
                  onClick={() => handleDelete(course.id, course.title)}
                  disabled={isDeleting === course.id || course._count.enrollments > 0}
                  className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={course._count.enrollments > 0 ? 'No se puede eliminar: tiene estudiantes inscritos' : 'Eliminar curso'}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Creado: {new Date(course.createdAt).toLocaleDateString('es-ES')}
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay cursos</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory || showPublishedOnly 
                ? 'No se encontraron cursos que coincidan con los filtros.'
                : 'Comienza creando tu primer curso.'
              }
            </p>
            {!searchTerm && !selectedCategory && !showPublishedOnly && (
              <div className="mt-6">
                <Link
                  href="/admin/courses/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Curso
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}