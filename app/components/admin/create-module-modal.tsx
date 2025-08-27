'use client';

import { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RichEditor from '@/components/ui/rich-editor';

interface CreateModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  onSuccess: () => void;
}

export default function CreateModuleModal({ isOpen, onClose, courseId, onSuccess }: CreateModuleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    isPublished: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          description: formData.content || formData.description
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Módulo creado exitosamente');
        setFormData({ title: '', description: '', content: '', isPublished: false });
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al crear el módulo');
        toast.error(errorData.error || 'Error al crear el módulo');
      }
    } catch (error) {
      console.error('Error creating module:', error);
      const errorMessage = 'Error interno del servidor';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Crear Nuevo Módulo</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="module-title" className="block text-sm font-medium text-gray-700 mb-1">
                Título del Módulo *
              </label>
              <input
                id="module-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Introducción a React"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenido del Módulo
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Añade texto, imágenes, videos y enlaces para crear contenido rico
              </p>
              <RichEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Describe qué aprenderán en este módulo, añade imágenes, videos..."
                className="min-h-[300px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="module-published"
                checked={formData.isPublished}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="module-published" className="text-sm font-medium text-gray-700">
                Publicar módulo inmediatamente
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
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
                {isLoading ? 'Creando...' : 'Crear Módulo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
