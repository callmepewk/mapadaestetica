import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";

export default function CardCategoria({ categoria }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`${createPageUrl("Anuncios")}?categoria=${encodeURIComponent(categoria.nome)}`);
  };

  return (
    <div className="w-full">
      <Card
        onClick={handleClick}
        className="relative overflow-hidden cursor-pointer group h-28 sm:h-32 md:h-36 lg:h-40 border-none shadow-lg hover:shadow-2xl transition-shadow duration-200 touch-manipulation"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${categoria.cor} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-3 md:p-4 text-white">
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-1.5 sm:mb-2 md:mb-3">
            {categoria.icon}
          </div>
          <h3 className="font-bold text-center text-xs sm:text-sm md:text-base lg:text-lg leading-tight px-1 line-clamp-2">
            {categoria.nome}
          </h3>
        </div>

        <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-white/20 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 md:px-3 rounded-full text-xs font-medium">
          Ver mais
        </div>
      </Card>
    </div>
  );
}