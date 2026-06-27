"use client";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Target,
  Lightbulb,
  Heart,
  Shield,
  Users,
  GraduationCap,
  Award,
  Calendar,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Book,
} from "lucide-react";
import { montserrat, montserratMedium } from "@/shared/config/font";
import { TeamSection } from "@/components/home";

export default function AboutPage() {
  const valores = [
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovación",
      desc: "Creamos soluciones originales, ágiles y modernas para un mundo digital.",
      color: "bg-[#FF7101]/10 text-[#FF7101]",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Compromiso",
      desc: "Damos todo nuestro esfuerzo y responsabilidad en cada proyecto.",
      color: "bg-[#01103B]/10 text-[#01103B]",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Transparencia",
      desc: "Actuamos con claridad y confianza en todo lo que hacemos.",
      color: "bg-[#FF7101]/10 text-[#FF7101]",
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Responsabilidad",
      desc: "Asumimos nuestros compromisos con ética y coherencia.",
      color: "bg-[#01103B]/10 text-[#01103B]",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Trabajo en equipo",
      desc: "Colaboramos con respeto, comunicación y unión.",
      color: "bg-[#FF7101]/10 text-[#FF7101]",
    },
    {
      icon: <Book className="w-8 h-8" />,
      title: "Pasión por enseñar",
      desc: "Formamos con entrega, vocación y mucho entusiasmo.",
      color: "bg-[#01103B]/10 text-[#01103B]",
    },
  ];

  const estadisticas = [
    {
      numero: "500+",
      label: "Proyectos Completados",
      icon: <Award className="w-6 h-6" />,
    },
    {
      numero: "50+",
      label: "Empresas Atendidas",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      numero: "1000+",
      label: "Estudiantes Formados",
      icon: <GraduationCap className="w-6 h-6" />,
    },
    {
      numero: "5+",
      label: "Años de Experiencia",
      icon: <Calendar className="w-6 h-6" />,
    },
  ];

  const timeline = [
    {
      año: "2019",
      titulo: "Fundación de DEP",
      descripción:
        "Iniciamos con la visión de transformar el panorama digital empresarial.",
    },
    {
      año: "2020",
      titulo: "Expansión de Servicios",
      descripción:
        "Incorporamos servicios de marketing digital y consultoría estratégica.",
    },
    {
      año: "2021",
      titulo: "Programa Educativo",
      descripción:
        "Lanzamos nuestros primeros cursos de formación tecnológica.",
    },
    {
      año: "2022",
      titulo: "Reconocimiento Nacional",
      descripción:
        "Obtuvimos certificaciones y reconocimientos por nuestra calidad.",
    },
    {
      año: "2024",
      titulo: "Innovación Continua",
      descripción:
        "Implementamos IA y tecnologías emergentes en nuestros servicios.",
    },
  ];

  return (
    <main
      className={`bg-gradient-to-br from-blue-50 to-[#01103B]/5 ${montserrat.className}`}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#01103B] to-[#01103B]/90 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-[#FF7101] hover:bg-[#FF7101]/90 text-white px-4 py-1.5 text-sm">
                Innovación Digital
              </Badge>
              <h1
                className={`text-4xl md:text-5xl font-bold leading-tight ${montserrat.className}`}
              >
                ¿Quiénes <span className="text-[#FF7101]">Somos</span>?
              </h1>
              <p
                className={`text-lg leading-relaxed text-blue-100 ${montserratMedium.className}`}
              >
                En <strong className="text-[#FF7101]">DEP</strong>, nos
                dedicamos al desarrollo empresarial mediante soluciones
                digitales, educación tecnológica y estrategias de marketing
                moderno. Transformamos ideas en resultados concretos.
              </p>
              <Button
                size="lg"
                className="bg-[#FF7101] hover:bg-[#FF7101]/90 text-white"
              >
                Conoce más <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="/img/equipo.jpg"
                  alt="Equipo DEP"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#FF7101]/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#01103B]/20 rounded-full animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {estadisticas.map((stat, idx) => (
              <Card
                key={idx}
                className="text-center p-6 hover:shadow-lg transition-shadow border border-gray-200"
              >
                <CardContent className="p-0">
                  <div className="text-[#FF7101] mb-3 flex justify-center">
                    {stat.icon}
                  </div>
                  <div
                    className={`text-3xl font-bold text-[#01103B] mb-2 ${montserrat.className}`}
                  >
                    {stat.numero}
                  </div>
                  <div
                    className={`text-sm text-gray-600 ${montserratMedium.className}`}
                  >
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Visión y Misión */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="group hover:shadow-2xl transition-all duration-500 border border-[#01103B]/20">
            <CardContent className="p-8 relative">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-[#01103B]/10 rounded-full text-[#01103B]">
                    <Eye className="w-8 h-8" />
                  </div>
                  <h2
                    className={`text-3xl font-bold text-[#01103B] ${montserrat.className}`}
                  >
                    Visión
                  </h2>
                </div>
                <p
                  className={`text-lg leading-relaxed text-gray-700 ${montserratMedium.className}`}
                >
                  Ser referentes en innovación digital y formación tecnológica,
                  impulsando el crecimiento de empresas, profesionales y jóvenes
                  con soluciones de alto impacto.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-500 border border-[#FF7101]/20">
            <CardContent className="p-8 relative">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-[#FF7101]/10 rounded-full text-[#FF7101]">
                    <Target className="w-8 h-8" />
                  </div>
                  <h2
                    className={`text-3xl font-bold text-[#01103B] ${montserrat.className}`}
                  >
                    Misión
                  </h2>
                </div>
                <p
                  className={`text-lg leading-relaxed text-gray-700 ${montserratMedium.className}`}
                >
                  Ofrecer servicios y programas educativos innovadores y
                  accesibles, que respondan a las necesidades reales del entorno
                  empresarial y social.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Valores */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-[#01103B]/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-3xl font-bold text-[#01103B] mb-4 ${montserrat.className}`}
            >
              Nuestros Valores
            </h2>
            <p
              className={`text-lg text-gray-600 max-w-2xl mx-auto ${montserratMedium.className}`}
            >
              Los principios que guían cada una de nuestras acciones y
              decisiones
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {valores.map((valor, idx) => (
              <Card
                key={idx}
                className="group hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-[#FF7101]/50"
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`inline-flex p-4 rounded-full ${valor.color} mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {valor.icon}
                  </div>
                  <h3
                    className={`text-xl font-bold text-[#01103B] mb-4 ${montserrat.className}`}
                  >
                    {valor.title}
                  </h3>
                  <p
                    className={`text-gray-600 leading-relaxed ${montserratMedium.className}`}
                  >
                    {valor.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline/Historia */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto bg-white">
        <div className="text-center mb-16">
          <h2
            className={`text-3xl font-bold text-[#01103B] mb-4 ${montserrat.className}`}
          >
            Nuestra Historia
          </h2>
          <p className={`text-lg text-gray-600 ${montserratMedium.className}`}>
            El camino que nos ha llevado hasta aquí
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#01103B] to-[#FF7101] rounded-full"></div>

          {timeline.map((item, idx) => (
            <div
              key={idx}
              className={`relative flex items-center mb-12 ${
                idx % 2 === 0 ? "justify-start" : "justify-end"
              }`}
            >
              <Card
                className={`w-full md:w-5/12 hover:shadow-lg transition-shadow border border-gray-200 ${
                  idx % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <Badge className="bg-[#01103B] hover:bg-[#01103B]/90 text-white px-3 py-1">
                      {item.año}
                    </Badge>
                  </div>
                  <h3
                    className={`text-xl font-bold text-[#01103B] mb-2 ${montserrat.className}`}
                  >
                    {item.titulo}
                  </h3>
                  <p className={`text-gray-600 ${montserratMedium.className}`}>
                    {item.descripción}
                  </p>
                </CardContent>
              </Card>

              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#FF7101] rounded-full border-4 border-white shadow-lg"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Sección de EQUIPO */}
      <div className="py-8">
        <TeamSection />
      </div>
      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[#FF7101] to-[#FF7101]/90 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 md:px-8">
          <h2 className={`text-3xl font-bold mb-6 ${montserrat.className}`}>
            ¿Listo para transformar tu negocio?
          </h2>
          <p
            className={`text-lg mb-8 text-orange-100 ${montserratMedium.className}`}
          >
            Únete a las empresas que ya confían en DEP para su crecimiento
            digital
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-[#FF7101] hover:bg-gray-100"
            >
              Contáctanos <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#FF7101] bg-transparent"
            >
              Ver nuestros servicios
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
