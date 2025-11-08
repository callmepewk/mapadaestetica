import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Loader2,
  X,
  Plus,
  ArrowLeft,
  AlertCircle,
  Crown,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle,
  Sparkles,
} from "lucide-react";

const dimensoesPorPlano = {
  cobre: { largura: 728, altura: 90, descricao: "Banner Leaderboard (728x90px)", limite: 1 },
  prata: { largura: 970, altura: 250, descricao: "Banner Billboard (970x250px)", limite: 5 },
  ouro: { largura: 1200, altura: 300, descricao: "Banner Premium (1200x300px)", limite: 10 },
  diamante: { largura: 1400, altura: 350, descricao: "Banner Destaque (1400x350px)", limite: 15 },
  platina: { largura: 1920, altura: 400, descricao: "Banner Full Width (1920x400px)", limite: 999 }
};

const posicoesDisponiveis = [
  { valor: "home_topo", label: "🏠 Home - Topo" },
  { valor: "home_meio", label: "🏠 Home - Meio" },
  { valor: "home_rodape", label: "🏠 Home - Rodapé" },
  { valor: "sidebar", label: "📌 Sidebar (Lateral)" },
  { valor: "blog", label: "📰 Blog" },
  { valor: "produtos", label: "🛍️ Página de Produtos" },
  { valor: "mapa", label: "🗺️ Página Mapa" }
];

const tiposLink = [
  { valor: "site", label: "🌐 Site", icon: "🌐" },
  { valor: "loja", label: "🛍️ Loja Online", icon: "🛍️" },
  { valor: "instagram", label: "📸 Instagram", icon: "📸" },
  { valor: "facebook", label: "📘 Facebook", icon: "📘" },
  { valor: "whatsapp", label: "💬 WhatsApp", icon: "💬" },
  { valor: "outro", label: "🔗 Outro", icon: "🔗" }
];

