"use client";

import Image from "next/image";

const partners = [
  { name: "Universidad Nacional de Piura", logo: "/img/partners/unp.png" },
  { name: "Camara de Comercio", logo: "/img/partners/camara-comercio.png" },
  { name: "Fundacion para el desarrollo del norte del Peru", logo: "/img/partners/desarrollo-norte.png" },
];

export function PartnersBlock() {
  return (
    <section className="bg-[#01103B] px-4 py-14 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-[#FFB072]">
              Aliados y convenios
            </span>
            <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
              Confianza institucional para proyectos digitales con respaldo.
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/70">
              Trabajamos junto a organizaciones que impulsan educacion, tecnologia y desarrollo empresarial.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {partners.map((partner) => (
              <div key={partner.name} className="flex min-h-36 items-center justify-center rounded-xl border border-white/10 bg-white p-5 shadow-sm">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={220}
                  height={100}
                  className="max-h-24 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
