'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  BookOpen, 
  ArrowLeft, 
  Edit, 
  Users, 
  Eye, 
  EyeOff, 
  Euro, 
  Plus,
  ChevronDown,
  ChevronRight,
  Play,
  Trash2,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { toast } from 'sonner'

interface Lesson {
  id: string
  title: string
  content?: string
  vimeoVideoId?: string
  durationSeconds?: number
  isFreePreview: boolean
  isPublished: boolean
  orderIndex: number
}

interface Module {
  id: string
  title: string
  description?: string
  isPublished: boolean
  orderIndex: number
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  slug: string
  description?: string
  price: number
  level: string
  isPublished: boolean
  modules: Module[]
  category?: { name: string }
  instructor: { name?: string; email: string }
  _count: { enrollments: number; reviews: number }
}

export default function AdminCourseDetailPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  
  // Dialog states
  const [showModuleDialog, setShowModuleDialog] = useState(false)
  const [showLessonDialog, setShowLessonDialog] = useState(false)
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  
  // Form states
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' })
  const [lessonForm, setLessonForm] = useState({
    title: '',
    content: '',
    vimeoVideoId: '',
    durationSeconds: '',
    isFreePreview: false
  })

  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchCourse()
  }, [session, status, params.id, router])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${params.id}`)
      if (response.ok) {
        const courseData = await response.json()
        setCourse(courseData)
      } else {
        toast.error('Error al cargar el curso')
      }
    } catch (error) {
      toast.error('Error al cargar el curso')
    } finally {
      setLoading(false)
    }
  }

  const createModule = async () => {
    if (!moduleForm.title.trim()) {
      toast.error('El título del módulo es requerido')
      return
    }

    try {
      const response = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...moduleForm,
          courseId: params.id
        })
      })

      if (response.ok) {
        const newModule = await response.json()
        setCourse(prev => prev ? {
          ...prev,
          modules: [...prev.modules, { ...newModule, lessons: [] }]
        } : null)
        
        setModuleForm({ title: '', description: '' })
        setShowModuleDialog(false)
        toast.success('Módulo creado exitosamente')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear módulo')
      }
    } catch (error) {
      toast.error('Error al crear módulo')
    }
  }

  const createLesson = async () => {
    if (!lessonForm.title.trim() || !selectedModuleId) {
      toast.error('El título de la lección es requerido')
      return
    }

    try {
      const response = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...lessonForm,
          moduleId: selectedModuleId
        })
      })

      if (response.ok) {
        const newLesson = await response.json()
        
        setCourse(prev => prev ? {
          ...prev,
          modules: prev.modules.map(module => 
            module.id === selectedModuleId 
              ? { ...module, lessons: [...module.lessons, newLesson] }
              : module
          )
        } : null)
        
        setLessonForm({
          title: '',
          content: '',
          vimeoVideoId: '',
          durationSeconds: '',
          isFreePreview: false
        })
        setShowLessonDialog(false)
        setSelectedModuleId(null)
        toast.success('Lección creada exitosamente')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al crear lección')
      }
    } catch (error) {
      toast.error('Error al crear lección')
    }
  }

  const toggleModuleExpanded = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Sin duración'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando curso...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Curso no encontrado</h2>
          <Link href="/admin/courses">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Cursos
            </Button>
          </Link>
        </div>
      </div>
    )
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

      <div className="max-w-6xl mx-auto px-4 py-8">
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
                  <Badge className="bg-green-100 text-green-800">
                    <Eye className="w-4 h-4 mr-1" />
                    Publicado
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <EyeOff className="w-4 h-4 mr-1" />
                    Borrador
                  </Badge>
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
                <div className="flex items-center">
                  <Play className="w-4 h-4 mr-1" />
                  <span>{course.modules.length} módulos</span>
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Contenido del Curso</h2>
            <Button onClick={() => setShowModuleDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Módulo
            </Button>
          </div>
          
          {course.modules.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay módulos aún
              </h3>
              <p className="text-gray-500 mb-4">
                Comienza creando el primer módulo para tu curso
              </p>
              <Button onClick={() => setShowModuleDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Módulo
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleModuleExpanded(module.id)}
                        >
                          {expandedModules.has(module.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Módulo {moduleIndex + 1}: {module.title}
                          </h3>
                          {module.description && (
                            <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={module.isPublished ? 'default' : 'secondary'}>
                          {module.isPublished ? 'Publicado' : 'Borrador'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {module.lessons.length} lecciones
                        </span>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedModuleId(module.id)
                            setShowLessonDialog(true)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Lección
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {expandedModules.has(module.id) && (
                    <div className="p-4">
                      {module.lessons.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Play className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No hay lecciones en este módulo</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setSelectedModuleId(module.id)
                              setShowLessonDialog(true)
                            }}
                          >
                            Crear Primera Lección
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-500 w-6">
                                  {lessonIndex + 1}.
                                </span>
                                <Play className="h-4 w-4 text-blue-600" />
                                <div>
                                  <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <span className="text-xs text-gray-500">
                                      {formatDuration(lesson.durationSeconds)}
                                    </span>
                                    {lesson.isFreePreview && (
                                      <Badge variant="outline" className="text-xs">
                                        Vista previa
                                      </Badge>
                                    )}
                                    <div className="flex items-center space-x-1">
                                      {lesson.isPublished ? (
                                        <Eye className="h-3 w-3 text-green-500" />
                                      ) : (
                                        <EyeOff className="h-3 w-3 text-gray-400" />
                                      )}
                                      <span className="text-xs text-gray-500">
                                        {lesson.isPublished ? 'Publicada' : 'Borrador'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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

      {/* Module Dialog */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Módulo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título del Módulo *</label>
              <Input
                value={moduleForm.title}
                onChange={(e) => setModuleForm({...moduleForm, title: e.target.value})}
                placeholder="Ej: Introducción al Tema"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                value={moduleForm.description}
                onChange={(e) => setModuleForm({...moduleForm, description: e.target.value})}
                placeholder="Descripción opcional del módulo"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowModuleDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={createModule}>Crear Módulo</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Lección</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título de la Lección *</label>
              <Input
                value={lessonForm.title}
                onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                placeholder="Ej: Conceptos básicos"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Contenido</label>
              <Textarea
                value={lessonForm.content}
                onChange={(e) => setLessonForm({...lessonForm, content: e.target.value})}
                placeholder="Contenido de la lección"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">ID Video Vimeo</label>
              <Input
                value={lessonForm.vimeoVideoId}
                onChange={(e) => setLessonForm({...lessonForm, vimeoVideoId: e.target.value})}
                placeholder="123456789"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Duración (segundos)</label>
              <Input
                type="number"
                value={lessonForm.durationSeconds}
                onChange={(e) => setLessonForm({...lessonForm, durationSeconds: e.target.value})}
                placeholder="600"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={lessonForm.isFreePreview}
                onCheckedChange={(checked) => setLessonForm({...lessonForm, isFreePreview: checked})}
              />
              <label className="text-sm font-medium">Vista previa gratuita</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowLessonDialog(false)
                  setSelectedModuleId(null)
                }}
              >
                Cancelar
              </Button>
              <Button onClick={createLesson}>Crear Lección</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}