import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // --- ROLES ---
  const roles = [
    { nombre: 'administrador', descripcion: 'Acceso total al sistema' },
    { nombre: 'gerente_comercial', descripcion: 'Gestión comercial y reportes' },
    { nombre: 'asesor_ventas', descripcion: 'Gestión de leads y cotizaciones' },
    { nombre: 'atencion_cliente', descripcion: 'Soporte y atención post-venta' },
    { nombre: 'cliente', descripcion: 'Acceso de cliente' },
  ]

  for (const r of roles) {
    await prisma.rol.upsert({
      where: { nombre: r.nombre },
      update: {},
      create: r
    })
  }
  console.log('✅ Roles created')

  // --- ADMIN USER ---
  const adminRol = await prisma.rol.findUnique({ where: { nombre: 'administrador' } })
  if (adminRol) {
    const hash = await bcrypt.hash('Admin123!', 10)
    await prisma.usuario.upsert({
      where: { email: 'admin@edupro.com' },
      update: {},
      create: {
        email: 'admin@edupro.com',
        password: hash,
        nombre: 'Administrador',
        rolId: adminRol.id,
        activo: true
      }
    })
    console.log('✅ Admin user created: admin@edupro.com / Admin123!')
  }

  // --- SETTINGS ---
  const settings = [
    { clave: 'hero_title', valor: 'Impulsa tu Futuro con EduPro', grupo: 'hero', tipo: 'text', descripcion: 'Título principal de la Home' },
    { clave: 'hero_subtitle', valor: 'Cursos especializados en diseño y tecnología para el mundo moderno.', grupo: 'hero', tipo: 'text', descripcion: 'Subtítulo de la Home' },
    { clave: 'hero_image', valor: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop', grupo: 'hero', tipo: 'image', descripcion: 'Imagen de fondo del Hero' },
    { clave: 'contact_email', valor: 'ventas@digitalesedupro.com', grupo: 'contact', tipo: 'text', descripcion: 'Email de contacto oficial' },
    { clave: 'contact_phone', valor: '+51 987 654 321', grupo: 'contact', tipo: 'text', descripcion: 'Teléfono de WhatsApp' },
    { clave: 'stats_projects', valor: '150', grupo: 'stats', tipo: 'number', descripcion: 'Cantidad de proyectos completados' },
    { clave: 'stats_students', valor: '500', grupo: 'stats', tipo: 'number', descripcion: 'Cantidad de alumnos egresados' },
  ]

  for (const s of settings) {
    await prisma.configuracionGlobal.upsert({
      where: { clave: s.clave },
      update: {},
      create: s
    })
  }

  // --- SAMPLE COURSES ---
  const courses = [
    {
      titulo: 'Canva Kids',
      slug: 'canva-kids',
      descripcion: 'Un curso creativo para que los niños exploren el diseño gráfico de manera divertida.',
      imagen: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?q=80&w=2071&auto=format&fit=crop',
      objetivos: ['Fomentar la creatividad', 'Aprender diseño básico', 'Uso de plantillas'],
      dirigidoA: 'Niños de 7 a 12 años',
      contenido: ['Interfaz de Canva', 'Diseño de Posters', 'Tarjetas Digitales'],
      precio: 150.00,
      activo: true
    },
    {
      titulo: 'Diseño Web Pro',
      slug: 'diseno-web-pro',
      descripcion: 'Domina Next.js y Tailwind CSS para crear interfaces de alto impacto.',
      imagen: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=2070&auto=format&fit=crop',
      objetivos: ['Componentes React', 'Tailwind Avanzado', 'Despliegue en Vercel'],
      dirigidoA: 'Estudiantes y Profesionales',
      contenido: ['React Hooks', 'Next.js App Router', 'API Routes'],
      precio: 299.99,
      activo: true
    }
  ]

  for (const c of courses) {
    await prisma.curso.upsert({
      where: { slug: c.slug },
      update: {},
      create: c
    })
  }

  // --- SAMPLE SERVICES ---
  const services = [
    {
      titulo: 'Desarrollo Web Premium',
      slug: 'desarrollo-web-premium',
      descripcion: 'Páginas web rápidas, seguras y optimizadas para Google.',
      icono: 'Layout',
      imagen: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
      caracteristicas: ['Diseño Responsivo', 'Certificado SSL', 'Hosting Incluido'],
      precioBase: 1200.00,
      activo: true
    },
    {
      titulo: 'Manejo de Redes',
      slug: 'manejo-redes',
      descripcion: 'Impulsamos tu marca en Facebook, Instagram y TikTok.',
      icono: 'Share2',
      imagen: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1974&auto=format&fit=crop',
      caracteristicas: ['Diseño de Contenido', 'Pauta Publicitaria', 'Reporte Mensual'],
      precioBase: 850.00,
      activo: true
    }
  ]

  for (const s of services) {
    await prisma.servicio.upsert({
      where: { slug: s.slug },
      update: {},
      create: s
    })
  }

  console.log('✅ Seed finished!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
