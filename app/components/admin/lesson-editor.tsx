'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Upload, FileText, Image as ImageIcon, Video, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import RichEditor from '@/components/ui/rich-editor';

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
    
    if (!formData.title.trim()) {
      setError('El título es requerido');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const url = lesson 
        ? `/api/admin/lessons/${lesson.id}`
        : `/api/admin/lessons`;
      
      const method = lesson ? 'PUT' : 'POST';
      
      const payload = {
        title: formData.title.trim(),
        content: formData.content?.trim() || null,
        vimeoVideoId: formData.vimeoVideoId?.trim() || null,
        durationSeconds: formData.durationSeconds || null,
        isFreePreview: formData.isFreePreview,
        isPublished: formData.isPublished,
        moduleId: module.id,
        resources: formData.resources.length > 0 ? formData.resources : null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
    <div className="max-w-6xl mx-auto space-y-6">
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenido de la Lección
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Crea contenido rico con texto, imágenes, videos y enlaces
              </p>
              <RichEditor
                content={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                placeholder="Escribe el contenido de la lección aquí. Puedes añadir texto, imágenes, videos de YouTube y enlaces..."
                className="min-h-[400px]"
              />
            </div>

            <div>
              <label htmlFor="vimeoVideoId" className="block text-sm font-medium text-gray-700 mb-1">
                ID de Video Vimeo (opcional)
              </label>
              <input
                id="vimeoVideoId"
                type="text"
                value={formData.vimeoVideoId}
                onChange={(e) => setFormData(prev => ({ ...prev, vimeoVideoId: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123456789"
              />
              <p className="text-sm text-gray-500 mt-1">
                Solo el ID numérico del video de Vimeo para el reproductor principal.
              </p>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duración (minutos:segundos)
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
                placeholder="10:30"
              />
              <p className="text-sm text-gray-500 mt-1">
                Formato: MM:SS (ej: 5:30 para 5 minutos y 30 segundos)
              </p>
            </div>
          </div>

          {/* Opciones */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                id="isFreePreview"
                type="checkbox"
                checked={formData.isFreePreview}
                onChange={(e) => setFormData(prev => ({ ...prev, isFreePreview: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isFreePreview" className="text-sm font-medium text-gray-700">
                Vista previa gratuita
              </label>
              <span className="text-xs text-gray-500">
                (Los usuarios no inscritos podrán ver esta lección)
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <input
                id="isPublished"
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                Publicar lección
              </label>
              <span className="text-xs text-gray-500">
                (Solo las lecciones publicadas serán visibles para los estudiantes)
              </span>
            </div>
          </div>

          {/* Recursos Adicionales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Recursos Descargables</h3>
            <p className="text-sm text-gray-500">
              Sube archivos adicionales que los estudiantes puedan descargar (PDFs, documentos, etc.)
            </p>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imágenes
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {uploading ? 'Subiendo...' : 'Subir imagen'}
                    </p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDFs
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e, 'pdf')}
                    className="hidden"
                    id="pdf-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {uploading ? 'Subiendo...' : 'Subir PDF'}
                    </p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documentos
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept=".doc,.docx,.txt"
                    onChange={(e) => handleFileUpload(e, 'document')}
                    className="hidden"
                    id="doc-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="doc-upload" className="cursor-pointer">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {uploading ? 'Subiendo...' : 'Subir documento'}
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Lista de recursos subidos */}
            {formData.resources.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recursos subidos:</h4>
                <div className="space-y-2">
                  {formData.resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {resource.type === 'image' && <ImageIcon className="h-5 w-5 text-blue-500" />}
                        {resource.type === 'pdf' && <FileText className="h-5 w-5 text-red-500" />}
                        {resource.type === 'document' && <FileText className="h-5 w-5 text-green-500" />}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{resource.name}</p>
                          <p className="text-xs text-gray-500">
                            {(resource.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveResource(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Guardando...' : (lesson ? 'Actualizar Lección' : 'Crear Lección')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
