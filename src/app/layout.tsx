import { ReactNode } from "react";
import { poppins } from "@/shared/config/font";
import { LayoutWrapper } from "./layout-wrapper";
import "../shared/styles/globals.css";

export const metadata = {
  title: "Digitales EduPro — Soluciones Digitales para tu Negocio | Piura",
  description:
    "Plataforma web de gestión y automatización de ventas para Digitales EduPro. Desarrolla tu negocio con soluciones tecnológicas innovadoras en Piura, Perú.",
  keywords: "digitales edupro, soluciones digitales, CRM ventas, cursos digitales, marketing digital, Piura",
  openGraph: {
    title: "Digitales EduPro — Soluciones Digitales",
    description: "Implementación de Plataforma Web Autogestionable para la Gestión y Automatización del Proceso de Ventas y Post-venta.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={`${poppins.className} antialiased`}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
