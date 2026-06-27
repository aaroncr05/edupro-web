"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Globe,
  Share2,
  Laptop,
  Code,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Award,
  Clock,
  Phone,
  Mail,
  Rocket,
  ShieldCheck,
  Zap,
  Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { servicesService, ServiceResponse } from "@/services/services.service";
import { QuestionSection } from "@/components/services/QuestionSection";

const estadisticas = [
  {
    numero: "500+",
    texto: "Proyectos Completados",
    icon: <Award className="w-6 h-6" />,
  },
  {
    numero: "200+",
    texto: "Clientes Satisfechos",
    icon: <Users className="w-6 h-6" />,
  },
  {
    numero: "5+",
    texto: "Años de Experiencia",
    icon: <Clock className="w-6 h-6" />,
  },
  {
    numero: "98%",
    texto: "Tasa de Satisfacción",
    icon: <Star className="w-6 h-6" />,
  },
];

const testimonios = [
  {
    nombre: "María González",
    empresa: "Boutique Elena",
    testimonio:
      "Excelente trabajo en nuestra página web. Aumentamos las ventas online en un 150% en solo 3 meses. El equipo fue profesional y cumplió con todos los plazos.",
    rating: 5,
  },
  {
    nombre: "Carlos Rodríguez",
    empresa: "Consultora Legal",
    testimonio:
      "El sistema CRM que desarrollaron transformó completamente nuestra gestión de clientes. Ahora somos un 40% más eficientes en nuestros procesos internos.",
    rating: 5,
  },
  {
    nombre: "Ana Martínez",
    empresa: "Café Central",
    testimonio:
      "Su manejo de redes sociales duplicó nuestros seguidores en solo 3 meses y aumentó las visitas a nuestra cafetería en un 30%. ¡Increíble trabajo!",
    rating: 5,
  },
];

