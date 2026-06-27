import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Actualizar el rol del usuario admin
    const updated = await prisma.usuario.update({
      where: { email: 'admin@edupro.com' },
      data: { rolId: 1 }, // rolId 1 es administrador
      include: { rol: true }
    })
    
    console.log('Usuario actualizado:', updated)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
