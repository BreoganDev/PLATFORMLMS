'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Upload, FileText, Image as ImageIcon, Video, X, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Module {
  id: string;
  title: string;
}

interface Lesson {
  id: string;
  title: string;
  content?: string | null;
  vimeoVideoId?: string | null;
  durationSeconds?: number | null;
  isFreePreview: boolean;
  isPublished: boolean;
  resources?: any[] | null;
}

interface Resource {
  type: 'image' | 'pdf' | 'document' | 'video';
  name: string;
  url: string;
  size: number;
}

interface LessonEditorProps {
  module: Module;
  lesson: Lesson | null;
  onBack: () => void;
  onSaved: () => void;
}

export default function LessonEditor({ module, lesson, onBack, onSaved }: LessonEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: lesson?.title || '',
    content: lesson?.content || '',
    vimeoVideoId: lesson?.vimeoVideoId || '',
    durationSeconds: lesson?.durationSeconds || 0,
    isFreePreview: lesson?.isFreePreview || false,
    isPublished: lesson?.isPublished || false,
    resources: (lesson?.resources as Resource[]) || []
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', type);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData
      });

      if (response.ok) {
        const data = await response.json();
        const newResource: Resource = {
          type: type as any,
          name: file.name,
          url: data.file.url,
          size: file.size
        };

        setFormData(prev => ({
          ...prev,
          resources: [...prev.resources, newResource]
        }));
        toast.success('Archivo subido exitosamente');
      } else {
        toast.error('Error al subir el archivo');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error interno del servidor');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const parseDuration = (timeString: string): number => {
    const parts = timeString.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseInt(parts[1]) || 0;
      return minutes * 60 + seconds;
    }
    return parseInt(timeString) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const url = lesson 
        ? `/api/admin/lessons/${lesson.id}`
        : `/api/admin/modules/${module.id}/lessons`;
      
      const method = lesson ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          resources: formData.resources.length > 0 ? formData.resources : null
        }),
      });

      if (response.ok) {
        toast.success(lesson ? 'Lección actualizada exitosamente' : 'Lección creada exitosamente');
        onSaved();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al guardar la lección');
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      setError('Error interno del servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            {lesson ? 'Editar Lección' : 'Crear Lección'}
          </h1>
          <p className="text-gray-600">Módulo: {module.title}</p>
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
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título de la Lección *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: ¿Qué es React y por qué usarlo?"
              />
            </div>

            <div>
              <label htmlFor="vimeo" className="block text-sm font-medium text-gray-700 mb-1">
                ID del Video de Vimeo
              </label>
              <input
                id="vimeo"
                type="text"
                value={formData.vimeoVideoId}
                onChange={(e) => setFormData(prev => ({ ...prev, vimeoVideoId: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123456789"
              />
              <p className="text-sm text-gray-500 mt-1">
                Solo el ID numérico del video de Vimeo
              </p>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duración
              </label>
              <input
                id="duration"
                type="text"
                value={formData.durationSeconds ? formatDuration(formData.durationSeconds) : ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  durationSeconds: parseDuration(e.target.value) 
                }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="15:30 o 930"
              />
              <p className="text-sm text-gray-500 mt-1">
                Formato: MM:SS o segundos totales
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="preview"
                  checked={formData.isFreePreview}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFreePreview: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="preview" className="text-sm font-medium text-gray-700">
                  Vista previa gratuita
                </label>
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
                  Publicar lección
                </label>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Contenido de la Lección
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={8}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Escribe el contenido de la lección. Puedes incluir descripciones, notas, transcripciones..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Este contenido aparecerá junto al video para ayudar a los estudiantes
            </p>
          </div>

          {/* Resources */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Recursos Adicionales
            </label>
            
            {/* Upload buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <label className="cursor-pointer bg-red-50 hover:bg-red-100 border border-red-200 p-3 rounded-lg flex flex-col items-center gap-2 transition-colors">
                <FileText className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-700">PDF</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'pdf')}
                  disabled={uploading}
                />
              </label>

              <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 border border-blue-200 p-3 rounded-lg flex flex-col items-center gap-2 transition-colors">
                <ImageIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-700">Imagen</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'image')}
                  disabled={uploading}
                />
              </label>

                            <label className="cursor-pointer bg-green-50 hover:bg-green-100 border border-green-200 p-3 rounded-lg flex flex-col items-center gap-2 transition-colors">
                              <FileText className="h-5 w-5 text-green-600" />
                              <span className="text-sm text-green-700">Documento</span>
                              <input
                                type="file"
                                accept=".doc,.docx,.txt"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'document')}
                                disabled={uploading}
                              />
                            </label>
                          </div>
                          {/* You may have more code for listing resources, etc. */}
                        </div>
                      </form>
                    </div>
                  </div>
                );
              }