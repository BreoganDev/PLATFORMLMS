'use client';

import { useState } from 'react';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
}

interface Module {
  id: string;
  title: string;
  description?: string | null;
  isPublished: boolean;
}

interface ModuleEditorProps {
  course: Course;
  module: Module | null;
  onBack: () => void;
  onSaved: () => void;
}

export default function ModuleEditor({ course, module, onBack, onSaved }: ModuleEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: module?.title || '',
    description: module?.description || '',
    isPublished: module?.isPublished || false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = module 
        ? `/api/admin/modules/${module.id}`
        : `/api/admin/courses/${course.id}/modules`;
      
      const method = module ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(module ? 'Módulo actualizado exitosamente' : 'Módulo creado exitosamente');
        onSaved();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al guardar el módulo');
      }
    } catch (error) {
      console.error('Error saving module:', error);
      setError('Error interno del servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al curso
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {module ? 'Editar Módulo' : 'Crear Módulo'}
          </h1>
          <p className="text-gray-600">Curso: {course.title}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título del Módulo *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Introducción a React"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe qué aprenderán en este módulo..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.isPublished}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">
              Publicar módulo
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formData.title || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Guardando...' : (module ? 'Actualizar' : 'Crear') + ' Módulo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}