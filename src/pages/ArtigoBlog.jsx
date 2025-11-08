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
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Newspaper,
  Plus,
  X,
  ExternalLink,
  Calendar,
  Link as LinkIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categorias = [
  "Estética Facial",
  "Estética Corporal",
  "Cuidados com a Pele",
  "Tratamentos",
  "Tendências",
  "Novidades",
  "Harmonização Facial"
];

const tiposLink = [
  { valor: "whatsapp", label: "💬 WhatsApp", icon: "💬" },
  { valor: "instagram", label: "📸 Instagram", icon: "📸" },
  { valor: "facebook", label: "📘 Facebook", icon: "📘" },
  { valor: "site", label: "🌐 Site", icon: "🌐" },
  { valor: "loja", label: "🛍️ Loja Online", icon: "🛍️" },
  { valor: "outro", label: "🔗 Outro", icon: "🔗" }
];

export default function ArtigoBlog() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(null);
  const [tipoConteudo, setTipoConteudo] = useState("escrito");

  const [formData, setFormData] = useState({
    titulo: "",
    resumo: "",
    conteudo: "",
    link_externo: "",
    categoria: "Tendências",
    tipo: "geral",
    tempo_leitura: 5,
    imagem_capa: "",
    status: "rascunho",
    data_publicacao: new Date().toISOString().split('T')[0],
    hora_publicacao: "12:00",
    links_patrocinador: []
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
          navigate(createPageUrl("DashboardPatrocinador"));
          return;
        }
        
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          tipo: isAdmin ? "profissional" : "geral"
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

  const handleUploadCapa = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, imagem_capa: file_url });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setErro("Erro ao fazer upload da imagem");
    }
  };

  const handleAdicionarLink = () => {
    if (!novoLink.titulo || !novoLink.url) {
      setErro("Preencha título e URL do link");
      return;
    }

    setFormData({
      ...formData,
      links_patrocinador: [...formData.links_patrocinador, { ...novoLink }]
    });

    setNovoLink({ titulo: "", url: "", tipo: "site" });
    setErro(null);
  };

  const handleRemoverLink = (index) => {
    setFormData({
      ...formData,
      links_patrocinador: formData.links_patrocinador.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.resumo || !formData.categoria) {
      setErro("Preencha os campos obrigatórios: título, resumo e categoria");
      return;
    }

    if (tipoConteudo === "escrito" && !formData.conteudo) {
      setErro("Preencha o conteúdo do artigo ou selecione 'Link Externo'");
      return;
    }

    if (tipoConteudo === "link" && !formData.link_externo) {
      setErro("Preencha o link externo do artigo");
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const dataHora = formData.status === 'programado' 
        ? `${formData.data_publicacao}T${formData.hora_publicacao}:00`
        : new Date().toISOString();

      await base44.entities.ArtigoBlog.create({
        titulo: formData.titulo,
        resumo: formData.resumo,
        conteudo: tipoConteudo === "escrito" ? formData.conteudo : "",
        link_externo: tipoConteudo === "link" ? formData.link_externo : "",
        categoria: formData.categoria,
        tipo: formData.tipo,
        tempo_leitura: formData.tempo_leitura,
        imagem_capa: formData.imagem_capa,
        status: formData.status,
        data_publicacao: dataHora,
        links_patrocinador: formData.links_patrocinador
      });

      setSucesso(true);
      setTimeout(() => {
        navigate(createPageUrl("DashboardPatrocinador"));
      }, 2000);
    } catch (error) {
      console.error("Erro ao criar artigo:", error);
      setErro("Erro ao cadastrar artigo. Tente novamente.");
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-4 sm:py-6 md:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("DashboardPatrocinador"))}
          className="mb-4 sm:mb-6 text-xs sm:text-sm h-9 sm:h-10"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

        <div className="text-center mb-6 sm:mb-8">
          <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs sm:text-sm px-3 py-1.5">
            <Newspaper className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Criar Artigo no Blog
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Novo Post no Blog
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            Crie conteúdo de qualidade para o blog do Mapa da Estética
          </p>
        </div>

        {sucesso && (
          <Alert className="mb-4 sm:mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 text-sm sm:text-base">
              ✅ Artigo criado com sucesso! Redirecionando...
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
              <CardTitle className="text-lg sm:text-xl">Informações do Artigo</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div>
                <Label className="text-sm sm:text-base">Título *</Label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: As Maiores Tendências de Estética em 2025"
                  className="mt-1.5 h-10 sm:h-11 text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <Label className="text-sm sm:text-base">Resumo *</Label>
                <Textarea
                  value={formData.resumo}
                  onChange={(e) => setFormData({ ...formData, resumo: e.target.value })}
                  placeholder="Breve resumo do artigo (será exibido nos cards)"
                  className="mt-1.5 text-sm sm:text-base"
                  rows={3}
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm sm:text-base">Categoria *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                    <SelectTrigger className="mt-1.5 h-10 sm:h-11 text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-sm sm:text-base">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm sm:text-base">Tempo de Leitura (minutos)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.tempo_leitura}
                    onChange={(e) => setFormData({ ...formData, tempo_leitura: parseInt(e.target.value) })}
                    className="mt-1.5 h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm sm:text-base mb-2 block">Imagem de Capa</Label>
                {formData.imagem_capa ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.imagem_capa}
                      alt="Capa"
                      className="h-32 sm:h-40 md:h-48 w-auto rounded-lg border-2 border-gray-200"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2"
                      onClick={() => setFormData({ ...formData, imagem_capa: "" })}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Label htmlFor="capa-upload" className="cursor-pointer block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-purple-400 transition-colors">
                      <span className="text-sm sm:text-base text-purple-600 font-medium">
                        Clique para enviar imagem
                      </span>
                    </div>
                  </Label>
                )}
                <Input
                  id="capa-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadCapa}
                />
              </div>
            </CardContent>
          </Card>

          {/* Conteúdo - TABS para Escrito ou Link */}
          <Card className="border-none shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Conteúdo do Artigo</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Tabs value={tipoConteudo} onValueChange={setTipoConteudo} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="escrito" className="text-xs sm:text-sm">
                    📝 Conteúdo Escrito
                  </TabsTrigger>
                  <TabsTrigger value="link" className="text-xs sm:text-sm">
                    🔗 Link Externo
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="escrito">
                  <div>
                    <Label className="text-sm sm:text-base">Escreva o conteúdo completo do artigo</Label>
                    <Textarea
                      value={formData.conteudo}
                      onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                      placeholder="Escreva o conteúdo completo do artigo aqui..."
                      className="mt-1.5 text-sm sm:text-base"
                      rows={12}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use parágrafos separados para melhor formatação
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="link">
                  <div>
                    <Label className="text-sm sm:text-base">Link do Artigo Externo</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input
                        value={formData.link_externo}
                        onChange={(e) => setFormData({ ...formData, link_externo: e.target.value, tipo: "geral" })}
                        placeholder="https://exemplo.com/artigo"
                        className="h-10 sm:h-11 text-sm sm:text-base"
                      />
                      {formData.link_externo && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(formData.link_externo, '_blank')}
                          className="flex-shrink-0"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      O artigo redirecionará para este link quando clicado
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Links do Patrocinador */}
          <Card className="border-none shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-600" />
                Links do Patrocinador
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              {formData.links_patrocinador.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.links_patrocinador.map((link, index) => (
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
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border-2 border-blue-200 space-y-3">
                <h4 className="font-semibold text-sm sm:text-base">Adicionar Novo Link</h4>
                
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs sm:text-sm">Tipo</Label>
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
                    <Label className="text-xs sm:text-sm">Título</Label>
                    <Input
                      value={novoLink.titulo}
                      onChange={(e) => setNovoLink({ ...novoLink, titulo: e.target.value })}
                      placeholder="Ex: Fale Conosco"
                      className="mt-1 h-9 sm:h-10 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">URL</Label>
                  <Input
                    value={novoLink.url}
                    onChange={(e) => setNovoLink({ ...novoLink, url: e.target.value })}
                    placeholder="https:// ou número WhatsApp"
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

          {/* Agendamento e Publicação */}
          <Card className="border-none shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Publicação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div>
                <Label className="text-sm sm:text-base">Status de Publicação</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="mt-1.5 h-10 sm:h-11 text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">💾 Salvar como Rascunho</SelectItem>
                    <SelectItem value="publicado">✅ Publicar Imediatamente</SelectItem>
                    <SelectItem value="programado">📅 Agendar Publicação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.status === 'programado' && (
                <div className="grid sm:grid-cols-2 gap-3 p-3 sm:p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div>
                    <Label className="text-xs sm:text-sm">Data de Publicação</Label>
                    <Input
                      type="date"
                      value={formData.data_publicacao}
                      onChange={(e) => setFormData({ ...formData, data_publicacao: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 h-9 sm:h-10 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs sm:text-sm">Horário</Label>
                    <Input
                      type="time"
                      value={formData.hora_publicacao}
                      onChange={(e) => setFormData({ ...formData, hora_publicacao: e.target.value })}
                      className="mt-1 h-9 sm:h-10 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800 text-xs sm:text-sm">
                        📅 O artigo será publicado automaticamente em: {formData.data_publicacao} às {formData.hora_publicacao}
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botões */}
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
              disabled={enviando}
              className="w-full sm:flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-11 order-1 sm:order-2"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {formData.status === 'programado' ? 'Agendar Post' : formData.status === 'publicado' ? 'Publicar Agora' : 'Salvar Rascunho'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}