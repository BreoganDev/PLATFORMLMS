import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function CourseHeader() {
  const session = await getServerSession(authOptions)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Maternidad en Calma</span>
        </Link>
        
        <nav className="flex items-center space-x-4">
          <Link href="/courses" className="text-sm font-medium transition-colors hover:text-primary">
            Cursos
          </Link>
          {session?.user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                Dashboard
              </Link>
              {session?.user?.role === 'ADMIN' && (
                <Link href="/admin" className="text-sm font-medium transition-colors hover:text-primary">
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium transition-colors hover:text-primary">
                Iniciar Sesión
              </Link>
              <Button asChild size="sm">
                <Link href="/register">Registrarse</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}