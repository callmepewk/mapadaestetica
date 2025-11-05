import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Sparkles, 
  Upload, 
  AlertCircle, 
  CheckCircle,
  Copy,
  Wand2,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categorias = [
  "Estética Facial", "Estética Corporal", "Estética Capilar e Tricologia",
  "Estética de Mãos e Pés", "Micropigmentação e Design", "Depilação",
  "Massoterapia e Drenagem", "Harmonização Facial", "Medicina Estética",
  "Dermatologia", "Cirurgia Plástica", "Fisioterapia Dermato Funcional",
  "Nutrição Estética", "Psicologia da Imagem", "Pilates e Fitness",
  "Acupuntura Estética", "Terapias Integrativas", "Podologia",
  "Manicure e Pedicure", "Barbearia", "Tatuagem e Piercing",
  "Spa e Bem-Estar", "Longevidade", "Outros"
];

const tiposAnuncio = [
  { valor: "servico", label: "Serviço" },
  { valor: "procedimento", label: "Procedimento" },
  { valor: "tecnica", label: "Técnica" },
  { valor: "consultorio", label: "Consultório" },
  { valor: "clinica", label: "Clínica" },
  { valor: "promocao", label: "Promoção" }
];

const faixasPreco = [
  { valor: "$", label: "$ - Até R$ 500" },
  { valor: "$$", label: "$$ - R$ 500 a R$ 1.000" },
  { valor: "$$$", label: "$$$ - R$ 1.000 a R$ 2.000" },
  { valor: "$$$$", label: "$$$$ - R$ 2.000 a R$ 5.000" },
  { valor: "$$$$$", label: "$$$$$ - Acima de R$ 5.000" }
];

export default function CadastrarAnuncio() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    tipo_anuncio: "",
    titulo: "",
    descricao: "",
    categoria: "",
    subcategoria: "",
    faixa_preco: "",
    profissional: "",
    telefone: "",
    whatsapp: "",
    email: "",
    cidade: "",
    estado: "",
    endereco: "",
    cep: "",
    horario_funcionamento: "",
    procedimentos_servicos: [],
    tags: []
  });

  // Estados do Assistente IA
  const [mostrarAssistenteDescricao, setMostrarAssistenteDescricao] = useState(false);
  const [sugestaoDescricao, setSugestaoDescricao] = useState("");
  const [loadingDescricao, setLoadingDescricao] = useState(false);
  const [feedbackDescricao, setFeedbackDescricao] = useState(null);

  // Estados do Gerador IA
  const [mostrarGeradorIA, setMostrarGeradorIA] = useState(false);
  const [dadosGeradorIA, setDadosGeradorIA] = useState({
    tipo_negocio: "",
    especialidade_principal: "",
    diferenciais: "",
    publico_alvo: "",
    experiencia: ""
  });
  const [anuncioGerado, setAnuncioGerado] = useState(null);
  const [loadingGerador, setLoadingGerador] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Preencher dados do usuário automaticamente
        setFormData(prev => ({
          ...prev,
          profissional: userData.full_name || "",
          telefone: userData.telefone || "",
          whatsapp: userData.whatsapp || "",
          email: userData.email || "",
          cidade: userData.cidade || "",
          estado: userData.estado || "",
          endereco: userData.endereco_completo || ""
        }));
      } catch (error) {
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Função para solicitar ajuda com descrição
  const handleSolicitarAjudaDescricao = async () => {
    if (!formData.titulo || !formData.categoria) {
      setErro("Preencha o título e a categoria primeiro para receber sugestões!");
      return;
    }

    setLoadingDescricao(true);
    setMostrarAssistenteDescricao(true);
    setFeedbackDescricao(null);

    try {
      const prompt = `Crie uma descrição profissional e atrativa para um anúncio de ${formData.categoria} com o título "${formData.titulo}". 
      
A descrição deve:
- Ser clara e objetiva
- Destacar benefícios do serviço
- Usar linguagem profissional mas acessível
- Ter entre 100-150 palavras
- Incluir call-to-action no final

${formData.subcategoria ? `Subcategoria específica: ${formData.subcategoria}` : ''}
${formData.faixa_preco ? `Faixa de preço: ${formData.faixa_preco}` : ''}`;

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setSugestaoDescricao(resultado);
    } catch (error) {
      console.error("Erro ao gerar descrição:", error);
      setErro("Erro ao gerar sugestão. Tente novamente.");
    } finally {
      setLoadingDescricao(false);
    }
  };

  // Função para copiar descrição sugerida
  const handleCopiarDescricao = () => {
    navigator.clipboard.writeText(sugestaoDescricao);
    alert("Descrição copiada!");
  };

  // Função para aplicar descrição sugerida
  const handleAplicarDescricao = () => {
    setFormData(prev => ({ ...prev, descricao: sugestaoDescricao }));
    setFeedbackDescricao("positivo");
    setTimeout(() => {
      setMostrarAssistenteDescricao(false);
      setFeedbackDescricao(null);
    }, 1500);
  };

  // Função para rejeitar descrição sugerida
  const handleRejeitarDescricao = () => {
    setFeedbackDescricao("negativo");
    setTimeout(() => {
      handleSolicitarAjudaDescricao();
    }, 500);
  };

  // Função para gerar anúncio completo com IA
  const handleGerarAnuncioIA = async () => {
    if (!dadosGeradorIA.tipo_negocio || !dadosGeradorIA.especialidade_principal) {
      setErro("Preencha pelo menos o tipo de negócio e a especialidade principal!");
      return;
    }

    setLoadingGerador(true);

    try {
      const prompt = `Gere um anúncio completo para um profissional de estética com as seguintes informações:

Tipo de Negócio: ${dadosGeradorIA.tipo_negocio}
Especialidade Principal: ${dadosGeradorIA.especialidade_principal}
${dadosGeradorIA.diferenciais ? `Diferenciais: ${dadosGeradorIA.diferenciais}` : ''}
${dadosGeradorIA.publico_alvo ? `Público-Alvo: ${dadosGeradorIA.publico_alvo}` : ''}
${dadosGeradorIA.experiencia ? `Anos de Experiência: ${dadosGeradorIA.experiencia}` : ''}

Gere um JSON com os seguintes campos:
- titulo: Um título atrativo e profissional (máximo 80 caracteres)
- descricao: Uma descrição completa e persuasiva (150-200 palavras)
- subcategoria: Subcategoria específica do serviço
- procedimentos_servicos: Array com 5-7 procedimentos/serviços oferecidos
- tags: Array com 5-8 hashtags relevantes (sem #)
- horario_funcionamento: Sugestão de horário de funcionamento

Seja criativo mas profissional. Use linguagem que converta clientes.`;

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            titulo: { type: "string" },
            descricao: { type: "string" },
            subcategoria: { type: "string" },
            procedimentos_servicos: { type: "array", items: { type: "string" } },
            tags: { type: "array", items: { type: "string" } },
            horario_funcionamento: { type: "string" }
          }
        }
      });

      setAnuncioGerado(resultado);
    } catch (error) {
      console.error("Erro ao gerar anúncio:", error);
      setErro("Erro ao gerar anúncio. Tente novamente.");
    } finally {
      setLoadingGerador(false);
    }
  };

  // Função para aplicar anúncio gerado (sem substituir campos já preenchidos)
  const handleAplicarAnuncioGerado = () => {
    setFormData(prev => ({
      ...prev,
      titulo: prev.titulo || anuncioGerado.titulo,
      descricao: prev.descricao || anuncioGerado.descricao,
      subcategoria: prev.subcategoria || anuncioGerado.subcategoria,
      procedimentos_servicos: prev.procedimentos_servicos.length > 0 ? prev.procedimentos_servicos : anuncioGerado.procedimentos_servicos,
      tags: prev.tags.length > 0 ? prev.tags : anuncioGerado.tags,
      horario_funcionamento: prev.horario_funcionamento || anuncioGerado.horario_funcionamento
    }));

    setMostrarGeradorIA(false);
    setAnuncioGerado(null);
    alert("Anúncio gerado aplicado com sucesso! Os campos que você já havia preenchido foram mantidos.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro(null);

    try {
      const anuncioData = {
        ...formData,
        status: "ativo",
        plano: user?.plano_ativo || "cobre",
        dias_exposicao: 30,
        visualizacoes: 0,
        curtidas: 0,
        profissional_verificado: false
      };

      await base44.entities.Anuncio.create(anuncioData);
      setSucesso(true);

      setTimeout(() => {
        navigate(createPageUrl("Inicio"));
      }, 2000);
    } catch (error) {
      console.error("Erro ao cadastrar anúncio:", error);
      setErro("Erro ao cadastrar anúncio. Verifique os dados e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold">
            <Sparkles className="w-4 h-4 mr-2" />
            Cadastro de Anúncio
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Crie Seu Anúncio Profissional
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Preencha as informações abaixo ou use nosso assistente de IA para criar um anúncio otimizado
          </p>
        </div>

        {/* Botões de Assistência IA */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer" onClick={() => setMostrarGeradorIA(true)}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Gerar Anúncio com IA</h3>
                  <p className="text-sm text-gray-600">
                    Preencha informações básicas e deixe a IA criar seu anúncio completo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer" onClick={handleSolicitarAjudaDescricao}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Ajuda com Descrição</h3>
                  <p className="text-sm text-gray-600">
                    Receba sugestões de descrição baseadas no seu título e categoria
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {erro && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}

        {sucesso && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Anúncio cadastrado com sucesso! Redirecionando...
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo e Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Anúncio *</Label>
                  <Select value={formData.tipo_anuncio} onValueChange={(value) => handleInputChange("tipo_anuncio", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposAnuncio.map(tipo => (
                        <SelectItem key={tipo.valor} value={tipo.valor}>{tipo.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Categoria *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Título do Anúncio *</Label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => handleInputChange("titulo", e.target.value)}
                  placeholder="Ex: Harmonização Facial Completa com Especialista"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Descrição *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSolicitarAjudaDescricao}
                    disabled={!formData.titulo || !formData.categoria}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Pedir Ajuda IA
                  </Button>
                </div>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => handleInputChange("descricao", e.target.value)}
                  placeholder="Descreva detalhadamente os serviços oferecidos..."
                  rows={6}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Subcategoria</Label>
                  <Input
                    value={formData.subcategoria}
                    onChange={(e) => handleInputChange("subcategoria", e.target.value)}
                    placeholder="Ex: Preenchimento Labial"
                  />
                </div>

                <div>
                  <Label>Faixa de Preço *</Label>
                  <Select value={formData.faixa_preco} onValueChange={(value) => handleInputChange("faixa_preco", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a faixa" />
                    </SelectTrigger>
                    <SelectContent>
                      {faixasPreco.map(faixa => (
                        <SelectItem key={faixa.valor} value={faixa.valor}>{faixa.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Profissional *</Label>
                  <Input
                    value={formData.profissional}
                    onChange={(e) => handleInputChange("profissional", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Telefone *</Label>
                  <Input
                    value={formData.telefone}
                    onChange={(e) => handleInputChange("telefone", e.target.value)}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Localização */}
          <Card>
            <CardHeader>
              <CardTitle>Localização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Cidade *</Label>
                  <Input
                    value={formData.cidade}
                    onChange={(e) => handleInputChange("cidade", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Estado *</Label>
                  <Input
                    value={formData.estado}
                    onChange={(e) => handleInputChange("estado", e.target.value)}
                    maxLength={2}
                    required
                  />
                </div>

                <div>
                  <Label>CEP</Label>
                  <Input
                    value={formData.cep}
                    onChange={(e) => handleInputChange("cep", e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
              </div>

              <div>
                <Label>Endereço Completo</Label>
                <Input
                  value={formData.endereco}
                  onChange={(e) => handleInputChange("endereco", e.target.value)}
                  placeholder="Rua, número, bairro"
                />
              </div>

              <div>
                <Label>Horário de Funcionamento</Label>
                <Input
                  value={formData.horario_funcionamento}
                  onChange={(e) => handleInputChange("horario_funcionamento", e.target.value)}
                  placeholder="Ex: Seg a Sex: 9h às 18h | Sáb: 9h às 13h"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("Inicio"))}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
            >
              {loading ? "Cadastrando..." : "Cadastrar Anúncio"}
            </Button>
          </div>
        </form>
      </div>

      {/* Modal de Assistente de Descrição */}
      <Dialog open={mostrarAssistenteDescricao} onOpenChange={setMostrarAssistenteDescricao}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              Sugestão de Descrição com IA
            </DialogTitle>
            <DialogDescription>
              Baseado no seu título e categoria, nossa IA gerou esta descrição profissional
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {loadingDescricao ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Gerando descrição...</span>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {sugestaoDescricao}
                  </p>
                </div>

                <AnimatePresence>
                  {feedbackDescricao === "positivo" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-green-50 border-2 border-green-200 p-4 rounded-lg text-center"
                    >
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-green-800 font-semibold">Descrição aplicada com sucesso!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleCopiarDescricao}
              disabled={loadingDescricao}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Texto
            </Button>
            <Button
              variant="outline"
              onClick={handleRejeitarDescricao}
              disabled={loadingDescricao}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Gerar Outra
            </Button>
            <Button
              onClick={handleAplicarDescricao}
              disabled={loadingDescricao}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Usar Esta Descrição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Gerador de Anúncio com IA */}
      <Dialog open={mostrarGeradorIA} onOpenChange={setMostrarGeradorIA}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-600" />
              Gerar Anúncio Completo com IA
            </DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo e nossa IA criará um anúncio profissional completo para você. 
              <strong> Os campos que você já preencheu no formulário serão mantidos.</strong>
            </DialogDescription>
          </DialogHeader>

          {!anuncioGerado ? (
            <div className="space-y-4">
              <Alert className="bg-purple-50 border-purple-200">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800">
                  <strong>Como funciona:</strong> Preencha algumas informações básicas e a IA irá gerar:
                  título profissional, descrição otimizada, procedimentos sugeridos, tags relevantes e horário de funcionamento.
                </AlertDescription>
              </Alert>

              <div>
                <Label>Tipo de Negócio *</Label>
                <Input
                  value={dadosGeradorIA.tipo_negocio}
                  onChange={(e) => setDadosGeradorIA({...dadosGeradorIA, tipo_negocio: e.target.value})}
                  placeholder="Ex: Clínica de Estética, Consultório Individual, Studio de Beleza"
                />
              </div>

              <div>
                <Label>Especialidade Principal *</Label>
                <Input
                  value={dadosGeradorIA.especialidade_principal}
                  onChange={(e) => setDadosGeradorIA({...dadosGeradorIA, especialidade_principal: e.target.value})}
                  placeholder="Ex: Harmonização Facial, Depilação a Laser, Micropigmentação"
                />
              </div>

              <div>
                <Label>Diferenciais do Seu Negócio</Label>
                <Textarea
                  value={dadosGeradorIA.diferenciais}
                  onChange={(e) => setDadosGeradorIA({...dadosGeradorIA, diferenciais: e.target.value})}
                  placeholder="Ex: Equipamentos de última geração, atendimento personalizado, produtos premium"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Quanto mais detalhes, melhor será o anúncio gerado
                </p>
              </div>

              <div>
                <Label>Público-Alvo</Label>
                <Input
                  value={dadosGeradorIA.publico_alvo}
                  onChange={(e) => setDadosGeradorIA({...dadosGeradorIA, publico_alvo: e.target.value})}
                  placeholder="Ex: Mulheres 25-45 anos, Homens executivos, Noivas"
                />
              </div>

              <div>
                <Label>Anos de Experiência</Label>
                <Input
                  value={dadosGeradorIA.experiencia}
                  onChange={(e) => setDadosGeradorIA({...dadosGeradorIA, experiencia: e.target.value})}
                  placeholder="Ex: 10 anos, 5 anos"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Anúncio gerado com sucesso!</strong> Revise as informações abaixo antes de aplicar.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label className="font-bold">Título Gerado:</Label>
                  <div className="bg-gray-50 p-3 rounded border mt-1">
                    <p>{anuncioGerado.titulo}</p>
                  </div>
                </div>

                <div>
                  <Label className="font-bold">Descrição Gerada:</Label>
                  <div className="bg-gray-50 p-3 rounded border mt-1">
                    <p className="whitespace-pre-line">{anuncioGerado.descricao}</p>
                  </div>
                </div>

                <div>
                  <Label className="font-bold">Subcategoria:</Label>
                  <div className="bg-gray-50 p-3 rounded border mt-1">
                    <p>{anuncioGerado.subcategoria}</p>
                  </div>
                </div>

                <div>
                  <Label className="font-bold">Procedimentos/Serviços:</Label>
                  <div className="bg-gray-50 p-3 rounded border mt-1">
                    <div className="flex flex-wrap gap-2">
                      {anuncioGerado.procedimentos_servicos.map((proc, i) => (
                        <Badge key={i} variant="outline">{proc}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="font-bold">Tags:</Label>
                  <div className="bg-gray-50 p-3 rounded border mt-1">
                    <div className="flex flex-wrap gap-2">
                      {anuncioGerado.tags.map((tag, i) => (
                        <Badge key={i} className="bg-purple-100 text-purple-800">#{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="font-bold">Horário de Funcionamento:</Label>
                  <div className="bg-gray-50 p-3 rounded border mt-1">
                    <p>{anuncioGerado.horario_funcionamento}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {!anuncioGerado ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setMostrarGeradorIA(false)}
                  disabled={loadingGerador}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleGerarAnuncioIA}
                  disabled={loadingGerador || !dadosGeradorIA.tipo_negocio || !dadosGeradorIA.especialidade_principal}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loadingGerador ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Gerar Anúncio
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setAnuncioGerado(null)}
                >
                  Gerar Novamente
                </Button>
                <Button
                  onClick={handleAplicarAnuncioGerado}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aplicar ao Formulário
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}