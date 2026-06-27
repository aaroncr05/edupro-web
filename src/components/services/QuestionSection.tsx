import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { montserratMedium } from "@/shared/config/font";

export const QuestionSection = () => {
  return (
    <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto bg-[#F0F4F8] rounded-2xl shadow-lg">
      {/* Título y descripción principal */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-[#01103B] font-['Poppins'] mb-4">
          Preguntas Frecuentes
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto font-[Montserrat]">
          Resolvemos tus dudas más comunes sobre nuestros servicios.
        </p>
      </div>

      {/* Accordion para las preguntas frecuentes */}
      <Accordion type="single" collapsible className="max-w-3xl mx-auto">
        {[
          {
            pregunta: "¿Qué incluye el desarrollo de una página web?",
            respuesta:
              "El desarrollo de una página web incluye el diseño personalizado, programación, implementación de funcionalidades específicas, optimización SEO básica, integración de formularios de contacto y el alojamiento en un servidor durante el primer año.",
          },
          {
            pregunta: "¿Cuánto tiempo lleva crear una página web?",
            respuesta:
              "El tiempo de desarrollo depende de la complejidad del proyecto. Para una página web básica, el proceso puede tomar entre 3 y 6 semanas. Para proyectos más complejos, como tiendas en línea o plataformas a medida, puede llevar entre 8 y 12 semanas.",
          },
          {
            pregunta: "¿Ofrecen soporte después de entregar la página web?",
            respuesta:
              "Sí, ofrecemos soporte post-entrega. Todos nuestros paquetes incluyen 3 meses de soporte gratuito, que cubren pequeñas actualizaciones, corrección de errores y ajustes en la funcionalidad. Posteriormente, ofrecemos contratos de mantenimiento según las necesidades del cliente.",
          },
          {
            pregunta: "¿La página será optimizada para móviles?",
            respuesta:
              "Sí, todas las páginas web que desarrollamos son completamente **responsivas**, lo que significa que se adaptan automáticamente a diferentes dispositivos, incluidos móviles, tabletas y escritorios. La experiencia del usuario será fluida en todas las plataformas.",
          },
          {
            pregunta: "¿Puedo gestionar la página web por mi cuenta?",
            respuesta:
              "Sí, entregamos el panel de administración para que puedas gestionar tu página de manera autónoma. Esto incluye la posibilidad de actualizar contenido, gestionar productos (si es una tienda en línea), controlar el SEO y mucho más. Ofrecemos capacitación para que puedas aprovechar al máximo todas las funcionalidades.",
          },
        ].map((faq, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`}>
            {/* AccordionTrigger: Botón que abre/cierra el acordeón */}
            <AccordionTrigger className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
              {/* Texto de la pregunta */}
              <span className="text-lg font-semibold text-[#01103B] font-['Poppins']">
                {faq.pregunta}
              </span>
              {/* Icono de ChevronRight que rota cuando se expande o colapsa */}
              {/* <ChevronRight className="w-5 h-5 text-[#FF7101] transition-transform transform rotate-0 group-open:rotate-90" /> */}
            </AccordionTrigger>

            {/* AccordionContent: El contenido que se muestra cuando se expande el acordeón */}
            {/* <AccordionContent className="text-gray-600 font-[Montserrat] text-sm p-6 bg-white shadow-sm"> */}
            <AccordionContent
              className={` text-gray-600 text-sm p-6 bg-white shadow-sm ${montserratMedium.className} `}
            >
              {/* Respuesta a la pregunta */}
              {faq.respuesta}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
