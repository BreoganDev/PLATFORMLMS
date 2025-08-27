// components/lesson-viewer.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  PlayCircle, 
  FileText, 
  Download, 
  Eye,
  Users,
  BookOpen,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import ContentViewer from '@/components/ui/content-viewer'
import { toast } from 'sonner'

interface LessonViewerProps {
  course: {
    id: string
    title: string
    slug: string
    modules: {
      id: string
      title: string
      lessons: {
        id: string
        title: string
        content: string | null
        vimeoVideoId: string | null
        durationSeconds: number | null
        isFreePreview: boolean
        isPublished: boolean
        resources: any
        orderIndex: number
      }[]
    }[]
    instructor: {
      name: string | null
      email: string
      image: string | null
    }
  }
  currentLesson: {
    id: string
    title: string
    content: string | null
    vimeoVideoId: string | null
    durationSeconds: number | null
    isFreePreview: boolean
    resources: any
  }
  userProgress: any[]
  lessonProgress: any
  isEnrolled: boolean
}

export default function LessonViewer({ 
  course, 
  currentLesson, 
  userProgress, 
  lessonProgress,
  isEnrolled 
}: LessonViewerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [lessonCompleted, setLessonCompleted] = useState(lessonProgress?.isCompleted || false)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const router = useRouter()

  // Generar lista plana de lecciones para navegación
  const allLessons = course.modules.flatMap(module => 
    module.lessons.map(lesson => ({
      ...lesson,
      moduleTitle: module.title,
      moduleId: module.id
    }))
  )

  const currentLessonIndex = allLessons.findIndex(l => l.id === currentLesson.id)
  const previousLesson = allLessons[currentLessonIndex - 1]
  const nextLesson = allLessons[currentLessonIndex + 1]

  // Calcular progreso general del curso
  const completedLessons = userProgress.filter(p => p.isCompleted).length
  const totalLessons = allLessons.length
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  const markLessonComplete = async () => {
    if (!isEnrolled || lessonCompleted) return

    setIsMarkingComplete(true)
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentLesson.id,
          completed: true
        })
      })

      if (response.ok) {
        setLessonCompleted(true)
        toast.success('¡Lección completada!')
        
        // Auto-navegar a la siguiente lección si existe
        if (nextLesson) {
          setTimeout(() => {
            router.push(`/course/${course.slug}/learn/${nextLesson.id}`)
          }, 1500)
        }
      }
    } catch (error) {
      toast.error('Error al marcar la lección como completada')
    } finally {
      setIsMarkingComplete(false)
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return ''
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Lista de lecciones */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white border-r border-gray-200 flex flex-col`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <Link href={`/course/${course.slug}`} className="flex items-center text-blue-600 hover:text-blue-800">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Volver al curso</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <h3 className="font-semibold text-gray-900 text-sm mb-2">{course.title}</h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Progreso del curso</span>
              <span>{completedLessons}/{totalLessons} lecciones</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-gray-500">
              {Math.round(progressPercentage)}% completado
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {course.modules.map((module, moduleIndex) => (
            <div key={module.id} className="border-b border-gray-100">
              <div className="p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 text-sm">
                  {moduleIndex + 1}. {module.title}
                </h4>
              </div>
              
              <div className="divide-y divide-gray-100">
                {module.lessons.map((lesson, lessonIndex) => {
                  const isCompleted = userProgress.find(p => p.id === lesson.id)?.isCompleted
                  const isCurrent = lesson.id === currentLesson.id
                  
                  return (
                    <Link
                      key={lesson.id}
                      href={`/course/${course.slug}/learn/${lesson.id}`}
                      className={`block p-3 hover:bg-gray-50 transition-colors ${
                        isCurrent ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <PlayCircle className={`h-4 w-4 ${isCurrent ? 'text-blue-500' : 'text-gray-400'}`} />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            isCurrent ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {lesson.title}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-1">
                            {lesson.durationSeconds && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDuration(lesson.durationSeconds)}
                              </span>
                            )}
                            
                            {lesson.isFreePreview && (
                              <Badge variant="outline" className="text-xs">
                                Gratis
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
              )}
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">{currentLesson.title}</h1>
                <div className="flex items-center gap-3 mt-1">
                  {currentLesson.durationSeconds && (
                    <span className="text-sm text-gray-600 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDuration(currentLesson.durationSeconds)}
                    </span>
                  )}
                  
                  {currentLesson.isFreePreview && (
                    <Badge variant="outline">Vista previa gratuita</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEnrolled && !lessonCompleted && (
                <Button
                  onClick={markLessonComplete}
                  disabled={isMarkingComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isMarkingComplete ? (
                    'Marcando...'
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como completada
                    </>
                  )}
                </Button>
              )}
              
              {lessonCompleted && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completada
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Contenido de la lección */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {/* Video de Vimeo si existe */}
            {currentLesson.vimeoVideoId && (
              <div className="mb-8">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://player.vimeo.com/video/${currentLesson.vimeoVideoId}?autoplay=0&title=0&byline=0&portrait=0`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={currentLesson.title}
                  />
                </div>
              </div>
            )}

            {/* Contenido de la lección con el nuevo visualizador */}
            {(currentLesson.content || (currentLesson.resources && Array.isArray(currentLesson.resources) && currentLesson.resources.length > 0)) && (
              <div className="mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <ContentViewer 
                    content={currentLesson.content}
                    resources={currentLesson.resources as any[]}
                  />
                </div>
              </div>
            )}

            {/* Navegación entre lecciones */}
            <div className="flex items-center justify-between">
              <div>
                {previousLesson && (
                  <Link href={`/course/${course.slug}/learn/${previousLesson.id}`}>
                    <Button variant="outline" className="flex items-center gap-2">
                      <ChevronLeft className="h-4 w-4" />
                      Anterior: {previousLesson.title}
                    </Button>
                  </Link>
                )}
              </div>

              <div>
                {nextLesson && (
                  <Link href={`/course/${course.slug}/learn/${nextLesson.id}`}>
                    <Button className="flex items-center gap-2">
                      Siguiente: {nextLesson.title}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
