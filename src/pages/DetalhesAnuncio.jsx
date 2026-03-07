import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapPin, Phone, Mail, Globe, Clock, Instagram, Facebook, ArrowLeft, Share2, Heart, Eye, Calendar, Lock, Crown, TrendingUp, CheckCircle, Star, Award, DollarSign, Navigation, Pencil } from "lucide-react";
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
import LoginPromptModal from "../components/home/LoginPromptModal";

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
  const [mostrarLoginPrompt, setMostrarLoginPrompt] = useState(false);

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
          if (mounted) {
            setUser(null);
            // USUÁRIO NÃO LOGADO - MOSTRAR MODAL
            // This is temporary, the user should only be redirected if no user is found,
            // not if an error occurs while fetching user.
            // For now, if an error happens in base44.auth.me(), it assumes no user is logged in.
            // setMostrarLoginPrompt(true); 
            // setLoading(false);
          }
          // Continue to load ad even if user is not logged in.
        }

        // Buscar anúncio pelo ID
        const anuncios = await base44.entities.Anuncio.list();
        const anuncioEncontrado = anuncios.find(a => a.id === id);
        
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
  const isUserFree = !isAdmin && (!user || user.plano_ativo === 'cobre' || !user.plano_ativo);
  const isPlanoCobre = user?.tipo_usuario === 'profissional' && (!user.plano_ativo || user.plano_ativo === 'cobre');
  const temRestricaoAcoes = !isAdmin && isPlanoCobre;
  const isAutor = user && anuncio && user.email === anuncio.created_by;
  const isProfissionalAutor = isAutor && user?.tipo_usuario === 'profissional';

  const handleCurtir = async () => {
    if (!user) {
      setMostrarLoginPrompt(true); // Show login prompt if not logged in
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
      alert("Erro ao processar curtida. Tente novamente.");
    }
  };

  const handleCompartilhar = () => {
    if (!user) {
      setMostrarLoginPrompt(true); // Show login prompt if not logged in
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

  // SE NÃO TEM USUÁRIO, MOSTRAR MODAL DE LOGIN
  // This logic is now handled by individual actions (curtir, compartilhar)
  // and removed from the main render flow for better user experience.
  // If the user is not logged in, they can still view the ad but actions are restricted.

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

  // SEO & Open Graph & Structured Data
  useEffect(() => {
    if (!anuncio) return;
    const slugify = (s) => s
      .toLowerCase()
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    const cidade = anuncio.cidade ? slugify(anuncio.cidade) : 'cidade';
    const categoria = anuncio.categoria ? slugify(anuncio.categoria) : 'categoria';
    const nome = (anuncio.profissional || anuncio.titulo || 'profissional');

    const title = `${anuncio.categoria || 'Serviço'} em ${anuncio.cidade || ''} | ${nome}`.trim();
    const description = `${nome} oferece ${anuncio.categoria || 'serviços estéticos'} em ${anuncio.cidade || ''}. ${anuncio.descricao?.slice(0,120) || ''}`.trim();

    document.title = title;
    const setMeta = (attr, key, val) => {
      let tag = document.querySelector(`${attr}[${key}="${val.name}"]`);
      if (!tag) { tag = document.createElement('meta'); tag.setAttribute(key, val.name); document.head.appendChild(tag); }
      tag.setAttribute('content', val.content);
    };
    // Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc); }
    metaDesc.setAttribute('content', description);

    // Open Graph
    const origin = window.location.origin;
    const url = `${origin}/${cidade}/${categoria}/${slugify(nome)}`;
    const image = anuncio.imagem_principal || anuncio.logo || '';
    const ogTags = [
      { name: 'og:title', content: title },
      { name: 'og:description', content: description },
      { name: 'og:type', content: 'website' },
      { name: 'og:url', content: url },
      { name: 'og:image', content: image },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image }
    ];
    ogTags.forEach(({ name, content }) => {
      let tag = document.querySelector(`meta[property="${name}"]`) || document.querySelector(`meta[name="${name}"]`);
      if (!tag) { tag = document.createElement('meta'); if (name.startsWith('og:')) tag.setAttribute('property', name); else tag.setAttribute('name', name); document.head.appendChild(tag); }
      tag.setAttribute('content', content || '');
    });

    // Structured Data (LocalBusiness)
    const scriptId = 'ld-localbusiness';
    const old = document.getElementById(scriptId); if (old) old.remove();
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: nome,
      image: image ? [image] : undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: [anuncio.rua, anuncio.numero].filter(Boolean).join(', '),
        addressLocality: anuncio.cidade,
        addressRegion: anuncio.estado,
        postalCode: anuncio.cep,
        addressCountry: 'BR'
      },
      telephone: anuncio.telefone || anuncio.whatsapp || undefined,
      url,
      openingHours: anuncio.horario_funcionamento || undefined,
      aggregateRating: anuncio.media_avaliacao ? {
        '@type': 'AggregateRating',
        ratingValue: anuncio.media_avaliacao,
        reviewCount: anuncio.comentarios?.length || 0
      } : undefined,
      makesOffer: (anuncio.servicos_oferecidos || []).map(s => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.nome } }))
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = scriptId;
    script.text = JSON.stringify(ld);
    document.head.appendChild(script);
  }, [anuncio]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Button variant="ghost" onClick={() => navigate(createPageUrl("Anuncios"))} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Card de Imagens */}
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

            {/* Card de Informações Principais */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Badge className="mb-3 bg-pink-100 text-pink-800">{anuncio.categoria}</Badge>
                    {anuncio.subcategoria && (
                      <Badge variant="outline" className="mb-3 ml-2">{anuncio.subcategoria}</Badge>
                    )}
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{anuncio.titulo}</h1>
                    {/* Ranking badge simples */}
                    {(() => { 
                       const views = Math.min((anuncio.visualizacoes || 0)/500,1);
                       const likes = Math.min((anuncio.curtidas || 0)/50,1);
                       const comments = Math.min((anuncio.comentarios?.length || 0)/20,1);
                       const profile = (anuncio.profissional_verificado?0.6:0)+(anuncio.profissional_especializado?0.4:0);
                       const score = Math.round((0.3*comments + 0.25*0 + 0.2*views + 0.15*likes + 0.1*Math.min(profile,1))*100);
                       const b = score>=80?{t:'🥇 Top Profissional',c:'bg-yellow-100 text-yellow-800'}:score>=60?{t:'⭐ Profissional Destaque',c:'bg-purple-100 text-purple-800'}:score>=40?{t:'📈 Em Crescimento',c:'bg-blue-100 text-blue-800'}:{t:'🆕 Novo Profissional',c:'bg-gray-100 text-gray-800'};
                       return <Badge className={`${b.c} text-xs`}>{b.t} • Score {score}</Badge>;
                    })()}
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
                    {/* Botão Editar - visível para autor ou admin */}
                    {(isAutor || isAdmin) && (
                      <Button
                        onClick={() => navigate(`${createPageUrl("EditarAnuncio")}?id=${anuncio.id}`)}
                        variant="outline"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    )}

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
                
                {/* TODAS AS INFORMAÇÕES DO CADASTRO */}
                <div className="space-y-6">
                  {/* Sobre */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <Award className="w-5 h-5 text-pink-600" />
                      Sobre
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{anuncio.descricao}</p>
                  </div>

                  {/* Tipo de Estabelecimento e Estrelas */}
                  {(anuncio.tipo_estabelecimento || anuncio.estrelas_estabelecimento) && (
                    <div className="flex gap-4 flex-wrap">
                      {anuncio.tipo_estabelecimento && (
                        <Badge variant="outline" className="text-sm">
                          🏢 {anuncio.tipo_estabelecimento}
                        </Badge>
                      )}
                      {anuncio.estrelas_estabelecimento && (
                        <Badge variant="outline" className="text-sm flex items-center gap-1">
                          {[...Array(anuncio.estrelas_estabelecimento)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Faixa de Preço */}
                  {anuncio.faixa_preco && (
                    <div className="bg-gradient-to-r from-[#FFF9E6] to-yellow-50 p-4 rounded-lg border-2 border-[#F7D426]">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-6 h-6 text-[#F7D426]" />
                        <div>
                          <p className="font-semibold text-gray-900">Faixa de Preço</p>
                          <p className="text-2xl font-bold text-[#F7D426]">{anuncio.faixa_preco}</p>
                          <p className="text-xs text-gray-600">
                            {anuncio.faixa_preco === "$" && "Até R$ 500"}
                            {anuncio.faixa_preco === "$$" && "R$ 500 - R$ 1.000"}
                            {anuncio.faixa_preco === "$$$" && "R$ 1.000 - R$ 2.000"}
                            {anuncio.faixa_preco === "$$$$" && "R$ 2.000 - R$ 5.000"}
                            {anuncio.faixa_preco === "$$$$$" && "Acima de R$ 5.000"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Serviços Oferecidos - SEM PREÇO */}
                  {anuncio.servicos_oferecidos && anuncio.servicos_oferecidos.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-pink-600" />
                        Serviços Oferecidos
                      </h3>
                      <div className="space-y-2">
                        {anuncio.servicos_oferecidos.map((servico, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div>
                              <p className="font-medium">{servico.nome}</p>
                              {servico.duracao && <p className="text-sm text-gray-500">Duração: {servico.duracao}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Procedimentos/Serviços */}
                  {anuncio.procedimentos_servicos && anuncio.procedimentos_servicos.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Procedimentos</h3>
                      <div className="flex flex-wrap gap-2">
                        {anuncio.procedimentos_servicos.map((proc, index) => (
                          <Badge key={index} variant="outline" className="text-sm">
                            {proc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {anuncio.tags && anuncio.tags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {anuncio.tags.map((tag, index) => (
                          <Badge key={index} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amenidades */}
                  {anuncio.amenidades && Object.values(anuncio.amenidades).some(v => v) && (
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Comodidades</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {anuncio.amenidades.estacionamento && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Estacionamento</span>
                          </div>
                        )}
                        {anuncio.amenidades.estacionamento_valet && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Valet</span>
                          </div>
                        )}
                        {anuncio.amenidades.aceita_pet && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Pet Friendly</span>
                          </div>
                        )}
                        {anuncio.amenidades.lounge && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Lounge</span>
                          </div>
                        )}
                        {anuncio.amenidades.lounge_bar && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Lounge Bar</span>
                          </div>
                        )}
                        {anuncio.amenidades.musica_ambiente && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Música Ambiente</span>
                          </div>
                        )}
                        {anuncio.amenidades.seguranca && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Segurança</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Profissional Verificado */}
                  {anuncio.profissional_verificado && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-bold text-green-900">Profissional Verificado ✓</p>
                          <p className="text-sm text-green-700">Documentação validada pela plataforma</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Seção de Perguntas e Respostas */}
            <SecaoPerguntas
              anuncio={anuncio}
              user={user}
              isAutor={isAutor}
            />

            {/* Seção de Comentários */}
            <SecaoComentarios
              anuncio={anuncio}
              user={user}
              isAutor={isAutor}
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
                  <a href={`tel:${anuncio.telefone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                    <a href={`https://wa.me/${anuncio.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center"><span className="text-white font-bold">W</span></div>
                      <div>
                        <p className="text-xs text-gray-500">WhatsApp</p>
                        <p className="font-medium text-green-700">Enviar mensagem</p>
                      </div>
                    </a>
                  )
                )}

                {anuncio.email && (
                  <a href={`mailto:${anuncio.email}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Mail className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-sm break-all">{anuncio.email}</p>
                    </div>
                  </a>
                )}

                {anuncio.site && (
                  <a href={anuncio.site} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <Globe className="w-5 h-5 text-pink-600" />
                    <div>
                      <p className="text-xs text-gray-500">Website</p>
                      <p className="font-medium text-sm break-all">Visitar site</p>
                    </div>
                  </a>
                )}

                {(anuncio.instagram || anuncio.facebook) && (
                  <>
                    <Separator />
                    <div className="flex gap-3">
                      {anuncio.instagram && (
                        <a href={`https://instagram.com/${anuncio.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 bg-gradient-to-br from-pink-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity">
                          <Instagram className="w-5 h-5" />
                          <span className="text-sm font-medium">Instagram</span>
                        </a>
                      )}
                      {anuncio.facebook && (
                        <a href={anuncio.facebook} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                          <Facebook className="w-5 h-5" />
                          <span className="text-sm font-medium">Facebook</span>
                        </a>
                      )}
                    </div>
                  </>
                )}

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
                  <div className="flex items-start gap-2 text-gray-600 mb-3">
                    <MapPin className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{anuncio.cidade}, {anuncio.estado}</p>
                      {anuncio.rua && (
                        <p className="text-sm text-gray-500">
                          {anuncio.rua}{anuncio.numero ? `, ${anuncio.numero}` : ''}
                        </p>
                      )}
                      {anuncio.bairro && <p className="text-sm text-gray-500">Bairro: {anuncio.bairro}</p>}
                      {anuncio.complemento && <p className="text-sm text-gray-500">{anuncio.complemento}</p>}
                      {anuncio.cep && <p className="text-sm text-gray-500">CEP: {anuncio.cep}</p>}
                      {anuncio.observacoes_endereco && (
                        <p className="text-xs text-gray-400 mt-1 italic">{anuncio.observacoes_endereco}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Botão Como Chegar - somente se tiver localização exata */}
                  {anuncio.compartilhar_localizacao_exata && anuncio.latitude && anuncio.longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${anuncio.latitude},${anuncio.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg"
                    >
                      <Navigation className="w-5 h-5" />
                      <span>Como Chegar</span>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {isProfissionalAutor && (
        <ImpulsionarAnuncioModal
          open={mostrarImpulsionar}
          onClose={() => setMostrarImpulsionar(false)}
          anuncio={anuncio}
        />
      )}

      <LoginPromptModal
        open={mostrarLoginPrompt}
        onClose={() => setMostrarLoginPrompt(false)}
        pageName="anúncios" // Or a more specific page name if desired
      />
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