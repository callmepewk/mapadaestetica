import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Eye, Star, Phone, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300 border-none"
        onClick={() => navigate(`${createPageUrl("DetalhesAnuncio")}?id=${anuncio.id}`)}
      >
        {/* Image */}
        <div className="relative h-48 md:h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
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
          
          {destaque && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-yellow-500 text-white border-none shadow-lg">
                <Star className="w-3 h-3 mr-1 fill-white" />
                Destaque
              </Badge>
            </div>
          )}

          <div className="absolute top-3 right-3">
            <Badge className={`border ${getStatusColor(anuncio.status_funcionamento)}`}>
              <Clock className="w-3 h-3 mr-1" />
              {anuncio.status_funcionamento}
            </Badge>
          </div>

          {/* Logo Overlay */}
          {anuncio.logo && (
            <div className="absolute bottom-3 left-3">
              <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                <AvatarImage src={anuncio.logo} />
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white text-xl">
                  {anuncio.profissional?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Category */}
          <Badge className={`mb-3 ${getCategoriaColor(anuncio.categoria)}`}>
            {anuncio.categoria}
          </Badge>

          {/* Title */}
          <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-pink-600 transition-colors">
            {anuncio.titulo}
          </h3>

          {/* Professional */}
          <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
            <span className="font-semibold">{anuncio.profissional}</span>
          </p>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {anuncio.descricao}
          </p>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{anuncio.cidade}, {anuncio.estado}</span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye className="w-3 h-3" />
              <span>{anuncio.visualizacoes || 0} visualizações</span>
            </div>
            
            <div className="text-xs text-gray-500">
              {anuncio.created_date && format(new Date(anuncio.created_date), "dd/MM/yyyy", { locale: ptBR })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}