
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, Sparkles, Heart, Eye, Briefcase, Users, ExternalLink, MessageCircle, Send, AlertCircle, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

const fontesExternas = [
  {
    nome: "Vogue Brasil",
    url: "https://vogue.globo.com/beleza",
    icon: "📰",
    cor: "from-black to-gray-800"
  },
  {
    nome: "Glamour",
    url: "https://revistaglamour.globo.com/Beleza",
    icon: "✨",
    cor: "from-pink-600 to-rose-600"
  },
  {
    nome: "Sociedade Brasileira de Dermatologia",
    url: "https://www.sbd.org.br/",
    icon: "🔬",
    cor: "from-blue-600 to-cyan-600"
  },
  {
    nome: "Portal ABRAESP",
    url: "https://www.abraesp.com.br/",
    icon: "💼",
    cor: "from-purple-600 to-indigo-600"
  },
  {
    nome: "Beleza Atual",
    url: "https://www.belezaatual.com.br/",
    icon: "💄",
    cor: "from-orange-500 to-amber-500"
  },
  {
    nome: "Metrópoles Saúde",
    url: "https://www.metropoles.com/saude",
    icon: "🏥",
    cor: "from-red-600 to-pink-600"
  }
];

export default function Blog() {
  const navigate = useNavigate();
  const [artigoSelecionado, setArtigoSelecionado] = useState(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [user, setUser] = useState(null);
  const [novoComentario, setNovoComentario] = useState("");
  const [comentarios, setComentarios] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const { data: artigos = [], isLoading } = useQuery({
    queryKey: ['artigos-blog'],
    queryFn: async () => {
      return await base44.entities.ArtigoBlog.filter({ status: 'publicado' }, '-created_date', 50);
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    initialData: [],
  });

  const artigosProfissionais = artigos.filter(a => a.tipo === 'profissional');
  const artigosGerais = artigos.filter(a => a.tipo === 'geral');

  const getCategoriaColor = (categoria) => {
    const colors = {
      "Estética Facial": "bg-purple-100 text-purple-800",
      "Estética Corporal": "bg-blue-100 text-blue-800",
      "Cuidados com a Pele": "bg-green-100 text-green-800",
      "Tratamentos": "bg-pink-100 text-pink-800",
      "Tendências": "bg-orange-100 text-orange-800",
      "Novidades": "bg-red-100 text-red-800",
      "Harmonização Facial": "bg-violet-100 text-violet-800"
    };
    return colors[categoria] || "bg-gray-100 text-gray-800";
  };

  const handleArtigoClick = async (e, artigo) => {
    e.preventDefault();
    
    if (!artigo || !artigo.id) {
      console.error("Artigo sem ID:", artigo);
      return;
    }
    
    // Artigos gerais com link externo abrem em nova aba
    if (artigo.tipo === 'geral' && artigo.link_externo) {
      window.open(artigo.link_externo, '_blank');
      return;
    }
    
    // Artigos profissionais ou sem link externo abrem no dialog
    try {
      await base44.entities.ArtigoBlog.update(artigo.id, {
        visualizacoes: (artigo.visualizacoes || 0) + 1
      });
      // Optionally refetch articles to update the count on cards, or just update local state
      // For simplicity, we'll refetch when the dialog closes or on next mount
    } catch (err) {
      console.log("Erro ao incrementar visualizações:", err);
    }

    // Buscar comentários
    try {
      const comentariosData = await base44.entities.ComentarioBlog.filter(
        { artigo_id: artigo.id, status: 'ativo' },
        '-created_date',
        100
      );
      setComentarios(comentariosData);
    } catch (err) {
      console.log("Erro ao buscar comentários:", err);
      setComentarios([]);
    }

    setArtigoSelecionado(artigo);
    setDialogAberto(true);
  };

  const handleCurtir = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }
    if (!artigoSelecionado) return;
    
    try {
      const curtidas = artigoSelecionado.curtidas || [];
      const jaCurtiu = curtidas.includes(user.email);
      
      const novasCurtidas = jaCurtiu
        ? curtidas.filter(email => email !== user.email)
        : [...curtidas, user.email];
      
      await base44.entities.ArtigoBlog.update(artigoSelecionado.id, {
        curtidas: novasCurtidas,
        total_curtidas: novasCurtidas.length
      });

      setArtigoSelecionado({ 
        ...artigoSelecionado, 
        curtidas: novasCurtidas, 
        total_curtidas: novasCurtidas.length 
      });
    } catch (error) {
      console.error("Erro ao curtir:", error);
    }
  };

  const handleComentar = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }
    
    if (!novoComentario.trim()) {
      setErro("Por favor, escreva um comentário");
      return;
    }
    
    try {
      await base44.entities.ComentarioBlog.create({
        artigo_id: artigoSelecionado.id,
        usuario_nome: user.full_name,
        usuario_email: user.email,
        usuario_foto: user.profile_picture || "", // Assuming `profile_picture` for user foto
        comentario: novoComentario,
        status: 'pendente' // Comentários podem precisar de moderação
      });

      const comentariosData = await base44.entities.ComentarioBlog.filter(
        { artigo_id: artigoSelecionado.id, status: 'ativo' },
        '-created_date',
        100
      );
      setComentarios(comentariosData);
      setNovoComentario("");
      setErro(null);
      alert("Seu comentário foi enviado para aprovação."); // Informar ao usuário que está pendente
    } catch (error) {
      setErro("Erro ao enviar comentário");
      console.error("Erro ao enviar comentário:", error);
    }
  };

  const ArtigoCard = ({ artigo }) => {
    if (!artigo) return null;
    
    return (
      <Card
        onClick={(e) => handleArtigoClick(e, artigo)}
        className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none cursor-pointer group"
      >
        <div className="h-48 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300">
          {artigo.imagem_capa ? (
            <img src={artigo.imagem_capa} alt={artigo.titulo} className="w-full h-full object-cover" />
          ) : (
            "✨"
          )}
        </div>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge className={getCategoriaColor(artigo.categoria)}>
              {artigo.categoria}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {artigo.tipo === 'profissional' ? (
                <><Briefcase className="w-3 h-3 mr-1" /> Profissional</>
              ) : (
                <><Users className="w-3 h-3 mr-1" /> Geral</>
              )}
            </Badge>
            {artigo.tipo === 'geral' && artigo.link_externo && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                <ExternalLink className="w-3 h-3 mr-1" />
                Externo
              </Badge>
            )}
          </div>
          <h3 className="font-bold text-lg md:text-xl mb-3 line-clamp-2 group-hover:text-pink-600 transition-colors">
            {artigo.titulo}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {artigo.resumo}
          </p>
          
          <div className="flex items-center gap-3 text-xs text-gray-500 pt-3 border-t flex-wrap">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {artigo.visualizacoes || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {artigo.total_curtidas || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {artigo.tempo_leitura} min
            </span>
          </div>

          <div className="text-xs text-gray-400 mt-2">
            {format(new Date(artigo.created_date), "dd/MM/yyyy")}
          </div>

          <Button className="w-full mt-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">
            {artigo.tipo === 'geral' && artigo.link_externo ? 'Ler no Site Original' : 'Ver Mais'}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full mb-4">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Atualizado semanalmente</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 px-4">
            Fique por Dentro do Universo da Estética
          </h1>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Artigos para profissionais e conteúdos das melhores fontes
          </p>
        </div>

        {/* Fontes Externas */}
        <div className="mb-12 px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📚 Fontes Confiáveis de Conteúdo
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {fontesExternas.map((fonte, index) => (
              <a
                key={index}
                href={fonte.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="h-full hover:shadow-xl transition-all border-none cursor-pointer">
                  <div className={`h-24 bg-gradient-to-br ${fonte.cor} flex items-center justify-center text-4xl`}>
                    {fonte.icon}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs font-semibold text-center text-gray-900 group-hover:text-pink-600 transition-colors flex items-center justify-center gap-1">
                      {fonte.nome}
                      <ExternalLink className="w-3 h-3" />
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>

        {/* Tabs para Profissionais e Gerais */}
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="geral" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Artigos Gerais
            </TabsTrigger>
            <TabsTrigger value="profissional" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Para Profissionais
            </TabsTrigger>
          </TabsList>

          {/* Artigos Gerais */}
          <TabsContent value="geral">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-20 mb-3" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : artigosGerais.length === 0 ? (
              <Card className="p-12 text-center mx-4">
                <div className="text-6xl mb-4">📰</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Explore as fontes confiáveis acima
                </h3>
                <p className="text-gray-600">
                  Clique nos ícones acima para acessar conteúdo das melhores publicações
                </p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
                {artigosGerais.map((artigo) => (
                  <ArtigoCard key={artigo.id} artigo={artigo} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Artigos Profissionais */}
          <TabsContent value="profissional">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-20 mb-3" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : artigosProfissionais.length === 0 ? (
              <Card className="p-12 text-center mx-4">
                <div className="text-6xl mb-4">💼</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum artigo profissional encontrado
                </h3>
                <p className="text-gray-600">
                  Volte mais tarde para novos conteúdos
                </p>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
                {artigosProfissionais.map((artigo) => (
                  <ArtigoCard key={artigo.id} artigo={artigo} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog do Artigo Completo */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <button
            onClick={() => {
              setDialogAberto(false);
              setArtigoSelecionado(null); // Clear selected article on close
              setComentarios([]); // Clear comments on close
              setNovoComentario(""); // Clear comment input
              setErro(null); // Clear errors
            }}
            className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg"
          >
            <X className="w-4 h-4" />
          </button>

          {artigoSelecionado && (
            <>
              <div className="h-48 md:h-96 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-6xl md:text-8xl">
                {artigoSelecionado.imagem_capa ? (
                  <img src={artigoSelecionado.imagem_capa} alt={artigoSelecionado.titulo} className="w-full h-full object-cover" />
                ) : (
                  "✨"
                )}
              </div>

              <div className="p-6 md:p-12">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <Badge className={getCategoriaColor(artigoSelecionado.categoria)}>
                    {artigoSelecionado.categoria}
                  </Badge>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(artigoSelecionado.created_date), "dd/MM/yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {artigoSelecionado.tempo_leitura} min
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCurtir}
                      disabled={!user}
                      className={artigoSelecionado.curtidas?.includes(user?.email) ? "text-red-600 border-red-600 hover:bg-red-50" : ""}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${artigoSelecionado.curtidas?.includes(user?.email) ? 'fill-red-600' : ''}`} />
                      {artigoSelecionado.total_curtidas || 0}
                    </Button>
                  </div>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  {artigoSelecionado.titulo}
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed border-l-4 border-pink-500 pl-6 italic">
                  {artigoSelecionado.resumo}
                </p>

                <div className="prose prose-lg max-w-none">
                  {artigoSelecionado.conteudo?.split('\n\n').map((paragrafo, index) => (
                    <p key={index} className="text-gray-700 mb-6 leading-relaxed text-base md:text-lg">
                      {paragrafo}
                    </p>
                  ))}
                </div>

                <div className="mt-12 pt-8 border-t">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <MessageCircle className="w-6 h-6" />
                    Comentários ({comentarios.length})
                  </h3>

                  {erro && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{erro}</AlertDescription>
                    </Alert>
                  )}

                  <div className="mb-8">
                    <Textarea
                      placeholder={user ? "Escreva seu comentário..." : "Faça login para comentar"}
                      value={novoComentario}
                      onChange={(e) => setNovoComentario(e.target.value)}
                      disabled={!user}
                      className="mb-3"
                      rows={4}
                    />
                    <Button onClick={handleComentar} disabled={!user || !novoComentario.trim()} className="bg-pink-600 hover:bg-pink-700">
                      <Send className="w-4 h-4 mr-2" />
                      Comentar
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {comentarios.length === 0 ? (
                      <p className="text-gray-500 text-center">Nenhum comentário ainda. Seja o primeiro!</p>
                    ) : (
                      comentarios.map((comentario) => (
                        <div key={comentario.id} className="border-l-2 border-gray-200 pl-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold flex-shrink-0">
                              {comentario.usuario_foto ? (
                                <img src={comentario.usuario_foto} alt={comentario.usuario_nome} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                comentario.usuario_nome.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{comentario.usuario_nome}</span>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(comentario.created_date), "dd/MM/yyyy 'às' HH:mm")}
                                </span>
                              </div>
                              <p className="text-gray-700">{comentario.comentario}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
