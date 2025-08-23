
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

  // Create courses
  const courses = [
    {
      title: 'React y Next.js desde Cero',
      description: 'Aprende a crear aplicaciones web modernas con React y Next.js. Desde conceptos básicos hasta aplicaciones avanzadas con SSR y SSG.',
      level: 'BEGINNER',
      price: 99.99,
      categoryIndex: 0, // Desarrollo Web
      coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
      modules: [
        {
          title: 'Fundamentos de React',
          lessons: [
            {
              title: 'Introducción a React',
              content: 'En esta lección aprenderemos los conceptos básicos de React, qué es, para qué sirve y por qué es tan popular.',
              durationSeconds: 900, // 15 minutes
              isFreePreview: true,
            },
            {
              title: 'Componentes y JSX',
              content: 'Descubre cómo crear componentes reutilizables y usar JSX para escribir HTML dentro de JavaScript.',
              durationSeconds: 1200, // 20 minutes
              isFreePreview: true,
            },
            {
              title: 'Props y State',
              content: 'Aprende a pasar datos entre componentes con props y gestionar el estado local de los componentes.',
              durationSeconds: 1800, // 30 minutes
            },
          ],
        },
        {
          title: 'Next.js Framework',
          lessons: [
            {
              title: 'Introducción a Next.js',
              content: 'Conoce Next.js, el framework de React más popular para aplicaciones de producción.',
              durationSeconds: 1200,
            },
            {
              title: 'Routing y Navegación',
              content: 'Aprende el sistema de rutas de Next.js y cómo crear navegación entre páginas.',
              durationSeconds: 1500,
            },
            {
              title: 'API Routes',
              content: 'Crea APIs serverless directamente en tu aplicación Next.js.',
              durationSeconds: 2100,
            },
          ],
        },
      ],
    },
    {
      title: 'Diseño UX/UI Profesional',
      description: 'Domina los principios del diseño UX/UI y aprende a crear interfaces intuitivas y atractivas para aplicaciones web y móviles.',
      level: 'INTERMEDIATE',
      price: 129.99,
      categoryIndex: 1, // Diseño UX/UI
      coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop',
      modules: [
        {
          title: 'Fundamentos de UX',
          lessons: [
            {
              title: 'Qué es UX Design',
              content: 'Introducción al diseño de experiencia de usuario y su importancia en el desarrollo de productos.',
              durationSeconds: 1200,
              isFreePreview: true,
            },
            {
              title: 'Research y User Personas',
              content: 'Aprende técnicas de investigación de usuarios y cómo crear personas efectivas.',
              durationSeconds: 1800,
            },
          ],
        },
        {
          title: 'Diseño de Interfaces',
          lessons: [
            {
              title: 'Principios de UI Design',
              content: 'Los principios fundamentales para diseñar interfaces efectivas y atractivas.',
              durationSeconds: 1500,
              isFreePreview: true,
            },
            {
              title: 'Tipografía y Color',
              content: 'Domina el uso de tipografía y paletas de colores en tus diseños.',
              durationSeconds: 1800,
            },
            {
              title: 'Prototipado con Figma',
              content: 'Crea prototipos interactivos usando Figma, la herramienta más popular de diseño.',
              durationSeconds: 2400,
            },
          ],
        },
      ],
    },
    {
      title: 'Introducción al Marketing Digital',
      description: 'Aprende las estrategias fundamentales del marketing digital, desde SEO hasta campañas en redes sociales.',
      level: 'BEGINNER',
      price: 0, // Free course
      categoryIndex: 2, // Marketing Digital
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
            {
              title: 'SEO Básico',
              content: 'Aprende los fundamentos del SEO para mejorar la visibilidad de tu sitio web.',
              durationSeconds: 1620,
              isFreePreview: true,
            },
          ],
        },
      ],
    },
    {
      title: 'Python para Data Science',
      description: 'Domina Python y sus librerías más importantes para análisis de datos, visualización y machine learning.',
      level: 'INTERMEDIATE',
      price: 149.99,
      categoryIndex: 3, // Data Science
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
      modules: [
        {
          title: 'Python Fundamentals',
          lessons: [
            {
              title: 'Configuración del Entorno',
              content: 'Instala y configura Python, Jupyter y las herramientas necesarias.',
              durationSeconds: 900,
              isFreePreview: true,
            },
            {
              title: 'Numpy y Pandas',
              content: 'Aprende a manipular datos con las librerías más importantes de Python.',
              durationSeconds: 2400,
            },
          ],
        },
        {
          title: 'Visualización de Datos',
          lessons: [
            {
              title: 'Matplotlib y Seaborn',
              content: 'Crea gráficos y visualizaciones efectivas con Python.',
              durationSeconds: 2100,
            },
            {
              title: 'Plotly Interactivo',
              content: 'Desarrolla visualizaciones interactivas con Plotly.',
              durationSeconds: 1800,
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

  // Create some sample progress for the student
  const freeCourse = await prisma.course.findFirst({
    where: { price: 0 },
    include: {
      modules: {
        include: {
          lessons: true,
        },
      },
    },
  })

  if (freeCourse?.modules?.length > 0) {
    const firstLesson = freeCourse?.modules?.[0]?.lessons?.[0]
    if (firstLesson) {
      await prisma.progress.create({
        data: {
          userId: student.id,
          lessonId: firstLesson.id,
          isCompleted: true,
          secondsWatched: firstLesson.durationSeconds,
          completedAt: new Date(),
        },
      })
      console.log('Sample progress created')
    }
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