export default function CriacaoBanner() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    plano_patrocinador: "",
    imagem_banner: "",
    logo_empresa: "",
    nome_empresa: "",
    links: [],
    posicao: "home_topo",
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: "",
    dimensoes_banner: { largura: 0, altura: 0 },
    limite_banners: 0,
    prioridade: 0
  });

  const [novoLink, setNovoLink] = useState({
    titulo: "",
    url: "",
    tipo: "site"
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        
        const isPatrocinador = userData.plano_patrocinador && userData.plano_patrocinador !== 'nenhum';
        const isAdmin = userData.role === 'admin';
        
        if (!isPatrocinador && !isAdmin) {
          alert("Acesso negado! Esta área é exclusiva para Patrocinadores e Administradores.");
          navigate(createPageUrl("Inicio"));
          return;
        }
        
        setUser(userData);
        
        // Definir plano automaticamente
        const plano = isAdmin ? 'platina' : userData.plano_patrocinador;
        const dimensoes = dimensoesPorPlano[plano];
        
        setFormData(prev => ({
          ...prev,
          plano_patrocinador: plano,
          nome_empresa: userData.full_name || userData.nome_empresa || "",
          dimensoes_banner: { largura: dimensoes.largura, altura: dimensoes.altura },
          limite_banners: dimensoes.limite,
          prioridade: plano === 'platina' ? 5 : plano === 'diamante' ? 4 : plano === 'ouro' ? 3 : plano === 'prata' ? 2 : 1
        }));
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        navigate(createPageUrl("Inicio"));
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleUploadBanner = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, imagem_banner: file_url });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setErro("Erro ao fazer upload do banner");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleUploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, logo_empresa: file_url });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setErro("Erro ao fazer upload do logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleAdicionarLink = () => {
    if (!novoLink.titulo || !novoLink.url) {
      setErro("Preencha título e URL do link");
      return;
    }

    setFormData({
      ...formData,
      links: [...formData.links, { ...novoLink }]
    });

    setNovoLink({ titulo: "", url: "", tipo: "site" });
    setErro(null);
  };

  const handleRemoverLink = (index) => {
    setFormData({
      ...formData,
      links: formData.links.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.imagem_banner || !formData.nome_empresa) {
      setErro("Preencha os campos obrigatórios: título, imagem do banner e nome da empresa");
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      await base44.entities.Banner.create({
        ...formData,
        metricas: {
          visualizacoes: 0,
          cliques: 0,
          tempo_medio_visualizacao: 0,
          compartilhamentos: 0,
          conversoes_produtos: 0
        },
        historico_metricas: []
      });

      setSucesso(true);
      setTimeout(() => {
        navigate(createPageUrl("DashboardPatrocinador"));
      }, 2000);
    } catch (error) {
      console.error("Erro ao criar banner:", error);
      setErro("Erro ao cadastrar banner. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-purple-600 mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const dimensoes = dimensoesPorPlano[formData.plano_patrocinador];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-4 sm:py-6 md:py-8 px-2 sm:px-4">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("DashboardPatrocinador"))}
          className="mb-4 sm:mb-6 text-xs sm:text-sm h-9 sm:h-10"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center mb-6 sm:mb-8">
          <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs sm:text-sm px-3 py-1.5">
            <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Área de Patrocinadores
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Criar Banner Publicitário
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-2">
            Configure seu banner de acordo com o seu plano de patrocínio
          </p>
        </div>

        {/* Plano e Dimensões */}
        <Card className="mb-4 sm:mb-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-4 sm:p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-base sm:text-lg mb-2 flex items-center gap-2">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  Seu Plano: {formData.plano_patrocinador.toUpperCase()}
                </h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  Limite de banners rotativos: <strong>{dimensoes?.limite}</strong>
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm sm:text-base mb-2">Dimensões do Banner:</h4>
                <p className="text-xs sm:text-sm text-purple-800 font-mono bg-white px-3 py-2 rounded border">
                  {dimensoes?.largura} x {dimensoes?.altura} pixels
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {dimensoes?.descricao}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {sucesso && (
          <Alert className="mb-4 sm:mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 text-sm sm:text-base">
              ✅ Banner cadastrado com sucesso! Redirecionando para o dashboard...
            </AlertDescription>
          </Alert>
        )}

        {erro && (
          <Alert className="mb-4 sm:mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm sm:text-base">{erro}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Informações Básicas */}
          <Card className="border-none shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Informações do Banner</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div>
                <Label className="text-sm sm:text-base">Nome da Empresa *</Label>
                <Input
                  value={formData.nome_empresa}
                  onChange={(e) => setFormData({ ...formData, nome_empresa: e.target.value })}
                  placeholder="Ex: Clínica Beleza Premium"
                  className="mt-1.5 h-10 sm:h-11 text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <Label className="text-sm sm:text-base">Título do Banner *</Label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Promoção Especial - 30% OFF"
                  className="mt-1.5 h-10 sm:h-11 text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <Label className="text-sm sm:text-base">Descrição</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva a campanha ou promoção..."
                  className="mt-1.5 text-sm sm:text-base"
                  rows={3}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm sm:text-base">Data de Início</Label>
                  <Input
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    className="mt-1.5 h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <Label className="text-sm sm:text-base">Data de Término (Opcional)</Label>
                  <Input
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    className="mt-1.5 h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm sm:text-base">Posição de Exibição</Label>
                <Select value={formData.posicao} onValueChange={(value) => setFormData({ ...formData, posicao: value })}>
                  <SelectTrigger className="mt-1.5 h-10 sm:h-11 text-sm sm:text-base">
                    <SelectValue placeholder="Selecione onde o banner aparecerá" />
                  </SelectTrigger>
                  <SelectContent>
                    {posicoesDisponiveis.map((pos) => (
                      <SelectItem key={pos.valor} value={pos.valor} className="text-sm sm:text-base">
                        {pos.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Upload de Imagens */}
          <Card className="border-none shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-pink-600" />
                Imagens
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Upload Banner */}
              <div>
                <Label className="text-sm sm:text-base mb-2 block">
                  Imagem do Banner * ({dimensoes?.largura}x{dimensoes?.altura}px)
                </Label>
                {formData.imagem_banner ? (
                  <div className="relative">
                    <img
                      src={formData.imagem_banner}
                      alt="Banner"
                      className="w-full h-auto rounded-lg border-2 border-gray-200"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData({ ...formData, imagem_banner: "" })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Label htmlFor="banner-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 md:p-12 text-center hover:border-purple-400 transition-colors">
                      {uploadingBanner ? (
                        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto animate-spin text-purple-600" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                          <span className="text-sm sm:text-base text-purple-600 font-medium">
                            Clique para enviar o banner
                          </span>
                          <p className="text-xs sm:text-sm text-gray-500 mt-2">
                            Formatos: JPG, PNG • Dimensões: {dimensoes?.largura}x{dimensoes?.altura}px
                          </p>
                        </>
                      )}
                    </div>
                  </Label>
                )}
                <Input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadBanner}
                  disabled={uploadingBanner}
                />
              </div>

              {/* Upload Logo */}
              <div>
                <Label className="text-sm sm:text-base mb-2 block">Logo da Empresa (Opcional)</Label>
                {formData.logo_empresa ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.logo_empresa}
                      alt="Logo"
                      className="h-20 sm:h-24 md:h-32 w-auto rounded-lg border-2 border-gray-200"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2"
                      onClick={() => setFormData({ ...formData, logo_empresa: "" })}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Label htmlFor="logo-upload" className="cursor-pointer block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-purple-400 transition-colors">
                      {uploadingLogo ? (
                        <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 mx-auto animate-spin text-purple-600" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-gray-400 mb-2 sm:mb-3" />
                          <span className="text-sm sm:text-base text-purple-600 font-medium">
                            Clique para enviar o logo
                          </span>
                          <p className="text-xs sm:text-sm text-gray-500 mt-2">
                            Formatos: JPG, PNG
                          </p>
                        </>
                      )}
                    </div>
                  </Label>
                )}
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadLogo}
                  disabled={uploadingLogo}
                />
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card className="border-none shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-600" />
                Links da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              {/* Links existentes */}
              {formData.links.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <span className="text-lg sm:text-xl">
                        {tiposLink.find(t => t.valor === link.tipo)?.icon || "🔗"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{link.titulo}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{link.url}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoverLink(index)}
                        className="flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Adicionar novo link */}
              <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border-2 border-blue-200 space-y-3">
                <h4 className="font-semibold text-sm sm:text-base">Adicionar Novo Link</h4>
                
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs sm:text-sm">Tipo de Link</Label>
                    <Select value={novoLink.tipo} onValueChange={(value) => setNovoLink({ ...novoLink, tipo: value })}>
                      <SelectTrigger className="mt-1 h-9 sm:h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposLink.map((tipo) => (
                          <SelectItem key={tipo.valor} value={tipo.valor} className="text-sm">
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">Título do Link</Label>
                    <Input
                      value={novoLink.titulo}
                      onChange={(e) => setNovoLink({ ...novoLink, titulo: e.target.value })}
                      placeholder="Ex: Visite nosso site"
                      className="mt-1 h-9 sm:h-10 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">URL</Label>
                  <Input
                    value={novoLink.url}
                    onChange={(e) => setNovoLink({ ...novoLink, url: e.target.value })}
                    placeholder="https://..."
                    className="mt-1 h-9 sm:h-10 text-sm"
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleAdicionarLink}
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto h-9"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {formData.imagem_banner && (
            <Card className="border-2 border-purple-300">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Preview do Banner
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="bg-gray-100 p-3 sm:p-4 md:p-6 rounded-lg">
                  <img
                    src={formData.imagem_banner}
                    alt="Preview"
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  {formData.logo_empresa && (
                    <div className="mt-3 sm:mt-4 flex justify-center">
                      <img
                        src={formData.logo_empresa}
                        alt="Logo"
                        className="h-12 sm:h-16 md:h-20 w-auto"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-white p-3 sm:p-4 rounded-lg shadow-lg border-t-2 border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("DashboardPatrocinador"))}
              className="w-full sm:flex-1 h-11 order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={enviando || uploadingBanner || uploadingLogo}
              className="w-full sm:flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-11 order-1 sm:order-2"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Cadastrar Banner
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}