
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, X } from 'lucide-react'

export function CoursesFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [categories, setCategories] = useState<any[]>([])
  const [search, setSearch] = useState(searchParams?.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get('category') || 'all')
  const [selectedLevel, setSelectedLevel] = useState(searchParams?.get('level') || 'all')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data?.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (search && search.trim()) {
      params.set('search', search.trim())
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory)
    }
    
    if (selectedLevel && selectedLevel !== 'all') {
      params.set('level', selectedLevel)
    }

    const queryString = params.toString()
    router.push(`/courses${queryString ? `?${queryString}` : ''}`)
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory('all')
    setSelectedLevel('all')
    router.push('/courses')
  }

  const hasFilters = search || (selectedCategory && selectedCategory !== 'all') || (selectedLevel && selectedLevel !== 'all')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filtros</CardTitle>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Buscar Curso</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Buscar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Categoría</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Categorías</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category?.id} value={category?.slug}>
                  {category?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Nivel</Label>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar nivel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Niveles</SelectItem>
              <SelectItem value="BEGINNER">Principiante</SelectItem>
              <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
              <SelectItem value="ADVANCED">Avanzado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={applyFilters} className="w-full">
          Aplicar Filtros
        </Button>
      </CardContent>
    </Card>
  )
}
