
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import AdminEnrollmentsClient from '@/components/admin-enrollments-client'

export default async function AdminEnrollmentsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  // Get courses and users for dropdowns
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      title: true,
      slug: true
    },
    orderBy: { title: 'asc' }
  })

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    },
    orderBy: { name: 'asc' }
  })

  return <AdminEnrollmentsClient courses={courses} users={users} />
}
