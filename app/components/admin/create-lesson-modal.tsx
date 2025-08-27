'use client';

import { useState } from 'react';
import { X, Save, AlertCircle, Upload, FileText, Image as ImageIcon, Video } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Resource {
  type: 'image' | 'pdf' | 'document' | 'video';
  name: string;
  url: string;
  size: number;
}

interface CreateLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string;
  onSuccess: () => void;
}

export default function CreateLessonModal({ isOpen, onClose, moduleId, onSuccess }: CreateLessonModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    vimeoVideoId: '',
    durationSeconds: 0,
    isFreePreview: false,
    isPublished: false,
    resources: [] as Resource[]
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
      const response = await fetch(`/api/admin/modules/${moduleId}/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          resources: formData.resources.length > 0 ? formData.resources : null
        }),
      });

      if (response.ok) {
        toast.success('Lección creada exitosamente');
        setFormData({
          title: '',
          content: '',
          vimeoVideoId: '',
          durationSeconds: 0,
          isFreePreview: false,
          isPublished: false,
          resources: []
        });
        onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al crear la lección');
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      setError('Error interno del servidor');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Crear Nueva Lección</h3>
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
              <label htmlFor="lesson-title" className="block text-sm font-medium text-gray-700 mb-1">
                Título de la Lección *
              </label>
              <input
                id="lesson-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: ¿Qué es React y por qué usarlo?"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="vimeo-id" className="block text-sm font-medium text-gray-700 mb-1">
                  ID del Video de Vimeo
                </label>
                <input
                  id="vimeo-id"
                  type="text"
                  value={formData.vimeoVideoId}
                  onChange={(e) => setFormData(prev => ({ ...prev, vimeoVideoId: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123456789"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duración
                </label>
                <input
                  id="duration"
                  type="text"
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    durationSeconds: parseDuration(e.target.value) 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="15:30 o 930"
                />
              </div>
            </div>

            <div>
              <label htmlFor="lesson-content" className="block text-sm font-medium text-gray-700 mb-1">
                Contenido de la Lección
              </label>
              <textarea
                id="lesson-content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción, notas, transcripción..."
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lesson-preview"
                  checked={formData.isFreePreview}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFreePreview: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="lesson-preview" className="text-sm font-medium text-gray-700">
                  Vista previa gratuita
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lesson-published"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="lesson-published" className="text-sm font-medium text-gray-700">
                  Publicar lección
                </label>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recursos Adicionales
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <label className="cursor-pointer bg-red-50 hover:bg-red-100 border border-red-200 p-2 rounded-lg flex flex-col items-center gap-1 transition-colors text-center">
                  <FileText className="h-4 w-4 text-red-600" />
                  <span className="text-xs text-red-700 font-medium">PDF</span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'pdf')}
                    disabled={uploading}
                  />
                </label>

                <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 border border-blue-200 p-2 rounded-lg flex flex-col items-center gap-1 transition-colors text-center">
                  <ImageIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-blue-700 font-medium">Imagen</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    disabled={uploading}
                  />
                </label>

                <label className="cursor-pointer bg-green-50 hover:bg-green-100 border border-green-200 p-2 rounded-lg flex flex-col items-center gap-1 transition-colors text-center">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">DOC</span>
                  <input
                    type="file"
                    accept=".doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'document')}
                    disabled={uploading}
                  />
                </label>

                <label className="cursor-pointer bg-purple-50 hover:bg-purple-100 border border-purple-200 p-2 rounded-lg flex flex-col items-center gap-1 transition-colors text-center">
                  <Video className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-purple-700 font-medium">Video</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    disabled={uploading}
                  />
                </label>
              </div>

              {uploading && (
                <div className="text-center py-2 text-blue-600 text-sm">
                  Subiendo archivo...
                </div>
              )}

              {formData.resources.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Archivos adjuntos:</p>
                  {formData.resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                      <div className="flex items-center gap-2">
                        {resource.type === 'pdf' && <FileText className="h-4 w-4 text-red-500" />}
                        {resource.type === 'image' && <ImageIcon className="h-4 w-4 text-blue-500" />}
                        {resource.type === 'document' && <FileText className="h-4 w-4 text-green-500" />}
                        {resource.type === 'video' && <Video className="h-4 w-4 text-purple-500" />}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{resource.name}</p>
                          <p className="text-xs text-gray-500">{(resource.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveResource(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || uploading || !formData.title.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Crear Lección
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}