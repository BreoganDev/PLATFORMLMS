import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, Award, ArrowRight, Star, PlayCircle, Clock, User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils'

// Tipo corregido que coincide con los datos de Prisma
interface CourseWithDetails {
  id: string
  title: string
  slug: string
  description: string | null
  coverImage: string | null
  level: string
  price: number
  category: {
    id: string
    name: string
    slug: string
    description: string | null
    icon: string | null
    createdAt: Date
    updatedAt: Date
  } | null
  instructor: {
    id: string
    name: string | null
    email: string
  }
  _count: {
    enrollments: number
    modules: number
  }
}

export default async function HomePage() {
  const featuredCourses = await db.course.findMany({
    where: { isPublished: true },
    include: {
      category: true,
      instructor: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      _count: {
        select: { enrollments: true, modules: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 6
  })

  const stats = {
    totalCourses: await db.course.count({ where: { isPublished: true } }),
    totalStudents: await db.user.count({ where: { role: 'STUDENT' } }),
    totalCategories: await db.category.count()
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Rosa Delia Cabrera</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/courses" className="text-sm font-medium transition-colors hover:text-primary">
              Cursos
            </Link>
            <Link href="/login" className="text-sm font-medium transition-colors hover:text-primary">
              Iniciar Sesión
            </Link>
            <Button asChild>
              <Link href="/register">Registrarse</Link>
            </Button>
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 -z-10" />
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Para madres, padres, tias, abuelas...
                  <span className="text-primary block">Maternidad en Calma</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Aprende a estar en calma, gestionarte, nutrición, psicología como también peinar fácil a diario y/o dar el salto profesional con Entrenzarte-PRO.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/courses">
                    Explorar Cursos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/register">Comenzar</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalCourses}+</div>
                  <div className="text-sm text-muted-foreground">Cursos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalStudents}+</div>
                  <div className="text-sm text-muted-foreground">Estudiantes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{stats.totalCategories}+</div>
                  <div className="text-sm text-muted-foreground">Categorías</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="h-20 w-20 text-primary/70" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">¿Por qué elegir a Rosa Delia Cabrera?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Te ofrecemos la mejor experiencia de aprendizaje online con herramientas modernas y contenido de calidad
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Contenido de Calidad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cursos creados por expertas del bienestar mental, emocional, nutricional, gestión, planificación, conecta contigo misma y con los demás
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Comunidad Activa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Conecta con otras madres y participa en una comunidad de aprendizaje colaborativo
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Progreso Medible</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sigue tu progreso, completa lecciones y alcanza tus objetivos de aprendizaje
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses?.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold">Cursos Destacados</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Descubre nuestros cursos más populares y comienza tu viaje hacia Ti y hacia tu Calma y Conexión
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses?.map((course) => (
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
                      <Badge variant="secondary">{course?.category?.name || 'Sin categoría'}</Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {course?.level}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        {course?._count?.enrollments}
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2">{course?.title}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-4 w-4 mr-1" />
                      {course?.instructor?.name || 'Instructor'}
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

            <div className="text-center mt-12">
              <Button asChild size="lg" variant="outline">
                <Link href="/courses">
                  Ver Todos los Cursos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              ¿List@ para comenzar tu viaje con destino tu Calma, Conexión y Plenitud?
            </h2>
            <p className="text-xl opacity-90">
              Únete a los demás usuari@s que ya están transformando sus vidas con Rosa Delia Cabrera
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">
                  Registrarse Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-black hover:bg-white hover:text-primary" asChild>
                <Link href="/courses">Explorar Cursos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">EduHub</span>
              </div>
              <p className="text-muted-foreground">
                La plataforma de aprendizaje online que transforma carreras y vidas.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Navegación</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/courses" className="text-muted-foreground hover:text-foreground">Cursos</Link></li>
                <li><Link href="/login" className="text-muted-foreground hover:text-foreground">Iniciar Sesión</Link></li>
                <li><Link href="/register" className="text-muted-foreground hover:text-foreground">Registro</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-muted-foreground">Centro de Ayuda</span></li>
                <li><span className="text-muted-foreground">Contacto</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Síguenos</h4>
              <p className="text-sm text-muted-foreground">
                Mantente conectado para las últimas actualizaciones
              </p>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} EduHub. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}