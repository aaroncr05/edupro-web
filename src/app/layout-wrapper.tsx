'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { ButtonWhatsappFloat, CrmSidebar, Footer, Navbar } from '@/components/shared';
import { useAuthStore } from '@/stores/auth.store';

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, hasHydrated } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const crmRoutes = [
    '/dashboard',
    '/leads',
    '/quotations',
    '/marketing',
    '/reports',
    '/cases',
    '/users',
    '/forms'
  ];

  const standaloneRoutes = [
    '/profile',
    '/login',
    '/register',
    '/forgot-password',
    '/verify-code',
    '/reset-password'
  ];

  const isRoute = (route: string) => pathname === route || pathname.startsWith(`${route}/`);
  const isCrmRoute = crmRoutes.some(isRoute);
  const isStandaloneRoute = standaloneRoutes.some(isRoute);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isCrmRoute) {
    const hasSession = Boolean(user);

    if (!hasHydrated || !hasSession) {
      return (
        <div className="min-h-screen bg-[#01103B]">
          {children}
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F6F7FB]">
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">EduPro CRM</p>
              <p className="truncate text-base font-black text-[#01103B]">{user?.nombre || 'Panel CRM'}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#01103B] text-white shadow-lg shadow-[#01103B]/20"
              aria-label="Abrir menú CRM"
            >
              <Menu size={22} />
            </button>
          </div>
        </header>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[80] lg:hidden">
            <button
              type="button"
              aria-label="Cerrar menú"
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 flex w-[min(88vw,360px)] flex-col bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Menú del sistema</p>
                  <h2 className="text-lg font-black text-[#01103B]">Módulos CRM</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500"
                  aria-label="Cerrar menú CRM"
                >
                  <X size={20} />
                </button>
              </div>
              <CrmSidebar mobile onNavigate={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        <div className="mx-auto flex w-full max-w-[1800px] gap-4 px-3 py-4 sm:px-4 lg:gap-6 lg:px-6 lg:py-6 xl:px-8">
          <CrmSidebar />
          <div className="min-w-0 flex-1">
            {children}
          </div>
        </div>
      </div>
    );
  }

  if (isStandaloneRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <ButtonWhatsappFloat />
      <Footer />
    </>
  );
}
