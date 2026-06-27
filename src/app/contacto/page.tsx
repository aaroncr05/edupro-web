"use client";
import { ContactSection } from "@/components/home/ContactSection";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";

export default function ContactoPage() {
  return (
    <main className="bg-white">
      {/* Page Hero */}
      <section className="relative py-16 overflow-hidden" style={{ background: 'linear-gradient(135deg, #01103B 0%, #0740E4 60%, #01103B 100%)' }}>
        {/* BG decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #FF7101, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #00CCFF, transparent)', transform: 'translate(-30%, 30%)' }} />
          <div className="absolute inset-0"
            style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4 bg-white/10 border border-white/20">
            📬 Ponte en contacto
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Hablemos sobre{" "}
            <span className="text-[#FF7101]">tu proyecto</span>
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Nuestro equipo está listo para ayudarte a transformar digitalmente tu negocio.
            Recibe una cotización personalizada sin costo.
          </p>
        </div>
      </section>

      {/* Quick contact strips */}
      <section className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
            {[
              { icon: MapPin, label: 'Ubicación', value: 'Piura, Perú', color: '#FF7101' },
              { icon: Phone, label: 'Teléfono', value: '+51 960 183 250', color: '#0740E4' },
              { icon: Mail, label: 'Correo', value: 'info@digitalesedupro.com', color: '#34A853' },
              { icon: Clock, label: 'Horario', value: 'Lun–Vie: 9:00–18:00', color: '#9333EA' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="flex items-center gap-3 p-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: item.color + '15' }}>
                    <Icon size={18} style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main form section */}
      <ContactSection />

      {/* WhatsApp CTA */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: '#25D36615' }}>
              <MessageCircle size={28} style={{ color: '#25D366' }} />
            </div>
            <h3 className="text-xl font-bold text-[#01103B] mb-2">¿Prefieres WhatsApp?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Chatea directamente con nuestro equipo para una respuesta más rápida.
            </p>
            <a
              href="https://wa.me/51960183250?text=Hola,%20me%20interesa%20conocer%20más%20sobre%20sus%20servicios"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
            >
              <MessageCircle size={16} />
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
