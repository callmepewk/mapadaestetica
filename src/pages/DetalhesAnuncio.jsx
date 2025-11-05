
import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, Phone, Mail, Globe, Clock, Instagram, Facebook, ArrowLeft, Share2, Heart, Eye, Calendar, Lock, Crown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import SecaoPerguntas from "../components/anuncios/SecaoPerguntas";
import ImpulsionarAnuncioModal from "../components/anuncios/ImpulsionarAnuncioModal";
import SecaoComentarios from "../components/anuncios/SecaoComentarios";

export default function DetalhesAnuncio() {
  const navigate = useNavigate();
  const [anuncio, setAnuncio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagemAtual, setImagemAtual] = useState(0);
  const [user, setUser] = useState(null);
  const [erro, setErro] = useState(null);
  const [curtido, setCurtido] = useState(false);
  const [compartilhando, setCompartilhando] = useState(false);
  const [mostrarImpulsionar, setMostrarImpulsionar] = useState(false);

  useEffect(() => {
    let mounted = true;

    const carregarDados = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');

      if (!id) {
        if (mounted) {
          setErro("ID do anúncio não fornecido");
          setLoading(false);
        }
        return;
      }

      try {
        // Buscar usuário
        try {
          const userData = await base44.auth.me();
          if (mounted) {
            setUser(userData);
            
            // Verificar se já curtiu
            const anunciosCurtidos = userData.anuncios_curtidos || [];
            if (anunciosCurtidos.includes(id)) {
              setCurtido(true);
            }
          }
        } catch {
          if (mounted) setUser(null);
        }

        // Buscar anúncio pelo ID
        console.log("Buscando anúncio com ID:", id);
        
        // Buscar usando filter com exact match no ID
        const anuncios = await base44.entities.Anuncio.list();
        const anuncioEncontrado = anuncios.find(a => a.id === id);
        
        console.log("Anúncio encontrado:", anuncioEncontrado);
        
        if (mounted) {
          if (anuncioEncontrado) {
            setAnuncio(anuncioEncontrado);
            // Incrementar visualizações
            try {
              await base44.entities.Anuncio.update(id, {
                visualizacoes: (anuncioEncontrado.visualizacoes || 0) + 1
              });
            } catch (err) {
              console.log("Erro ao incrementar visualizações:", err);
            }
          } else {
            setErro("Anúncio não encontrado");
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("Erro ao carregar:", error);
        if (mounted) {
          setErro("Erro ao carregar anúncio");
          setLoading(false);
        }
      }
    };

    carregarDados();

    return () => {
      mounted = false;
    };
  }, []);

  const todasImagens = anuncio ? [
    anuncio.imagem_principal,
    ...(anuncio.imagens_galeria || [])
  ].filter(Boolean) : [];

  const isPaciente = user?.tipo_usuario === 'paciente';
  const isAdmin = user?.role === 'admin';
  // Admin nunca tem restrição
  // Apenas plano COBRE tem restrição para WhatsApp
  const isUserFree = !isAdmin && (!user || user.plano_ativo === 'cobre' || !user.plano_ativo);
  
  // Para curtir e compartilhar: apenas plano COBRE profissional tem restrição
  const isPlanoCobre = user?.tipo_usuario === 'profissional' && (!user.plano_ativo || user.plano_ativo === 'cobre');
  const temRestricaoAcoes = !isAdmin && isPlanoCobre;

  const isAutor = user && anuncio && user.email === anuncio.created_by;
  const isProfissionalAutor = isAutor && user?.tipo_usuario === 'profissional';

  const handleCurtir = async () => {
    if (!user) {
      alert("Faça login para curtir!");
      return;
    }

    if (temRestricaoAcoes) {
      alert("Faça upgrade do seu plano para curtir anúncios!");
      return;
    }

    const novoCurtidoState = !curtido;
    setCurtido(novoCurtidoState);

    try {
      const usuarios_curtiram = anuncio.usuarios_curtiram || [];
      const novosUsuarios = novoCurtidoState 
        ? [...usuarios_curtiram, user.email]
        : usuarios_curtiram.filter(email => email !== user.email);
      
      const novasCurtidas = novoCurtidoState ? (anuncio.curtidas || 0) + 1 : Math.max((anuncio.curtidas || 0) - 1, 0);
      
      await base44.entities.Anuncio.update(anuncio.id, {
        curtidas: novasCurtidas,
        usuarios_curtiram: novosUsuarios
      });

      const anuncios_curtidos = user.anuncios_curtidos || [];
      const novosAnunciosCurtidos = novoCurtidoState
        ? [...anuncios_curtidos, anuncio.id]
        : anuncios_curtidos.filter(id => id !== anuncio.id);
      
      await base44.auth.updateMe({ anuncios_curtidos: novosAnunciosCurtidos });
      
      setUser({ ...user, anuncios_curtidos: novosAnunciosCurtidos });
      setAnuncio(prevAnuncio => ({
        ...prevAnuncio,
        curtidas: novasCurtidas,
        usuarios_curtiram: novosUsuarios
      }));
    } catch (error) {
      console.error("Erro ao curtir:", error);
      setCurtido(!novoCurtidoState);
      alert("Erro ao curtir/descurtir. Tente novamente.");
    }
  };

  const handleCompartilhar = () => {
    if (!user) {
      alert("Faça login para compartilhar!");
      return;
    }

    if (temRestricaoAcoes) {
      alert("Faça upgrade do seu plano para compartilhar anúncios!");
      return;
    }

    const link = `${window.location.origin}${createPageUrl("DetalhesAnuncio")}?id=${anuncio.id}`;
    navigator.clipboard.writeText(link);
    setCompartilhando(true);
    setTimeout(() => setCompartilhando(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando anúncio...</p>
        </div>
      </div>
    );
  }

  if (erro || !anuncio) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md mx-4">
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {erro || "Anúncio não encontrado"}
          </h3>
          <p className="text-gray-600 mb-6">
            Este anúncio não existe ou foi removido.
          </p>
          <Button
            onClick={() => navigate(createPageUrl("Anuncios"))}
            className="bg-gradient-to-r from-pink-600 to-rose-600"
          >
            Voltar para Anúncios
          </Button>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Button variant="ghost" onClick={() => navigate(createPageUrl("Anuncios"))} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden border-none shadow-lg">
              <div className="relative h-96 bg-gray-100">
                {todasImagens.length > 0 ? (
                  <img src={todasImagens[imagemAtual]} alt={anuncio.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-8xl">✨</div>
                )}
                {todasImagens.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {todasImagens.map((_, index) => (
                      <button key={index} onClick={() => setImagemAtual(index)} className={`w-2 h-2 rounded-full transition-all ${imagemAtual === index ? "bg-white w-8" : "bg-white/50"}`} />
                    ))}
                  </div>
                )}
              </div>
              {todasImagens.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {todasImagens.map((img, index) => (
                    <button key={index} onClick={() => setImagemAtual(index)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${imagemAtual === index ? "border-pink-500" : "border-gray-200"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Badge className="mb-3 bg-pink-100 text-pink-800">{anuncio.categoria}</Badge>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{anuncio.titulo}</h1>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={anuncio.logo} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                          {anuncio.profissional?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{anuncio.profissional}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Eye className="w-3 h-3" />
                          <span>{anuncio.visualizacoes || 0} visualizações</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* Botão Impulsionar - Apenas para o autor profissional */}
                    {isProfissionalAutor && (
                      <Button
                        onClick={() => setMostrarImpulsionar(true)}
                        className="bg-gradient-to-r from-[#F7D426] to-[#FFE066] hover:from-[#E5C215] hover:to-[#F7D426] text-[#2C2C2C] font-bold border-2 border-[#2C2C2C]"
                      >
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Impulsionar
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleCurtir}
                      disabled={temRestricaoAcoes}
                      className={curtido ? 'text-red-600 border-red-600' : ''}
                    >
                      <Heart className={`w-4 h-4 ${curtido ? 'fill-red-600' : ''}`} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleCompartilhar}
                      disabled={temRestricaoAcoes}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {compartilhando && (
                  <Alert className="mb-4 bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800">
                      Link copiado para área de transferência!
                    </AlertDescription>
                  </Alert>
                )}
                <Separator className="my-6" />
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Sobre</h3>
                    <p className="text-gray-600 leading-relaxed">{anuncio.descricao}</p>
                  </div>
                  {anuncio.servicos_oferecidos && anuncio.servicos_oferecidos.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Serviços Oferecidos</h3>
                      <div className="space-y-2">
                        {anuncio.servicos_oferecidos.map((servico, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{servico.nome}</p>
                              {servico.duracao && <p className="text-sm text-gray-500">Duração: {servico.duracao}</p>}
                            </div>
                            {servico.preco && <p className="font-semibold text-pink-600">R$ {servico.preco.toFixed(2)}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Seção de Perguntas e Respostas - SEMPRE VISÍVEL */}
            <SecaoPerguntas
              anuncio={anuncio}
              user={user}
              isAutor={isAutor}
            />

            {/* NOVO: Seção de Comentários - Logo após perguntas */}
            <SecaoComentarios
              anuncio={anuncio}
              user={user}
            />
          </div>

          <div className="space-y-6">
            {(isUserFree || isPaciente) && (
              <Alert className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300">
                <Lock className="h-5 w-5 text-yellow-600" />
                <AlertDescription className="text-yellow-900">
                  <p className="font-semibold mb-2">{isPaciente ? "🔒 Acesso Limitado" : "🔒 Plano FREE/Cobre"}</p>
                  <p className="text-sm mb-3">{isPaciente ? "Pacientes têm acesso limitado." : "Faça upgrade para acesso completo!"}</p>
                  {!isPaciente && <Button onClick={() => navigate(createPageUrl("Planos"))} className="w-full bg-gradient-to-r from-yellow-600 to-amber-600" size="sm"><Crown className="w-4 h-4 mr-2" />Ver Planos</Button>}
                </AlertDescription>
              </Alert>
            )}

            <Card className="border-none shadow-lg sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-4">Informações de Contato</h3>
                {anuncio.telefone && (
                  <a href={`tel:${anuncio.telefone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <Phone className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="text-xs text-gray-500">Telefone</p>
                      <p className="font-medium">{anuncio.telefone}</p>
                    </div>
                  </a>
                )}
                
                {anuncio.whatsapp && (
                  (isUserFree && !isAdmin) ? (
                    <div className="relative">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-2 border-green-200">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center"><span className="text-white font-bold">W</span></div>
                        <div>
                          <p className="text-xs text-gray-500">WhatsApp</p>
                          <p className="font-medium text-green-700 blur-sm select-none">({anuncio.whatsapp.substring(0, 2)}) *****-****</p>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Lock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-sm text-yellow-900 mb-1">🔒 Plano Gratuito</p>
                            <p className="text-xs text-yellow-800 mb-3">
                              Faça upgrade do seu plano para visualizar o WhatsApp e contatar diretamente os profissionais!
                            </p>
                            <Button 
                              onClick={() => navigate(createPageUrl("Planos"))}
                              size="sm" 
                              className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700"
                            >
                              <Crown className="w-4 h-4 mr-2" />
                              Ver Planos
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <a href={`https://wa.me/${anuncio.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center"><span className="text-white font-bold">W</span></div>
                      <div>
                        <p className="text-xs text-gray-500">WhatsApp</p>
                        <p className="font-medium text-green-700">Enviar mensagem</p>
                      </div>
                    </a>
                  )
                )}

                {/* Horário de Funcionamento */}
                {anuncio.horario_funcionamento && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-start gap-2 mb-2">
                        <Clock className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1">Horário de Funcionamento</p>
                          <p className="text-sm text-gray-600">{anuncio.horario_funcionamento}</p>
                          {anuncio.status_funcionamento && anuncio.status_funcionamento !== "N/D" && (
                            <Badge className={`mt-2 ${getStatusColor(anuncio.status_funcionamento)}`}>
                              {anuncio.status_funcionamento}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                <Separator />
                <div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="font-medium">{anuncio.cidade}, {anuncio.estado}</p>
                      {anuncio.endereco && <p className="text-sm text-gray-500">{anuncio.endereco}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Impulsionar Anúncio */}
      {isProfissionalAutor && (
        <ImpulsionarAnuncioModal
          open={mostrarImpulsionar}
          onClose={() => setMostrarImpulsionar(false)}
          anuncio={anuncio}
        />
      )}
    </div>
  );

  function getStatusColor(status) {
    const colors = {
      "Aberto Agora": "bg-green-100 text-green-800 border-green-200",
      "Fechado": "bg-red-100 text-red-800 border-red-200",
      "Sempre Aberto": "bg-blue-100 text-blue-800 border-blue-200",
      "N/D": "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[status] || colors["N/D"];
  }
}
