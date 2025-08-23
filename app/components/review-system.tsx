
'use client'

import { useState, useEffect } from 'react'
import { Star, User, MessageSquare, Send, Loader } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment?: string
  createdAt: string
  user: {
    name: string
    image?: string
  }
}

interface Session {
  user: {
    id: string
    name?: string | null
    email?: string | null
  }
}

interface ReviewSystemProps {
  courseId: string
  isEnrolled: boolean
  session: Session | null
}

export default function ReviewSystem({ courseId, isEnrolled, session }: ReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [userRating, setUserRating] = useState(0)
  const [userComment, setUserComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [courseId])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?courseId=${courseId}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews)
        setAverageRating(data.averageRating)
        setTotalReviews(data.totalReviews)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!session || !userRating) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          rating: userRating,
          comment: userComment
        }),
      })

      if (response.ok) {
        setUserRating(0)
        setUserComment('')
        setShowReviewForm(false)
        await fetchReviews() // Refresh reviews
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al enviar la reseña')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Error al enviar la reseña')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive = false, size = 'small') => {
    const starSize = size === 'large' ? 'h-6 w-6' : 'h-4 w-4'
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => setUserRating(star) : undefined}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center py-8">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Reseñas y Valoraciones</h2>
          {session && isEnrolled && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Escribir Reseña
            </button>
          )}
        </div>

        {/* Overall Rating */}
        <div className="flex items-center gap-6 mb-8 p-6 bg-gray-50 rounded-xl">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            {renderStars(Math.round(averageRating), false, 'large')}
            <div className="text-sm text-gray-600 mt-2">
              {totalReviews} reseña{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* Rating breakdown (simplified) */}
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = reviews.filter(r => r.rating === rating).length
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
              
              return (
                <div key={rating} className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600 w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && session && isEnrolled && (
          <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Escribe tu reseña
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calificación
              </label>
              {renderStars(userRating, true, 'large')}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario (opcional)
              </label>
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Cuéntanos qué te pareció este curso..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {userComment.length}/500 caracteres
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmitReview}
                disabled={!userRating || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar Reseña
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600">No hay reseñas aún</p>
              <p className="text-sm text-gray-500">¡Sé el primero en compartir tu opinión!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  <div className="bg-gray-200 rounded-full p-2 flex-shrink-0">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {review.user.name || 'Usuario'}
                        </h4>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {review.comment && (
                      <p className="text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
