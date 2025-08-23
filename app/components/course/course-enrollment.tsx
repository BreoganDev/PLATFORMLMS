'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, Play, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface CourseEnrollmentProps {
  course: any
  isEnrolled: boolean
  userId?: string
  session?: any // Pasamos la sesión como prop
}

export function CourseEnrollment({ course, isEnrolled, userId, session }: CourseEnrollmentProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleEnrollment = async () => {
    if (!session?.user) {
      toast.error('Debes iniciar sesión para inscribirte')
      return
    }

    if (course?.price === 0) {
      // Free course - direct enrollment
      setIsLoading(true)
      try {
        const response = await fetch('/api/courses/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: course?.id }),
        })

        if (response.ok) {
          toast.success('¡Te has inscrito exitosamente!')
          window.location.reload()
        } else {
          const data = await response.json()
          toast.error(data?.error || 'Error al inscribirse')
        }
      } catch (error) {
        toast.error('Error al procesar la inscripción')
      } finally {
        setIsLoading(false)
      }
    } else {
      // Paid course - redirect to Stripe Checkout
      setIsLoading(true)
      try {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: course?.id }),
        })

        if (response.ok) {
          const data = await response.json()
          window.location.href = data?.url
        } else {
          const data = await response.json()
          toast.error(data?.error || 'Error al procesar el pago')
        }
      } catch (error) {
        toast.error('Error al procesar el pago')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-primary">
            {course?.price === 0 ? 'Gratis' : formatPrice(course?.price)}
          </div>
          {course?.price > 0 && (
            <p className="text-sm text-muted-foreground">Pago único • Acceso de por vida</p>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isEnrolled ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Ya estás inscrito</span>
            </div>
            <Button asChild className="w-full" size="lg">
              <Link href={`/course/${course?.slug}/learn`}>
                <Play className="mr-2 h-4 w-4" />
                Continuar Aprendiendo
              </Link>
            </Button>
          </div>
        ) : session?.user ? (
          <Button 
            onClick={handleEnrollment} 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : course?.price === 0 ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Inscribirse Gratis
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Comprar Ahora
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/login">
                Iniciar Sesión para Inscribirse
              </Link>
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Registrarse
              </Link>
            </p>
          </div>
        )}

        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-semibold">Este curso incluye:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {course?.modules?.length || 0} módulos de contenido
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Acceso de por vida
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Acceso en dispositivos móviles
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Videos de alta calidad
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}