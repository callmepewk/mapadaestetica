import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Eye, Star, Crown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CardAnuncio({ anuncio, destaque = false }) {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    const colors = {
      "Aberto Agora": "bg-green-100 text-green-800 border-green-200",
      "Fechado": "bg-red-100 text-red-800 border-red-200",
      "Sempre Aberto": "bg-blue-100 text-blue-800 border-blue-200",
      "N/D": "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[status] || colors["N/D"];
  };

  const getCategoriaColor = (categoria) => {
    const colors = {
      "Depilação": "bg-pink-100 text-pink-800",
      "Estética Facial": "bg-purple-100 text-purple-800",
      "Estética Corporal": "bg-blue-100 text-blue-800",
      "Massoterapia": "bg-green-100 text-green-800",
      "Micropigmentação": "bg-orange-100 text-orange-800",
      "Design de Sobrancelhas": "bg-indigo-100 text-indigo-800",
      "Manicure e Pedicure": "bg-red-100 text-red-800",
      "Harmonização Facial": "bg-violet-100 text-violet-800"
    };
    return colors[categoria] || "bg-gray-100 text-gray-800";
  };

  const isPremium = anuncio.plano === 'premium';

  return (
    <div className="w-full">
      <Card 
        className={`overflow-hidden cursor-pointer group hover:shadow-2xl transition-shadow duration-200 border-none h-full flex flex-col ${
          isPremium ? 'ring-2 ring-[#F7D426]' : ''
        }`}
        onClick={() => navigate(`${createPageUrl("DetalhesAnuncio")}?id=${anuncio.id}`)}
      >
        {/* Image - LAZY LOADING */}
        <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
          {anuncio.imagem_principal ? (
            <img
              src={anuncio.imagem_principal}
              alt={anuncio.titulo}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl sm:text-5xl md:text-6xl">
              ✨
            </div>
          )}
          
          {isPremium && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
              <Badge className="bg-gradient-to-r from-[#F7D426] to-yellow-500 text-[#2C2C2C] border-none shadow-lg text-xs font-bold">
                <Crown className="w-3 h-3 mr-1 fill-[#2C2C2C]" />
                PREMIUM
              </Badge>
            </div>
          )}

          {destaque && !isPremium && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
              <Badge className="bg-yellow-500 text-white border-none shadow-lg text-xs">
                <Star className="w-3 h-3 mr-1 fill-white" />
                Destaque
              </Badge>
            </div>
          )}

          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            <Badge className={`border text-xs ${getStatusColor(anuncio.status_funcionamento)}`}>
              <Clock className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">{anuncio.status_funcionamento}</span>
              <span className="sm:hidden">{anuncio.status_funcionamento === "Aberto Agora" ? "Aberto" : anuncio.status_funcionamento === "Sempre Aberto" ? "24h" : "Fechado"}</span>
            </Badge>
          </div>

          {anuncio.logo && (
            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
              <Avatar className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-2 sm:border-4 border-white shadow-lg">
                <AvatarImage src={anuncio.logo} loading="lazy" />
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white text-lg sm:text-xl">
                  {anuncio.profissional?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-3 sm:p-4 flex flex-col flex-1">
          <div className="mb-2 sm:mb-3">
            <Badge className={`text-xs ${getCategoriaColor(anuncio.categoria)}`}>
              {anuncio.categoria}
            </Badge>
          </div>

          <h3 className="font-bold text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
            {anuncio.titulo}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 flex-1">
            {anuncio.descricao}
          </p>

          <div className="space-y-2 text-xs text-gray-500 pt-3 border-t mt-auto">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{anuncio.cidade}, {anuncio.estado}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{anuncio.visualizacoes || 0} visualizações</span>
              </div>

              {anuncio.created_date && (
                <span className="text-xs text-gray-400">
                  {format(new Date(anuncio.created_date), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}