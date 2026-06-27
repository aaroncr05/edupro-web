const ConveniosPage = () => {
  return (
    <>
      <CursosGrid />
    </>
  );
};

export default ConveniosPage;
import Image from "next/image";
// app/components/CursoCard.tsx
import { FC } from "react";

interface CursoCardProps {
  titulo: string;
  descripción: string;
  imagen: string;
}
// app/components/CursosGrid.tsx

const cursos = [
  {
    titulo: "Canva Kids",
    descripción: "Curso creativo para niños sobre diseño con Canva.",
    imagen: "/img/canva-kids.jpg",
  },
  {
    titulo: "Google Kids",
    descripción: "Navegación segura y herramientas educativas de Google.",
    imagen: "/img/google-kids.jpg",
  },
  {
    titulo: "Herramientas de Google",
    descripción: "Domina Drive, Docs, Gmail y más.",
    imagen: "/img/google-tools.jpg",
  },
  {
    titulo: "Herramientas de IA",
    descripción: "Uso práctico de herramientas como ChatGPT, Gemini y más.",
    imagen: "/img/ia-tools.jpg",
  },
  {
    titulo: "Cursos para empresas",
    descripción: "Capacitación corporativa en herramientas digitales.",
    imagen: "/img/cursos-empresas.jpg",
  },
];

const CursosGrid = () => (
  <section className="py-12 bg-[#F9FAFB]">
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-[#01103B] mb-8">
        Nuestros Cursos
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cursos.map((curso, i) => (
          <CursoCard key={i} {...curso} />
        ))}
      </div>
    </div>
  </section>
);

const CursoCard: FC<CursoCardProps> = ({ titulo, descripción, imagen }) => (
  <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition">
    <Image
      src={imagen}
      alt={titulo}
      className="w-full h-40 object-cover rounded-xl mb-4"
    />
    <h3 className="text-xl font-semibold text-[#01103B]">{titulo}</h3>
    <p className="text-sm text-gray-600">{descripción}</p>
  </div>
);
