"use client";

export default function PáginasWeb() {
  const planes = [
    {
      nombre: "Nace",
      precio: "S/450.00",
      incluye: [
        "Landing page",
        "1 correo corporativo",
        "Hosting y dominio básico"
      ],
    },
    {
      nombre: "Crece",
      precio: "S/650.00",
      incluye: [
        "Web administrable (CMS)",
        "3 correos corporativos",
        "Hosting pro"
      ],
    },
    {
      nombre: "Despega",
      precio: "S/850.00",
      incluye: [
        "Tienda virtual completa",
        "5 correos corporativos",
        "Hosting premium",
        "SEO inicial"
      ],
    },
  ];

  const gradient = `linear-gradient(to bottom, #0740e4, rgb(39, 76, 130))`;

  return (
    <main className="min-h-screen px-4 py-10 max-w-7xl mx-auto font-[Montserrat]">
      <h1 className="text-3xl md:text-4xl font-bold text-[#01103B] mb-8 text-center">
        Creación de Páginas Web
      </h1>

      <p className="text-gray-700 text-center mb-2 max-w-3xl mx-auto text-base md:text-lg">
        Diseño personalizado, optimizado para móviles y motores de búsqueda.
        Incluye hosting, dominio, correos corporativos y mantenimiento inicial.
      </p>
      <p className="text-gray-700 text-center mb-12 max-w-3xl mx-auto text-base md:text-lg">
        Tipos: Landing Page, Web Administrable (CMS), Tienda Virtual.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {planes.map((plan, idx) => (
          <div
            key={idx}
            className="rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-300 flex flex-col"
            style={{
              background: gradient,
            }}
          >
            <div className="flex-1 flex flex-col items-center px-4 py-6 text-white">
              <h3 className="text-xl md:text-2xl font-bold mb-4 text-center">
                {plan.nombre}
              </h3>
              <p className="text-3xl md:text-4xl font-extrabold mb-6 text-center text-white">
                {plan.precio}
              </p>
              <ul className="w-full text-center space-y-2 text-base md:text-lg">
                {plan.incluye.map((item, i) => (
                  <li key={i} className="border-t border-white/30 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-3 text-center">
              <button className="bg-[#FF7101] hover:bg-[#e46300] text-white text-base md:text-lg font-bold py-2.5 rounded-full w-full transition">
                Contratar
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-12 text-center text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
        <strong>Importante:</strong> Todos nuestros planes incluyen diseño
        profesional y soporte técnico. Los tiempos de entrega varían según
        la complejidad del proyecto.
      </p>
    </main>
  );
}
