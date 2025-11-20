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
import { ScrollArea } from "@/components/ui/scroll-area";
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
  MapPin,
  Plus
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
  { valor: "evento", label: "Evento" },
  { valor: "venda_produto", label: "Venda de Produto" },
  { valor: "venda_aparelho", label: "Venda de Aparelho" },
  { valor: "aluguel_produto", label: "Aluguel de Produto" },
  { valor: "aluguel_aparelho", label: "Aluguel de Aparelho" },
  { valor: "troca_produto", label: "Troca de Produto" },
  { valor: "troca_aparelho", label: "Troca de Aparelho" },
  { valor: "venda_moveis", label: "Venda de Móveis" },
  { valor: "troca_moveis", label: "Troca de Móveis" },
  { valor: "ia", label: "IA" },
  { valor: "servicos", label: "Serviços" },
  { valor: "servicos_ia", label: "Serviços de IA" },
  { valor: "midia_marketing", label: "Mídia e Marketing" }
];

const faixasPreco = [
  { valor: "$", label: "$ - Até R$ 500" },
  { valor: "$$", label: "$$ - R$ 500 a R$ 1.000" },
  { valor: "$$$", label: "$$$ - R$ 1.000 a R$ 2.000" },
  { valor: "$$$$", label: "$$$$ - R$ 2.000 a R$ 5.000" },
  { valor: "$$$$$", label: "$$$$$ - Acima de R$ 5.000" }
];

const tiposEstabelecimento = [
  { valor: "Consultorio", label: "Consultório", estrelas: 1 },
  { valor: "Clinica", label: "Clínica", estrelas: 2 },
  { valor: "Centro Clínico", label: "Centro Clínico (Médico)", estrelas: 3 },
  { valor: "Centro de Especialidade", label: "Centro Estético", estrelas: 4 },
  { valor: "Clinica de Luxo", label: "Clínica de Luxo", estrelas: 5 }
];

// NEW: List of common procedures for the selector
const procedimentosComuns = [
  "Limpeza de Pele Profunda", "Peeling Químico", "Microagulhamento", "Drenagem Linfática",
  "Massagem Modeladora", "Massagem Relaxante", "Botox", "Preenchimento Facial",
  "Fios de PDO", "Bioestimuladores de Colágeno", "Depilação a Laser", "Depilação com Cera",
  "Design de Sobrancelhas", "Micropigmentação de Sobrancelhas", "Alongamento de Cílios",
  "Manicure", "Pedicure", "Spa dos Pés", "Spa das Mãos", "Hair Skincare", "Corte de Cabelo",
  "Hidratação Capilar", "Coloração", "Tratamento para Acne", "Rejuvenescimento Facial",
  "Contorno Corporal", "Criolipólise", "Radiofrequência", "Ultrassom Microfocado",
  "Enzimas Injetáveis", "Tratamento para Celulite", "Tratamento para Estrias",
  "Esmaltação em Gel", "Unha de Fibra", "Reflexologia Podal", "Podoprofilaxia",
  "Tricologia Capilar", "Consultoria de Imagem", "Maquiagem Profissional", "Pós-operatório"
];

