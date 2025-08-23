
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, Star, Euro, Users, Clock, X } from 'lucide-react'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  slug: string
  description?: string | null
  price: number
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  instructor: { name: string | null }
  category?: { name: string; icon?: string | null } | null
  enrollments: { userId: string }[]
  modules: {
    lessons: { durationSeconds?: number | null }[]
  }[]
  reviews: { rating: number }[]
  averageRating: number
  totalReviews: number
}

interface SearchAndFiltersProps {
  courses: Course[]
  onFilteredCoursesChange: (courses: Course[]) => void
}

export default function SearchAndFilters({ courses, onFilteredCoursesChange }: SearchAndFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<string>('all')
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>('newest')
  const [showFilters, setShowFilters] = useState(false)

  // Extract unique categories and levels
  const categories = useMemo(() => {
    const cats = courses
      .filter(course => course.category?.name)
      .map(course => course.category!)
      .reduce((acc, cat) => {
        if (!acc.find(c => c.name === cat.name)) {
          acc.push({
            name: cat.name,
            icon: cat.icon || undefined
          })
        }
        return acc
      }, [] as { name: string; icon?: string }[])
    return cats
  }, [courses])

  const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses.filter(course => {
      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchesTitle = course.title.toLowerCase().includes(term)
        const matchesDescription = course.description?.toLowerCase().includes(term) || false
        const matchesInstructor = course.instructor.name?.toLowerCase().includes(term) || false
        
        if (!matchesTitle && !matchesDescription && !matchesInstructor) {
          return false
        }
      }

      // Level filter
      if (selectedLevel !== 'all' && course.level !== selectedLevel) {
        return false
      }

      // Category filter
      if (selectedCategory !== 'all' && course.category?.name !== selectedCategory) {
        return false
      }

      // Price range filter
      if (priceRange !== 'all') {
        switch (priceRange) {
          case 'free':
            if (course.price > 0) return false
            break
          case 'under-50':
            if (course.price >= 50) return false
            break
          case '50-100':
            if (course.price < 50 || course.price > 100) return false
            break
          case 'over-100':
            if (course.price <= 100) return false
            break
        }
      }

      // Rating filter
      if (minRating > 0 && course.averageRating < minRating) {
        return false
      }

      return true
    })

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.id).getTime() - new Date(a.id).getTime() // Simple sort by ID as proxy for date
        case 'oldest':
          return new Date(a.id).getTime() - new Date(b.id).getTime()
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return b.averageRating - a.averageRating
        case 'popular':
          return b.enrollments.length - a.enrollments.length
        default:
          return 0
      }
    })

    return filtered
  }, [courses, searchTerm, selectedLevel, selectedCategory, priceRange, minRating, sortBy])

  // Update parent component when filtered courses change
  useEffect(() => {
    onFilteredCoursesChange(filteredAndSortedCourses)
  }, [filteredAndSortedCourses, onFilteredCoursesChange])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedLevel('all')
    setSelectedCategory('all')
    setPriceRange('all')
    setMinRating(0)
    setSortBy('newest')
  }

  const hasActiveFilters = searchTerm || selectedLevel !== 'all' || selectedCategory !== 'all' || 
                          priceRange !== 'all' || minRating > 0 || sortBy !== 'newest'

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cursos, instructores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              !
            </span>
          )}
        </button>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguos</option>
          <option value="price-low">Precio: menor a mayor</option>
          <option value="price-high">Precio: mayor a menor</option>
          <option value="rating">Mejor valorados</option>
          <option value="popular">Más populares</option>
        </select>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los niveles</option>
                <option value="BEGINNER">Principiante</option>
                <option value="INTERMEDIATE">Intermedio</option>
                <option value="ADVANCED">Avanzado</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rango de precio
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los precios</option>
                <option value="free">Gratis</option>
                <option value="under-50">Menos de €50</option>
                <option value="50-100">€50 - €100</option>
                <option value="over-100">Más de €100</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valoración mínima
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Cualquier valoración</option>
                <option value={4}>4+ estrellas</option>
                <option value={3}>3+ estrellas</option>
                <option value={2}>2+ estrellas</option>
                <option value={1}>1+ estrellas</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="h-4 w-4" />
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-4 text-sm text-gray-600">
        Mostrando {filteredAndSortedCourses.length} de {courses.length} cursos
        {hasActiveFilters && ' (filtrados)'}
      </div>
    </div>
  )
}
