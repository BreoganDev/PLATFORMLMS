'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, X, AlertCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  level: string;
  categoryId?: string | null;
  coverImage?: string | null;
  isPublished: boolean;
  category?: { id: string; name: string; slug: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CourseSettingsFormProps {
  course: Course;
  categories: Category[];
}

export default function CourseSettingsForm({ course, categories }: CourseSettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description || '',
    price: course.price,
    level: course.level,
    categoryId: course.categoryId || '',
    coverImage: course.coverImage || '',
    isPublished: course.isPublished
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
    }
  };

  const uploadCoverImage = async (): Promise<string | null> => {
    if (!coverImageFile) return null;

    const uploadFormData = new FormData();
    uploadFormData.append('file', coverImageFile);
    uploadFormData.append('type', 'image');

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData
      });

      if (response.ok) {
        const data = await response.json();
        return data.file.url;
      }
      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let coverImageUrl = formData.coverImage;
      if (coverImageFile) {
        const uploadedUrl = await uploadCoverImage();
        if (uploadedUrl) {
          coverImageUrl = uploadedUrl;
        }
      }

      const response = await fetch(`/api/admin/courses/${course.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          coverImage: coverImageUrl
        }),
      });

      if (response.ok) {
        toast.success('Configuración del curso actualizada');
        router.push(`/admin/courses/${course.id}/edit`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al actualizar el curso');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      setError('Error interno del servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/admin/courses/${course.id}/edit`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al editor
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Curso</h1>
        </div>
        <p className="text-gray-600">Edita la información básica del curso</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
                Título del Curso *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                id="category"
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sin categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                Nivel
              </label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="BEGINNER">Principiante</option>
                <option value="INTERMEDIATE">Intermedio</option>
                <option value="ADVANCED">Avanzado</option>
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Precio (€)
              </label>
              <input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                Curso publicado
              </label>
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Imagen de Portada
            </label>
            
            {formData.coverImage && !coverImageFile && (
              <div className="mb-4">
                <div className="relative inline-block">
                  <img 
                    src={formData.coverImage} 
                    alt="Portada actual" 
                    className="h-32 w-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">Imagen actual</p>
              </div>
            )}

            <div className="border-2 border-gray-300 border-dashed rounded-lg p-6 hover:border-blue-400 transition-colors">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <label
                  htmlFor="cover-image"
                  className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  <span>Cambiar imagen de portada</span>
                  <input
                    id="cover-image"
                    name="cover-image"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP hasta 10MB</p>
              </div>
            </div>
            
            {coverImageFile && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-10 bg-blue-100 rounded border border-blue-200 flex items-center justify-center">
                    <Upload className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Nueva imagen: {coverImageFile.name}
                    </p>
                    <p className="text-xs text-blue-700">
                      {(coverImageFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Link
              href={`/admin/courses/${course.id}/edit`}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={!formData.title || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}