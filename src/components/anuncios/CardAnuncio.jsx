import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ImageWithLoader from "../common/ImageWithLoader";
import { MapPin, Eye, Heart, CheckCircle, Star, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CardAnuncio({ anuncio, distancia, isPreview = false }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isPreview) return;
    navigate(`${createPageUrl("DetalhesAnuncio")}?id=${anuncio.id}`);
  };

  return (
    <Card 
      onClick={handleClick}
      className="cursor-pointer group hover:shadow-2xl transition-all duration-300 overflow-hidden border-none w-full"
    >
      <div className="relative h-40 sm:h-48 md:h-56 overflow-hidden bg-gray-100">
        {anuncio.imagem_principal ? (
          <ImageWithLoader
            src={anuncio.imagem_principal}
            alt={anuncio.titulo}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl sm:text-5xl md:text-6xl">
            ✨
          </div>
        )}
        
        {anuncio.profissional_verificado && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-green-500 text-white border-2 border-white shadow-lg text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Verificado</span>
              <span className="sm:hidden">✓</span>
            </Badge>
          </div>
        )}

        {isPreview && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-gray-900 text-white border-2 border-white text-[10px]">Exemplo</Badge>
          </div>
        )}
        {/* Badge Profissional Especializado */}
        {anuncio.profissional_especializado && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-2 border-white shadow-lg text-xs">
              <Award className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Especializado</span>
              <span className="sm:hidden">⭐</span>
            </Badge>
          </div>
        )}

        {anuncio.em_destaque && (
          <div className="absolute bottom-2 right-2">
            <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-[#2C2C2C] font-bold border-2 border-white shadow-lg text-xs">
              <span className="hidden sm:inline">⭐ Destaque</span>
              <span className="sm:hidden">⭐</span>
            </Badge>
          </div>
        )}
        {anuncio.plano === 'platina' && (
          <div className="absolute inset-y-0 left-2 flex items-center">
            <div className="w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-purple-600 animate-pulse"/>
          </div>
        )}

        {/* Badge de Estrelas do Estabelecimento */}
        {/* Selo Clube da Beleza */}
        {anuncio.exibir_selo_clube && (
          <div className="absolute bottom-2 left-2">
            <ImageWithLoader
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/652cd0312_clubeimg.jpeg"
              alt="Clube da Beleza"
              className="w-6 h-6 rounded shadow border border-white"
              fallbackUrl="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/b53be18d1_clubeimg.jpeg"
            />
          </div>
        )}

        {anuncio.estrelas_estabelecimento && (
          <div className={`absolute bottom-2 ${anuncio.exibir_selo_clube ? 'left-9' : 'left-2'}`}>
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold border-2 border-white shadow-lg flex items-center gap-0.5 text-xs">
              {[...Array(anuncio.estrelas_estabelecimento)].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-white" />
              ))}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-pink-200 flex-shrink-0">
            <AvatarImage src={anuncio.logo} />
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold text-sm sm:text-base">
              {anuncio.profissional?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg mb-0.5 sm:mb-1 line-clamp-2 group-hover:text-pink-600 transition-colors">
              {anuncio.titulo}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">
              {anuncio.profissional}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600 flex-shrink-0" />
            <span className="truncate">{anuncio.cidade}, {anuncio.estado}</span>
          </div>

          {distancia !== null && distancia !== undefined && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-blue-600">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>{distancia.toFixed(2)} km de você</span>
            </div>
          )}

          {/* Tipo de estabelecimento com estrelas */}
          {anuncio.tipo_estabelecimento && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 bg-yellow-50 px-2 py-1 rounded">
              <span className="font-medium truncate">{anuncio.tipo_estabelecimento}</span>
              {anuncio.estrelas_estabelecimento && (
                <span className="flex items-center gap-0.5 flex-shrink-0">
                  {[...Array(anuncio.estrelas_estabelecimento)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </span>
              )}
            </div>
          )}
          </div>

          {anuncio.amenidades && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
            {[
              { key: 'estacionamento', label: 'Estacionamento', emoji: '🅿️' },
              { key: 'estacionamento_valet', label: 'Valet', emoji: '🚗' },
              { key: 'aceita_pet', label: 'Pet', emoji: '🐶' },
              { key: 'lounge', label: 'Lounge', emoji: '🛋️' },
              { key: 'lounge_bar', label: 'Bar', emoji: '🍷' },
              { key: 'musica_ambiente', label: 'Música', emoji: '🎵' },
              { key: 'seguranca', label: 'Segurança', emoji: '🛡️' },
            ].filter(a => anuncio.amenidades?.[a.key]).map(a => (
              <Badge key={a.key} className="bg-gray-100 text-gray-800 text-xs">{a.emoji} {a.label}</Badge>
            ))}
          </div>
          )}

          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <Badge className="bg-purple-100 text-purple-800 text-xs">
            <span className="truncate max-w-[120px] sm:max-w-none">{anuncio.categoria}</span>
          </Badge>
          {anuncio.faixa_preco && (
            <Badge className="bg-green-100 text-green-800 text-xs font-bold">
              {anuncio.faixa_preco}
            </Badge>
          )}
          {anuncio.profissional_especializado && (
            <Badge className="bg-purple-100 text-purple-800 text-xs flex items-center gap-1">
              <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
              <span className="hidden sm:inline">Especializado</span>
              <span className="sm:hidden">⭐</span>
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 pt-2 sm:pt-3 border-t">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="tabular-nums">{anuncio.visualizacoes || 0}</span>
            </span>
            <span className="flex items-center gap-1">
              <Heart className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${anuncio.curtidas > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="tabular-nums">{anuncio.curtidas || 0}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}