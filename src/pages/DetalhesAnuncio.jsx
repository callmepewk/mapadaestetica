
import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Instagram,
  Facebook,
  ArrowLeft,
  Share2,
  Heart,
  Eye,
  Calendar,
  Lock,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DetalhesAnuncio() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [anuncioId, setAnuncioId] = useState(null);
  const [imagemAtual, setImagemAtual] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    setAnuncioId(id);

    // Buscar usuário autenticado
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // CARREGAMENTO INSTANTÂNEO
  const { data: anuncio, isLoading } = useQuery({
    queryKey: ['anuncio', anuncioId],
    queryFn: async () => {
      const anuncios = await base44.entities.Anuncio.filter({ id: anuncioId });
      return anuncios[0];
    },
    enabled: !!anuncioId,
    staleTime: 15 * 60 * 1000, // 15 minutos
    cacheTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const incrementarVisualizacoesMutation = useMutation({
    mutationFn: async () => {
      if (anuncio) {
        await base44.entities.Anuncio.update(anuncio.id, {
          visualizacoes: (anuncio.visualizacoes || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['anuncio', anuncioId]);
    },
  });

  useEffect(() => {
    if (anuncio && !isLoading) {
      incrementarVisualizacoesMutation.mutate();
    }
  }, [anuncio?.id]);

  // Renderização instantânea com skeleton leve
  if (!anuncio) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-32 bg-gray-200 rounded" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 bg-gray-200 rounded-xl" />
                <div className="h-64 bg-gray-200 rounded-xl" />
              </div>
              <div className="h-96 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const todasImagens = [
    anuncio.imagem_principal,
    ...(anuncio.imagens_galeria || [])
  ].filter(Boolean);

  // Verificar se usuário é free
  const isUserFree = !user || user.plano_ativo === 'free' || !user.plano_ativo;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Anuncios"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Anúncios
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden border-none shadow-lg">
              <div className="relative h-96 bg-gray-100">
                {todasImagens.length > 0 ? (
                  <img
                    src={todasImagens[imagemAtual]}
                    alt={anuncio.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-8xl">
                    ✨
                  </div>
                )}

                {todasImagens.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {todasImagens.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setImagemAtual(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          imagemAtual === index
                            ? "bg-white w-8"
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {todasImagens.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {todasImagens.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setImagemAtual(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        imagemAtual === index
                          ? "border-pink-500"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${anuncio.titulo} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Info Card */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Badge className="mb-3 bg-pink-100 text-pink-800">
                      {anuncio.categoria}
                    </Badge>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {anuncio.titulo}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={anuncio.logo} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                          {anuncio.profissional?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{anuncio.profissional}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Eye className="w-3 h-3" />
                          <span>{anuncio.visualizacoes || 0} visualizações</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Sobre</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {anuncio.descricao}
                    </p>
                  </div>

                  {anuncio.servicos_oferecidos && anuncio.servicos_oferecidos.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Serviços Oferecidos</h3>
                      <div className="space-y-2">
                        {anuncio.servicos_oferecidos.map((servico, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{servico.nome}</p>
                              {servico.duracao && (
                                <p className="text-sm text-gray-500">
                                  Duração: {servico.duracao}
                                </p>
                              )}
                            </div>
                            {servico.preco && (
                              <p className="font-semibold text-pink-600">
                                R$ {servico.preco.toFixed(2)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {anuncio.horario_funcionamento && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Horário de Funcionamento
                      </h3>
                      <p className="text-gray-600">{anuncio.horario_funcionamento}</p>
                      <Badge className={`mt-2 ${
                        anuncio.status_funcionamento === "Aberto Agora"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {anuncio.status_funcionamento}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Free Plan Restriction Alert */}
            {isUserFree && (
              <Alert className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300">
                <Lock className="h-5 w-5 text-yellow-600" />
                <AlertDescription className="text-yellow-900">
                  <p className="font-semibold mb-2">🔒 Recursos Limitados no Plano FREE</p>
                  <p className="text-sm mb-3">
                    Faça upgrade para ter acesso completo aos contatos dos profissionais!
                  </p>
                  <Button
                    onClick={() => navigate(createPageUrl("Planos"))}
                    className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700"
                    size="sm"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Ver Planos
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Contact Card */}
            <Card className="border-none shadow-lg sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-4">Informações de Contato</h3>

                {anuncio.telefone && (
                  <a
                    href={`tel:${anuncio.telefone}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="text-xs text-gray-500">Telefone</p>
                      <p className="font-medium">{anuncio.telefone}</p>
                    </div>
                  </a>
                )}

                {anuncio.whatsapp && (
                  isUserFree ? (
                    <div className="relative">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">W</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">WhatsApp</p>
                          <div className="relative inline-block">
                            <p className="font-medium text-green-700 blur-sm select-none">
                              ({anuncio.whatsapp.substring(0, 2)}) *****-****
                            </p>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Lock className="w-4 h-4 text-green-700" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-center text-gray-600">
                        <Lock className="w-3 h-3 inline mr-1" />
                        Faça upgrade para ver o WhatsApp
                      </div>
                    </div>
                  ) : (
                    <a
                      href={`https://wa.me/${anuncio.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">W</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">WhatsApp</p>
                        <p className="font-medium text-green-700">Enviar mensagem</p>
                      </div>
                    </a>
                  )
                )}

                {anuncio.email && (
                  <a
                    href={`mailto:${anuncio.email}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-pink-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium truncate">{anuncio.email}</p>
                    </div>
                  </a>
                )}

                {anuncio.site && (
                  <a
                    href={anuncio.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Globe className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="text-xs text-gray-500">Website</p>
                      <p className="font-medium">Visitar site</p>
                    </div>
                  </a>
                )}

                <Separator />

                {/* Social Media */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Redes Sociais</p>
                  <div className="flex gap-2">
                    {anuncio.instagram && (
                      <a
                        href={anuncio.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <Instagram className="w-4 h-4" />
                        <span className="text-sm font-medium">Instagram</span>
                      </a>
                    )}
                    {anuncio.facebook && (
                      <a
                        href={anuncio.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Facebook className="w-4 h-4" />
                        <span className="text-sm font-medium">Facebook</span>
                      </a>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Location */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="font-medium">{anuncio.cidade}, {anuncio.estado}</p>
                      {anuncio.endereco && (
                        <p className="text-sm text-gray-500">{anuncio.endereco}</p>
                      )}
                    </div>
                  </div>
                </div>

                {anuncio.created_date && (
                  <div className="pt-4 border-t text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Anúncio criado em {format(new Date(anuncio.created_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
