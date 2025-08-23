
'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  BookOpen, 
  User, 
  Calendar,
  Search,
  UserPlus,
  Users,
  GraduationCap
} from 'lucide-react'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  slug: string
}

interface User {
  id: string
  name: string | null
  email: string
  role: string
}

interface Enrollment {
  id: string
  enrolledAt: string
  user: {
    id: string
    name: string
    email: string
  }
  course: {
    id: string
    title: string
    slug: string
  }
}

interface AdminEnrollmentsClientProps {
  courses: Course[]
  users: User[]
}

export default function AdminEnrollmentsClient({ courses, users }: AdminEnrollmentsClientProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filterCourse, setFilterCourse] = useState('')
  const [searchUser, setSearchUser] = useState('')

  useEffect(() => {
    fetchEnrollments()
  }, [filterCourse])

  const fetchEnrollments = async () => {
    try {
      const params = new URLSearchParams()
      if (filterCourse) params.append('courseId', filterCourse)
      
      const response = await fetch(`/api/admin/enrollments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data)
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEnrollment = async () => {
    if (!selectedUserId || !selectedCourseId) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserId,
          courseId: selectedCourseId,
        }),
      })

      if (response.ok) {
        setShowCreateModal(false)
        setSelectedUserId('')
        setSelectedCourseId('')
        await fetchEnrollments()
      } else {
        const error = await response.json()
        alert(error.error || 'Error creating enrollment')
      }
    } catch (error) {
      console.error('Error creating enrollment:', error)
      alert('Error creating enrollment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const searchTerm = searchUser.toLowerCase()
    return (user.name?.toLowerCase().includes(searchTerm) || false) ||
           user.email.toLowerCase().includes(searchTerm)
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Admin Panel</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/admin/courses" className="text-gray-700 hover:text-blue-600 transition-colors">
                Cursos
              </Link>
              <Link href="/admin/users" className="text-gray-700 hover:text-blue-600 transition-colors">
                Usuarios
              </Link>
              <Link href="/" className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition-colors">
                Ir al Sitio
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Inscripciones</h1>
            <p className="text-gray-600 mt-2">Asigna cursos a usuarios manualmente</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Nueva Inscripción
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Curso
              </label>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los cursos</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Enrollments Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando inscripciones...</p>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No se encontraron inscripciones</p>
              {filterCourse && (
                <p className="text-sm text-gray-500 mt-2">
                  Prueba cambiando el filtro de curso
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Curso
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Inscripción
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-gray-200 rounded-full p-2">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.user.name || 'Sin nombre'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enrollment.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 text-blue-600 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.course.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enrollment.course.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {new Date(enrollment.enrolledAt).toLocaleDateString('es-ES')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/course/${enrollment.course.slug}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Ver Curso
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Enrollment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nueva Inscripción</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Curso
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar curso</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <div className="relative mb-2">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar usuario..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-40 overflow-y-auto"
                  size={Math.min(filteredUsers.length, 5)}
                >
                  <option value="">Seleccionar usuario</option>
                  {filteredUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name || 'Sin nombre'} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleCreateEnrollment}
                disabled={isSubmitting || !selectedUserId || !selectedCourseId}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creando...' : 'Crear Inscripción'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
