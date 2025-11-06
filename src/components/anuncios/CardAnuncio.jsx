import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye, Heart, CheckCircle, Star, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CardAnuncio({ anuncio, distancia }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`${createPageUrl("DetalhesAnuncio")}?id=${anuncio.id}`);
  };

  return (
    <Card 
      onClick={handleClick}
      className="cursor-pointer group hover:shadow-2xl transition-all duration-300 overflow-hidden border-none"
    >
      <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100">
        {anuncio.imagem_principal ? (
          <img
            src={anuncio.imagem_principal}
            alt={anuncio.titulo}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
            ✨
          </div>
        )}
        
        {anuncio.profissional_verificado && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-500 text-white border-2 border-white shadow-lg">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verificado
            </Badge>
          </div>
        )}

        {/* NOVO: Badge Profissional Especializado */}
        {anuncio.profissional_especializado && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-2 border-white shadow-lg">
              <Award className="w-3 h-3 mr-1" />
              Especializado
            </Badge>
          </div>
        )}

        {anuncio.em_destaque && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-[#2C2C2C] font-bold border-2 border-white shadow-lg">
              ⭐ Destaque
            </Badge>
          </div>
        )}

        {/* Badge de Estrelas do Estabelecimento */}
        {anuncio.estrelas_estabelecimento && (
          <div className="absolute bottom-3 left-3">
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold border-2 border-white shadow-lg flex items-center gap-1">
              {[...Array(anuncio.estrelas_estabelecimento)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-white" />
              ))}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-12 h-12 border-2 border-pink-200 flex-shrink-0">
            <AvatarImage src={anuncio.logo} />
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold">
              {anuncio.profissional?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1 line-clamp-2 group-hover:text-pink-600 transition-colors">
              {anuncio.titulo}
            </h3>
            <p className="text-sm text-gray-600 font-medium">
              {anuncio.profissional}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-pink-600 flex-shrink-0" />
            <span className="truncate">{anuncio.cidade}, {anuncio.estado}</span>
          </div>

          {distancia !== null && distancia !== undefined && (
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
              <MapPin className="w-4 h-4" />
              <span>{distancia.toFixed(2)} km de você</span>
            </div>
          )}

          {/* Mostrar tipo de estabelecimento com estrelas */}
          {anuncio.tipo_estabelecimento && (
            <div className="flex items-center gap-2 text-sm text-gray-700 bg-yellow-50 px-2 py-1 rounded">
              <span className="font-medium">{anuncio.tipo_estabelecimento}</span>
              {anuncio.estrelas_estabelecimento && (
                <span className="flex items-center gap-0.5">
                  {[...Array(anuncio.estrelas_estabelecimento)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="bg-purple-100 text-purple-800 text-xs">
            {anuncio.categoria}
          </Badge>
          {anuncio.faixa_preco && (
            <Badge className="bg-green-100 text-green-800 text-xs font-bold">
              {anuncio.faixa_preco}
            </Badge>
          )}
          {anuncio.profissional_especializado && (
            <Badge className="bg-purple-100 text-purple-800 text-xs flex items-center gap-1">
              <Award className="w-3 h-3" />
              Especializado
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {anuncio.visualizacoes || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className={`w-4 h-4 ${anuncio.curtidas > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {anuncio.curtidas || 0}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}