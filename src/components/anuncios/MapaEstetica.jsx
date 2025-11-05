import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import 'leaflet/dist/leaflet.css';

// Componente separado para o mapa, evitando problemas de inicialização
export default function MapaEstetica({ anuncios, minhaLocalizacao, cidadeFiltro, estadoFiltro, calcularDistancia }) {
  const [L, setL] = useState(null);
  const [icones, setIcones] = useState(null);

  useEffect(() => {
    // Importar Leaflet dinamicamente
    import('leaflet').then((leaflet) => {
      const LeafletModule = leaflet.default;
      
      // Fix para os ícones do Leaflet
      delete LeafletModule.Icon.Default.prototype._getIconUrl;
      LeafletModule.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Criar ícones
      const verifiedIcon = new LeafletModule.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const defaultIcon = new LeafletModule.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const userIcon = new LeafletModule.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      setL(LeafletModule);
      setIcones({ verifiedIcon, defaultIcon, userIcon });
    });
  }, []);

  if (!L || !icones) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  const center = minhaLocalizacao 
    ? [minhaLocalizacao.latitude, minhaLocalizacao.longitude]
    : anuncios.length > 0 
      ? [anuncios[0].latitude, anuncios[0].longitude]
      : [-23.5505, -46.6333]; // São Paulo como fallback

  return (
    <div className="rounded-lg overflow-hidden border-2 border-gray-200" style={{ height: '600px' }}>
      <MapContainer
        center={center}
        zoom={minhaLocalizacao ? 13 : 12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marker da localização do usuário */}
        {minhaLocalizacao && (
          <Marker
            position={[minhaLocalizacao.latitude, minhaLocalizacao.longitude]}
            icon={icones.userIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold text-red-600">📍 Você está aqui</p>
                <p className="text-sm">{cidadeFiltro} - {estadoFiltro}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Markers dos profissionais */}
        {anuncios.map((anuncio) => (
          <Marker
            key={anuncio.id}
            position={[anuncio.latitude, anuncio.longitude]}
            icon={anuncio.profissional_verificado ? icones.verifiedIcon : icones.defaultIcon}
          >
            <Popup maxWidth={300}>
              <div className="space-y-2">
                {anuncio.logo && (
                  <img
                    src={anuncio.logo}
                    alt={anuncio.profissional}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    {anuncio.titulo}
                    {anuncio.profissional_verificado && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        ✓ Verificado
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 font-semibold">
                    {anuncio.profissional}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {anuncio.categoria}
                  </p>
                  {anuncio.faixa_preco && (
                    <p className="text-sm font-bold text-pink-600 mt-1">
                      {anuncio.faixa_preco}
                    </p>
                  )}
                </div>
                
                {minhaLocalizacao && calcularDistancia && (
                  <p className="text-xs text-gray-500">
                    📍 Distância: {calcularDistancia(
                      minhaLocalizacao.latitude,
                      minhaLocalizacao.longitude,
                      anuncio.latitude,
                      anuncio.longitude
                    ).toFixed(2)} km
                  </p>
                )}
                
                <Button
                  size="sm"
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                  onClick={() => {
                    window.location.href = `${createPageUrl("DetalhesAnuncio")}?id=${anuncio.id}`;
                  }}
                >
                  Ver Detalhes
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}