
import { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Iniciar Sesión - EduHub',
  description: 'Accede a tu cuenta de EduHub',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Link href="/" className="mx-auto flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">EduHub</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tu email y contraseña para continuar
          </p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/register"
            className="underline underline-offset-4 hover:text-primary"
          >
            Registrarse
          </Link>
        </p>
      </div>
    </div>
  )
}
