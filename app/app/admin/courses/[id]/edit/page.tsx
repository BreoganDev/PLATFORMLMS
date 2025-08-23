
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ArrowLeft, Save, AlertCircle, Trash2 } from 'lucide-react'

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [vimeoVideoId, setVimeoVideoId] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchCourse()
  }, [params.id])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${params.id}`)
      
      if (!response.ok) {
        throw new Error('Course not found')
      }

      const data = await response.json()
      const courseData = data.course
      
      setCourse(courseData)
      setTitle(courseData.title)
      setDescription(courseData.description || '')
      setPrice(courseData.price.toString())
      setVimeoVideoId(courseData.vimeoVideoId || '')
      setIsPublished(courseData.isPublished)
    } catch (error) {
      setError('Error al cargar el curso')
      console.error('Error fetching course:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!title.trim()) {
      setError('El título es requerido')
      setIsLoading(false)
      return
    }

    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      setError('Ingresa un precio válido')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/admin/courses/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          price: Number(price),
          vimeoVideoId: vimeoVideoId.trim() || null,
          isPublished,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al actualizar el curso')
      }

      router.push('/admin')
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando curso...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Curso no encontrado</h1>
          <Link href="/admin" className="text-blue-600 hover:text-blue-700">
            Volver al admin
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">LMS Admin</span>
            </div>
            <Link
              href="/admin"
              className="text-gray-600 hover:text-blue-600 inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Editar Curso
          </h1>
          <p className="text-gray-600 mt-2">
            Actualiza la información de tu curso
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Curso *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Introducción a React.js"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe de qué trata tu curso..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Precio (USD) *
                  </label>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="29.99"
                  />
                </div>

                <div>
                  <label htmlFor="vimeoVideoId" className="block text-sm font-medium text-gray-700 mb-2">
                    ID de Video Vimeo
                  </label>
                  <input
                    id="vimeoVideoId"
                    type="text"
                    value={vimeoVideoId}
                    onChange={(e) => setVimeoVideoId(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123456789"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Obtén el ID numérico de la URL de Vimeo
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="isPublished"
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
                  Curso publicado (visible para los estudiantes)
                </label>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                
                <Link
                  href="/admin"
                  className="text-gray-600 hover:text-gray-800 px-6 py-3 transition-colors"
                >
                  Cancelar
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
