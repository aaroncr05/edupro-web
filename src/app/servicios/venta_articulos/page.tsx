"use client";

export default function ArticulosInformaticos() {
  const productos = [
    {
      nombre: "Laptop Core i5 11va Gen - 8GB RAM - 256GB SSD",
      estado: "Nuevo",
      precio: "S/ 1,899.00",
      descripción:
        "Ideal para trabajo de oficina, navegación web y videollamadas.",
    },
    {
      nombre: "Laptop Core i7 10ma Gen - 16GB RAM - 512GB SSD",
      estado: "Reacondicionado",
      precio: "S/ 2,499.00",
      descripción:
        "Excelente opción para profesionales que requieren potencia a menor costo.",
    },
    {
      nombre: "Teclado Mecánico RGB",
      estado: "Nuevo",
      precio: "S/ 149.00",
      descripción:
        "Diseño ergonómico, luces RGB, ideal para gaming o productividad.",
    },
    {
      nombre: "Mouse Inalámbrico Logitech",
      estado: "Nuevo",
      precio: "S/ 69.00",
      descripción:
        "Cómodo, ligero y con gran precisión.",
    },
    {
      nombre: "Impresora Multifuncional Epson EcoTank",
      estado: "Nuevo",
      precio: "S/ 749.00",
      descripción:
        "Impresión económica, ideal para casa u oficina.",
    },
    {
      nombre: "Audífonos Bluetooth",
      estado: "Nuevo",
      precio: "S/ 89.00",
      descripción:
        "Buena calidad de sonido y batería de larga duración.",
    },
    {
      nombre: "Adaptador USB a HDMI",
      estado: "Nuevo",
      precio: "S/ 45.00",
      descripción:
        "Permite conectar tu laptop a pantallas externas fácilmente.",
    },
  ];

  const gradient = `linear-gradient(to bottom, #0740e4, rgb(39, 76, 130))`;

  return (
    <main className="min-h-screen px-4 py-10 max-w-7xl mx-auto font-[Montserrat]">
      <h1 className="text-3xl md:text-4xl font-bold text-[#01103B] mb-8 text-center">
        Venta de Artículos Informáticos
      </h1>

      <p className="text-gray-700 text-center mb-12 max-w-3xl mx-auto text-base md:text-lg">
        Ofrecemos una amplia variedad de artículos informáticos nuevos y
        reacondicionados, ideales para profesionales, empresas y estudiantes.
        Contamos con laptops, periféricos, accesorios y dispositivos inteligentes
        de las mejores marcas, garantizando calidad, buen rendimiento y soporte
        técnico. Nuestros productos incluyen garantía y asesoría personalizada
        para elegir la mejor opción según tus necesidades y presupuesto.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map((prod, idx) => (
          <div
            key={idx}
            className="rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-300 flex flex-col"
            style={{
              background: gradient,
            }}
          >
            <div className="flex-1 flex flex-col items-center px-4 py-6 text-white">
              <h3 className="text-xl md:text-xl font-bold mb-4 text-center">
                {prod.nombre}
              </h3>
              <p className="text-2xl md:text-3xl font-extrabold mb-6 text-center text-white">
                {prod.precio}
              </p>
              <ul className="w-full text-center space-y-2 text-base md:text-lg">
                <li className="border-t border-white/30 py-2">
                  Estado: <span className="font-semibold">{prod.estado}</span>
                </li>
                <li className="border-t border-white/30 py-2">
                  {prod.descripción}
                </li>
              </ul>
            </div>
            <div className="bg-white p-3 text-center">
              <button className="bg-[#FF7101] hover:bg-[#e46300] text-white text-base md:text-lg font-bold py-2.5 rounded-full w-full transition">
                Consultar
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-12 text-center text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
        <strong>Importante:</strong> Los productos están sujetos a disponibilidad
        y pueden variar en precio según promociones o stock. ¡Contáctanos para
        asesoría personalizada!
      </p>
    </main>
  );
}
