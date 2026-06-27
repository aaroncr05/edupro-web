'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { coursesService, CourseResponse } from '@/services/courses.service'
import { ArrowLeft, BookOpen, Target, Users, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function DynamicCoursePage() {
  const { slug } = useParams()
  const [course, setCourse] = useState<CourseResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true)
        const response = await coursesService.getCourseBySlug(slug as string)
        setCourse(response.data)
      } catch (error) {
        console.error('Error fetching course:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) fetchCourse()
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#FF7101] animate-spin" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-[#01103B] mb-4">Curso no encontrado</h1>
        <Link href="/cursos" className="text-[#FF7101] font-bold flex items-center gap-2">
          <ArrowLeft size={20} /> Volver al catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <Image 
          src={course.imagen} 
          alt={course.titulo} 
          fill 
          className="object-cover transition-transform duration-700 hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#01103B] via-[#01103B]/60 to-transparent" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <Link href="/cursos" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm font-medium transition-colors">
            <ArrowLeft size={16} /> Catálogo de Cursos
          </Link>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
            {course.titulo}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-medium">
            {course.descripción}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Objetivos */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#FF7101]/10 flex items-center justify-center text-[#FF7101]">
                    <Target size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-[#01103B]">Objetivos del Curso</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.objetivos.map((obj, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <CheckCircle size={18} className="text-[#34A853] mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 font-medium">{obj}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contenido */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#0740E4]/10 flex items-center justify-center text-[#0740E4]">
                    <BookOpen size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-[#01103B]">Contenido Académico</h2>
                </div>
                <div className="space-y-3">
                  {course.contenido.map((item, i) => (
                    <div key={i} className="group flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-[#0740E4] hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400 group-hover:bg-[#0740E4] group-hover:text-white transition-colors">
                          {i + 1}
                        </span>
                        <p className="font-bold text-gray-700">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Sidebar / CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-gray-50 rounded-[40px] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Inversión del Curso</p>
                <div className="text-5xl font-black text-[#01103B] mb-6">
                  <span className="text-2xl align-top mr-1">S/</span>{(Number(course.precio) || 0).toFixed(0)}
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-left p-4 bg-white rounded-2xl border border-gray-100">
                    <Users size={20} className="text-[#FF7101]" />
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">Dirigido a</p>
                      <p className="text-sm font-bold text-[#01103B]">{course.dirigidoA}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-left p-4 bg-white rounded-2xl border border-gray-100">
                    <CheckCircle size={20} className="text-[#34A853]" />
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase">Certificación</p>
                      <p className="text-sm font-bold text-[#01103B]">Digital Incluida</p>
                    </div>
                  </div>
                </div>

                <a 
                  href={course.linkInscripcion || `https://wa.me/51987654321?text=Hola,%20quiero%20inscribirme%20al%20curso%20${encodeURIComponent(course.titulo)}`}
                  target="_blank"
                  className="w-full py-5 rounded-2xl bg-[#FF7101] text-white font-black uppercase tracking-widest text-sm hover:bg-[#01103B] shadow-lg shadow-[#FF7101]/30 transition-all block"
                >
                  Inscribirme Ahora
                </a>
                <p className="mt-4 text-[10px] text-gray-400 font-bold uppercase">Vacantes limitadas por grupo</p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
