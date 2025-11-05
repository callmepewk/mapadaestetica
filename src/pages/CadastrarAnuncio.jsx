
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
import { Checkbox } from "@/components/ui/checkbox";
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
  Loader2,
  X,
  Shield,
  FileText,
  MessageCircle,
  MapPin // New import
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
  { valor: "promocao", label: "Promoção" },
  { valor: "venda_produto", label: "Venda de Produto" },
  { valor: "venda_aparelho", label: "Venda de Aparelho" },
  { valor: "aluguel_produto", label: "Aluguel de Produto" },
  { valor: "aluguel_aparelho", label: "Aluguel de Aparelho" },
  { valor: "troca_produto", label: "Troca de Produto" },
  { valor: "troca_aparelho", label: "Troca de Aparelho" }
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
    tags: [],
    imagem_principal: "",
    logo: "", // New field
    imagens_galeria: [],
    amenidades: {
      estacionamento: false,
      estacionamento_valet: false,
      aceita_pet: false,
      lounge: false,
      lounge_bar: false,
      musica_ambiente: false,
      seguranca: false
    }
  });

  // Estados de upload de imagens
  const [uploadingImagemPrincipal, setUploadingImagemPrincipal] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false); // New state
  const [uploadingGaleria, setUploadingGaleria] = useState(false);

  // Estados de verificação de autoridade
  const [documentosVerificacao, setDocumentosVerificacao] = useState({
    licenca_sanitaria: null,
    alvara_funcionamento: null,
    registro_profissional: null
  });
  const [uploadingDocumentos, setUploadingDocumentos] = useState({
    licenca_sanitaria: false,
    alvara_funcionamento: false,
    registro_profissional: false
  });
  const [solicitarVerificacao, setSolicitarVerificacao] = useState(false);

  // Estados do Assistente IA (Descrição)
  const [mostrarAssistenteDescricao, setMostrarAssistenteDescricao] = useState(false);
  const [sugestaoDescricao, setSugestaoDescricao] = useState("");
  const [loadingDescricao, setLoadingDescricao] = useState(false);
  const [feedbackDescricao, setFeedbackDescricao] = useState(null);

  // Novo estado: Assistente IA para Título
  const [mostrarAssistenteTitulo, setMostrarAssistenteTitulo] = useState(false);
  const [sugestaoTitulo, setSugestaoTitulo] = useState("");
  const [loadingTitulo, setLoadingTitulo] = useState(false);
  const [feedbackTitulo, setFeedbackTitulo] = useState(null);

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

  // Novo estado: Modal de Geração de Imagem
  const [mostrarModalImagem, setMostrarModalImagem] = useState(false);

  // Estado para localização
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);

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

  const handleAmenidadeChange = (amenidade, checked) => {
    setFormData(prev => ({
      ...prev,
      amenidades: {
        ...prev.amenidades,
        [amenidade]: checked
      }
    }));
  };

  // Upload de logo
  const handleUploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, logo: file_url }));
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setErro("Erro ao fazer upload do logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Upload de imagem principal
  const handleUploadImagemPrincipal = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImagemPrincipal(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, imagem_principal: file_url }));
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setErro("Erro ao fazer upload da imagem");
    } finally {
      setUploadingImagemPrincipal(false);
    }
  };

  // Upload de galeria de imagens
  const handleUploadGaleria = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingGaleria(true);
    try {
      const urls = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        urls.push(file_url);
      }
      setFormData(prev => ({
        ...prev,
        imagens_galeria: [...prev.imagens_galeria, ...urls]
      }));
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setErro("Erro ao fazer upload das imagens");
    } finally {
      setUploadingGaleria(false);
    }
  };

  // Remover imagem da galeria
  const handleRemoverImagemGaleria = (index) => {
    setFormData(prev => ({
      ...prev,
      imagens_galeria: prev.imagens_galeria.filter((_, i) => i !== index)
    }));
  };

  // Upload de documentos de verificação
  const handleUploadDocumento = async (tipo, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDocumentos(prev => ({ ...prev, [tipo]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setDocumentosVerificacao(prev => ({ ...prev, [tipo]: file_url }));
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setErro("Erro ao fazer upload do documento");
    } finally {
      setUploadingDocumentos(prev => ({ ...prev, [tipo]: false }));
    }
  };

  // Enviar solicitação de verificação
  const handleEnviarVerificacao = async () => {
    const documentosCompletos = Object.values(documentosVerificacao).every(doc => doc !== null);

    if (!documentosCompletos) {
      setErro("Por favor, envie todos os 3 documentos para solicitar verificação");
      return;
    }

    const mensagem = `
Nova Solicitação de Verificação de Profissional

Profissional: ${user.full_name}
Email: ${user.email}
Telefone: ${formData.telefone}
Cidade: ${formData.cidade} - ${formData.estado}

Documentos enviados:
1. Licença Sanitária: ${documentosVerificacao.licenca_sanitaria}
2. Alvará de Funcionamento: ${documentosVerificacao.alvara_funcionamento}
3. Registro Profissional: ${documentosVerificacao.registro_profissional}

Por favor, revisar e aprovar/reprovar esta solicitação.
    `;

    try {
      await base44.integrations.Core.SendEmail({
        to: "pedro_hbfreitas@hotmail.com", // This should be configured to an admin email
        subject: `Verificação de Profissional - ${user.full_name}`,
        body: mensagem
      });

      alert("Solicitação enviada com sucesso! Você receberá um email quando a verificação for processada.");
      setSolicitarVerificacao(false); // Reset this state if needed, or simply for internal logic.
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
      setErro("Erro ao enviar solicitação de verificação");
    }
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

  // Função para solicitar ajuda com título
  const handleSolicitarAjudaTitulo = async () => {
    if (!formData.categoria) {
      setErro("Preencha a categoria primeiro para receber sugestões de título!");
      return;
    }

    setLoadingTitulo(true);
    setMostrarAssistenteTitulo(true);
    setFeedbackTitulo(null);

    try {
      const prompt = `Crie um título profissional, atrativo e otimizado para SEO para um anúncio de ${formData.categoria}.

O título deve:
- Ser claro e direto
- Chamar atenção do cliente
- Incluir palavras-chave relevantes
- Ter no máximo 70 caracteres
- Ser profissional mas cativante

${formData.subcategoria ? `Subcategoria específica: ${formData.subcategoria}` : ''}
${formData.profissional ? `Nome do profissional: ${formData.profissional}` : ''}

Gere APENAS o título, sem aspas ou explicações adicionais.`;

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setSugestaoTitulo(resultado);
    } catch (error) {
      console.error("Erro ao gerar título:", error);
      setErro("Erro ao gerar sugestão de título. Tente novamente.");
    } finally {
      setLoadingTitulo(false);
    }
  };

  // Função para copiar título sugerido
  const handleCopiarTitulo = () => {
    navigator.clipboard.writeText(sugestaoTitulo);
    alert("Título copiado!");
  };

  // Função para aplicar título sugerido
  const handleAplicarTitulo = () => {
    setFormData(prev => ({ ...prev, titulo: sugestaoTitulo }));
    setFeedbackTitulo("positivo");
    setTimeout(() => {
      setMostrarAssistenteTitulo(false);
      setFeedbackTitulo(null);
    }, 1500);
  };

  // Função para rejeitar título sugerido
  const handleRejeitarTitulo = () => {
    setFeedbackTitulo("negativo");
    setTimeout(() => {
      handleSolicitarAjudaTitulo();
    }, 500);
  };

  // Função para abrir modal de geração de imagem
  const handleGerarImagem = () => {
    setMostrarModalImagem(true);
  };

  // Função para contratar serviço de design
  const handleContratarDesign = () => {
    const mensagem = `Olá! Tenho interesse no serviço de design profissional para geração de imagens de anúncios do Mapa da Estética! 🎨`;
    window.open(`https://wa.me/5531972595643?text=${encodeURIComponent(mensagem)}`, '_blank');
    setMostrarModalImagem(false);
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

  // Função para buscar localização do usuário
  const handleUsarMinhaLocalizacao = async () => {
    setBuscandoLocalizacao(true);

    try {
      // Tentar obter geolocalização do navegador
      if (!navigator.geolocation) {
        alert("Geolocalização não é suportada pelo seu navegador");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Usar API de geocoding reverso para obter endereço
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();

            if (data && data.address) {
              const address = data.address;

              setFormData(prev => ({
                ...prev,
                cidade: address.city || address.town || address.village || "",
                estado: address.state_code || address.state || "",
                endereco: `${address.road || ""} ${address.house_number || ""}`.trim(),
                cep: address.postcode || ""
              }));

              alert("Localização preenchida com sucesso!");
            } else {
                alert("Não foi possível determinar o endereço a partir da sua localização. Preencha manualmente.");
            }
          } catch (error) {
            console.error("Erro ao buscar endereço:", error);
            alert("Erro ao buscar endereço. Verifique sua conexão ou tente novamente.");
          }
        },
        (error) => {
          console.error("Erro de geolocalização:", error);
          let message = "Não foi possível obter sua localização. ";
          if (error.code === error.PERMISSION_DENIED) {
              message += "Por favor, conceda permissão de localização ao navegador.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
              message += "As informações de localização não estão disponíveis.";
          } else if (error.code === error.TIMEOUT) {
              message += "A solicitação para obter a localização expirou.";
          }
          alert(message);
        }
      );
    } finally {
      setBuscandoLocalizacao(false);
    }
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
        profissional_verificado: false,
        imagem_principal: formData.imagem_principal,
        logo: formData.logo, // Include in payload
        imagens_galeria: formData.imagens_galeria,
        amenidades: formData.amenidades,
        verificacao_autoridade: {
          licenca_sanitaria: {
            possui: !!documentosVerificacao.licenca_sanitaria,
            documento_url: documentosVerificacao.licenca_sanitaria || "",
            verificado: false,
            data_verificacao: ""
          },
          alvara_funcionamento: {
            possui: !!documentosVerificacao.alvara_funcionamento,
            documento_url: documentosVerificacao.alvara_funcionamento || "",
            verificado: false,
            data_verificacao: ""
          },
          registro_profissional: {
            possui: !!documentosVerificacao.registro_profissional,
            documento_url: documentosVerificacao.registro_profissional || "",
            verificado: false,
            data_verificacao: ""
          }
        }
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
                  <h3 className="font-bold text-lg mb-1">Ajuda com Descrição IA</h3>
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
          {/* Informações Básicas */}
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
                <div className="flex items-center justify-between mb-2">
                  <Label>Título do Anúncio *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSolicitarAjudaTitulo}
                    disabled={!formData.categoria}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Pedir Ajuda IA
                  </Button>
                </div>
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

          {/* Upload de Imagens */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Imagens do Anúncio</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGerarImagem}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Gerar Imagem com Design Profissional
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo/Foto do Profissional */}
              <div>
                <Label>Logo / Foto do Profissional</Label>
                <p className="text-xs text-gray-500 mb-2">Imagem que aparecerá como identificação do seu perfil</p>
                <div className="mt-2">
                  {formData.logo ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.logo}
                        alt="Logo"
                        className="w-32 h-32 object-cover rounded-full border-4 border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                        onClick={() => setFormData(prev => ({ ...prev, logo: "" }))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center max-w-xs">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <Label htmlFor="logo" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700">
                          {uploadingLogo ? "Enviando..." : "Clique para enviar logo"}
                        </span>
                      </Label>
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadLogo}
                        disabled={uploadingLogo}
                      />
                      <p className="text-xs text-gray-500 mt-2">Preferencialmente quadrada (1:1)</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Imagem Principal *</Label>
                <p className="text-xs text-gray-500 mb-2">Imagem de capa do seu anúncio</p>
                <div className="mt-2">
                  {formData.imagem_principal ? (
                    <div className="relative">
                      <img
                        src={formData.imagem_principal}
                        alt="Imagem principal"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData(prev => ({ ...prev, imagem_principal: "" }))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <Label htmlFor="imagem-principal" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700">
                          {uploadingImagemPrincipal ? "Enviando..." : "Clique para enviar"}
                        </span>
                      </Label>
                      <Input
                        id="imagem-principal"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadImagemPrincipal}
                        disabled={uploadingImagemPrincipal}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Galeria de Imagens (até 10 imagens)</Label>
                <div className="mt-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {formData.imagens_galeria.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt={`Galeria ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => handleRemoverImagemGaleria(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {formData.imagens_galeria.length < 10 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <Label htmlFor="galeria" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 text-sm">
                          {uploadingGaleria ? "Enviando..." : "Adicionar mais imagens"}
                        </span>
                      </Label>
                      <Input
                        id="galeria"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleUploadGaleria}
                        disabled={uploadingGaleria}
                      />
                    </div>
                  )}
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

          {/* Amenidades */}
          <Card>
            <CardHeader>
              <CardTitle>Amenidades do Estabelecimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="estacionamento"
                    checked={formData.amenidades.estacionamento}
                    onCheckedChange={(checked) => handleAmenidadeChange("estacionamento", checked)}
                  />
                  <Label htmlFor="estacionamento" className="cursor-pointer">
                    🅿️ Estacionamento
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="estacionamento_valet"
                    checked={formData.amenidades.estacionamento_valet}
                    onCheckedChange={(checked) => handleAmenidadeChange("estacionamento_valet", checked)}
                  />
                  <Label htmlFor="estacionamento_valet" className="cursor-pointer">
                    🚗 Estacionamento com Valet
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="aceita_pet"
                    checked={formData.amenidades.aceita_pet}
                    onCheckedChange={(checked) => handleAmenidadeChange("aceita_pet", checked)}
                  />
                  <Label htmlFor="aceita_pet" className="cursor-pointer">
                    🐕 Aceita Pets
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lounge"
                    checked={formData.amenidades.lounge}
                    onCheckedChange={(checked) => handleAmenidadeChange("lounge", checked)}
                  />
                  <Label htmlFor="lounge" className="cursor-pointer">
                    🛋️ Lounge
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lounge_bar"
                    checked={formData.amenidades.lounge_bar}
                    onCheckedChange={(checked) => handleAmenidadeChange("lounge_bar", checked)}
                  />
                  <Label htmlFor="lounge_bar" className="cursor-pointer">
                    🍷 Lounge Bar
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="musica_ambiente"
                    checked={formData.amenidades.musica_ambiente}
                    onCheckedChange={(checked) => handleAmenidadeChange("musica_ambiente", checked)}
                  />
                  <Label htmlFor="musica_ambiente" className="cursor-pointer">
                    🎵 Música Ambiente
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="seguranca"
                    checked={formData.amenidades.seguranca}
                    onCheckedChange={(checked) => handleAmenidadeChange("seguranca", checked)}
                  />
                  <Label htmlFor="seguranca" className="cursor-pointer">
                    🛡️ Segurança 24h
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Localização */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Localização</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUsarMinhaLocalizacao}
                  disabled={buscandoLocalizacao}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  {buscandoLocalizacao ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Usar Minha Localização
                    </>
                  )}
                </Button>
              </div>
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

          {/* Torne-se um Profissional Verificado */}
          <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-blue-900">Torne-se um Profissional Verificado</CardTitle>
              </div>
              <p className="text-sm text-blue-700 mt-2">
                Ganhe o selo de verificação ✓ similar ao Meta e aumente sua credibilidade!
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-white border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <strong>Como funciona:</strong> Envie os 3 documentos abaixo e nossa equipe irá verificar.
                  Após aprovação, você receberá o selo de profissional verificado no seu anúncio!
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {/* Licença Sanitária */}
                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Licença Sanitária
                  </Label>
                  {documentosVerificacao.licenca_sanitaria ? (
                    <div className="mt-2 p-3 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-between">
                      <span className="text-sm text-green-800">✓ Documento enviado</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDocumentosVerificacao(prev => ({ ...prev, licenca_sanitaria: null }))}
                      >
                        Remover
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <Label htmlFor="licenca" className="cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                          {uploadingDocumentos.licenca_sanitaria ? (
                            <Loader2 className="w-6 h-6 mx-auto animate-spin text-blue-600" />
                          ) : (
                            <>
                              <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                              <span className="text-sm text-blue-600">Clique para enviar</span>
                            </>
                          )}
                        </div>
                      </Label>
                      <Input
                        id="licenca"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleUploadDocumento("licenca_sanitaria", e)}
                        disabled={uploadingDocumentos.licenca_sanitaria}
                      />
                    </div>
                  )}
                </div>

                {/* Alvará de Funcionamento */}
                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Alvará de Funcionamento
                  </Label>
                  {documentosVerificacao.alvara_funcionamento ? (
                    <div className="mt-2 p-3 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-between">
                      <span className="text-sm text-green-800">✓ Documento enviado</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDocumentosVerificacao(prev => ({ ...prev, alvara_funcionamento: null }))}
                      >
                        Remover
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <Label htmlFor="alvara" className="cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                          {uploadingDocumentos.alvara_funcionamento ? (
                            <Loader2 className="w-6 h-6 mx-auto animate-spin text-blue-600" />
                          ) : (
                            <>
                              <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                              <span className="text-sm text-blue-600">Clique para enviar</span>
                            </>
                          )}
                        </div>
                      </Label>
                      <Input
                        id="alvara"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleUploadDocumento("alvara_funcionamento", e)}
                        disabled={uploadingDocumentos.alvara_funcionamento}
                      />
                    </div>
                  )}
                </div>

                {/* Registro Profissional */}
                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Registro Profissional (CRO, CREFITO, etc)
                  </Label>
                  {documentosVerificacao.registro_profissional ? (
                    <div className="mt-2 p-3 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-between">
                      <span className="text-sm text-green-800">✓ Documento enviado</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDocumentosVerificacao(prev => ({ ...prev, registro_profissional: null }))}
                      >
                        Remover
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <Label htmlFor="registro" className="cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                          {uploadingDocumentos.registro_profissional ? (
                            <Loader2 className="w-6 h-6 mx-auto animate-spin text-blue-600" />
                          ) : (
                            <>
                              <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                              <span className="text-sm text-blue-600">Clique para enviar</span>
                            </>
                          )}
                        </div>
                      </Label>
                      <Input
                        id="registro"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => handleUploadDocumento("registro_profissional", e)}
                        disabled={uploadingDocumentos.registro_profissional}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="button"
                onClick={handleEnviarVerificacao}
                disabled={!Object.values(documentosVerificacao).every(doc => doc !== null)}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Shield className="w-4 h-4 mr-2" />
                Enviar para Verificação
              </Button>
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

      {/* Modal de Assistente de Título */}
      <Dialog open={mostrarAssistenteTitulo} onOpenChange={setMostrarAssistenteTitulo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              Sugestão de Título com IA
            </DialogTitle>
            <DialogDescription>
              Baseado na sua categoria, nossa IA gerou este título profissional e otimizado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {loadingTitulo ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Gerando título...</span>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border-2 border-blue-200">
                  <p className="text-xl font-bold text-gray-800 text-center">
                    {sugestaoTitulo}
                  </p>
                </div>

                <AnimatePresence>
                  {feedbackTitulo === "positivo" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-green-50 border-2 border-green-200 p-4 rounded-lg text-center"
                    >
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-green-800 font-semibold">Título aplicado com sucesso!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleCopiarTitulo}
              disabled={loadingTitulo}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Texto
            </Button>
            <Button
              variant="outline"
              onClick={handleRejeitarTitulo}
              disabled={loadingTitulo}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Gerar Outro
            </Button>
            <Button
              onClick={handleAplicarTitulo}
              disabled={loadingTitulo}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Usar Este Título
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Modal de Geração de Imagem */}
      <Dialog open={mostrarModalImagem} onOpenChange={setMostrarModalImagem}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Design Profissional de Imagens
            </DialogTitle>
            <DialogDescription>
              Serviço exclusivo com equipe especializada
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl border-2 border-purple-200 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wand2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Deseja Contratar Este Serviço Exclusivo?
              </h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Nossa equipe de design profissional criará imagens personalizadas e de alta qualidade
                para o seu anúncio, garantindo que você se destaque da concorrência!
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-6 text-left">
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-sm">Design Profissional</span>
                  </div>
                  <p className="text-xs text-gray-600">Imagens criadas por designers especializados</p>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-sm">Alta Qualidade</span>
                  </div>
                  <p className="text-xs text-gray-600">Imagens em alta resolução e otimizadas</p>
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-sm">Personalização</span>
                  </div>
                  <p className="text-xs text-gray-600">100% adaptado à sua identidade visual</p>
                </div>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200 mb-6">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 text-sm">
                  <strong>Investimento:</strong> Entre em contato para saber valores e prazos personalizados para suas necessidades!
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setMostrarModalImagem(false)}
              className="w-full sm:w-auto"
            >
              Talvez Depois
            </Button>
            <Button
              onClick={handleContratarDesign}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Falar com Equipe de Design
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
