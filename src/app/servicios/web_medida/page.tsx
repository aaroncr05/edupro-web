"use client";

export default function SistemaWebMedida() {
  const sistemas = [
    {
      nombre: "Sistema para Colegios / Instituciones Educativas",
      funcionalidades: [
        "Gestión de estudiantes",
        "Matrículas y pagos",
        "Reportes",
        "Acceso web para padres y alumnos"
      ],
      precio: "Desde S/ 5,000.00",
    },
    {
      nombre: "Sistema para Restaurantes",
      funcionalidades: [
        "Pedidos online",
        "Reservas",
        "Cartas digitales",
        "Integración con delivery apps"
      ],
      precio: "Desde S/ 3,500.00",
    },
    {
      nombre: "Sistema Hotelero",
      funcionalidades: [
        "Gestión de reservas",
        "Check-in, Check-out",
        "Integración con canales de venta online"
      ],
      precio: "Desde S/ 6,000.00",
    },
    {
      nombre: "Tienda Virtual a Medida",
      funcionalidades: [
        "Catálogo personalizado",
        "Carrito de compras",
        "Pasarelas de pago",
        "Panel administrativo"
      ],
      precio: "Desde S/ 4,000.00",
    },
    {
      nombre: "CRM Empresarial",
      funcionalidades: [
        "Seguimiento de clientes",
        "Cotizaciones",
        "Ventas",
        "Reportes personalizados"
      ],
      precio: "Desde S/ 7,000.00",
    },
  ];

  const gradient = `linear-gradient(to bottom, #0740e4,rgb(39, 76, 130))`;

  return (
    <main className="min-h-screen px-4 py-10 max-w-7xl mx-auto font-[Montserrat]">
      <h1 className="text-3xl md:text-4xl font-bold text-[#01103B] mb-8 text-center">
        Sistema Web a Medida
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sistemas.map((sistema, idx) => (
          <div
            key={idx}
            className="rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-300 flex flex-col"
            style={{
              background: gradient,
            }}
          >
            <div className="flex-1 flex flex-col items-center px-4 py-6 text-white">
              <h3 className="text-xl md:text-xl font-bold mb-4 text-center">
                {sistema.nombre}
              </h3>
              <p className="text-2xl md:text-3xl font-extrabold mb-6 text-center">
                {sistema.precio}
              </p>
              <ul className="w-full text-center space-y-2 text-base md:text-lg">
                {sistema.funcionalidades.map((func, i) => (
                  <li key={i} className="border-t border-white/30 py-2">
                    {func}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-3 text-center">
              <button className="bg-[#FF7101] hover:bg-[#e46300] text-white text-base md:text-lg font-bold py-2.5 rounded-full w-full transition">
                Solicitar Cotización
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
