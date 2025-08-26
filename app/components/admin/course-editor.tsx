'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit3, Trash2, ChevronDown, ChevronRight, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import ModuleEditor from './module-editor';
import LessonEditor from './lesson-editor';

interface Course {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  level: string;
  categoryId?: string | null;
  coverImage?: string | null;
  isPublished: boolean;
  modules: Module[];
  category?: { id: string; name: string; slug: string } | null;
}

interface Module {
  id: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  isPublished: boolean;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  content?: string | null;
  vimeoVideoId?: string | null;
  durationSeconds?: number | null;
  orderIndex: number;
  isFreePreview: boolean;
  isPublished: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CourseEditorProps {
  course: Course;
  categories: Category[];
}

export default function CourseEditor({ course: initialCourse, categories }: CourseEditorProps) {
  const [course, setCourse] = useState(initialCourse);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'course' | 'module' | 'lesson'>('course');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // Refrescar datos del curso
  const refreshCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${course.id}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data.course);
      }
    } catch (error) {
      console.error('Error refreshing course:', error);
    }
  };

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleCreateModule = () => {
    setSelectedModule(null);
    setView('module');
  };

  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    setView('module');
  };

  const handleCreateLesson = (module: Module) => {
    setSelectedModule(module);
    setSelectedLesson(null);
    setView('lesson');
  };

  const handleEditLesson = (lesson: Lesson, module: Module) => {
    setSelectedModule(module);
    setSelectedLesson(lesson);
    setView('lesson');
  };

  const handleDeleteModule = async (moduleId: string, moduleName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el módulo "${moduleName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/modules/${moduleId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Módulo eliminado exitosamente');
        refreshCourse();
      } else {
        toast.error('Error al eliminar el módulo');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Error interno del servidor');
    }
  };

  const handleDeleteLesson = async (lessonId: string, lessonName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la lección "${lessonName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Lección eliminada exitosamente');
        refreshCourse();
      } else {
        toast.error('Error al eliminar la lección');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Error interno del servidor');
    }
  };

  if (view === 'module') {
    return (
      <ModuleEditor
        course={course}
        module={selectedModule}
        onBack={() => setView('course')}
        onSaved={() => {
          setView('course');
          refreshCourse();
        }}
      />
    );
  }

  if (view === 'lesson') {
    return (
      <LessonEditor
        module={selectedModule!}
        lesson={selectedLesson}
        onBack={() => setView('course')}
        onSaved={() => {
          setView('course');
          refreshCourse();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/courses"
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a cursos
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Editar Curso</h1>
      </div>

      {/* Información básica del curso */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{course.title}</h2>
            <p className="text-gray-600 mt-1">{course.description}</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                {course.level}
              </span>
              <span className="text-sm text-gray-600">€{course.price}</span>
              {course.category && (
                <span className="text-sm text-gray-600">{course.category.name}</span>
              )}
              <span className={`text-sm px-2 py-1 rounded ${
                course.isPublished 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {course.isPublished ? 'Publicado' : 'Borrador'}
              </span>
            </div>
          </div>
          <Link
            href={`/admin/courses/${course.id}/settings`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Editar información básica
          </Link>
        </div>
      </div>

      {/* Módulos del curso */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Contenido del Curso</h2>
          <button
            onClick={handleCreateModule}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Añadir Módulo
          </button>
        </div>

        <div className="space-y-4">
          {course.modules.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay módulos</h3>
              <p className="text-gray-600 mb-4">Comienza añadiendo tu primer módulo al curso</p>
              <button
                onClick={handleCreateModule}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Crear primer módulo
              </button>
            </div>
          ) : (
            course.modules.map((module, index) => (
              <div key={module.id} className="border border-gray-200 rounded-lg">
                {/* Header del módulo */}
                <div className="p-4 bg-gray-50 flex items-center justify-between rounded-t-lg">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleModuleExpansion(module.id)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {expandedModules.has(module.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <span className="text-sm text-gray-500">Módulo {index + 1}</span>
                    <h3 className="font-medium text-gray-900">{module.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      module.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {module.isPublished ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {module.lessons.length} lecciones
                    </span>
                    <button
                      onClick={() => handleEditModule(module)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Editar módulo"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module.id, module.title)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Eliminar módulo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Contenido expandido del módulo */}
                {expandedModules.has(module.id) && (
                  <div className="p-4 border-t">
                    {module.description && (
                      <p className="text-gray-600 text-sm mb-4">{module.description}</p>
                    )}
                    
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">Lecciones</h4>
                      <button
                        onClick={() => handleCreateLesson(module)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        Añadir Lección
                      </button>
                    </div>

                    {module.lessons.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                        <p className="text-sm">No hay lecciones en este módulo</p>
                        <button
                          onClick={() => handleCreateLesson(module)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
                        >
                          Crear primera lección
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500 w-6">
                                {lessonIndex + 1}.
                              </span>
                              <span className="font-medium text-gray-900">{lesson.title}</span>
                              <div className="flex items-center gap-2">
                                {lesson.isFreePreview && (
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                    Preview
                                  </span>
                                )}
                                {lesson.vimeoVideoId && (
                                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                    Video
                                  </span>
                                )}
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  lesson.isPublished 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {lesson.isPublished ? 'Publicado' : 'Borrador'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {lesson.durationSeconds && (
                                <span className="text-sm text-gray-500">
                                  {Math.floor(lesson.durationSeconds / 60)}:{(lesson.durationSeconds % 60).toString().padStart(2, '0')}
                                </span>
                              )}
                              <button
                                onClick={() => handleEditLesson(lesson, module)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Editar lección"
                              >
                                <Edit3 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Eliminar lección"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
