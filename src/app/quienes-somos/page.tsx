"use client";

import Image from "next/image";

export default function QuienesSomos() {
  const valores = [
    {
      img: "/img/quienes-somos/valor-innovacion.png",
      title: "Innovación",
      desc: "Creamos soluciones originales, ágiles y modernas para un mundo digital.",
      color: "#FF7101",
    },
    {
      img: "/img/quienes-somos/valor-compromiso.png",
      title: "Compromiso",
      desc: "Damos todo nuestro esfuerzo y responsabilidad en cada proyecto.",
      color: "#FF7101",
    },
    {
      img: "/img/quienes-somos/valor-transparencia.png",
      title: "Transparencia",
      desc: "Actuamos con claridad y confianza en todo lo que hacemos.",
      color: "#FF7101",
    },
    {
      img: "/img/quienes-somos/valor-resposabilidad.png",
      title: "Responsabilidad",
      desc: "Asumimos nuestros compromisos con ética y coherencia.",
      color: "#FF7101",
    },
    {
      img: "/img/quienes-somos/valor-equipo.png",
      title: "Trabajo en equipo",
      desc: "Colaboramos con respeto, comunicación y unión.",
      color: "#FF7101",
    },
    {
      img: "/img/quienes-somos/valor-pasion.png",
      title: "Pasión por enseñar",
      desc: "Formamos con entrega, vocación y mucho entusiasmo.",
      color: "#FF7101",
    },
  ];

  return (
    <main className="bg-white text-gray-800 font-[Montserrat] px-4 md:px-8 py-16 max-w-7xl mx-auto space-y-24">
      {/* SECCIÓN 1: Presentación */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#01103B] font-['Poppins'] mb-6">
            ¿Quiénes Somos?
          </h1>
          <p className="text-lg text-justify leading-relaxed text-gray-700">
            En <strong>DEP</strong>, nos dedicamos al desarrollo empresarial
            mediante soluciones digitales, educación tecnológica y estrategias
            de marketing moderno. Nos impulsa la pasión por transformar ideas en
            resultados concretos y sostenibles.
          </p>
        </div>
        <div className="relative h-72 md:h-96 w-full rounded-2xl overflow-hidden shadow-xl">
          <Image
            src="/img/equipo.jpg"
            alt="Equipo DEP"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* SECCIÓN 2: Visión y Misión */}
      <section className="grid md:grid-cols-2 gap-8">
        {[
          {
            icon: (
              <Image
                src="/img/quienes-somos/vision.png"
                alt="icono"
                width={32}
                height={32}
              />
            ),
            title: "Visión",
            desc: "Ser referentes en innovación digital y formación tecnológica, impulsando el crecimiento de empresas, profesionales y jóvenes con soluciones de alto impacto.",
          },
          {
            icon: (
              <Image
                src="/img/quienes-somos/mision.png"
                alt="icono"
                width={32}
                height={32}
              />
            ),
            title: "Misión",
            desc: "Ofrecer servicios y programas educativos innovadores y accesibles, que respondan a las necesidades reales del entorno empresarial y social.",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-[#F7F8FA] rounded-2xl p-8 shadow-md hover:shadow-lg transition duration-300 border-t-4 border-[#0740E4]"
          >
            <div className="flex items-center gap-3 mb-4">
              {item.icon}
              <h2 className="text-2xl font-bold font-['Poppins'] text-[#01103B]">
                {item.title}
              </h2>
            </div>
            <p className="text-gray-700 text-base leading-relaxed text-justify">
              {item.desc}
            </p>
          </div>
        ))}
      </section>

      {/* SECCIÓN 3: Valores con color y estilo */}
      <section className="bg-[#F9FAFB] px-4 rounded-2xl">
        <h2 className="text-3xl font-semibold text-[#01103B] font-['Poppins'] text-center mb-12">
          Nuestros Valores
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-7xl mx-auto text-center">
          {valores.map((valor, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center border-t-4"
              style={{ borderColor: valor.color }}
            >
              <div className="w-32 h-32 mb-4 relative">
                <Image
                  src={valor.img}
                  alt={valor.title}
                  fill
                  sizes="128px"
                  className="object-contain"
                />
              </div>
              <h3 className="text-lg font-bold font-[Poppins] mb-2">
                {valor.title}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {valor.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
