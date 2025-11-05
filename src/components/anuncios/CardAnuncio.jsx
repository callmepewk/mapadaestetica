
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Eye, Star, Crown, Phone, Mail, Globe, Instagram, Facebook, X, Share2, Heart, Copy } from "lucide-react";
import { format } from "date-fns";

export default function CardAnuncio({ anuncio, destaque = false }) {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [imagemAtual, setImagemAtual] = useState(0);
  const [curtido, setCurtido] = useState(false);
  const [user, setUser] = useState(null);
  const [compartilhandoLink, setCompartilhandoLink] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Assuming base44 and its auth method are available globally or imported implicitly
        // If not, you might need an explicit import like: import { base44 } from 'path/to/base44';
        const userData = await base44.auth.me();
        setUser(userData);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  if (!anuncio) return null;

  // Admin nunca tem restrição, apenas usuários profissionais com plano cobre
  const isAdmin = user?.role === 'admin';
  const isPlanoGratuito = !isAdmin && (!user || user.plano_ativo === 'cobre' || !user.plano_ativo);

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

  const getTipoAnuncioInfo = (tipo) => {
    const info = {
      "servico": { texto: "Serviço", emoji: "💼", cor: "bg-blue-100 text-blue-800" },
      "procedimento": { texto: "Procedimento", emoji: "🔬", cor: "bg-purple-100 text-purple-800" },
      "tecnica": { texto: "Técnica", emoji: "✨", cor: "bg-pink-100 text-pink-800" },
      "consultorio": { texto: "Consultório", emoji: "🏢", cor: "bg-gray-100 text-gray-800" },
      "clinica": { texto: "Clínica", emoji: "🏥", cor: "bg-cyan-100 text-cyan-800" },
      "promocao": { texto: "Promoção", emoji: "🎁", cor: "bg-red-100 text-red-800" }
    };
    return info[tipo] || info["servico"];
  };

  const getFaixaPrecoInfo = (faixa) => {
    const info = {
      "$": { texto: "Até R$ 500", cor: "text-green-600" },
      "$$": { texto: "R$ 500 - R$ 1.000", cor: "text-blue-600" },
      "$$$": { texto: "R$ 1.000 - R$ 2.000", cor: "text-yellow-600" },
      "$$$$": { texto: "R$ 2.000 - R$ 5.000", cor: "text-orange-600" },
      "$$$$$": { texto: "Acima de R$ 5.000", cor: "text-red-600" }
    };
    return info[faixa] || info["$"];
  };

  const handleCurtir = async (e) => {
    e.stopPropagation();
    if (!user) {
      alert("Faça login para curtir anúncios!");
      return;
    }
    setCurtido(!curtido);
    
    try {
      const curtidasAtuais = anuncio.curtidas || 0;
      const novasCurtidas = curtido ? curtidasAtuais - 1 : curtidasAtuais + 1;
      // Assuming base44 and its entities method are available globally or imported implicitly
      await base44.entities.Anuncio.update(anuncio.id, {
        curtidas: novasCurtidas
      });
      anuncio.curtidas = novasCurtidas; // Update local anuncio object for immediate UI reflection
    } catch (error) {
      console.error("Erro ao curtir:", error);
      setCurtido(prev => !prev); // Revert state if API call fails
    }
  };

  const handleCompartilhar = (e) => {
    e.stopPropagation();
    const link = `${window.location.origin}/detalhes-anuncio?id=${anuncio.id}`;
    navigator.clipboard.writeText(link);
    setLinkCopiado(true);
    setTimeout(() => {
      setLinkCopiado(false);
      setCompartilhandoLink(false); // Close sharing options after copying
    }, 2000);
  };

  const abrirCompartilhamento = (e, rede) => {
    e.stopPropagation();
    const link = `${window.location.origin}/detalhes-anuncio?id=${anuncio.id}`;
    const texto = encodeURIComponent(`Confira: ${anuncio.titulo} - ${anuncio.profissional}`);
    const url = encodeURIComponent(link);
    
    const links = {
      whatsapp: `https://wa.me/?text=${texto}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${texto}&url=${url}`
    };

    window.open(links[rede], '_blank', 'width=600,height=400');
    setCompartilhandoLink(false); // Close sharing options after opening social media
  };

  const isPremium = anuncio?.plano === 'premium' || anuncio?.plano === 'platina';
  const todasImagens = [anuncio.imagem_principal, ...(anuncio.imagens_galeria || [])].filter(Boolean);

  return (
    <>
      <Card
        onClick={() => {
          window.location.href = `/detalhes-anuncio?id=${anuncio.id}`;
        }}
        className={`overflow-hidden group hover:shadow-2xl transition-shadow duration-200 border-none h-full flex flex-col cursor-pointer ${
          isPremium ? 'ring-2 ring-[#F7D426]' : ''
        }`}
      >
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
          {anuncio.imagem_principal ? (
            <img
              src={anuncio.imagem_principal}
              alt={anuncio.titulo}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">✨</div>
          )}

          {isPremium && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-[#F7D426] to-yellow-500 text-[#2C2C2C] border-none shadow-lg font-bold">
                <Crown className="w-3 h-3 mr-1 fill-[#2C2C2C]" />
                PREMIUM
              </Badge>
            </div>
          )}

          {destaque && !isPremium && (
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

          {anuncio.logo && (
            <div className="absolute bottom-3 left-3">
              <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                <AvatarImage src={anuncio.logo} loading="lazy" />
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white text-xl">
                  {anuncio.profissional?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        <CardContent className="p-4 flex flex-col flex-1">
          <div className="mb-3 flex items-center gap-2 flex-wrap">
            {anuncio.tipo_anuncio && (
              <Badge className={getTipoAnuncioInfo(anuncio.tipo_anuncio).cor}>
                {getTipoAnuncioInfo(anuncio.tipo_anuncio).emoji} {getTipoAnuncioInfo(anuncio.tipo_anuncio).texto}
              </Badge>
            )}
            <Badge className={getCategoriaColor(anuncio.categoria)}>
              {anuncio.categoria}
            </Badge>
            {anuncio.subcategoria && (
              <Badge variant="outline" className="text-xs">
                {anuncio.subcategoria}
              </Badge>
            )}
            {anuncio.profissional_verificado && (
              <Badge className="bg-blue-100 text-blue-800">
                ✓ Verificado
              </Badge>
            )}
          </div>

          <h3 className="font-bold text-xl mb-2 line-clamp-2">
            {anuncio.titulo}
          </h3>

          <p className="text-sm font-semibold text-gray-700 mb-2">
            {anuncio.profissional}
          </p>

          {anuncio.categoria_clinica && (
            <p className="text-xs text-gray-600 mb-2">
              {anuncio.categoria_clinica}
            </p>
          )}

          {anuncio.tipo_estabelecimento && (
            <Badge variant="outline" className="mb-2 w-fit text-xs">
              {anuncio.tipo_estabelecimento}
            </Badge>
          )}

          {anuncio.estrelas_estabelecimento && (
            <div className="flex gap-1 mb-2">
              {Array.from({ length: anuncio.estrelas_estabelecimento }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          )}

          {/* Faixa de Preço */}
          {anuncio.faixa_preco && (
            <div className="mb-3 bg-gradient-to-r from-green-50 to-blue-50 p-2 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${getFaixaPrecoInfo(anuncio.faixa_preco).cor}`}>
                  {anuncio.faixa_preco}
                </span>
                <span className="text-xs text-gray-600">
                  {getFaixaPrecoInfo(anuncio.faixa_preco).texto}
                </span>
              </div>
            </div>
          )}

          {/* Status de Funcionamento */}
          {anuncio.status_funcionamento && anuncio.status_funcionamento !== "N/D" && (
            <div className="mb-2">
              <Badge className={`${getStatusColor(anuncio.status_funcionamento)} text-xs`}>
                <Clock className="w-3 h-3 mr-1" />
                {anuncio.status_funcionamento}
              </Badge>
            </div>
          )}

          {/* Horário de Funcionamento */}
          {anuncio.horario_funcionamento && (
            <div className="mb-3 bg-gray-50 p-2 rounded-lg">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-700">Horário:</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{anuncio.horario_funcionamento}</p>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1">
            {anuncio.descricao}
          </p>

          {anuncio.procedimentos_servicos && anuncio.procedimentos_servicos.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">Procedimentos:</p>
              <div className="flex flex-wrap gap-1">
                {anuncio.procedimentos_servicos.slice(0, 3).map((proc, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{proc}</Badge>
                ))}
                {anuncio.procedimentos_servicos.length > 3 && (
                  <Badge variant="outline" className="text-xs">+{anuncio.procedimentos_servicos.length - 3}</Badge>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 flex-shrink-0 text-pink-600" />
              <span className="truncate">{anuncio.cidade}, {anuncio.estado}</span>
            </div>

            {anuncio.telefone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 flex-shrink-0 text-pink-600" />
                <span>{anuncio.telefone}</span>
              </div>
            )}

          </div>

          {anuncio.amenidades && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {anuncio.amenidades.estacionamento && <Badge variant="outline" className="text-xs">🅿️ Estacionamento</Badge>}
                {anuncio.amenidades.aceita_pet && <Badge variant="outline" className="text-xs">🐕 Pet Friendly</Badge>}
                {anuncio.amenidades.lounge && <Badge variant="outline" className="text-xs">🛋️ Lounge</Badge>}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {anuncio.visualizacoes || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {anuncio.curtidas || 0}
              </span>
            </div>

            {anuncio.created_date && (
              <span className="text-xs text-gray-400">
                {format(new Date(anuncio.created_date), "dd/MM/yyyy")}
              </span>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2 pt-4 border-t mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCurtir}
              className={`flex-1 ${curtido ? 'text-red-600' : 'text-gray-600'}`}
            >
              <Heart className={`w-4 h-4 mr-2 ${curtido ? 'fill-red-600' : ''}`} />
              {curtido ? 'Curtido' : 'Curtir'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setCompartilhandoLink(!compartilhandoLink);
              }}
              className="flex-1 text-blue-600"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {linkCopiado ? 'Link Copiado!' : 'Compartilhar'}
            </Button>
          </div>

          {/* Opções de Compartilhamento */}
          {compartilhandoLink && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={(e) => abrirCompartilhamento(e, 'whatsapp')} className="flex-1 bg-green-50 text-green-700">
                  WhatsApp
                </Button>
                <Button size="sm" variant="outline" onClick={(e) => abrirCompartilhamento(e, 'facebook')} className="flex-1 bg-blue-50 text-blue-700">
                  Facebook
                </Button>
                <Button size="sm" variant="outline" onClick={(e) => abrirCompartilhamento(e, 'twitter')} className="flex-1 bg-sky-50 text-sky-700">
                  Twitter
                </Button>
              </div>
              <Button size="sm" variant="outline" onClick={handleCompartilhar} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Copiar Link
              </Button>
            </div>
          )}

          <Button
            onClick={(e) => { e.stopPropagation(); setDialogAberto(true); }}
            className="w-full mt-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
          >
            Ver Mais Detalhes
          </Button>
        </CardContent>
      </Card>

      {/* Dialog com TODAS as informações */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
          <button
            onClick={() => setDialogAberto(false)}
            className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="grid lg:grid-cols-3 gap-0">
            {/* Coluna Esquerda - Imagens e Info Principal */}
            <div className="lg:col-span-2">
              {/* Galeria de Imagens */}
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
                <div className="p-4 flex gap-2 overflow-x-auto bg-gray-50">
                  {todasImagens.map((img, index) => (
                    <button key={index} onClick={() => setImagemAtual(index)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${imagemAtual === index ? "border-pink-500" : "border-gray-200"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Informações Principais */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {anuncio.tipo_anuncio && (
                        <Badge className={getTipoAnuncioInfo(anuncio.tipo_anuncio).cor}>
                          {getTipoAnuncioInfo(anuncio.tipo_anuncio).emoji} {getTipoAnuncioInfo(anuncio.tipo_anuncio).texto}
                        </Badge>
                      )}
                      <Badge className={getCategoriaColor(anuncio.categoria)}>{anuncio.categoria}</Badge>
                      {isPremium && (
                        <Badge className="bg-gradient-to-r from-[#F7D426] to-yellow-500 text-[#2C2C2C]">
                          <Crown className="w-3 h-3 mr-1" /> PREMIUM
                        </Badge>
                      )}
                      {anuncio.profissional_verificado && (
                        <Badge className="bg-blue-500 text-white">✓ Verificado</Badge>
                      )}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{anuncio.titulo}</h2>
                    <div className="flex items-center gap-2 mb-2">
                      {anuncio.logo && (
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={anuncio.logo} />
                          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-500 text-white">
                            {anuncio.profissional?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <p className="font-semibold">{anuncio.profissional}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Eye className="w-3 h-3" />
                          <span>{anuncio.visualizacoes || 0} visualizações</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* These buttons are left untouched as per instructions, they don't have onClick events in the original code */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon"><Share2 className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon"><Heart className="w-4 h-4" /></Button>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-6">
                  {/* Faixa de Preço DESTACADA */}
                  {anuncio.faixa_preco && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-200">
                      <h3 className="font-semibold text-sm text-gray-700 mb-2">💰 Faixa de Preço dos Serviços</h3>
                      <div className="flex items-center gap-3">
                        <span className={`text-4xl font-bold ${getFaixaPrecoInfo(anuncio.faixa_preco).cor}`}>
                          {anuncio.faixa_preco}
                        </span>
                        <div>
                          <p className="font-semibold text-lg">{getFaixaPrecoInfo(anuncio.faixa_preco).texto}</p>
                          <p className="text-xs text-gray-500">Valores aproximados dos serviços</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Sobre</h3>
                    <p className="text-gray-600 leading-relaxed">{anuncio.descricao}</p>
                  </div>

                  {anuncio.servicos_oferecidos && anuncio.servicos_oferecidos.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Serviços Oferecidos</h3>
                      <div className="space-y-2">
                        {anuncio.servicos_oferecidos.map((servico, index) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{servico.nome}</p>
                              {servico.duracao && <p className="text-sm text-gray-500">Duração: {servico.duracao}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {anuncio.procedimentos_servicos && anuncio.procedimentos_servicos.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Procedimentos</h3>
                      <div className="flex flex-wrap gap-2">
                        {anuncio.procedimentos_servicos.map((proc, index) => (
                          <Badge key={index} variant="outline">{proc}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {anuncio.tags && anuncio.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {anuncio.tags.map((tag, index) => (
                          <Badge key={index} className="bg-purple-100 text-purple-800">{tag}</Badge>
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
                      <Badge className={`mt-2 ${getStatusColor(anuncio.status_funcionamento)}`}>
                        {anuncio.status_funcionamento || "N/D"}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Coluna Direita - Contatos */}
            <div className="bg-gray-50 p-6">
              <h3 className="font-semibold text-lg mb-4">Informações de Contato</h3>

              <div className="space-y-3">
                {anuncio.telefone && (
                  <a href={`tel:${anuncio.telefone}`} className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                    <Phone className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="text-xs text-gray-500">Telefone</p>
                      <p className="font-medium">{anuncio.telefone}</p>
                    </div>
                  </a>
                )}

                {anuncio.whatsapp && (
                  isPlanoGratuito ? (
                    <div className="relative">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-2 border-green-200">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">W</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">WhatsApp</p>
                          <p className="font-medium text-green-700 blur-sm select-none">({anuncio.whatsapp.substring(0, 2)}) *****-****</p>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          <Crown className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-sm text-yellow-900 mb-1">🔒 Conteúdo Bloqueado</p>
                            <p className="text-xs text-yellow-800 mb-3">
                              Faça upgrade do seu plano para visualizar o WhatsApp e contatar diretamente os profissionais!
                            </p>
                            <a 
                              href={`https://wa.me/5531972595643?text=${encodeURIComponent("Olá! Gostaria de fazer upgrade do meu plano para acessar os contatos dos profissionais! 💆‍♀️")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700">
                                <Crown className="w-4 h-4 mr-2" />
                                Fazer Upgrade
                              </Button>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <a href={`https://wa.me/${anuncio.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
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
                  <a href={`mailto:${anuncio.email}`} className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                    <Mail className="w-5 h-5 text-pink-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium truncate">{anuncio.email}</p>
                    </div>
                  </a>
                )}

                {anuncio.site && (
                  <a href={anuncio.site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                    <Globe className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="text-xs text-gray-500">Website</p>
                      <p className="font-medium">Visitar site</p>
                    </div>
                  </a>
                )}

                <Separator />

                {(anuncio.instagram || anuncio.facebook) && (
                  <>
                    <p className="text-sm font-medium text-gray-600">Redes Sociais</p>
                    <div className="flex gap-2">
                      {anuncio.instagram && (
                        <a href={anuncio.instagram} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90">
                          <Instagram className="w-4 h-4" />
                          <span className="text-sm font-medium">Instagram</span>
                        </a>
                      )}
                      {anuncio.facebook && (
                        <a href={anuncio.facebook} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 p-2 bg-blue-600 text-white rounded-lg hover:opacity-90">
                          <Facebook className="w-4 h-4" />
                          <span className="text-sm font-medium">Facebook</span>
                        </a>
                      )}
                    </div>
                    <Separator />
                  </>
                )}

                <div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="font-medium">{anuncio.cidade}, {anuncio.estado}</p>
                      {anuncio.endereco && <p className="text-sm text-gray-500">{anuncio.endereco}</p>}
                      {anuncio.cep && <p className="text-sm text-gray-500">CEP: {anuncio.cep}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
