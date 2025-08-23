
import { Suspense } from 'react'
import { CoursesHeader } from '@/components/courses/courses-header'
import { CoursesFilters } from '@/components/courses/courses-filters'
import { CoursesList } from '@/components/courses/courses-list'
import { CoursesLoading } from '@/components/courses/courses-loading'

export default function CoursesPage({
  searchParams,
}: {
  searchParams: { category?: string; level?: string; search?: string }
}) {
  return (
    <div className="min-h-screen">
      <CoursesHeader />
      
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <CoursesFilters />
          </div>
          
          <div className="lg:col-span-3">
            <Suspense fallback={<CoursesLoading />}>
              <CoursesList searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
