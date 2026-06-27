"use client";

import Image from "next/image";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    company: "Universidad Nacional de Piura",
    logo: "/img/partners/unp.png",
    text: "El trabajo fue ordenado, claro y orientado a resultados. La propuesta digital ayudo a mejorar nuestra comunicacion y procesos.",
    author: "Maria Gonzales",
    role: "Direccion de tecnologia",
    avatar: "/img/testimonial/testimonial-b.jpg",
  },
  {
    company: "Camara de Comercio",
    logo: "/img/partners/camara-comercio.png",
    text: "Tuvimos acompanamiento desde el diagnostico hasta la entrega. El equipo entiende la necesidad comercial antes de desarrollar.",
    author: "Carlos Rodriguez",
    role: "Gerencia TI",
    avatar: "/img/testimonial/testimonial-a.jpg",
  },
  {
    company: "Desarrollo Norte",
    logo: "/img/partners/desarrollo-norte.png",
    text: "Nos entregaron una solucion practica, visual y facil de gestionar. La comunicacion durante el proyecto fue constante.",
    author: "Ana Martinez",
    role: "Coordinacion de proyectos",
    avatar: "/img/testimonial/testimonial-b.jpg",
  },
];

export function TestimonialsSection() {
  return (
    <section className="px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="inline-flex rounded-full bg-[#FF7101]/10 px-4 py-2 text-sm font-bold text-[#FF7101]">
              Testimonios
            </span>
            <h2 className="mt-4 text-3xl font-black text-[#01103B] sm:text-4xl">
              Clientes que confiaron en nuestro proceso
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-gray-500">
            Cada proyecto se trabaja con seguimiento, comunicacion y enfoque en resultados medibles.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.company} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <Image src={item.logo} alt={item.company} width={120} height={55} className="max-h-12 w-auto object-contain" />
                <Quote size={28} className="text-[#FF7101]" />
              </div>

              <div className="mt-5 flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={16} className="fill-[#FF7101] text-[#FF7101]" />
                ))}
              </div>

              <p className="mt-5 min-h-28 text-sm leading-7 text-gray-600">{item.text}</p>

              <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-5">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-[#01103B]">
                  <Image src={item.avatar} alt={item.author} fill sizes="48px" className="object-cover" />
                </div>
                <div>
                  <p className="font-bold text-[#01103B]">{item.author}</p>
                  <p className="text-xs text-gray-500">{item.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
