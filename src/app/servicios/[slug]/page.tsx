'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { servicesService, ServiceResponse } from '@/services/services.service'
import { ArrowLeft, CheckCircle2, MessageSquare, Zap, Shield, Rocket } from 'lucide-react'
import Link from 'next/link'

export default function DynamicServicePage() {
  const { slug } = useParams()
  const [service, setService] = useState<ServiceResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchService = async () => {
      try {
        setIsLoading(true)
        const response = await servicesService.getServiceBySlug(slug as string)
        setService(response.data)
      } catch (error) {
        console.error('Error fetching service:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) fetchService()
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#0740E4] animate-spin" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-[#01103B] mb-4">Servicio no encontrado</h1>
        <Link href="/servicios" className="text-[#0740E4] font-bold flex items-center gap-2">
          <ArrowLeft size={20} /> Volver a servicios
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-[#01103B]">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#0740E4]/10 skew-x-12 translate-x-1/4" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Link href="/servicios" className="inline-flex items-center gap-2 text-[#0740E4] mb-6 text-sm font-black uppercase tracking-widest transition-colors hover:text-white">
                <ArrowLeft size={16} /> Nuestros Servicios
              </Link>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-none">
                {service.titulo}
              </h1>
              <p className="text-xl text-white/60 mb-8 leading-relaxed">
                {service.descripción}
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href={`https://wa.me/51987654321?text=Hola,%20solicito%20información%20sobre%20${encodeURIComponent(service.titulo)}`}
                  target="_blank"
                  className="px-8 py-4 rounded-2xl bg-[#0740E4] text-white font-black uppercase tracking-widest text-sm hover:bg-[#FF7101] shadow-lg shadow-[#0740E4]/30 transition-all"
                >
                  Solicitar Cotización
                </a>
                <div className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm">
                  Desde S/ {(Number(service.precioBase) || 0).toFixed(0)}
                </div>
              </div>
            </div>
            <div className="relative aspect-video lg:aspect-square rounded-[40px] overflow-hidden border-8 border-white/5 shadow-2xl">
              <Image 
                src={service.imagen} 
                alt={service.titulo} 
                fill 
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#01103B] mb-4">¿Qué incluye este servicio?</h2>
            <p className="text-gray-500 font-medium">Calidad garantizada y soporte continuo en cada etapa.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, t: 'Entrega Ágil', d: 'Optimizamos tiempos sin sacrificar la excelencia técnica.' },
              { icon: Shield, t: 'Soporte 24/7', d: 'Acompañamiento constante post-entrega para tu tranquilidad.' },
              { icon: Rocket, t: 'Escalabilidad', d: 'Soluciones diseñadas para crecer junto a tu negocio.' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-[#0740E4] mb-6 group-hover:bg-[#0740E4] group-hover:text-white transition-colors">
                  <item.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-[#01103B] mb-3">{item.t}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detail Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[40px] p-12 border border-gray-100 shadow-2xl shadow-gray-200/50">
            <h3 className="text-2xl font-black text-[#01103B] mb-8 flex items-center gap-3">
              <CheckCircle2 size={28} className="text-[#34A853]" /> Características Principales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {service.caracteristicas.map((car, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-[#0740E4]" />
                  {car}
                </div>
              ))}
            </div>

            <div className="mt-12 p-8 bg-[#01103B] rounded-3xl text-center text-white relative overflow-hidden">
               <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-[#0740E4]/20 rounded-full blur-2xl" />
               <MessageSquare className="mx-auto mb-4 text-[#FF7101]" size={40} />
               <h4 className="text-xl font-bold mb-2">¿Tienes un requerimiento especial?</h4>
               <p className="text-white/60 mb-6 text-sm">Personalizamos cada solución según los objetivos de tu marca.</p>
               <Link href="/contacto" className="inline-block px-8 py-3 bg-[#FF7101] rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-[#01103B] transition-all">
                 Hablar con un Especialista
               </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
