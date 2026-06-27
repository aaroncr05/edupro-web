"use client";

export default function RedesSociales() {
  const planes = [
    {
      nombre: "Nace",
      precio: "S/300.00/mes",
      incluye: [
        "8 flyers",
        "4 reels",
        "8 copys",
        "Gestión 1 red social"
      ],
    },
    {
      nombre: "Crece",
      precio: "S/500.00/mes",
      incluye: [
        "15 flyers",
        "8 reels",
        "15 copys",
        "Gestión 2 redes sociales"
      ],
    },
    {
      nombre: "Despega",
      precio: "S/850.00/mes",
      incluye: [
        "25 flyers",
        "12 reels",
        "25 copys",
        "Gestión 2 redes sociales"
      ],
    },
  ];

  const gradient = `linear-gradient(to bottom, #0740e4, rgb(39, 76, 130))`;

  return (
    <main className="min-h-screen px-4 py-10 max-w-7xl mx-auto font-[Montserrat]">
      <h1 className="text-3xl md:text-4xl font-bold text-[#01103B] mb-8 text-center">
        Manejo de Redes Sociales
      </h1>

      <p className="text-gray-700 text-center mb-12 max-w-3xl mx-auto text-base md:text-lg">
        Gestión integral con estrategia, diseño de piezas visuales, redacción
        creativa y análisis de métricas.
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
        <strong>Importante:</strong> Los planes se adaptan a la identidad de tu
        marca. Podemos personalizar cantidad de piezas y plataformas según tus
        necesidades.
      </p>
    </main>
  );
}
