import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Navigation,
  Phone,
  MessageCircle,
  Clock,
  Star,
  Search,
  Loader2,
  ExternalLink,
  Crown,
} from "lucide-react";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const criarIconeUsuario = () => {
  return L.divIcon({
    html: `<div style="background: #3B82F6; border: 3px solid white; width: 20px; height: 20px; border-radius: 50%; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
  });
};

const criarIconeEstabelecimento = (categoria) => {
  const icons = {
    "Salão de Beleza": "💇",
    "Clínica de Estética": "💆",
    "Spa": "🌿",
    "Barbearia": "✂️",
    "Centro de Estética": "✨",
    "Consultório": "🏥",
    "Outros": "📍"
  };
  
  const emoji = icons[categoria] || "📍";
  
  return L.divIcon({
    html: `<div style="font-size: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${emoji}</div>`,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

// Componente para centralizar mapa
function CentralizarMapa({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

// Função para calcular distância
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function Mapa() {
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(null);
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);
  const [centralizarEm, setCentralizarEm] = useState(null);
  
  // Filtros
  const [buscaCidade, setBuscaCidade] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroPlano, setFiltroPlano] = useState("");
  const [ordenacao, setOrdenacao] = useState("distancia");

  // Query estabelecimentos
  const { data: estabelecimentos = [], isLoading } = useQuery({
    queryKey: ['estabelecimentos-parceiros'],
    queryFn: async () => {
      return await base44.entities.EstabelecimentoParceiro.list('-created_date', 500);
    },
  });

  // Obter localização do usuário
  useEffect(() => {
    if (navigator.geolocation) {
      setBuscandoLocalizacao(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocalizacaoUsuario({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setBuscandoLocalizacao(false);
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          setBuscandoLocalizacao(false);
          // Localização padrão (Brasil central)
          setLocalizacaoUsuario({ lat: -15.7801, lng: -47.9292 });
        }
      );
    } else {
      setLocalizacaoUsuario({ lat: -15.7801, lng: -47.9292 });
    }
  }, []);

  const handleUsarMinhaLocalizacao = () => {
    if (navigator.geolocation) {
      setBuscandoLocalizacao(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const novaLocalizacao = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocalizacaoUsuario(novaLocalizacao);
          setCentralizarEm(novaLocalizacao);
          setBuscandoLocalizacao(false);
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          alert("Não foi possível obter sua localização. Verifique as permissões do navegador.");
          setBuscandoLocalizacao(false);
        }
      );
    }
  };

  // Filtrar estabelecimentos
  const estabelecimentosFiltrados = estabelecimentos.filter(est => {
    const matchCidade = !buscaCidade || 
      est.cidade?.toLowerCase().includes(buscaCidade.toLowerCase()) ||
      est.estado?.toLowerCase().includes(buscaCidade.toLowerCase());
    const matchCategoria = !filtroCategoria || est.categoria === filtroCategoria;
    const matchPlano = !filtroPlano || est.plano_desconto === filtroPlano;
    
    return matchCidade && matchCategoria && matchPlano;
  });

  // Calcular distâncias e ordenar
  const estabelecimentosComDistancia = estabelecimentosFiltrados.map(est => {
    let distancia = null;
    if (localizacaoUsuario && est.latitude && est.longitude) {
      distancia = calcularDistancia(
        localizacaoUsuario.lat,
        localizacaoUsuario.lng,
        est.latitude,
        est.longitude
      );
    }
    return { ...est, distancia };
  });

  // Ordenar
  const estabelecimentosOrdenados = [...estabelecimentosComDistancia].sort((a, b) => {
    if (ordenacao === "distancia") {
      if (a.distancia === null) return 1;
      if (b.distancia === null) return -1;
      return a.distancia - b.distancia;
    }
    return 0;
  });

  const handleCentralizarEstabelecimento = (est) => {
    if (est.latitude && est.longitude) {
      setCentralizarEm({ lat: est.latitude, lng: est.longitude });
    }
  };

  const handleComoChegar = (est) => {
    if (!localizacaoUsuario || !est.latitude || !est.longitude) {
      alert("Localização não disponível");
      return;
    }
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${localizacaoUsuario.lat},${localizacaoUsuario.lng}&destination=${est.latitude},${est.longitude}`;
    window.open(url, '_blank');
  };

  const getDescontoInfo = (plano) => {
    const descontos = {
      light: { badge: "LIGHT", desconto: "10%", cor: "bg-blue-100 text-blue-800" },
      gold: { badge: "GOLD", desconto: "15%", cor: "bg-yellow-100 text-yellow-800" },
      vip: { badge: "VIP", desconto: "25%", cor: "bg-purple-100 text-purple-800" }
    };
    return descontos[plano] || null;
  };

  if (!localizacaoUsuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#F7D426] mb-4" />
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F7D426] to-[#FFE066] py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C2C2C] mb-2">
            🗺️ Mapa de Estabelecimentos Parceiros
          </h1>
          <p className="text-[#2C2C2C]/80">
            Encontre os melhores estabelecimentos perto de você
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Cidade ou Estado"
                value={buscaCidade}
                onChange={(e) => setBuscaCidade(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todas</SelectItem>
                <SelectItem value="Salão de Beleza">💇 Salão de Beleza</SelectItem>
                <SelectItem value="Clínica de Estética">💆 Clínica de Estética</SelectItem>
                <SelectItem value="Spa">🌿 Spa</SelectItem>
                <SelectItem value="Barbearia">✂️ Barbearia</SelectItem>
                <SelectItem value="Centro de Estética">✨ Centro de Estética</SelectItem>
                <SelectItem value="Consultório">🏥 Consultório</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroPlano} onValueChange={setFiltroPlano}>
              <SelectTrigger>
                <SelectValue placeholder="Plano Clube" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todos</SelectItem>
                <SelectItem value="light">💙 LIGHT (10%)</SelectItem>
                <SelectItem value="gold">💛 GOLD (15%)</SelectItem>
                <SelectItem value="vip">💜 VIP (25%)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ordenacao} onValueChange={setOrdenacao}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distancia">Mais Próximos</SelectItem>
                <SelectItem value="relevancia">Relevância</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleUsarMinhaLocalizacao}
              disabled={buscandoLocalizacao}
              className="bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold"
            >
              {buscandoLocalizacao ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  Minha Localização
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mapa + Lista */}
      <div className="grid lg:grid-cols-3 gap-0 h-[calc(100vh-280px)]">
        {/* Lista Lateral */}
        <div className="lg:col-span-1 bg-white border-r overflow-y-auto p-4">
          <div className="mb-4">
            <h2 className="font-bold text-lg text-gray-900 mb-2">
              📍 {estabelecimentosOrdenados.length} estabelecimentos encontrados
            </h2>
            {localizacaoUsuario && (
              <p className="text-sm text-gray-600">
                Mostrando por proximidade da sua localização
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#F7D426]" />
            </div>
          ) : estabelecimentosOrdenados.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum estabelecimento encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {estabelecimentosOrdenados.map((est) => {
                const descontoInfo = getDescontoInfo(est.plano_desconto);
                
                return (
                  <Card
                    key={est.id}
                    className="cursor-pointer hover:shadow-lg transition-all border-2 border-gray-200 hover:border-[#F7D426]"
                    onClick={() => handleCentralizarEstabelecimento(est)}
                  >
                    <CardContent className="p-4">
                      {/* Foto */}
                      {est.foto && (
                        <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                          <img
                            src={est.foto}
                            alt={est.nome}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Nome e Categoria */}
                      <div className="mb-3">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{est.nome}</h3>
                        <Badge variant="outline" className="text-xs">
                          {est.categoria}
                        </Badge>
                      </div>

                      {/* Endereço */}
                      <div className="flex items-start gap-2 mb-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{est.endereco}, {est.cidade} - {est.estado}</span>
                      </div>

                      {/* Distância */}
                      {est.distancia !== null && (
                        <div className="flex items-center gap-2 mb-3 text-sm">
                          <Navigation className="w-4 h-4 text-[#F7D426]" />
                          <span className="font-bold text-[#F7D426]">
                            {est.distancia.toFixed(1)} km de você
                          </span>
                        </div>
                      )}

                      {/* Desconto do Clube */}
                      {descontoInfo && (
                        <div className="mb-3">
                          <Badge className={`${descontoInfo.cor} font-bold`}>
                            <Crown className="w-3 h-3 mr-1" />
                            {descontoInfo.badge} - {descontoInfo.desconto} OFF
                          </Badge>
                        </div>
                      )}

                      {/* Horário */}
                      {est.horario_funcionamento && (
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{est.horario_funcionamento}</span>
                        </div>
                      )}

                      {/* Ações */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleComoChegar(est);
                          }}
                          className="flex-1 bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C]"
                          disabled={!localizacaoUsuario}
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          Como Chegar
                        </Button>

                        {est.whatsapp && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://wa.me/${est.whatsapp.replace(/\D/g, '')}`, '_blank');
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            WhatsApp
                          </Button>
                        )}

                        {est.telefone && !est.whatsapp && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`tel:${est.telefone}`, '_blank');
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Ligar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Mapa */}
        <div className="lg:col-span-2 relative">
          <MapContainer
            center={localizacaoUsuario ? [localizacaoUsuario.lat, localizacaoUsuario.lng] : [-15.7801, -47.9292]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {/* Marcador do Usuário */}
            {localizacaoUsuario && (
              <Marker
                position={[localizacaoUsuario.lat, localizacaoUsuario.lng]}
                icon={criarIconeUsuario()}
              >
                <Popup>
                  <div className="text-center p-2">
                    <p className="font-bold text-blue-600">📍 Você está aqui</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Marcadores dos Estabelecimentos */}
            {estabelecimentosOrdenados.map((est) => {
              if (!est.latitude || !est.longitude) return null;
              
              const descontoInfo = getDescontoInfo(est.plano_desconto);
              
              return (
                <Marker
                  key={est.id}
                  position={[est.latitude, est.longitude]}
                  icon={criarIconeEstabelecimento(est.categoria)}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-bold text-gray-900 mb-2">{est.nome}</h3>
                      
                      {descontoInfo && (
                        <Badge className={`${descontoInfo.cor} mb-2`}>
                          <Crown className="w-3 h-3 mr-1" />
                          {descontoInfo.badge} - {descontoInfo.desconto} OFF
                        </Badge>
                      )}
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {est.endereco}, {est.cidade}
                      </p>
                      
                      {est.distancia !== null && (
                        <p className="text-sm font-bold text-[#F7D426] mb-2">
                          📍 {est.distancia.toFixed(1)} km de você
                        </p>
                      )}
                      
                      {est.telefone && (
                        <p className="text-sm text-gray-600 mb-2">
                          📞 {est.telefone}
                        </p>
                      )}
                      
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => handleComoChegar(est)}
                          className="flex-1 bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C]"
                        >
                          Como Chegar
                        </Button>
                        {est.whatsapp && (
                          <Button
                            size="sm"
                            onClick={() => window.open(`https://wa.me/${est.whatsapp.replace(/\D/g, '')}`, '_blank')}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            WhatsApp
                          </Button>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Componente para centralizar */}
            {centralizarEm && <CentralizarMapa center={centralizarEm} />}
          </MapContainer>

          {/* Badge de Info no Mapa */}
          <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3 border-2 border-[#F7D426]">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-[#F7D426]" />
              <span className="font-bold text-gray-900">Legenda:</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                <span>Você</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">💇</span>
                <span>Salão de Beleza</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">💆</span>
                <span>Clínica de Estética</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🌿</span>
                <span>Spa</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info sobre Clube da Beleza */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            👑 Benefícios Exclusivos do Clube da Beleza
          </h3>
          <p className="text-gray-700 mb-4">
            Membros do clube têm descontos especiais em todos os estabelecimentos parceiros!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-base">
              💙 LIGHT - 10% OFF
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800 px-4 py-2 text-base">
              💛 GOLD - 15% OFF
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2 text-base">
              💜 VIP - 25% OFF
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}