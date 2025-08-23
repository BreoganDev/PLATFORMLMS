
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  UserPlus, 
  GraduationCap,
  Shield,
  Calendar,
  BarChart3,
  Star
} from 'lucide-react'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  // Get dashboard stats
  const [totalUsers, totalCourses, totalEnrollments, totalCertificates] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
    prisma.certificate.count()
  ])

  // Get recent activity
  const recentEnrollments = await prisma.enrollment.findMany({
    take: 5,
    orderBy: { enrolledAt: 'desc' },
    include: {
      user: {
        select: { name: true, email: true }
      },
      course: {
        select: { title: true, slug: true }
      }
    }
  })

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  })

  // Get top courses by enrollment
  const topCourses = await prisma.course.findMany({
    take: 5,
    include: {
      _count: {
        select: {
          enrollments: {
            where: { status: 'ACTIVE' }
          }
        }
      },
      reviews: {
        select: { rating: true }
      }
    },
    orderBy: {
      enrollments: {
        _count: 'desc'
      }
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Admin Panel</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/courses" className="text-gray-700 hover:text-blue-600 transition-colors">
                Cursos
              </Link>
              <Link href="/admin/users" className="text-gray-700 hover:text-blue-600 transition-colors">
                Usuarios
              </Link>
              <Link href="/admin/enrollments" className="text-gray-700 hover:text-blue-600 transition-colors">
                Inscripciones
              </Link>
              <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Ir al Sitio
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            Gestiona tu LMS desde este panel centralizado
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Cursos</p>
                <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Inscripciones Activas</p>
                <p className="text-2xl font-bold text-gray-900">{totalEnrollments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Certificados Emitidos</p>
                <p className="text-2xl font-bold text-gray-900">{totalCertificates}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/courses/new"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Crear Curso</h3>
                <p className="text-sm text-gray-600">Añade un nuevo curso al catálogo</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Gestionar Usuarios</h3>
                <p className="text-sm text-gray-600">Administra usuarios y roles</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Link>

          <Link
            href="/admin/enrollments"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Asignar Cursos</h3>
                <p className="text-sm text-gray-600">Inscribe usuarios manualmente</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Courses */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Cursos Más Populares</h2>
              <Link href="/admin/courses" className="text-blue-600 hover:text-blue-700 text-sm">
                Ver todos
              </Link>
            </div>

            <div className="space-y-4">
              {topCourses.map((course) => {
                const averageRating = course.reviews.length > 0
                  ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / course.reviews.length
                  : 0

                return (
                  <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{course.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          {course._count.enrollments} estudiantes
                        </span>
                        {course.reviews.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            {averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Actividad Reciente</h2>

            <div className="space-y-4">
              {recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <GraduationCap className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {enrollment.user.name || 'Usuario'} se inscribió en
                    </p>
                    <p className="text-sm text-gray-600">{enrollment.course.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(enrollment.enrolledAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
