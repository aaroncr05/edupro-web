"use client";

import Link from "next/link";
import { ArrowRight, Megaphone, MonitorSmartphone, GraduationCap } from "lucide-react";

const paths = [
  {
    title: "Quiero vender mas",
    desc: "Campanas, redes sociales y estrategia digital para atraer prospectos.",
    href: "/contacto",
    icon: Megaphone,
    color: "#FF7101",
  },
  {
    title: "Necesito una web o sistema",
    desc: "Páginas web, tiendas, landing pages y sistemas a medida para tu negocio.",
    href: "/servicios",
    icon: MonitorSmartphone,
    color: "#0740E4",
  },
  {
    title: "Quiero capacitar a mi equipo",
    desc: "Cursos y talleres prácticos para mejorar habilidades digitales.",
    href: "/cursos",
    icon: GraduationCap,
    color: "#34A853",
  },
];

export function ConversionPathSection() {
  return (
    <section className="relative z-10 -mt-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-lg md:grid-cols-3">
        {paths.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-lg border border-gray-100 p-5 transition-colors hover:bg-gray-50"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${item.color}15`, color: item.color }}
                >
                  <Icon size={22} />
                </div>
                <ArrowRight size={18} className="text-gray-300 transition-colors group-hover:text-[#FF7101]" />
              </div>
              <h2 className="text-lg font-bold text-[#01103B]">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">{item.desc}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
