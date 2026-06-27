"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Book, Code, Globe, Monitor, Share2, Smartphone } from "lucide-react";
import { servicesService, ServiceResponse } from "@/services/services.service";

const fallbackServices = [
  {
    id: 1,
    titulo: "Páginas web",
    slug: "páginas_web",
    descripción: "Sitios modernos, rápidos y preparados para captar clientes.",
    icono: "Globe",
    caracteristicas: ["Landing pages", "Web corporativa", "SEO base"],
  },
  {
    id: 2,
    titulo: "Sistemas a medida",
    slug: "web_medida",
    descripción: "Herramientas internas para ventas, operaciones y control.",
    icono: "Code",
    caracteristicas: ["CRM", "Automatizacion", "Paneles de control"],
  },
  {
    id: 3,
    titulo: "Marketing digital",
    slug: "manejo_redes",
    descripción: "Estrategia, contenido y campanas para generar oportunidades.",
    icono: "Share2",
    caracteristicas: ["Redes sociales", "Campanas", "Anuncios"],
  },
] as ServiceResponse[];

export function ServicesSection() {
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await servicesService.getAllServices({ activo: true });
        setServices(response.data.slice(0, 6));
      } catch (error) {
        console.error("Error loading services for home:", error);
        setServices(fallbackServices);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Code":
        return Code;
      case "Smartphone":
        return Smartphone;
      case "Share2":
        return Share2;
      case "Monitor":
        return Monitor;
      case "Book":
        return Book;
      default:
        return Globe;
    }
  };

  const visibleServices = services.length > 0 ? services : fallbackServices;

  return (
    <section id="servicios" className="px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <span className="inline-flex rounded-full bg-[#01103B]/10 px-4 py-2 text-sm font-bold text-[#01103B]">
              Servicios
            </span>
            <h2 className="mt-4 text-3xl font-black leading-tight text-[#01103B] sm:text-4xl lg:text-5xl">
              Soluciones digitales para captar, vender y atender mejor.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-gray-500">
            Creamos experiencias digitales con enfoque comercial: páginas web, sistemas, marketing y capacitaciones conectadas con el crecimiento de tu negocio.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? [1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse rounded-xl bg-gray-100" />)
            : visibleServices.map((service, index) => {
                const Icon = getIcon(service.icono);
                const isPrimary = index === 0;
                return (
                  <article
                    key={service.id}
                    className={`group rounded-xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${
                      isPrimary ? "border-[#01103B] bg-[#01103B] text-white" : "border-gray-200 bg-white text-[#01103B]"
                    }`}
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${isPrimary ? "bg-white/10 text-[#FFB072]" : "bg-[#FF7101]/10 text-[#FF7101]"}`}>
                        <Icon size={26} />
                      </div>
                      <span className={`text-xs font-bold ${isPrimary ? "text-white/45" : "text-gray-300"}`}>
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="text-xl font-black">{service.titulo}</h3>
                    <p className={`mt-3 min-h-16 text-sm leading-6 ${isPrimary ? "text-white/70" : "text-gray-500"}`}>
                      {service.descripción}
                    </p>

                    <ul className="mt-5 space-y-2">
                      {(service.caracteristicas || []).slice(0, 3).map((feature) => (
                        <li key={feature} className={`flex items-center gap-2 text-sm ${isPrimary ? "text-white/80" : "text-gray-600"}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF7101]" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={`/servicios/${service.slug}`}
                      className={`mt-6 inline-flex items-center gap-2 text-sm font-bold ${
                        isPrimary ? "text-[#FFB072]" : "text-[#FF7101]"
                      }`}
                    >
                      Ver detalle
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </article>
                );
              })}
        </div>

        <div className="mt-8 rounded-xl border border-[#FF7101]/20 bg-[#FF7101]/10 p-5 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
          <div>
            <p className="font-black text-[#01103B]">No sabes que servicio necesitas?</p>
            <p className="mt-1 text-sm text-gray-600">Te orientamos y armamos una propuesta según tu objetivo.</p>
          </div>
          <Link
            href="/contacto"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF7101] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#e86600] sm:mt-0"
          >
            Solicitar asesoria
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
