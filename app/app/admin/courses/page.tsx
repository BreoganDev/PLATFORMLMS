import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminCoursesClient from '@/components/admin-courses-client'
import { db } from '@/lib/db'

export default async function AdminCoursesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  const courses = await db.course.findMany({
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
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
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const categories = await db.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  return <AdminCoursesClient courses={courses} categories={categories} />
}