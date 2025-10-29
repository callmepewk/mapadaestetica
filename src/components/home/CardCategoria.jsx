import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function CardCategoria({ categoria }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`${createPageUrl("Anuncios")}?categoria=${encodeURIComponent(categoria.nome)}`);
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <Card
        onClick={handleClick}
        className="relative overflow-hidden cursor-pointer group h-32 sm:h-36 md:h-40 border-none shadow-lg hover:shadow-2xl transition-all duration-300"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${categoria.cor} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 text-white">
          <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 transform group-hover:scale-110 transition-transform">
            {categoria.icon}
          </div>
          <h3 className="font-bold text-center text-sm sm:text-base md:text-lg leading-tight px-1">
            {categoria.nome}
          </h3>
        </div>

        <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-white/20 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs font-medium">
          Ver mais
        </div>
      </Card>
    </motion.div>
  );
}