// app/admin/courses/page.tsx - REEMPLAZAR COMPLETAMENTE
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import AdminCoursesClient from '@/components/admin-courses-client'

export default async function AdminCoursesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  // Obtener cursos con include completo
  const courses = await db.course.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      category: true,
      instructor: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      _count: {
        select: {
          enrollments: true,
          modules: true,
          reviews: true
        }
      }
    }
  })

  // Obtener categorías para el filtro
  const categories = await db.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true
    },
    orderBy: { name: 'asc' }
  })

  return <AdminCoursesClient courses={courses} categories={categories} />
}