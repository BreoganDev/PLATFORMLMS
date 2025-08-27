// scripts/create-admin.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  console.log('🔐 Creando usuario administrador...')

  try {
    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('✅ Ya existe un administrador:')
      console.log(`   📧 Email: ${existingAdmin.email}`)
      console.log(`   👤 Nombre: ${existingAdmin.name || 'Sin nombre'}`)
      console.log(`   🎯 Rol: ${existingAdmin.role}`)
      return
    }

    // Crear admin
    const adminPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Administrador',
        password: adminPassword,
        role: 'ADMIN',
      },
    })

    console.log('✅ Administrador creado exitosamente:')
    console.log(`   📧 Email: ${admin.email}`)
    console.log(`   🔑 Contraseña: admin123`)
    console.log(`   🎯 Rol: ${admin.role}`)
    console.log('')
    console.log('🚀 Ahora puedes acceder al admin panel con estas credenciales.')

  } catch (error) {
    console.error('❌ Error creando administrador:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function listAllUsers() {
  console.log('\n👥 Usuarios en la base de datos:')
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true
    }
  })

  if (users.length === 0) {
    console.log('   📭 No hay usuarios registrados')
    return
  }

  users.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.email} - ${user.role} - ${user.name || 'Sin nombre'}`)
  })
}

async function main() {
  await listAllUsers()
  await createAdmin()
}

main().catch(console.error)