// NEW: SeletorProcedimentos Component
const SeletorProcedimentos = ({ open, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProcedimentos = procedimentosComuns.filter(proc =>
    proc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Procedimentos/Serviços</DialogTitle>
          <DialogDescription>
            Escolha os procedimentos ou serviços que você oferece para o seu anúncio.
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Buscar procedimento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        <ScrollArea className="h-[300px] pr-4">
          <div className="grid grid-cols-1 gap-2">
            {filteredProcedimentos.length > 0 ? (
              filteredProcedimentos.map((proc) => (
                <Button
                  key={proc}
                  variant="outline"
                  onClick={() => onSelect(proc)}
                  className="justify-start hover:bg-blue-50"
                >
                  {proc}
                </Button>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum procedimento encontrado.</p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// NOVO: Lista de Emojis para o Mapa
const emojisDisponiveis = [
  "💆", "💆‍♀️", "💆‍♂️", "💅", "💇", "💇‍♀️", "💇‍♂️", "✂️", "💄", "💋",
  "👄", "👁️", "👃", "🦷", "🧖", "🧖‍♀️", "🧖‍♂️", "🧴", "🧼", "🧽",
  "🪒", "💉", "💊", "🩹", "🩺", "⚕️", "🏥", "🏨", "🛁", "🚿",
  "✨", "⭐", "🌟", "💫", "🌸", "🌺", "🌻", "🌼", "🌷", "🌹",
  "🌿", "🍃", "☘️", "🎀", "🎁", "💝", "💖", "💗", "💓", "💞",
  "🦋", "🌈", "☀️", "🌙", "⚡", "🔥", "💧", "❄️", "🧊", "🎨",
  "🖌️", "✏️", "📝", "📋", "📌", "🎯", "🏆", "👑", "💎", "💍",
  "🔬", "🧬", "🧪", "⚗️", "🩻", "🔍", "📊", "📈", "🎓", "🏅"
];

// NOVO: Componente Seletor de Emoji
const SeletorEmoji = ({ open, onClose, onSelect, emojiAtual }) => {
  const [busca, setBusca] = useState(""); // This state is not used in the provided filteredEmojis logic, but kept as per original.

  const emojisFiltrados = busca
    ? emojisDisponiveis.filter((emoji) => emoji.includes(busca)) // Filter by emoji character if needed, or by some description
    : emojisDisponiveis;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎨 Selecionar Ícone para o Mapa
          </DialogTitle>
          <DialogDescription>
            Escolha o emoji que representará seu anúncio no mapa da estética
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {emojiAtual && (
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 text-center">
              <p className="text-sm text-blue-800 mb-2">Emoji atual:</p>
              <span className="text-6xl">{emojiAtual}</span>
            </div>
          )}

          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 p-2">
              {emojisFiltrados.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelect(emoji);
                    onClose();
                  }}
                  className={`text-4xl p-3 rounded-lg hover:bg-blue-100 transition-all hover:scale-110 ${
                    emoji === emojiAtual ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-gray-50'
                  }`}
                  title={`Emoji ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


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
    status_funcionamento: "",
    tipo_estabelecimento: "", // NEW
    estrelas_estabelecimento: null, // NEW
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
    logo: "",
    imagens_galeria: [],
    amenidades: {
      estacionamento: false,
      estacionamento_valet: false,
      aceita_pet: false,
      lounge: false,
      lounge_bar: false,
      musica_ambiente: false,
      seguranca: false
    },
    icone_mapa: "📍" // NOVO: Emoji padrão para o mapa
  });

  // Estados de upload de imagens
  const [uploadingImagemPrincipal, setUploadingImagemPrincipal] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
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
  // NEW STATE: Estado para o seletor de procedimentos
  const [mostrarSeletorProcedimentos, setMostrarSeletorProcedimentos] = useState(false);

  // NOVOS Estados para Seletor de Emoji
  const [mostrarSeletorEmoji, setMostrarSeletorEmoji] = useState(false);
  const [gerandoEmojiIA, setGerandoEmojiIA] = useState(false);


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
    // Se for tipo_estabelecimento, também atualizar as estrelas
    if (field === "tipo_estabelecimento") {
      const tipoSelecionado = tiposEstabelecimento.find(t => t.valor === value);
      setFormData(prev => ({
        ...prev,
        tipo_estabelecimento: value,
        estrelas_estabelecimento: tipoSelecionado ? tipoSelecionado.estrelas : null
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAmenidadeChange = (amenidade, checked) => {
    setFormData(prev => ({
      ...prev,
      amenidades: { // Correctly updating nested state
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

  // NEW FUNCTION: Adicionar procedimento
  const handleAdicionarProcedimento = (procedimento) => {
    if (!formData.procedimentos_servicos.includes(procedimento)) {
      setFormData(prev => ({
        ...prev,
        procedimentos_servicos: [...prev.procedimentos_servicos, procedimento]
      }));
    }
    setMostrarSeletorProcedimentos(false); // Close the selector after selection
  };

  // NEW FUNCTION: Remover procedimento
  const handleRemoverProcedimento = (procedimento) => {
    setFormData(prev => ({
      ...prev,
      procedimentos_servicos: prev.procedimentos_servicos.filter(p => p !== procedimento)
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
      setErro("Erro ao gerar sugestão. Tente novamente.");
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

  // NOVA Função: Sugerir Emoji com IA
  const handleSugerirEmojiIA = async () => {
    if (!formData.titulo || !formData.categoria) {
      setErro("Preencha título e categoria primeiro para receber sugestões de emoji!");
      setTimeout(() => setErro(null), 3000);
      return;
    }

    setGerandoEmojiIA(true);

    try {
      const prompt = `Você é um especialista em UX/UI para plataformas de estética.

ANÚNCIO:
Título: ${formData.titulo}
Categoria: ${formData.categoria}
${formData.subcategoria ? `Subcategoria: ${formData.subcategoria}` : ''}
${formData.descricao ? `Descrição: ${formData.descricao.substring(0, 200)}` : ''}
${formData.procedimentos_servicos.length > 0 ? `Procedimentos: ${formData.procedimentos_servicos.join(', ')}` : ''}

TAREFA: Escolha o emoji MAIS ADEQUADO da lista abaixo para representar este anúncio no mapa:

${emojisDisponiveis.join(' ')}

CRITÉRIOS:
- O emoji deve ser CLARO e RECONHECÍVEL
- Deve representar bem a categoria/serviço
- Deve ser profissional mas atrativo
- Priorize emojis relacionados a beleza, saúde e estética

Retorne APENAS o emoji escolhido, sem aspas, explicações ou texto adicional.`;

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      const emojiSugerido = resultado.trim();
      
      // Verificar se o emoji sugerido existe na lista
      if (emojisDisponiveis.includes(emojiSugerido)) {
        setFormData(prev => ({ ...prev, icone_mapa: emojiSugerido }));
        alert(`✨ IA sugeriu: ${emojiSugerido}\n\nEmoji aplicado com sucesso!`);
      } else {
        // Fallback: Tentar encontrar emoji similar (ex: se a IA retornar "💅🏻" e só tiver "💅") ou usar o primeiro caractere se for um emoji composto ou não encontrado.
        // For now, defaulting to the first emoji or a known generic one for simplicity.
        const defaultEmoji = emojisDisponiveis.includes("✨") ? "✨" : emojisDisponiveis[0];
        setFormData(prev => ({ ...prev, icone_mapa: defaultEmoji }));
        alert(`⚠️ A IA sugeriu um emoji não disponível ou ambíguo.\nAplicamos: ${defaultEmoji} (genérico ou primeiro da lista).`);
      }
    } catch (error) {
      console.error("Erro ao sugerir emoji:", error);
      alert("Erro ao sugerir emoji. Tente novamente.");
    } finally {
      setGerandoEmojiIA(false);
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
        logo: formData.logo,
        imagens_galeria: formData.imagens_galeria,
        amenidades: formData.amenidades,
        icone_mapa: formData.icone_mapa, // NOVO: Incluir emoji
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-4 sm:py-6 md:py-8 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <Badge className="mb-3 sm:mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold text-xs sm:text-sm">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Cadastro de Anúncio
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            Crie Seu Anúncio Profissional
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
            Preencha as informações abaixo ou use nosso assistente de IA para criar um anúncio otimizado
          </p>
        </div>

        {/* Botões de Assistência IA - MOBILE OPTIMIZED */}
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer" onClick={() => setMostrarGeradorIA(true)}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Wand2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1">Gerar Anúncio com IA</h3>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    Preencha informações básicas e deixe a IA criar seu anúncio completo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer" onClick={handleSolicitarAjudaDescricao}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base md:text-lg mb-1">Ajuda com Descrição IA</h3>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
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

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Informações Básicas - MOBILE OPTIMIZED */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-sm">Tipo de Anúncio *</Label>
                  <Select value={formData.tipo_anuncio} onValueChange={(value) => handleInputChange("tipo_anuncio", value)}>
                    <SelectTrigger className="mt-1 h-10 sm:h-11 text-sm">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposAnuncio.map(tipo => (
                        <SelectItem key={tipo.valor} value={tipo.valor} className="text-sm">{tipo.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Categoria *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
                    <SelectTrigger className="mt-1 h-10 sm:h-11 text-sm">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] sm:max-h-[300px]">
                      {categorias.map(cat => (
                        <SelectItem key={cat} value={cat} className="text-sm">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* NOVO: Tipo de Estabelecimento com Estrelas */}
              {(formData.tipo_anuncio === "consultorio" || formData.tipo_anuncio === "clinica") && (
                <div>
                  <Label className="text-sm">Tipo de Estabelecimento</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Selecione o tipo do seu estabelecimento. Cada tipo possui uma classificação em estrelas.
                  </p>
                  <Select
                    value={formData.tipo_estabelecimento}
                    onValueChange={(value) => handleInputChange("tipo_estabelecimento", value)}
                  >
                    <SelectTrigger className="mt-1 h-10 sm:h-11 text-sm">
                      <SelectValue placeholder="Selecione o tipo de estabelecimento" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposEstabelecimento.map(tipo => (
                        <SelectItem key={tipo.valor} value={tipo.valor} className="text-sm">
                          <div className="flex items-center gap-2">
                            <span>{tipo.label}</span>
                            <span className="text-yellow-500">
                              {"⭐".repeat(tipo.estrelas)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {formData.estrelas_estabelecimento && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-300">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {"⭐".repeat(formData.estrelas_estabelecimento)}
                        </span>
                        <div>
                          <p className="font-bold text-yellow-900">
                            {formData.tipo_estabelecimento}
                          </p>
                          <p className="text-xs text-yellow-700">
                            Classificação: {formData.estrelas_estabelecimento} {formData.estrelas_estabelecimento === 1 ? "estrela" : "estrelas"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Título do Anúncio *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSolicitarAjudaTitulo}
                    disabled={!formData.categoria}
                    className="text-xs sm:text-sm h-8 px-2 sm:h-auto sm:px-4"
                  >
                    <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Pedir Ajuda IA
                  </Button>
                </div>
                <Input
                  value={formData.titulo}
                  onChange={(e) => handleInputChange("titulo", e.target.value)}
                  placeholder="Ex: Harmonização Facial Completa com Especialista"
                  required
                  className="h-10 sm:h-11 text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Descrição *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSolicitarAjudaDescricao}
                    disabled={!formData.titulo || !formData.categoria}
                    className="text-xs sm:text-sm h-8 px-2 sm:h-auto sm:px-4"
                  >
                    <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Pedir Ajuda IA
                  </Button>
                </div>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => handleInputChange("descricao", e.target.value)}
                  placeholder="Descreva detalhadamente os serviços oferecidos..."
                  rows={6}
                  required
                  className="text-sm"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-sm">Subcategoria</Label>
                  <Input
                    value={formData.subcategoria}
                    onChange={(e) => handleInputChange("subcategoria", e.target.value)}
                    placeholder="Ex: Preenchimento Labial"
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-sm">Faixa de Preço *</Label>
                  <Select value={formData.faixa_preco} onValueChange={(value) => handleInputChange("faixa_preco", value)}>
                    <SelectTrigger className="mt-1 h-10 sm:h-11 text-sm">
                      <SelectValue placeholder="Selecione a faixa" />
                    </SelectTrigger>
                    <SelectContent>
                      {faixasPreco.map(faixa => (
                        <SelectItem key={faixa.valor} value={faixa.valor} className="text-sm">{faixa.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* NEW FIELDS */}
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-sm">Status de Funcionamento</Label>
                  <Select
                    value={formData.status_funcionamento || "N/D"}
                    onValueChange={(value) => handleInputChange("status_funcionamento", value)}
                  >
                    <SelectTrigger className="mt-1 h-10 sm:h-11 text-sm">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/D" className="text-sm">Não Informado</SelectItem>
                      <SelectItem value="Aberto Agora" className="text-sm">Aberto Agora</SelectItem>
                      <SelectItem value="Fechado" className="text-sm">Fechado</SelectItem>
                      <SelectItem value="Sempre Aberto" className="text-sm">Sempre Aberto (24h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm">Horário de Funcionamento</Label>
                  <Input
                    value={formData.horario_funcionamento}
                    onChange={(e) => handleInputChange("horario_funcionamento", e.target.value)}
                    placeholder="Ex: Seg a Sex: 9h às 18h"
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm">Palavras-chave / Hashtags</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Adicione palavras-chave para melhorar a busca do seu anúncio (ex: botox, harmonização)
                </p>
                <Input
                  value={formData.tags?.join(", ") || ""}
                  onChange={(e) => handleInputChange("tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                  placeholder="Ex: botox, harmonização, preenchimento"
                  className="h-10 sm:h-11 text-sm"
                />
              </div>

              {/* NEW: Procedimentos/Serviços */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Procedimentos/Serviços Oferecidos</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setMostrarSeletorProcedimentos(true)}
                    className="text-xs sm:text-sm h-8 px-2 sm:h-auto sm:px-4"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Selecionar Procedimentos
                  </Button>
                </div>

                {formData.procedimentos_servicos.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3 sm:p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    {formData.procedimentos_servicos.map((proc, index) => (
                      <Badge key={index} variant="secondary" className="text-xs sm:text-sm py-1.5 px-3">
                        {proc}
                        <X
                          className="w-3 h-3 ml-2 cursor-pointer hover:text-red-600"
                          onClick={() => handleRemoverProcedimento(proc)}
                        />
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                    <p className="text-sm text-gray-500">
                      Nenhum procedimento adicionado. Clique em "Selecionar Procedimentos" para adicionar.
                    </p>
                  </div>
                )}
              </div>

              {/* NOVO: Seletor de Ícone do Mapa */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Ícone no Mapa</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSugerirEmojiIA}
                      disabled={gerandoEmojiIA || !formData.titulo || !formData.categoria}
                      className="text-xs sm:text-sm h-8 px-2 sm:h-auto sm:px-4 border-purple-300 text-purple-700"
                    >
                      {gerandoEmojiIA ? (
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      )}
                      IA Sugerir
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMostrarSeletorEmoji(true)}
                      className="text-xs sm:text-sm h-8 px-2 sm:h-auto sm:px-4"
                    >
                      🎨 Escolher Emoji
                    </Button>
                  </div>
                </div>
                <div 
                  onClick={() => setMostrarSeletorEmoji(true)}
                  className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200 cursor-pointer hover:border-blue-400 transition-all flex flex-col items-center justify-center group"
                >
                  <span className="text-7xl mb-2 group-hover:scale-110 transition-transform">
                    {formData.icone_mapa}
                  </span>
                  <p className="text-sm text-blue-800 font-medium">
                    Este emoji aparecerá no mapa
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Clique para alterar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload de Imagens */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <CardTitle className="text-lg sm:text-xl">Imagens do Anúncio</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGerarImagem}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 text-xs sm:text-sm h-9 px-3 sm:h-auto sm:px-4 w-full sm:w-auto"
                >
                  <Wand2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Gerar Imagem com Design Profissional
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* Logo/Foto do Profissional */}
              <div>
                <Label className="text-sm">Logo / Foto do Profissional</Label>
                <p className="text-xs text-gray-500 mb-2">Imagem que aparecerá como identificação do seu perfil</p>
                <div className="mt-2">
                  {formData.logo ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.logo}
                        alt="Logo"
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full border-4 border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 rounded-full w-7 h-7 p-0 sm:w-8 sm:h-8"
                        onClick={() => setFormData(prev => ({ ...prev, logo: "" }))}
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center max-w-xs">
                      <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                      <Label htmlFor="logo" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 text-sm">
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
                <Label className="text-sm">Imagem Principal *</Label>
                <p className="text-xs text-gray-500 mb-2">Imagem de capa do seu anúncio</p>
                <div className="mt-2">
                  {formData.imagem_principal ? (
                    <div className="relative">
                      <img
                        src={formData.imagem_principal}
                        alt="Imagem principal"
                        className="w-full h-48 sm:h-64 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 w-7 h-7 p-0 sm:w-8 sm:h-8"
                        onClick={() => setFormData(prev => ({ ...prev, imagem_principal: "" }))}
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center">
                      <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                      <Label htmlFor="imagem-principal" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-700 text-sm">
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
                <Label className="text-sm">Galeria de Imagens (até 10 imagens)</Label>
                <div className="mt-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    {formData.imagens_galeria.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt={`Galeria ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 w-6 h-6 p-0 sm:w-7 sm:h-7"
                          onClick={() => handleRemoverImagemGaleria(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {formData.imagens_galeria.length < 10 && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                      <Upload className="w-7 h-7 sm:w-8 sm:h-8 mx-auto text-gray-400 mb-2" />
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
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-sm">Profissional *</Label>
                  <Input
                    value={formData.profissional}
                    onChange={(e) => handleInputChange("profissional", e.target.value)}
                    required
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-sm">Telefone *</Label>
                  <Input
                    value={formData.telefone}
                    onChange={(e) => handleInputChange("telefone", e.target.value)}
                    placeholder="(00) 00000-0000"
                    required
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-sm">WhatsApp</Label>
                  <Input
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-sm">Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenidades */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Amenidades do Estabelecimento</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="estacionamento"
                    checked={formData.amenidades.estacionamento}
                    onCheckedChange={(checked) => handleAmenidadeChange("estacionamento", checked)}
                  />
                  <Label htmlFor="estacionamento" className="cursor-pointer text-sm">
                    🅿️ Estacionamento
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="estacionamento_valet"
                    checked={formData.amenidades.estacionamento_valet}
                    onCheckedChange={(checked) => handleAmenidadeChange("estacionamento_valet", checked)}
                  />
                  <Label htmlFor="estacionamento_valet" className="cursor-pointer text-sm">
                    🚗 Estacionamento com Valet
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="aceita_pet"
                    checked={formData.amenidades.aceita_pet}
                    onCheckedChange={(checked) => handleAmenidadeChange("aceita_pet", checked)}
                  />
                  <Label htmlFor="aceita_pet" className="cursor-pointer text-sm">
                    🐕 Aceita Pets
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lounge"
                    checked={formData.amenidades.lounge}
                    onCheckedChange={(checked) => handleAmenidadeChange("lounge", checked)}
                  />
                  <Label htmlFor="lounge" className="cursor-pointer text-sm">
                    🛋️ Lounge
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lounge_bar"
                    checked={formData.amenidades.lounge_bar}
                    onCheckedChange={(checked) => handleAmenidadeChange("lounge_bar", checked)}
                  />
                  <Label htmlFor="lounge_bar" className="cursor-pointer text-sm">
                    🍷 Lounge Bar
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="musica_ambiente"
                    checked={formData.amenidades.musica_ambiente}
                    onCheckedChange={(checked) => handleAmenidadeChange("musica_ambiente", checked)}
                  />
                  <Label htmlFor="musica_ambiente" className="cursor-pointer text-sm">
                    🎵 Música Ambiente
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="seguranca"
                    checked={formData.amenidades.seguranca}
                    onCheckedChange={(checked) => handleAmenidadeChange("seguranca", checked)}
                  />
                  <Label htmlFor="seguranca" className="cursor-pointer text-sm">
                    🛡️ Segurança 24h
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Localização COM ALERTA */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <CardTitle className="text-lg sm:text-xl">Localização</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUsarMinhaLocalizacao}
                  disabled={buscandoLocalizacao}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm h-9 px-3 sm:h-auto sm:px-4 w-full sm:w-auto"
                >
                  {buscandoLocalizacao ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Usar Minha Localização
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* ALERTA IMPORTANTE */}
              {(formData.tipo_anuncio === "clinica" || formData.tipo_anuncio === "consultorio") && (
                <Alert className="bg-blue-50 border-blue-200">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900 text-sm">
                    <strong>📍 Importante:</strong> Para garantir que seu estabelecimento apareça no
                    <strong> Mapa da Estética</strong>, preencha <strong>todas as informações de endereço</strong>
                    (cidade, estado, endereço completo e CEP). Quanto mais completo, melhor sua visibilidade!
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <Label className="text-sm">Cidade *</Label>
                  <Input
                    value={formData.cidade}
                    onChange={(e) => handleInputChange("cidade", e.target.value)}
                    required
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-sm">Estado *</Label>
                  <Input
                    value={formData.estado}
                    onChange={(e) => handleInputChange("estado", e.target.value)}
                    maxLength={2}
                    required
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-sm">CEP</Label>
                  <Input
                    value={formData.cep}
                    onChange={(e) => handleInputChange("cep", e.target.value)}
                    placeholder="00000-000"
                    className="h-10 sm:h-11 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm">Endereço Completo</Label>
                <Input
                  value={formData.endereco}
                  onChange={(e) => handleInputChange("endereco", e.target.value)}
                  placeholder="Rua, número, bairro"
                  className="h-10 sm:h-11 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Torne-se um Profissional Verificado */}
          <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <CardTitle className="text-lg sm:text-xl text-blue-900">Torne-se um Profissional Verificado</CardTitle>
              </div>
              <p className="text-sm text-blue-700 mt-2">
                Ganhe o selo de verificação ✓ similar ao Meta e aumente sua credibilidade!
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <Alert className="bg-white border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-900 text-sm">
                  <strong>Como funciona:</strong> Envie os 3 documentos abaixo e nossa equipe irá verificar.
                  Após aprovação, você receberá o selo de profissional verificado no seu anúncio!
                </AlertDescription>
              </Alert>

              <div className="space-y-3 sm:space-y-4">
                {/* Licença Sanitária */}
                <div>
                  <Label className="flex items-center gap-2 text-sm">
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
                        className="h-8 px-2"
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
                  <Label className="flex items-center gap-2 text-sm">
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
                        className="h-8 px-2"
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
                  <Label className="flex items-center gap-2 text-sm">
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
                        className="h-8 px-2"
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
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-11"
              >
                <Shield className="w-4 h-4 mr-2" />
                Enviar para Verificação
              </Button>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("Inicio"))}
              className="w-full sm:flex-1 h-11 sm:h-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 h-11 sm:h-auto order-1 sm:order-2"
            >
              {loading ? "Cadastrando..." : "Cadastrar Anúncio"}
            </Button>
          </div>
        </form>
      </div>

      {/* Modal de Assistente de Título */}
      <Dialog open={mostrarAssistenteTitulo} onOpenChange={setMostrarAssistenteTitulo}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 sm:p-8 rounded-xl border-2 border-purple-200 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Wand2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                Deseja Contratar Este Serviço Exclusivo?
              </h3>
              <p className="text-sm sm:text-base text-gray-700 mb-5 sm:mb-6 leading-relaxed">
                Nossa equipe de design profissional criará imagens personalizadas e de alta qualidade
                para o seu anúncio, garantindo que você se destaque da concorrência!
              </p>

              <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6 text-left">
                <div className="bg-white p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <span className="font-semibold text-sm">Design Profissional</span>
                  </div>
                  <p className="text-xs text-gray-600">Imagens criadas por designers especializados</p>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <span className="font-semibold text-sm">Alta Qualidade</span>
                  </div>
                  <p className="text-xs text-gray-600">Imagens em alta resolução e otimizadas</p>
                </div>

                <div className="bg-white p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    <span className="font-semibold text-sm">Personalização</span>
                  </div>
                  <p className="text-xs text-gray-600">100% adaptado à sua identidade visual</p>
                </div>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200 mb-5 sm:mb-6">
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
              className="w-full sm:w-auto h-10 sm:h-auto"
            >
              Talvez Depois
            </Button>
            <Button
              onClick={handleContratarDesign}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-bold h-10 sm:h-auto"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Falar com Equipe de Design
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Gerador de Anúncio com IA */}
      <Dialog open={mostrarGeradorIA} onOpenChange={setMostrarGeradorIA}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
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

      {/* Modal de Seletor de Procedimentos */}
      <SeletorProcedimentos
        open={mostrarSeletorProcedimentos}
        onClose={() => setMostrarSeletorProcedimentos(false)}
        onSelect={handleAdicionarProcedimento}
      />

      {/* NOVO: Modal Seletor de Emoji */}
      <SeletorEmoji
        open={mostrarSeletorEmoji}
        onClose={() => setMostrarSeletorEmoji(false)}
        onSelect={(emoji) => setFormData(prev => ({ ...prev, icone_mapa: emoji }))}
        emojiAtual={formData.icone_mapa}
      />
    </div>
  );
}