export default function CanvaKidsPage() {
  return (
    <main>
      <CursoDetalle
        titulo="Canva Kids"
        descripción="Un curso creativo para que los niños exploren el diseño gráfico de manera divertida y educativa usando Canva."
        imagen="/img/canva-kids-banner.jpg"
        objetivos={[
          "Fomentar la creatividad en los niños.",
          "Aprender a diseñar tarjetas, posters y presentaciones.",
          "Explorar plantillas amigables para menores.",
        ]}
        dirigidoA="Niños entre 7 y 12 años con interés en el diseño y la tecnología."
        contenido={[
          "Introducción a Canva",
          "Creación de una tarjeta de cumpleaños",
          "Diseño de posters escolares",
          "Presentaciones interactivas",
          "Exportar y compartir trabajos",
        ]}
        linkInscripcion="https://wa.me/51987654321?text=Hola,%20quiero%20inscribirme%20al%20curso%20Canva%20Kids"
      />
    </main>
  );
}

import Image from "next/image";
// app/components/CursoDetalle.tsx
import { FC } from "react";

interface CursoDetalleProps {
  titulo: string;
  descripción: string;
  imagen: string;
  objetivos: string[];
  dirigidoA: string;
  contenido: string[];
  linkInscripcion: string;
}

const CursoDetalle: FC<CursoDetalleProps> = ({
  titulo,
  descripción,
  imagen,
  objetivos,
  dirigidoA,
  contenido,
  linkInscripcion,
}) => (
  <div className="max-w-5xl mx-auto px-4 py-10">
    <h1 className="text-4xl font-extrabold text-[#01103B] mb-4">{titulo}</h1>
    <p className="text-gray-700 mb-6 text-lg">{descripción}</p>
    <Image
      src={imagen}
      alt={titulo}
      className="rounded-2xl mb-8 w-full h-64 object-cover"
    />

    <div className="mb-6">
      <h2 className="text-2xl font-bold text-[#FF7101] mb-2">Objetivos</h2>
      <ul className="list-disc pl-5 text-gray-700">
        {objetivos.map((obj, i) => (
          <li key={i}>{obj}</li>
        ))}
      </ul>
    </div>

    <div className="mb-6">
      <h2 className="text-2xl font-bold text-[#FF7101] mb-2">Dirigido a</h2>
      <p className="text-gray-700">{dirigidoA}</p>
    </div>

    <div className="mb-6">
      <h2 className="text-2xl font-bold text-[#FF7101] mb-2">
        Contenido del Curso
      </h2>
      <ul className="list-decimal pl-5 text-gray-700">
        {contenido.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>

    <a
      href={linkInscripcion}
      target="_blank"
      className="inline-block mt-6 bg-[#0740E4] text-white px-6 py-3 rounded-full hover:bg-[#01103B] transition"
    >
      Inscribirse por WhatsApp
    </a>
  </div>
);
