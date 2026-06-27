"use client";
import { useState } from "react";
import {
  Briefcase,
  GraduationCap,
  Code,
  Globe,
  Mail,
  Phone,
  Linkedin,
  Github,
  Award,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Datos de ejemplo (deberías reemplazar con tus datos reales)
const professionalData = {
  id: "juan-perez",
  name: "Juan Pérez",
  title: "Desarrollador Full Stack",
  specialty: "React & Node.js",
  avatar: "/img/testimonial/testimonial-a.jpg",
  bio: "Desarrollador con 5+ años de experiencia creando aplicaciones web escalables y eficientes. Especializado en JavaScript moderno y arquitecturas cloud.",
  about:
    "Apasionado por crear soluciones tecnológicas que impacten positivamente en los usuarios. Me enfoco en escribir código limpio, mantenible y bien documentado.",
  contact: {
    email: "juan@ejemplo.com",
    phone: "+1 234 567 890",
    website: "juanperez.dev",
    linkedin: "linkedin.com/in/juanperez",
    github: "github.com/juanperez",
  },
  experience: [
    {
      id: 1,
      role: "Desarrollador Senior",
      company: "Tech Solutions Inc.",
      period: "2020 - Presente",
      description:
        "Lideré el desarrollo de la plataforma de e-commerce que aumentó las ventas en un 150%.",
      skills: ["React", "Node.js", "AWS", "GraphQL"],
    },
    {
      id: 2,
      role: "Desarrollador Frontend",
      company: "Digital Agency",
      period: "2018 - 2020",
      description:
        "Implementé interfaces de usuario accesibles y responsive para más de 20 clientes.",
      skills: ["JavaScript", "CSS3", "Vue.js"],
    },
  ],
  education: [
    {
      id: 1,
      degree: "Ingeniería en Sistemas",
      institution: "Universidad Tecnológica",
      year: "2017",
    },
    {
      id: 2,
      degree: "Certificación AWS",
      institution: "Amazon Web Services",
      year: "2019",
    },
  ],
  skills: [
    { id: 1, name: "JavaScript", level: "Experto" },
    { id: 2, name: "React", level: "Experto" },
    { id: 3, name: "Node.js", level: "Avanzado" },
    { id: 4, name: "TypeScript", level: "Avanzado" },
    { id: 5, name: "AWS", level: "Intermedio" },
    { id: 6, name: "GraphQL", level: "Intermedio" },
  ],
  projects: [
    {
      id: 1,
      name: "Plataforma E-commerce",
      description:
        "Solución completa con carrito de compras, pasarela de pagos y panel de administración.",
      technologies: ["React", "Node.js", "MongoDB", "Stripe"],
      link: "https://ecommerce.juanperez.dev",
    },
    {
      id: 2,
      name: "Sistema de Gestión de Contenidos",
      description:
        "CMS personalizado para pequeñas empresas con editor en tiempo real.",
      technologies: ["Next.js", "Firebase", "Tailwind CSS"],
      link: "https://cms.juanperez.dev",
    },
  ],
  certifications: [
    {
      id: 1,
      name: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      year: "2021",
    },
    {
      id: 2,
      name: "React Professional",
      issuer: "Meta",
      year: "2020",
    },
  ],
};

export default function ProfessionalPortfolioPage() {
  const [activeTab, setActiveTab] = useState("experience");

  // En una implementación real, obtendrías los datos del profesional basado en params.id
  const professional = professionalData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-[#01103B] text-white py-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32 border-4 border-[#FF7101]">
                <AvatarImage
                  src={professional.avatar}
                  alt={professional.name}
                  className="w-full object-cover"
                />
                <AvatarFallback>
                  {professional.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {professional.name}
              </h1>
              <h2 className="text-xl md:text-2xl text-[#FF7101] mb-4">
                {professional.title} | {professional.specialty}
              </h2>
              <p className="text-gray-300 max-w-2xl">{professional.bio}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                <Button
                  variant="outline"
                  className="border-white text-[#01103B] hover:bg-white"
                  onClick={() =>
                    window.open(
                      `mailto:${professional.contact.email}`,
                      "_blank"
                    )
                  }
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contactar
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-[#01103B] hover:bg-white"
                  onClick={() =>
                    window.open(
                      `https://${professional.contact.linkedin}`,
                      "_blank"
                    )
                  }
                >
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-[#01103B] hover:bg-white"
                  onClick={() =>
                    window.open(
                      `https://${professional.contact.github}`,
                      "_blank"
                    )
                  }
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#01103B]">
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[#FF7101]" />
                  <a
                    href={`mailto:${professional.contact.email}`}
                    className="hover:text-[#FF7101]"
                  >
                    {professional.contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-[#FF7101]" />
                  <a
                    href={`tel:${professional.contact.phone}`}
                    className="hover:text-[#FF7101]"
                  >
                    {professional.contact.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-[#FF7101]" />
                  <a
                    href={`https://${professional.contact.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#FF7101]"
                  >
                    {professional.contact.website}
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#01103B]">
                  Habilidades Técnicas
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {professional.skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="outline"
                    className="bg-[#01103B]/10 text-[#01103B] hover:bg-[#01103B]/20"
                  >
                    {skill.name}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[#01103B]">
                  Certificaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {professional.certifications.map((cert) => (
                  <div key={cert.id} className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-[#FF7101] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-gray-600">
                        {cert.issuer} • {cert.year}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Contenido principal */}
          <div className="lg:col-span-3 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#01103B]">
                  Acerca de mí
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{professional.about}</p>
              </CardContent>
            </Card>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="experience">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Experiencia
                </TabsTrigger>
                <TabsTrigger value="projects">
                  <Code className="mr-2 h-4 w-4" />
                  Proyectos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="experience">
                <Card>
                  <CardContent className="pt-6 space-y-8">
                    {professional.experience.map((exp) => (
                      <div key={exp.id} className="relative pl-8 pb-8">
                        <div className="absolute left-0 top-0 w-4 h-4 bg-[#FF7101] rounded-full"></div>
                        <div className="absolute left-2 top-4 bottom-0 w-px bg-gray-200"></div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#01103B]">
                            {exp.role} • {exp.company}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <Calendar className="h-4 w-4" />
                            {exp.period}
                          </div>
                          <p className="text-gray-700 mb-3">
                            {exp.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {exp.skills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="outline"
                                className="bg-[#01103B]/10 text-[#01103B]"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects">
                <Card>
                  <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
                    {professional.projects.map((project) => (
                      <Card
                        key={project.id}
                        className="hover:shadow-lg transition-shadow"
                      >
                        <CardHeader>
                          <CardTitle className="text-lg font-semibold text-[#01103B]">
                            {project.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-gray-700">{project.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech) => (
                              <Badge
                                key={tech}
                                variant="outline"
                                className="bg-[#01103B]/10 text-[#01103B]"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                          {project.link && (
                            <Button
                              variant="link"
                              className="text-[#FF7101] p-0"
                              onClick={() =>
                                window.open(project.link, "_blank")
                              }
                            >
                              Ver proyecto{" "}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#01103B]">
                  Educación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {professional.education.map((edu) => (
                  <div key={edu.id} className="flex items-start gap-4">
                    <div className="bg-[#01103B]/10 p-2 rounded-full">
                      <GraduationCap className="h-6 w-6 text-[#01103B]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#01103B]">
                        {edu.degree}
                      </h3>
                      <p className="text-gray-700">{edu.institution}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
