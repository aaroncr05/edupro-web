"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Users,
  Award,
  Star,
  Calendar,
  Monitor,
  Brain,
  Globe,
  Share2,
  Play,
  BookOpen,
  Search,
  User,
  ChevronRight,
  Rocket,
  ArrowRight,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { coursesService, CourseResponse } from "@/services/courses.service";
import Link from "next/link";
import Image from "next/image";

const categorias = [
  {
    id: "todas",
    nombre: "Todas las Categorías",
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    id: "google-workspace",
    nombre: "Google Workspace",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    id: "inteligencia-artificial",
    nombre: "Inteligencia Artificial",
    icon: <Brain className="w-4 h-4" />,
  },
  {
    id: "desarrollo-web",
    nombre: "Desarrollo Web",
    icon: <Monitor className="w-4 h-4" />,
  },
  {
    id: "redes-sociales",
    nombre: "Redes Sociales",
    icon: <Share2 className="w-4 h-4" />,
  },
];

const instructores = [
  {
    nombre: "María González",
    especialidad: "Google Workspace Expert",
    experiencia: "8 años",
    certificaciones: "Google Certified Trainer",
  },
  {
    nombre: "Dr. Carlos Rodríguez",
    especialidad: "AI & Machine Learning",
    experiencia: "12 años",
    certificaciones: "PhD in Computer Science",
  },
  {
    nombre: "Ana Martínez",
    especialidad: "Full Stack Developer",
    experiencia: "10 años",
    certificaciones: "AWS Certified, React Expert",
  },
];

const testimonios = [
  {
    nombre: "Jennifer López",
    empresa: "Tech Solutions",
    curso: "Google Workspace Básico",
    testimonio:
      "Excelente curso, muy práctico y aplicable inmediatamente en mi trabajo diario.",
    rating: 5,
  },
  {
    nombre: "Miguel Torres",
    empresa: "StartUp Digital",
    curso: "IA para Empresas",
    testimonio:
      "Transformó completamente nuestra forma de trabajar. Altamente recomendado.",
    rating: 5,
  },
  {
    nombre: "Sofia Ramírez",
    empresa: "Marketing Pro",
    curso: "Marketing en Redes Sociales",
    testimonio:
      "Los mejores tips y estrategias que he aprendido. Instructor muy experimentado.",
    rating: 5,
  },
];

