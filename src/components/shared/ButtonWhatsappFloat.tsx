import React from "react";
import { FaWhatsapp } from "react-icons/fa";

export const ButtonWhatsappFloat = () => {
  return (
    <div className="relative">
      <a
        href="https://wa.me/960183250"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-white text-[#25D366] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 border-[#25D366]/20"
        aria-label="WhatsApp"
      >
        <FaWhatsapp size={24} />
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
      </a>
    </div>
  );
};
