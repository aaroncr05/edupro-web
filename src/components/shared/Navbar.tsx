"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/about", label: "Quienes Somos" },
  { href: "/servicios", label: "Servicios" },
  { href: "/cursos", label: "Cursos" },
];

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = (href: string) =>
    pathname === href ? "text-[#FF7101] bg-[#FF7101]/10" : "text-[#01103B] hover:bg-gray-50 hover:text-[#FF7101]";

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 border-b bg-white/95 px-4 text-[#01103B] backdrop-blur transition-all duration-300",
        scrolled ? "border-gray-200 py-2 shadow-md" : "border-gray-100 py-3 shadow-sm"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/img/logo.png"
            alt="Digitales EduPro Logo"
            width={76}
            height={76}
            priority
            className="h-11 w-auto object-contain"
          />
        </Link>

        <NavigationMenu className="hidden md:block">
          <NavigationMenuList className="gap-1">
            {NAV_LINKS.map((link) => (
              <NavigationMenuItem key={link.href}>
                <Link href={link.href} className={cn("rounded-lg px-4 py-2 text-sm font-bold transition-colors", linkClass(link.href))}>
                  {link.label}
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/contacto">
            <Button className="rounded-lg bg-[#FF7101] px-5 text-sm font-bold text-white hover:bg-[#e86600]">
              Contactanos
            </Button>
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-2xl text-[#01103B] focus:outline-none md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {menuOpen && (
        <div className="mt-3 border-t border-gray-100 bg-white px-4 pb-4 pt-3 md:hidden">
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn("rounded-lg px-4 py-2 text-sm font-bold transition-colors", linkClass(link.href))}
              >
                {link.label}
              </Link>
            ))}

            <Link href="/contacto" onClick={() => setMenuOpen(false)} className="pt-2">
              <Button className="w-full rounded-lg bg-[#FF7101] font-bold text-white hover:bg-[#e86600]">
                Contactanos
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
