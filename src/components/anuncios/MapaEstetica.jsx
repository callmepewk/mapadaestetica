import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import 'leaflet/dist/leaflet.css';

// Componente para ajustar o centro do mapa quando a localização mudar
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

// Componente separado para o mapa
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

      // Criar ícones customizados - estilo Uber/99
      const verifiedIcon = new LeafletModule.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [30, 45],
        iconAnchor: [15, 45],
        popupAnchor: [1, -40],
        shadowSize: [45, 45]
      });

      const defaultIcon = new LeafletModule.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [30, 45],
        iconAnchor: [15, 45],
        popupAnchor: [1, -40],
        shadowSize: [45, 45]
      });

      const userIcon = new LeafletModule.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [35, 50],
        iconAnchor: [17, 50],
        popupAnchor: [1, -45],
        shadowSize: [50, 50]
      });

      setL(LeafletModule);
      setIcones({ verifiedIcon, defaultIcon, userIcon });
    });
  }, []);

  if (!L || !icones) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg border-2 border-pink-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-800 font-semibold text-lg">Carregando mapa...</p>
          <p className="text-gray-600 text-sm mt-2">Preparando visualização dos profissionais</p>
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
    <div className="rounded-xl overflow-hidden border-4 border-pink-200 shadow-2xl" style={{ height: '700px' }}>
      <MapContainer
        center={center}
        zoom={minhaLocalizacao ? 14 : 12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={center} zoom={minhaLocalizacao ? 14 : 12} />
        
        {/* Marker da localização do usuário */}
        {minhaLocalizacao && (
          <Marker
            position={[minhaLocalizacao.latitude, minhaLocalizacao.longitude]}
            icon={icones.userIcon}
          >
            <Popup className="custom-popup">
              <div className="text-center p-2">
                <div className="text-4xl mb-2">📍</div>
                <p className="font-bold text-red-600 text-lg">Você está aqui</p>
                <p className="text-sm text-gray-600 mt-1">{cidadeFiltro} - {estadoFiltro}</p>
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
            <Popup maxWidth={320} className="custom-popup">
              <div className="space-y-3 p-2">
                {anuncio.imagem_principal && (
                  <img
                    src={anuncio.imagem_principal}
                    alt={anuncio.profissional}
                    className="w-full h-40 object-cover rounded-lg shadow-md"
                  />
                )}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-lg text-gray-900 flex-1">
                      {anuncio.titulo}
                    </h3>
                    {anuncio.profissional_verificado && (
                      <Badge className="bg-green-100 text-green-800 text-xs flex-shrink-0">
                        ✓ Verificado
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-base text-gray-700 font-semibold mb-1">
                    {anuncio.profissional}
                  </p>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                    <span>📍</span>
                    <span>{anuncio.cidade}, {anuncio.estado}</span>
                  </div>
                  
                  <Badge className="bg-purple-100 text-purple-800 text-xs mb-2">
                    {anuncio.categoria}
                  </Badge>
                  
                  {anuncio.faixa_preco && (
                    <p className="text-lg font-bold text-pink-600 mb-2">
                      {anuncio.faixa_preco}
                    </p>
                  )}
                </div>
                
                {minhaLocalizacao && calcularDistancia && (
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <p className="text-sm text-blue-800 font-semibold">
                      📍 Distância: {calcularDistancia(
                        minhaLocalizacao.latitude,
                        minhaLocalizacao.longitude,
                        anuncio.latitude,
                        anuncio.longitude
                      ).toFixed(2)} km de você
                    </p>
                  </div>
                )}
                
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold shadow-lg"
                  onClick={() => {
                    window.location.href = `${createPageUrl("DetalhesAnuncio")}?id=${anuncio.id}`;
                  }}
                >
                  Ver Detalhes Completos
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        
        .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        
        .custom-popup .leaflet-popup-close-button {
          font-size: 24px;
          color: #666;
          padding: 8px;
        }
        
        .custom-popup .leaflet-popup-close-button:hover {
          color: #e11d48;
        }
      `}</style>
    </div>
  );
}