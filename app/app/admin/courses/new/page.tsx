'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { BookOpen, ArrowLeft, Save, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

export default function NewCoursePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [vimeoVideoId, setVimeoVideoId] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const { data: session, status } = useSession()

  // Redirect if not admin
  if (status === 'loading') {
    return <div>Cargando...</div>
  }

  if (!session?.user || session?.user?.role !== 'ADMIN') {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!title.trim()) {
      toast.error('El título es requerido')
      setIsLoading(false)
      return
    }

    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      toast.error('Ingresa un precio válido')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
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
        throw new Error(data.error || 'Error al crear el curso')
      }

      toast.success('Curso creado exitosamente')
      router.push('/admin')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver al Admin
              </Link>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
              <BookOpen className="h-6 w-6 mr-2" />
              Crear Nuevo Curso
            </h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Título del Curso *
              </label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Nutrición en el Embarazo"
                className="mt-1"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe de qué trata el curso..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Precio (€) *
              </label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="mt-1"
                required
              />
            </div>

            <div>
              <label htmlFor="vimeoVideoId" className="block text-sm font-medium text-gray-700">
                ID del Video de Vimeo (Trailer)
              </label>
              <Input
                id="vimeoVideoId"
                type="text"
                value={vimeoVideoId}
                onChange={(e) => setVimeoVideoId(e.target.value)}
                placeholder="Ej: 123456789"
                className="mt-1"
              />
              <p className="mt-1 text-sm text-gray-500">
                Solo el ID numérico del video, no la URL completa
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublished"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                Publicar curso inmediatamente
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin')}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Curso
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}