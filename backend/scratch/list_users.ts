import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: { rol: true },
      orderBy: { id: 'asc' }
    })
    
    console.log('Todos los usuarios:')
    usuarios.forEach(u => {
      console.log(`ID: ${u.id}, Email: ${u.email}, Nombre: ${u.nombre}, Rol: ${u.rol?.nombre} (rolId: ${u.rolId})`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
