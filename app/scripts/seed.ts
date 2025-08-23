import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { createSlug } from '../lib/utils'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eduhub.com' },
    update: {},
    create: {
      email: 'admin@eduhub.com',
      name: 'Admin EduHub',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create test student
  const studentPassword = await bcrypt.hash('student123', 12)
  const student = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      password: studentPassword,
      role: 'STUDENT',
    },
  })

  console.log('Users created:', { admin: admin.email, student: student.email })

  // Create categories
  const categories = [
    {
      name: 'Desarrollo Web',
      description: 'Cursos de programación web, frameworks y tecnologías modernas',
    },
    {
      name: 'Diseño UX/UI',
      description: 'Diseño de experiencias de usuario y interfaces atractivas',
    },
    {
      name: 'Marketing Digital',
      description: 'Estrategias de marketing online, SEO, SEM y redes sociales',
    },
    {
      name: 'Data Science',
      description: 'Análisis de datos, machine learning e inteligencia artificial',
    },
  ]

  const createdCategories = []
  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: createSlug(categoryData.name) },
      update: {},
      create: {
        name: categoryData.name,
        slug: createSlug(categoryData.name),
        description: categoryData.description,
      },
    })
    createdCategories.push(category)
    console.log('Category created:', category.name)
  }

  // Create courses (solo si no existen)
  const existingCoursesCount = await prisma.course.count()
  if (existingCoursesCount === 0) {
    const courses = [
      {
        title: 'React y Next.js desde Cero',
        description: 'Aprende a crear aplicaciones web modernas con React y Next.js. Desde conceptos básicos hasta aplicaciones avanzadas con SSR y SSG.',
        level: 'BEGINNER',
        price: 99.99,
        categoryIndex: 0,
        coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
        modules: [
          {
            title: 'Fundamentos de React',
            lessons: [
              {
                title: 'Introducción a React',
                content: 'En esta lección aprenderemos los conceptos básicos de React.',
                durationSeconds: 900,
                isFreePreview: true,
              },
              {
                title: 'Componentes y JSX',
                content: 'Descubre cómo crear componentes reutilizables.',
                durationSeconds: 1200,
                isFreePreview: true,
              },
            ],
          },
        ],
      },
      {
        title: 'Introducción al Marketing Digital',
        description: 'Aprende las estrategias fundamentales del marketing digital.',
        level: 'BEGINNER',
        price: 0, // Free course
        categoryIndex: 2,
        coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
        modules: [
          {
            title: 'Fundamentos del Marketing Digital',
            lessons: [
              {
                title: 'Qué es el Marketing Digital',
                content: 'Introducción al marketing digital y sus principales canales.',
                durationSeconds: 1080,
                isFreePreview: true,
              },
            ],
          },
        ],
      },
    ]

    // Create courses with modules and lessons
    for (let courseIndex = 0; courseIndex < courses.length; courseIndex++) {
      const courseData = courses[courseIndex]
      const category = createdCategories[courseData.categoryIndex]

      const course = await prisma.course.create({
        data: {
          title: courseData.title,
          slug: createSlug(courseData.title),
          description: courseData.description,
          level: courseData.level as any,
          price: courseData.price,
          isPublished: true,
          coverImage: courseData.coverImage,
          categoryId: category.id,
          instructorId: admin.id,
        },
      })

      console.log('Course created:', course.title)

      // Create modules and lessons
      for (let moduleIndex = 0; moduleIndex < courseData.modules.length; moduleIndex++) {
        const moduleData = courseData.modules[moduleIndex]
        
        const module = await prisma.module.create({
          data: {
            title: moduleData.title,
            orderIndex: moduleIndex + 1,
            courseId: course.id,
          },
        })

        console.log('  Module created:', module.title)

        // Create lessons
        for (let lessonIndex = 0; lessonIndex < moduleData.lessons.length; lessonIndex++) {
          const lessonData = moduleData.lessons[lessonIndex]
          
          const lesson = await prisma.lesson.create({
            data: {
              title: lessonData.title,
              content: lessonData.content,
              durationSeconds: lessonData.durationSeconds,
              orderIndex: lessonIndex + 1,
              isFreePreview: lessonData.isFreePreview || false,
              moduleId: module.id,
            },
          })

          console.log('    Lesson created:', lesson.title)
        }
      }

      // Enroll student in free course
      if (courseData.price === 0) {
        await prisma.enrollment.create({
          data: {
            userId: student.id,
            courseId: course.id,
            status: 'ACTIVE',
          },
        })
        console.log('  Student enrolled in free course')
      }
    }
  } else {
    console.log('Courses already exist, skipping course creation')
  }

  console.log('Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })