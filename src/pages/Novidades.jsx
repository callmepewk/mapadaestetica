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
  TrendingUp,
  Upload,
  X,
  Calendar,
} from "lucide-react";

export default function Novidades() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    conteudo_detalhado: "",
    data_publicacao: new Date().toISOString(),
    categoria: "nova_funcionalidade",
    icone: "✨",
    imagem: "",
    status: "rascunho"
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        
        if (userData.role !== 'admin') {
          alert("Acesso negado! Esta área é exclusiva para Administradores.");
          navigate(createPageUrl("Inicio"));
          return;
        }
        
        setUser(userData);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        navigate(createPageUrl("Inicio"));
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleUploadImagem = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, imagem: file_url });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setErro("Erro ao fazer upload da imagem");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.descricao || !formData.data_publicacao) {
      setErro("Preencha os campos obrigatórios: título, descrição e data/hora");
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      await base44.entities.Novidade.create({
        ...formData,
        data_publicacao: new Date(formData.data_publicacao).toISOString()
      });

      setSucesso(true);
      setTimeout(() => {
        navigate(createPageUrl("DashboardPatrocinador"));
      }, 2000);
    } catch (error) {
      console.error("Erro ao criar novidade:", error);
      setErro("Erro ao cadastrar novidade. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-green-600 mb-4" />
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
          Voltar
        </Button>

        <div className="text-center mb-6 sm:mb-8">
          <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs sm:text-sm px-3 py-1.5">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Publicar Novidade
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Nova Atualização da Plataforma
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">
            Compartilhe as últimas atualizações com os usuários
          </p>
        </div>

        {sucesso && (
          <Alert className="mb-4 sm:mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 text-sm sm:text-base">
              ✅ Novidade publicada com sucesso!
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
          <Card className="border-none shadow-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Informações da Novidade</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div>
                <Label className="text-sm sm:text-base">Título *</Label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Nova Funcionalidade: Dashboard de Patrocinadores"
                  className="mt-1.5 h-10 sm:h-11 text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <Label className="text-sm sm:text-base">Descrição *</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Breve descrição da atualização"
                  className="mt-1.5 text-sm sm:text-base"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label className="text-sm sm:text-base">Conteúdo Detalhado</Label>
                <Textarea
                  value={formData.conteudo_detalhado}
                  onChange={(e) => setFormData({ ...formData, conteudo_detalhado: e.target.value })}
                  placeholder="Explicação completa da atualização..."
                  className="mt-1.5 text-sm sm:text-base"
                  rows={6}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm sm:text-base">Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                    <SelectTrigger className="mt-1.5 h-10 sm:h-11 text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nova_funcionalidade">🆕 Nova Funcionalidade</SelectItem>
                      <SelectItem value="melhoria">⬆️ Melhoria</SelectItem>
                      <SelectItem value="correcao">🔧 Correção</SelectItem>
                      <SelectItem value="anuncio">📢 Anúncio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm sm:text-base">Ícone (Emoji)</Label>
                  <Input
                    value={formData.icone}
                    onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                    placeholder="✨"
                    maxLength={2}
                    className="mt-1.5 h-10 sm:h-11 text-sm sm:text-base text-center text-2xl"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm sm:text-base">Data e Horário *</Label>
                <Input
                  type="datetime-local"
                  value={formData.data_publicacao.substring(0, 16)}
                  onChange={(e) => setFormData({ ...formData, data_publicacao: e.target.value })}
                  className="mt-1.5 h-10 sm:h-11 text-sm sm:text-base"
                  required
                />
              </div>

              <div>
                <Label className="text-sm sm:text-base mb-2 block">Imagem Ilustrativa</Label>
                {formData.imagem ? (
                  <div className="relative inline-block">
                    <img
                      src={formData.imagem}
                      alt="Ilustração"
                      className="h-32 sm:h-40 w-auto rounded-lg border-2 border-gray-200"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2"
                      onClick={() => setFormData({ ...formData, imagem: "" })}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Label htmlFor="imagem-upload" className="cursor-pointer block">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-green-400 transition-colors">
                      <Upload className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-gray-400 mb-2" />
                      <span className="text-sm sm:text-base text-green-600 font-medium">
                        Clique para enviar imagem
                      </span>
                    </div>
                  </Label>
                )}
                <Input
                  id="imagem-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadImagem}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-white p-3 sm:p-4 rounded-lg shadow-lg border-t-2">
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
              className="w-full sm:flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-11 order-1 sm:order-2"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Publicar Novidade
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}