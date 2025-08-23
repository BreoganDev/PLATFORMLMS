
import { Role, CourseLevel, OrderStatus, EnrollmentStatus } from '@prisma/client'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
    } & DefaultSession['user']
  }

  interface User {
    role: Role
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
  }
}

export interface CourseWithCategory {
  id: string
  title: string
  slug: string
  description: string | null
  coverImage: string | null
  level: CourseLevel
  isPublished: boolean
  price: number
  categoryId: string
  instructorId: string
  createdAt: Date
  updatedAt: Date
  category: {
    id: string
    name: string
    slug: string
  }
  instructor: {
    id: string
    name: string | null
  }
  _count: {
    enrollments: number
    modules: number
  }
}

export interface CourseWithModules {
  id: string
  title: string
  slug: string
  description: string | null
  coverImage: string | null
  level: CourseLevel
  isPublished: boolean
  price: number
  categoryId: string
  instructorId: string
  createdAt: Date
  updatedAt: Date
  category: {
    id: string
    name: string
    slug: string
  }
  instructor: {
    id: string
    name: string | null
  }
  modules: ModuleWithLessons[]
  _count: {
    enrollments: number
  }
}

export interface ModuleWithLessons {
  id: string
  title: string
  orderIndex: number
  lessons: LessonWithProgress[]
}

export interface LessonWithProgress {
  id: string
  title: string
  content: string | null
  vimeoVideoId: string | null
  durationSeconds: number
  orderIndex: number
  isFreePreview: boolean
  progress?: {
    id: string
    isCompleted: boolean
    secondsWatched: number
    completedAt: Date | null
  }[]
}

export interface UserProgress {
  userId: string
  courseId: string
  completedLessons: number
  totalLessons: number
  progressPercentage: number
  lastAccessedLesson?: {
    id: string
    title: string
    moduleId: string
  }
}

export interface EnrollmentWithCourse {
  id: string
  status: EnrollmentStatus
  enrolledAt: Date
  course: {
    id: string
    title: string
    slug: string
    coverImage: string | null
    level: CourseLevel
    instructor: {
      id: string
      name: string | null
    }
  }
  progress?: UserProgress
}
