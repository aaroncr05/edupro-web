"use client";

export default function CursosPage() {
  const cursos = [
    {
      nombre: "Canva Kids",
      duracion: "1 mes (4 sesiones de 2h)",
      virtual: "S/49.90",
      presencial: "S/74.90",
      contenido: [
        "Diseño de flyers",
        "Uso de plantillas",
        "Animaciones básicas",
        "Portadas"
      ],
    },
    {
      nombre: "Google Kids",
      duracion: "2 meses (8 sesiones de 2h)",
      virtual: "S/74.90",
      presencial: "S/99.90",
      contenido: [
        "Google Drive",
        "Gmail",
        "Docs, Sheets, Slides",
        "Trabajo colaborativo"
      ],
    },
    {
      nombre: "Herramientas de Google",
      duracion: "2 meses (Virtual: 16 sesiones 2h, Presencial: 8 sesiones 3h)",
      virtual: "S/49.90",
      presencial: "S/119.90",
      contenido: [
        "Drive, Gmail",
        "Docs, Sheets, Slides",
        "Formularios",
        "Jamboard"
      ],
    },
    {
      nombre: "IA para el Público General",
      duracion: "1 mes (Virtual: 4 sesiones de 2h, Presencial: 4 sesiones de 3h)",
      virtual: "S/199.90",
      presencial: "S/299.90",
      contenido: [
        "ChatGPT",
        "Gemini",
        "Gamma.app",
        "Heygen",
        "Deepseek"
      ],
    },
  ];

  const convenio = {
    nombre: "Convenios con Empresas",
    duracion: "1 mes (Virtual: 4 sesiones de 2h, Presencial: 4 sesiones de 3h)",
    googleVirtual: "S/39.90",
    googlePresencial: "S/95.90",
    iaVirtual: "S/159.90",
    iaPresencial: "S/239.90",
    contenido: "Cursos de Google y IA con 20% de descuento, monitoreo personalizado.",
  };

  const gradient = `linear-gradient(to bottom, #0740e4, rgb(39, 76, 130))`;

  return (
    <main className="min-h-screen px-4 py-10 max-w-7xl mx-auto font-[Montserrat]">
      <h1 className="text-3xl md:text-4xl font-bold text-[#01103B] mb-8 text-center">
        Nuestros Cursos y Capacitaciones
      </h1>

      <p className="text-gray-700 text-center mb-12 max-w-3xl mx-auto text-base md:text-lg">
        Descubre nuestros cursos diseñados para potenciar tus habilidades
        digitales. Modalidades virtuales y presenciales, con horarios flexibles
        y contenido actualizado.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursos.map((curso, idx) => (
          <div
            key={idx}
            className="rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-300 flex flex-col"
            style={{
              background: gradient,
            }}
          >
            <div className="flex-1 flex flex-col items-center px-4 py-6 text-white">
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-center">
                {curso.nombre}
              </h3>
              <p className="text-sm md:text-base mb-3 text-center">
                <span className="font-semibold">Duración:</span> {curso.duracion}
              </p>
              <p className="text-2xl md:text-3xl font-extrabold mb-4 text-center text-white">
                Virtual: {curso.virtual}
              </p>
              <p className="text-2xl md:text-3xl font-extrabold mb-6 text-center text-white">
                Presencial: {curso.presencial}
              </p>
              <ul className="w-full text-center space-y-2 text-base md:text-lg">
                {curso.contenido.map((item, i) => (
                  <li key={i} className="border-t border-white/30 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-3 text-center">
              <button className="bg-[#FF7101] hover:bg-[#e46300] text-white text-base md:text-lg font-bold py-2.5 rounded-full w-full transition">
                Inscribirme
              </button>
            </div>
          </div>
        ))}

        {/* TARJETA ESPECIAL CONVENIOS */}
        <div
          className="rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-300 flex flex-col"
          style={{
            background: gradient,
          }}
        >
          <div className="flex-1 flex flex-col items-center px-4 py-6 text-white">
            <h3 className="text-xl md:text-2xl font-bold mb-3 text-center">
              {convenio.nombre}
            </h3>
            <p className="text-sm md:text-base mb-4 text-center">
              <span className="font-semibold">Duración:</span>{" "}
              {convenio.duracion}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 w-full">
              {/* Columna Google */}
              <div className="bg-white rounded-lg p-4 flex flex-col items-center">
                <h4 className="text-[#FF7101] font-bold mb-2 text-center text-sm md:text-base">
                  Google
                </h4>
                <div className="mb-1 text-sm md:text-base text-gray-700 text-center">
                  <span className="font-semibold">Virtual:</span>{" "}
                  {convenio.googleVirtual}
                </div>
                <div className="text-sm md:text-base text-gray-700 text-center">
                  <span className="font-semibold">Presencial:</span>{" "}
                  {convenio.googlePresencial}
                </div>
              </div>

              {/* Columna IA */}
              <div className="bg-white rounded-lg p-4 flex flex-col items-center">
                <h4 className="text-[#01103B] font-bold mb-2 text-center text-sm md:text-base">
                  IA
                </h4>
                <div className="mb-1 text-sm md:text-base text-gray-700 text-center">
                  <span className="font-semibold">Virtual:</span>{" "}
                  {convenio.iaVirtual}
                </div>
                <div className="text-sm md:text-base text-gray-700 text-center">
                  <span className="font-semibold">Presencial:</span>{" "}
                  {convenio.iaPresencial}
                </div>
              </div>
            </div>

            <p className="text-sm md:text-base text-center">
              {convenio.contenido}
            </p>
          </div>
          <div className="bg-white p-3 text-center">
            <button className="bg-[#FF7101] hover:bg-[#e46300] text-white text-base md:text-lg font-bold py-2.5 rounded-full w-full transition">
              Inscribirme
            </button>
          </div>
        </div>
      </div>

      <p className="mt-12 text-center text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
        <strong>Importante:</strong> Los cursos inician con una cantidad mínima
        de estudiantes por gasto administrativo. El aforo es limitado en las
        modalidades virtual y presencial. Los horarios dependerán del curso
        aperturado en el mes.
      </p>
    </main>
  );
}
