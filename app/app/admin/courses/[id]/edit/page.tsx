import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import CourseEditor from '@/components/admin/course-editor';

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const course = await db.course.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      modules: {
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' }
          }
        },
        orderBy: { orderIndex: 'asc' }
      }
    }
  });

  if (!course) {
    notFound();
  }

  const categories = await db.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CourseEditor course={course} categories={categories} />
      </div>
    </div>
  );
}