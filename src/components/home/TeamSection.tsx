"use client";

import Image from "next/image";
import { Code2, LineChart, Palette, ServerCog } from "lucide-react";

const members = [
  {
    name: "Equipo de Desarrollo",
    role: "Web, sistemas y automatizacion",
    avatar: "/img/team/team-a.jpg",
    icon: Code2,
    color: "#0740E4",
  },
  {
    name: "Equipo Creativo",
    role: "Diseno, contenido y marca",
    avatar: "/img/team/team-b.jpg",
    icon: Palette,
    color: "#FF7101",
  },
  {
    name: "Equipo Comercial",
    role: "CRM, ventas y seguimiento",
    avatar: "/img/team/team-a.jpg",
    icon: LineChart,
    color: "#34A853",
  },
  {
    name: "Equipo de Soporte",
    role: "Mantenimiento y atención post-venta",
    avatar: "/img/team/team-b.jpg",
    icon: ServerCog,
    color: "#01103B",
  },
];

export function TeamSection() {
  return (
    <section className="px-4">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-[#01103B] p-6 text-white sm:p-8 lg:p-10">
          <div className="mb-8 grid gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-[#FFB072]">
                Equipo
              </span>
              <h2 className="mt-4 text-3xl font-black sm:text-4xl">
                Profesionales para cada etapa de tu proyecto
              </h2>
            </div>
            <p className="text-sm leading-6 text-white/70">
              Integramos estrategia, desarrollo, diseno, ventas y soporte para que tu solucion digital no solo se vea bien, sino que funcione para captar y atender clientes.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {members.map((member) => {
              const Icon = member.icon;
              return (
                <article key={member.name} className="rounded-xl border border-white/10 bg-white p-4 text-[#01103B] shadow-sm">
                  <div className="relative mb-4 h-44 overflow-hidden rounded-lg">
                    <Image src={member.avatar} alt={member.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${member.color}15`, color: member.color }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-black">{member.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