export default function CursosDisponibles() {
  const [cursos, setCursos] = useState<CourseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        setIsLoading(true);
        const response = await coursesService.getAllCourses({ activo: true });
        setCursos(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCursos();
  }, []);

  const cursosFiltrados = cursos.filter((curso) => {
    const coincideBusqueda =
      curso.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      curso.descripción.toLowerCase().includes(busqueda.toLowerCase());

    return coincideBusqueda;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-8 max-w-7xl mx-auto text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF7101]/10 to-[#01103B]/10 rounded-b-3xl"></div>
        <div className="relative z-10">
          <Badge className="mb-4 bg-[#FF7101] hover:bg-[#e46300] text-white">
            <Rocket className="mr-2 w-4 h-4" />
            Educación Tecnológica de Vanguardia
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-[#01103B] font-['Poppins'] mb-6">
            Cursos y <span className="text-[#FF7101]">Capacitaciones</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 font-[Montserrat]">
            Impulsa tu carrera profesional con nuestros cursos especializados en
            Google Workspace, Inteligencia Artificial, Desarrollo Web y
            Marketing Digital. Aprende de expertos y obtén certificaciones
            reconocidas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="bg-[#FF7101] hover:bg-[#e46300] text-white group"
            >
              <Play className="mr-2 w-4 h-4" />
              Ver Cursos Disponibles
              <ArrowRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#01103B] text-[#01103B] hover:bg-[#01103B] hover:text-white bg-transparent"
            >
              <Calendar className="mr-2 w-4 h-4" />
              Calendario de Cursos
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="text-center bg-white/80 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-3xl font-bold text-[#FF7101] mb-1">500+</div>
              <div className="text-sm text-[#01103B]">Estudiantes</div>
            </div>
            <div className="text-center bg-white/80 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-3xl font-bold text-[#FF7101] mb-1">15+</div>
              <div className="text-sm text-[#01103B]">Cursos</div>
            </div>
            <div className="text-center bg-white/80 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-3xl font-bold text-[#FF7101] mb-1">98%</div>
              <div className="text-sm text-[#01103B]">Satisfacción</div>
            </div>
            <div className="text-center bg-white/80 p-4 rounded-xl backdrop-blur-sm">
              <div className="text-3xl font-bold text-[#FF7101] mb-1">24/7</div>
              <div className="text-sm text-[#01103B]">Soporte</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="py-6 max-w-7xl mx-auto px-4">
        <Card className="p-6 bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar cursos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 border-[#01103B]/20 focus:border-[#FF7101]"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <Select
                value={categoriaSeleccionada}
                onValueChange={setCategoriaSeleccionada}
              >
                <SelectTrigger className="w-full sm:w-48 border-[#01103B]/20 focus:border-[#FF7101]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      <div className="flex items-center gap-2">
                        {categoria.icon}
                        {categoria.nombre}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </section>

      {/* Cursos Grid */}
      <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#01103B] font-['Poppins'] flex items-center gap-2">
            Cursos Disponibles
            <Badge className="bg-[#FF7101] text-white text-base font-semibold rounded-full">
              {cursosFiltrados.length}
            </Badge>
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-[500px] bg-gray-100 animate-pulse rounded-3xl" />
            ))
          ) : cursosFiltrados.map((curso) => (
            <Card
              key={curso.id}
              className="group hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="relative h-48 w-full">
                <Image 
                  src={curso.imagen} 
                  alt={curso.titulo} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-4 right-4 bg-[#FF7101] hover:bg-[#e46300] text-white">
                  S/ {(Number(curso.precio) || 0).toFixed(2)}
                </Badge>
              </div>

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-[#FF7101]">
                    <BookOpen className="w-5 h-5" />
                    <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                      General
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 fill-[#FF7101] text-[#FF7101]" />
                    4.8
                  </div>
                </div>

                <CardTitle className="text-xl font-semibold text-[#01103B] font-['Poppins'] mb-2 group-hover:text-[#FF7101] transition-colors">
                  {curso.titulo}
                </CardTitle>
                <CardDescription className="text-gray-600 font-[Montserrat] line-clamp-2">
                  {curso.descripción}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Disponible
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      Virtual / Presencial
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Dirigido a: {curso.dirigidoA}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[#FF7101]">
                    <Award className="w-4 h-4" />
                    <span>Certificación incluida</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link href={`/cursos/${curso.slug}`}>
                    <Button className="w-full bg-[#FF7101] hover:bg-[#e46300] text-white group">
                      Inscribirse Ahora
                      <ChevronRight className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </Link>
                  <Link href={`/cursos/${curso.slug}`}>
                    <Button
                      variant="outline"
                      className="w-full text-[#01103B] border-[#01103B] hover:bg-[#01103B] hover:text-white bg-transparent"
                    >
                      Ver Detalles
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Instructores */}
      <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#01103B] font-['Poppins'] mb-4">
            Nuestros Instructores
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-[Montserrat]">
            Aprende de profesionales con amplia experiencia y certificaciones
            reconocidas internacionalmente.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {instructores.map((instructor, idx) => (
            <Card
              key={idx}
              className="text-center hover:shadow-lg transition-shadow duration-300 group"
            >
              <CardContent className="p-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#FF7101] to-[#01103B] rounded-full flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                  <User className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-semibold text-[#01103B] font-['Poppins'] mb-2">
                  {instructor.nombre}
                </h3>
                <p className="text-[#FF7101] font-medium mb-2">
                  {instructor.especialidad}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  {instructor.experiencia} de experiencia
                </p>
                <Badge
                  variant="secondary"
                  className="text-xs bg-[#01103B] text-white hover:bg-[#01103B]/90"
                >
                  {instructor.certificaciones}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#01103B] font-['Poppins'] mb-4">
            Lo Que Dicen Nuestros Estudiantes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-[Montserrat]">
            Historias de éxito de profesionales que transformaron su carrera con
            nuestros cursos.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonios.map((testimonio, idx) => (
            <Card
              key={idx}
              className="hover:shadow-lg transition-shadow duration-300 group"
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
                <p className="text-gray-600 mb-4 font-[Montserrat] italic">
                  {`"${testimonio.testimonio}"`}
                </p>
                <div>
                  <div className="font-semibold text-[#01103B] font-['Poppins']">
                    {testimonio.nombre}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonio.empresa}
                  </div>
                  <Badge
                    variant="outline"
                    className="mt-2 text-xs border-[#FF7101] text-[#FF7101]"
                  >
                    {testimonio.curso}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto mb-20">
        <Card className="bg-gradient-to-r from-[#01103B] to-[#FF7101] text-white overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-white/10"></div>
          <CardContent className="p-12 text-center relative z-10">
            <h2 className="text-4xl font-bold font-['Poppins'] mb-4">
              ¿Listo para Impulsar tu Carrera?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto font-[Montserrat]">
              Únete a cientos de profesionales que ya han transformado su futuro con nuestra educación de calidad.
            </p>
            <Link href="/contacto">
              <Button size="lg" className="bg-white text-[#01103B] hover:bg-gray-100">
                Empezar Ahora
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
