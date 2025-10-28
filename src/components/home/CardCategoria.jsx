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
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        onClick={handleClick}
        className="relative overflow-hidden cursor-pointer group h-40 border-none shadow-lg hover:shadow-2xl transition-all duration-300"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${categoria.cor} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
          <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">
            {categoria.icon}
          </div>
          <h3 className="font-bold text-center text-lg leading-tight">
            {categoria.nome}
          </h3>
        </div>

        <div className="absolute bottom-2 right-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
          Ver mais
        </div>
      </Card>
    </motion.div>
  );
}