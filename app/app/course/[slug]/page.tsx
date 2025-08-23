
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { BookOpen, DollarSign, Play, Users, CheckCircle, ArrowLeft, Euro } from 'lucide-react'
import CheckoutButton from '@/components/checkout-button'
import PaymentStatus from '@/components/payment-status'
import CertificateButton from '@/components/certificate-button'
import ReviewSystem from '@/components/review-system'

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  
  const course = await prisma.course.findUnique({
    where: { 
      slug: params.slug,
      isPublished: true 
    },
    include: {
      instructor: {
        select: { name: true, image: true }
      },
      category: {
        select: { name: true, icon: true }
      },
      modules: {
        where: { isPublished: true },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { orderIndex: 'asc' }
          }
        },
        orderBy: { orderIndex: 'asc' }
      },
      enrollments: {
        where: { status: 'ACTIVE' },
        select: { userId: true }
      },
      reviews: {
        where: { isPublished: true },
        select: { rating: true }
      }
    }
  })

  if (!course) {
    notFound()
  }

  // Check if user already purchased/enrolled in this course
  const userEnrollment = session ? 
    await prisma.enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: course.id,
        status: 'ACTIVE'
      }
    }) : null

  const totalStudents = course.enrollments.length
  const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0)
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
  const freePreviewLessons = course.modules.flatMap(m => m.lessons.filter(l => l.isFreePreview))

  // Calculate average rating
  const averageRating = course.reviews.length > 0 
    ? course.reviews.reduce((sum, review) => sum + review.rating, 0) / course.reviews.length 
    : 0

  // Get user's progress for certificate (only if enrolled)
  let userProgress = null
  let completionPercentage = 0

  if (session && userEnrollment) {
    const allLessons = course.modules.flatMap(module => module.lessons)
    
    userProgress = await prisma.progress.findMany({
      where: {
        userId: session.user.id,
        lessonId: { in: allLessons.map(l => l.id) }
      }
    })

    const completedLessons = userProgress.filter(p => p.isCompleted).length
    completionPercentage = allLessons.length > 0 ? (completedLessons / allLessons.length) * 100 : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/courses" 
                className="text-gray-700 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Cursos
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">LMS Basic</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              
              {course.description && (
                <p className="text-xl text-gray-600 leading-relaxed mb-6">
                  {course.description}
                </p>
              )}

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{totalStudents} estudiantes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Play className="h-4 w-4" />
                  <span>{totalLessons} lecciones</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{totalDurationMinutes} minutos</span>
                </div>
                {course.reviews.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span>{averageRating.toFixed(1)} ({course.reviews.length} reseña{course.reviews.length !== 1 ? 's' : ''})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Video Preview */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
              {freePreviewLessons.length > 0 && freePreviewLessons[0].vimeoVideoId ? (
                <div className="aspect-video">
                  <iframe
                    src={`https://player.vimeo.com/video/${freePreviewLessons[0].vimeoVideoId}?autoplay=0&title=0&byline=0&portrait=0`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    title={`Preview: ${freePreviewLessons[0].title}`}
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 aspect-video flex items-center justify-center">
                  <div className="text-center text-white">
                    <Play className="h-20 w-20 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Vista previa del curso</h3>
                    <p className="text-blue-100">
                      {userEnrollment ? 'Ir al reproductor' : 'Compra para acceder al contenido completo'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Course Curriculum */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contenido del curso
              </h2>
              
              <div className="space-y-4">
                {course.modules.map((module, moduleIndex) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg">
                    <div className="bg-gray-50 px-4 py-3 rounded-t-lg">
                      <h3 className="font-semibold text-gray-900">
                        {moduleIndex + 1}. {module.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {module.lessons.length} lecciones • {Math.ceil(
                          module.lessons.reduce((total, lesson) => total + (lesson.durationSeconds || 0), 0) / 60
                        )} minutos
                      </p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Play className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {lesson.title}
                              </p>
                              {lesson.content && (
                                <p className="text-xs text-gray-500">
                                  {lesson.content.substring(0, 60)}...
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {lesson.isFreePreview && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                Preview
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {Math.ceil((lesson.durationSeconds || 0) / 60)}min
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  <div className="flex items-center justify-center gap-1">
                    <Euro className="h-8 w-8" />
                    <span>{course.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="text-lg text-gray-500 mb-2">
                  o ${Math.round(course.price * 1.08 * 100) / 100} USD
                </div>
                <p className="text-gray-500 text-sm">Pago único • Acceso de por vida</p>
              </div>

              {userEnrollment ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">¡Ya estás inscrito en este curso!</p>
                  </div>
                  <Link
                    href={`/course/${course.slug}/learn`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Play className="h-5 w-5" />
                    Continuar Aprendiendo
                  </Link>
                  
                  {/* Certificate Section */}
                  <div className="border-t border-gray-200 pt-4">
                    <CertificateButton 
                      courseId={course.id}
                      courseName={course.title}
                      completionPercentage={completionPercentage}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {session ? (
                    <CheckoutButton courseId={course.id} courseName={course.title} price={course.price} />
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 text-center">
                        Inicia sesión para comprar este curso
                      </p>
                      <Link
                        href={`/login?callbackUrl=/course/${course.slug}`}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
                      >
                        Iniciar Sesión
                      </Link>
                      <Link
                        href={`/register?callbackUrl=/course/${course.slug}`}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
                      >
                        Crear Cuenta
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Este curso incluye:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Video en alta calidad
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Acceso de por vida
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Disponible 24/7
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Progreso guardado automáticamente
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <ReviewSystem 
          courseId={course.id} 
          isEnrolled={!!userEnrollment}
          session={session}
        />
      </div>
      
      <PaymentStatus />
    </div>
  )
}
