"use client";

import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaLinkedin,
} from "react-icons/fa";
import Link from "next/link";
import { montserrat, montserratMedium } from "@/shared/config/font";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="bg-[#01103B] text-white pt-12 pb-6 border-t-4 border-[#FF7101]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Columna 1 - Logo y descripción */}
          <div className="space-y-4">
            <h3 className={`text-xl font-bold ${montserrat.className}`}>
              <Image
                src="/img/logo.old.png"
                alt="DEP Logo"
                width={50}
                height={50}
                className="inline-block mr-2"
              />
            </h3>
            <p
              className={`text-gray-300 text-sm ${montserratMedium.className}`}
            >
              Soluciones digitales innovadoras para impulsar tu negocio y
              formación profesional.
            </p>
            <div className="flex gap-4 pt-2">
              {[
                {
                  href: "https://www.facebook.com/share/19SsznZpaa/",
                  icon: <FaFacebookF className="text-lg" />,
                  name: "Facebook",
                },
                {
                  href: "https://www.instagram.com/digitalesedu.pro",
                  icon: <FaInstagram className="text-lg" />,
                  name: "Instagram",
                },
                {
                  href: "https://www.tiktok.com/@digitales.edu.pro",
                  icon: <FaTiktok className="text-lg" />,
                  name: "TikTok",
                },
                {
                  href: "https://www.linkedin.com/company/digitales-edu-pro/",
                  icon: <FaLinkedin className="text-lg" />,
                  name: "LinkedIn",
                },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#FF7101] transition-all duration-300 border border-gray-600 hover:border-[#FF7101]"
                  title={social.name}
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Columna 2 - Enlaces rápidos */}
          <div>
            <h4
              className={`text-lg font-semibold mb-4 ${montserrat.className}`}
            >
              Enlaces Rápidos
            </h4>
            <ul className={`space-y-2 text-sm ${montserratMedium.className}`}>
              <li>
                <Link
                  href="/servicios"
                  className="hover:text-[#FF7101] transition-colors"
                >
                  Servicios
                </Link>
              </li>
              <li>
                <Link
                  href="/cursos"
                  className="hover:text-[#FF7101] transition-colors"
                >
                  Cursos
                </Link>
              </li>
              <li>
                <a
                  href="/nosotros"
                  className="hover:text-[#FF7101] transition-colors"
                >
                  Nosotros
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="hover:text-[#FF7101] transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/contacto"
                  className="hover:text-[#FF7101] transition-colors"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3 - Contacto */}
          <div>
            <h4
              className={`text-lg font-semibold mb-4 ${montserrat.className}`}
            >
              Contacto
            </h4>
            <ul className={`space-y-3 text-sm ${montserratMedium.className}`}>
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-[#FF7101] mt-1" />
                <span>Piura, Perú</span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="text-[#FF7101]" />
                <a
                  href="tel:+51960183250"
                  className="hover:text-[#FF7101] transition-colors"
                >
                  +51 960 183 250
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-[#FF7101]" />
                <a
                  href="mailto:info@digitalesedupro.com"
                  className="hover:text-[#FF7101] transition-colors"
                >
                  info@digitalesedupro.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FaClock className="text-[#FF7101]" />
                <span>Lun-Vie: 9:00 - 18:00</span>
              </li>
            </ul>
          </div>

          {/* Columna 4 - Newsletter */}
          <div>
            <h4
              className={`text-lg font-semibold mb-4 ${montserrat.className}`}
            >
              Newsletter
            </h4>
            <p className={`text-sm mb-4 ${montserratMedium.className}`}>
              Suscríbete para recibir nuestras últimas noticias y ofertas.
            </p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="px-4 py-2 rounded text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7101]"
                required
              />
              <button
                type="submit"
                className="bg-[#FF7101] hover:bg-[#FF7101]/90 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>

        {/* Derechos de autor */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p
              className={`text-xs md:text-sm text-gray-400 ${montserratMedium.className}`}
            >
              © {new Date().getFullYear()} DEP Digitales Edu Pro. Todos los
              derechos reservados.
            </p>
            <div
              className={`flex gap-4 mt-4 md:mt-0 text-xs md:text-sm ${montserratMedium.className}`}
            >
              <a
                href="/politica-privacidad"
                className="hover:text-[#FF7101] transition-colors"
              >
                Política de Privacidad
              </a>
              <a
                href="/terminos-servicio"
                className="hover:text-[#FF7101] transition-colors"
              >
                Términos de Servicio
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