const procesos = [
  {
    paso: 1,
    titulo: "Consulta Inicial",
    descripción:
      "Analizamos tus necesidades y objetivos en una reunión gratuita.",
    icon: <Phone className="w-6 h-6" />,
  },
  {
    paso: 2,
    titulo: "Propuesta Personalizada",
    descripción:
      "Creamos un plan de acción detallado con soluciones a tu medida.",
    icon: <Mail className="w-6 h-6" />,
  },
  {
    paso: 3,
    titulo: "Desarrollo o Implementación",
    descripción:
      "Nuestro equipo trabaja en tu proyecto con actualizaciones constantes.",
    icon: <Code className="w-6 h-6" />,
  },
  {
    paso: 4,
    titulo: "Entrega y Capacitación",
    descripción:
      "Te entregamos el producto final con entrenamiento para su uso.",
    icon: <GraduationCap className="w-6 h-6" />,
  },
  {
    paso: 5,
    titulo: "Soporte Continuo",
    descripción:
      "Ofrecemos mantenimiento y soporte post-venta para garantizar tu éxito.",
    icon: <ShieldCheck className="w-6 h-6" />,
  },
];

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const response = await servicesService.getAllServices({ activo: true });
        setServices(response.data);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  const getIcon = (icono: string) => {
    switch (icono) {
      case 'Code': return <Code className="w-8 h-8" />;
      case 'Globe': return <Globe className="w-8 h-8" />;
      case 'Share2': return <Share2 className="w-8 h-8" />;
      case 'Laptop': return <Laptop className="w-8 h-8" />;
      default: return <Zap className="w-8 h-8" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-8 max-w-7xl mx-auto text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF7101]/10 to-[#01103B]/10 rounded-b-3xl"></div>
        <div className="relative z-10">
          <Badge className="mb-4 bg-[#FF7101] hover:bg-[#e46300] text-white">
            <Rocket className="mr-2 w-4 h-4" />
            Soluciones Tecnológicas Integrales
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-[#01103B] font-['Poppins'] mb-6">
            Potencia tu Negocio con Nuestros{" "}
            <span className="text-[#FF7101]">Servicios Digitales</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-[Montserrat]">
            Transformamos ideas en soluciones digitales innovadoras. Desde
            desarrollo web hasta capacitación tecnológica, te acompañamos en
            cada paso de tu transformación digital con resultados medibles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-[#FF7101] hover:bg-[#e46300] text-white group"
            >
              Explorar Servicios
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Link href="/contacto">
              <Button
                size="lg"
                variant="outline"
                className="border-[#01103B] text-[#01103B] hover:bg-[#01103B] hover:text-white bg-transparent"
              >
                <Phone className="mr-2 w-4 h-4" />
                Contactar Ahora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {estadisticas.map((stat, idx) => (
            <div
              key={idx}
              className="text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-center mb-3 text-[#FF7101]">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-[#01103B] font-['Poppins'] mb-2">
                {stat.numero}
              </div>
              <div className="text-sm text-gray-600 font-[Montserrat]">
                {stat.texto}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Proceso de Trabajo */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto bg-white rounded-2xl shadow-sm mb-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#01103B] font-['Poppins'] mb-4">
            Nuestro Proceso de Trabajo
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-[Montserrat]">
            Metodología clara y transparente para garantizar resultados
            excepcionales en cada proyecto.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-5">
          {procesos.map((proceso) => (
            <div key={proceso.paso} className="text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto bg-[#01103B] rounded-full flex items-center justify-center text-white">
                  {proceso.icon}
                </div>
                <div className="absolute -top-2 -right-2 bg-[#FF7101] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  {proceso.paso}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-[#01103B] mb-2 font-['Poppins']">
                {proceso.titulo}
              </h3>
              <p className="text-gray-600 text-sm font-[Montserrat]">
                {proceso.descripción}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Servicios Grid */}
      <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#01103B] font-['Poppins'] mb-4">
            Nuestros Servicios Especializados
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-[Montserrat]">
            Soluciones diseñadas para impulsar tu crecimiento digital con
            tecnologías innovadoras y mejores prácticas del mercado.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-100 animate-pulse rounded-3xl" />
            ))
          ) : services.map((servicio, idx) => (
            <Card
              key={idx}
              className="relative group hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-100 bg-white"
            >
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-[#FF7101] to-[#e46300] text-white rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    {getIcon(servicio.icono)}
                  </div>
                </div>
                <CardTitle className="text-xl font-semibold text-[#01103B] font-['Poppins'] mb-2">
                  {servicio.titulo}
                </CardTitle>
                <CardDescription className="text-gray-600 font-[Montserrat] line-clamp-2">
                  {servicio.descripción}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  {servicio.caracteristicas.slice(0, 4).map((feature, featureIdx) => (
                    <div
                      key={featureIdx}
                      className="flex items-start text-sm text-gray-600"
                    >
                      <CheckCircle className="w-4 h-4 text-[#FF7101] mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-[#01103B] font-['Poppins']">
                      Desde S/ {(Number(servicio.precioBase) || 0).toFixed(0)}
                    </div>
                    <Badge variant="outline" className="text-[#FF7101] border-[#FF7101]">
                      Garantizado
                    </Badge>
                  </div>
                </div>

                <Link href={`/servicios/${servicio.slug}`}>
                  <Button className="w-full bg-[#FF7101] hover:bg-[#e46300] text-white group-hover:bg-[#01103B] transition-colors duration-300">
                    Ver Detalles
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto bg-[#01103B] rounded-3xl text-white mb-20">
        <div className="text-center mb-12 pt-10">
          <h2 className="text-4xl font-bold font-['Poppins'] mb-4">
            ¿Por Qué Elegirnos?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto font-[Montserrat]">
            Ventajas competitivas que nos diferencian y garantizan la excelencia
            en cada proyecto.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 p-10">
          <div className="bg-white/10 p-6 rounded-xl hover:bg-white/20 transition-colors">
            <div className="bg-[#FF7101] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 font-['Poppins']">
              Soluciones Rápidas
            </h3>
            <p className="text-gray-300 font-[Montserrat]">
              Entregamos proyectos en tiempos récord sin comprometer la calidad,
              con metodologías ágiles probadas.
            </p>
          </div>
          <div className="bg-white/10 p-6 rounded-xl hover:bg-white/20 transition-colors">
            <div className="bg-[#FF7101] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 font-['Poppins']">
              Calidad Garantizada
            </h3>
            <p className="text-gray-300 font-[Montserrat]">
              Nuestros estándares de calidad exceden las expectativas del
              mercado, con pruebas rigurosas en cada etapa.
            </p>
          </div>
          <div className="bg-white/10 p-6 rounded-xl hover:bg-white/20 transition-colors">
            <div className="bg-[#FF7101] w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Smile className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2 font-['Poppins']">
              Soporte Excepcional
            </h3>
            <p className="text-gray-300 font-[Montserrat]">
              Equipo de soporte disponible 24/7 para resolver cualquier duda o
              inconveniente post-venta.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#01103B] font-['Poppins'] mb-4">
            Testimonios de Clientes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-[Montserrat]">
            La satisfacción de nuestros clientes es nuestra mejor carta de
            presentación.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonios.map((testimonio, idx) => (
            <Card
              key={idx}
              className="hover:shadow-lg transition-shadow duration-300 group bg-white border border-gray-100"
            >
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonio.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-[#FF7101] text-[#FF7101]"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 font-[Montserrat] italic">
                  {`"${testimonio.testimonio}"`}
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-[#01103B]/10 flex items-center justify-center text-[#01103B] font-bold mr-4 group-hover:bg-[#FF7101]/10 group-hover:text-[#FF7101] transition-colors">
                    {testimonio.nombre.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-[#01103B] font-['Poppins']">
                      {testimonio.nombre}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonio.empresa}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Preguntas Frecuentes */}
      <QuestionSection />

      {/* CTA Section */}
      <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto mb-20">
        <Card className="bg-gradient-to-r from-[#01103B] to-[#FF7101] text-white overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-white/10"></div>
          <CardContent className="p-12 text-center relative z-10">
            <h2 className="text-4xl font-bold font-['Poppins'] mb-4">
              ¿Listo para Transformar tu Negocio?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto font-[Montserrat]">
              Contáctanos hoy y descubre cómo podemos ayudarte a alcanzar tus
              objetivos digitales con soluciones personalizadas y de alta
              calidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contacto">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-[#01103B] hover:bg-gray-100"
                >
                  <Phone className="mr-2 w-4 h-4" />
                  Llamar Ahora
                </Button>
              </Link>
              <Link href="/contacto">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-[#01103B] bg-transparent"
                >
                  <Mail className="mr-2 w-4 h-4" />
                  Enviar Email
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
