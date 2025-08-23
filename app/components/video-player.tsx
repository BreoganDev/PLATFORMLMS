
'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, BookOpen, CheckCircle, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Lesson {
  id: string
  title: string
  content?: string | null
  vimeoVideoId?: string | null
  durationSeconds?: number | null
  orderIndex: number
  isFreePreview: boolean
}

interface Module {
  id: string
  title: string
  orderIndex: number
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  slug: string
  modules: Module[]
}

interface Progress {
  id: string
  lessonId: string
  isCompleted: boolean
  secondsWatched: number
  completedAt?: Date | null
}

interface VideoPlayerProps {
  course: Course
  userProgress: Progress[]
  initialLessonId: string
}

export default function VideoPlayer({ course, userProgress, initialLessonId }: VideoPlayerProps) {
  const [currentLessonId, setCurrentLessonId] = useState(initialLessonId)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Get all lessons in order
  const allLessons = course.modules.flatMap(module => 
    module.lessons.map(lesson => ({
      ...lesson,
      moduleTitle: module.title
    }))
  )

  const currentLesson = allLessons.find(l => l.id === currentLessonId)
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId)
  const nextLesson = allLessons[currentIndex + 1]
  const prevLesson = allLessons[currentIndex - 1]

  const getLessonProgress = (lessonId: string) => {
    return userProgress.find(p => p.lessonId === lessonId)
  }

  const markAsCompleted = async (lessonId: string) => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          isCompleted: true,
        }),
      })
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  if (!currentLesson) {
    return <div>Lección no encontrada</div>
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Main Video Area */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'mr-80' : ''} transition-all duration-300`}>
        {/* Video Container */}
        <div className="flex-1 relative bg-black">
          {currentLesson.vimeoVideoId ? (
            <iframe
              src={`https://player.vimeo.com/video/${currentLesson.vimeoVideoId}?autoplay=0&title=0&byline=0&portrait=0&color=ffffff`}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              title={currentLesson.title}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="h-24 w-24 mx-auto mb-6 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">Sin video disponible</h3>
                <p className="text-gray-400">Esta lección aún no tiene contenido de video.</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Controls */}
        <div className="bg-gray-900 text-white p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">{currentLesson.title}</h2>
              <p className="text-gray-400 text-sm">{currentLesson.moduleTitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <BookOpen className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => prevLesson && setCurrentLessonId(prevLesson.id)}
                disabled={!prevLesson}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <SkipBack className="h-4 w-4" />
                Anterior
              </button>
              
              <button
                onClick={() => nextLesson && setCurrentLessonId(nextLesson.id)}
                disabled={!nextLesson}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Siguiente
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => markAsCompleted(currentLesson.id)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                Completar
              </button>
              
              <Link
                href={`/course/${course.slug}`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al curso
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 overflow-y-auto z-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Contenido del curso</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {course.modules.map((module) => (
                <div key={module.id}>
                  <h4 className="font-medium text-gray-900 mb-2">{module.title}</h4>
                  <div className="space-y-1 ml-2">
                    {module.lessons.map((lesson) => {
                      const progress = getLessonProgress(lesson.id)
                      const isCompleted = progress?.isCompleted || false
                      const isCurrent = lesson.id === currentLessonId

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLessonId(lesson.id)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            isCurrent 
                              ? 'bg-blue-50 border border-blue-200' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <Play className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${
                                isCurrent ? 'text-blue-700' : 'text-gray-900'
                              }`}>
                                {lesson.title}
                              </p>
                              {lesson.durationSeconds && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  {Math.ceil(lesson.durationSeconds / 60)}min
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
