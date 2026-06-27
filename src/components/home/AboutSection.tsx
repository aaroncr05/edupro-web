"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Target, Users } from "lucide-react";

const pillars = [
  {
    title: "Estrategia clara",
    desc: "Analizamos tu objetivo comercial antes de proponer una solucion digital.",
    icon: Target,
    color: "#FF7101",
  },
  {
    title: "Equipo multidisciplinario",
    desc: "Desarrollo, diseno, marketing y soporte trabajando bajo un mismo proceso.",
    icon: Users,
    color: "#0740E4",
  },
  {
    title: "Resultados medibles",
    desc: "Construimos soluciones que puedan generar leads, ventas y seguimiento.",
    icon: Award,
    color: "#34A853",
  },
];

export function AboutSection() {
  return (
    <section id="nosotros" className="overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative">
            <div className="absolute -left-4 -top-4 h-full w-full rounded-xl bg-[#FF7101]" />
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
              <Image
                src="/img/equipo.jpg"
                alt="Equipo Digitales EduPro"
                width={720}
                height={620}
                className="h-[460px] w-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-[#01103B]/90 p-5 text-white">
                <p className="text-sm font-semibold text-[#FFB072]">Digitales EduPro</p>
                <p className="mt-1 text-xl font-black">Tecnologia + marketing para crecer</p>
              </div>
            </div>
          </div>

          <div>
            <span className="inline-flex rounded-full bg-[#01103B]/10 px-4 py-2 text-sm font-bold text-[#01103B]">
              Quienes somos
            </span>
            <h2 className="mt-5 text-3xl font-black leading-tight text-[#01103B] sm:text-4xl lg:text-5xl">
              Un equipo enfocado en convertir ideas digitales en oportunidades comerciales.
            </h2>
            <p className="mt-5 text-base leading-7 text-gray-600">
              Ayudamos a empresas y emprendedores a ordenar su presencia digital, captar prospectos y automatizar procesos con soluciones visuales, funcionales y pensadas para el cliente final.
            </p>

            <div className="mt-8 grid gap-4">
              {pillars.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      <Icon size={23} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#01103B]">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="/quienes-somos"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#FF7101] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#e86600]"
            >
              Conoce mas sobre nosotros
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
