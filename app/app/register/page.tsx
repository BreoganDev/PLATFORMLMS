
import { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Registro - EduHub',
  description: 'Crea tu cuenta en EduHub',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Link href="/" className="mx-auto flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">EduHub</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Crear Cuenta
          </h1>
          <p className="text-sm text-muted-foreground">
            Únete a EduHub y comienza a aprender
          </p>
        </div>
        <RegisterForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
