"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { settingsService } from "@/services/settings.service";

export function HeroBlock() {
  const [content, setContent] = useState({
    title: "Digitales EduPro",
    subtitle:
      "Soluciones digitales, marketing, sistemas web y capacitaciones para empresas que quieren vender mejor y operar con mas orden.",
    image: "/img/fondo.jpg",
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await settingsService.getAllSettings();
        const title = data.find((s) => s.key === "hero_title")?.value;
        const subtitle = data.find((s) => s.key === "hero_subtitle")?.value;
        const image = data.find((s) => s.key === "hero_image")?.value;

        setContent((prev) => ({
          title: title || prev.title,
          subtitle: subtitle || prev.subtitle,
          image: image || prev.image,
        }));
      } catch (error) {
        console.error("Error loading hero settings:", error);
      }
    };

    loadSettings();
  }, []);

  return (
    <section className="relative min-h-[calc(100svh-4.25rem)] overflow-hidden bg-[#01103B]">
      <Image
        src={content.image}
        alt="Equipo de Digitales EduPro trabajando en soluciones digitales"
        fill
        sizes="100vw"
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[#01103B]/75" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-white to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4.25rem)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl text-white">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#34A853]" />
            Empresa digital en Piura
          </div>

          <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            {content.title}
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
            {content.subtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF7101] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#e86600]"
            >
              Solicitar cotizacion
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/servicios"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20"
            >
              Ver servicios
            </Link>
          </div>

          <div className="mt-8 grid max-w-2xl gap-3 text-sm text-white/85 sm:grid-cols-3">
            {["Páginas web", "Marketing digital", "Sistemas a medida"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-[#34A853]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Link
        href="https://wa.me/51960183250"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-6 right-6 z-20 hidden items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-bold text-[#01103B] shadow-lg transition-colors hover:bg-gray-100 md:inline-flex"
      >
        <MessageCircle size={18} className="text-[#34A853]" />
        WhatsApp
      </Link>
    </section>
  );
}
