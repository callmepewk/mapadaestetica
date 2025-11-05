
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Plus,
  Star,
  Send
} from "lucide-react";
import AssistenteAnuncio from "../components/home/AssistenteAnuncio";

const categorias = [
  "Depilação", "Estética Facial", "Estética Corporal", "Massoterapia",
  "Drenagem Linfática", "Micropigmentação", "Design de Sobrancelhas",
  "Extensão de Cílios", "Manicure e Pedicure", "Podologia",
  "Acupuntura Estética", "Carboxiterapia", "Criolipólise",
  "Radiofrequência", "Ultrassom Estético", "Peeling",
  "Limpeza de Pele", "Tratamento de Acne", "Harmonização Facial",
  "Preenchimento", "Botox", "Fios de Sustentação", "Bichectomia",
  "Maquiagem", "Penteados", "Tratamento Capilar",
  "Beauty Pet Shop", "Gastronomia Fit", "Boutique Fit",
  "Clínicas e Policlínicas", "Locação e Vendas Estética", "Outros"
];

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const tiposEstabelecimento = [
  { nome: "Consultório", estrelas: 1 },
  { nome: "Clínica", estrelas: 2 },
  { nome: "Centro Clínico", estrelas: 3 },
  { nome: "Centro de Especialidade", estrelas: 4 },
  { nome: "Clínica de Luxo", estrelas: 5 }
];

export default function CadastrarAnuncio() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [enviandoVerificacao, setEnviandoVerificacao] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          profissional: userData.full_name || "",
          email: userData.email || "",
          telefone: userData.telefone || "",
          whatsapp: userData.whatsapp || "",
          cidade: userData.cidade || "",
          estado: userData.estado || "",
          instagram: userData.instagram || "",
          facebook: userData.facebook || ""
        }));
      } catch (error) {
        base44.auth.redirectToLogin(createPageUrl("CadastrarAnuncio"));
      }
    };
    fetchUser();
  }, []);

  const [formData, setFormData] = useState({
    tipo_anuncio: "servico",
    titulo: "",
    descricao: "",
    categoria: "",
    subcategoria: "",
    categoria_clinica: "",
    faixa_preco: "$",
    tipo_estabelecimento: "",
    estrelas_estabelecimento: 1,
    profissional: "",
    telefone: "",
    whatsapp: "",
    email: "",
    instagram: "",
    facebook: "",
    site: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    imagem_principal: "",
    logo: "",
    video_url: "",
    horario_funcionamento: "",
    status_funcionamento: "N/D",
    status: "ativo",
    data_agendamento: "",
    servicos_oferecidos: [],
    amenidades: {
      estacionamento: false,
      estacionamento_valet: false,
      aceita_pet: false,
      lounge: false,
      lounge_bar: false,
      musica_ambiente: false,
      seguranca: false
    },
    verificacao_autoridade: {
      licenca_sanitaria: { possui: false, documento_url: "" },
      alvara_funcionamento: { possui: false, documento_url: "" },
      registro_profissional: { possui: false, documento_url: "" }
    },
    tags: [],
    procedimentos_servicos: []
  });

  const [novaTag, setNovaTag] = useState("");

  const criarAnuncioMutation = useMutation({
    mutationFn: async (data) => {
      const anuncio = await base44.entities.Anuncio.create({
        ...data,
        // The `status` field is now directly from formData
        // `plano` and `em_destaque` were already defined correctly in formData before the spread
        // The original `status: "pendente"` is replaced by `formData.status`
        plano: user?.plano_ativo || "cobre", // Changed from "free" to "cobre"
        em_destaque: false,
        visualizacoes: 0,
        curtidas: 0,
        profissional_verificado: false
      });

      // Criar registros no RelatorioPreco para cada serviço
      if (data.servicos_oferecidos && data.servicos_oferecidos.length > 0) {
        for (const servico of data.servicos_oferecidos) {
          if (servico.preco) {
            await base44.entities.RelatorioPreco.create({
              anuncio_id: anuncio.id,
              profissional_nome: data.profissional,
              profissional_email: data.email || user.email,
              categoria: data.categoria,
              procedimento: servico.nome,
              valor_medio: servico.preco,
              faixa_preco: data.faixa_preco,
              cidade: data.cidade,
              estado: data.estado,
              data_coleta: new Date().toISOString().split('T')[0]
            });
          }
        }
      }

      return anuncio;
    },
    onSuccess: () => {
      setSucesso(true);
      setTimeout(() => {
        navigate(createPageUrl("Perfil"));
      }, 3000);
    },
    onError: (error) => {
      setErro("Erro ao criar anúncio. Por favor, tente novamente.");
      console.error(error);
    },
  });

  const handleImageUpload = async (file, tipo) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (tipo.startsWith('verificacao_')) {
        const [_, doc] = tipo.split('verificacao_');
        setFormData(prev => ({
          ...prev,
          verificacao_autoridade: {
            ...prev.verificacao_autoridade,
            [doc]: {
              ...prev.verificacao_autoridade[doc],
              documento_url: file_url
            }
          }
        }));
      } else {
        setFormData(prev => ({ ...prev, [tipo]: file_url }));
      }
    } catch (error) {
      setErro("Erro ao fazer upload da imagem");
    }
    setUploadingImage(false);
  };

  const solicitarVerificacao = async () => {
    const docs = formData.verificacao_autoridade;
    const docsParaVerificar = [];
    
    if (docs.licenca_sanitaria.possui && docs.licenca_sanitaria.documento_url) {
      docsParaVerificar.push('Licença Sanitária');
    }
    if (docs.alvara_funcionamento.possui && docs.alvara_funcionamento.documento_url) {
      docsParaVerificar.push('Alvará de Funcionamento');
    }
    if (docs.registro_profissional.possui && docs.registro_profissional.documento_url) {
      docsParaVerificar.push('Registro Profissional');
    }

    if (docsParaVerificar.length === 0) {
      setErro("Por favor, selecione e faça upload de pelo menos um documento para verificação.");
      return;
    }

    setEnviandoVerificacao(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "pedro_hbfreitas@hotmail.com", // Replace with actual recipient email
        subject: `Solicitação de Verificação de Documentos - ${formData.profissional}`,
        body: `
          <h2>Solicitação de Verificação de Documentos</h2>
          <p><strong>Profissional:</strong> ${formData.profissional}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Telefone:</strong> ${formData.telefone || 'N/A'}</p>
          <p><strong>WhatsApp:</strong> ${formData.whatsapp || 'N/A'}</p>
          <p><strong>Mensagem:</strong> Gostaria de validar meus documentos para me tornar um profissional verificado</p>
          
          <h3>Documentos Enviados:</h3>
          <ul>
            ${docs.licenca_sanitaria.possui ? `<li><a href="${docs.licenca_sanitaria.documento_url}">Licença Sanitária</a></li>` : ''}
            ${docs.alvara_funcionamento.possui ? `<li><a href="${docs.alvara_funcionamento.documento_url}">Alvará de Funcionamento</a></li>` : ''}
            ${docs.registro_profissional.possui ? `<li><a href="${docs.registro_profissional.documento_url}">Registro Profissional</a></li>` : ''}
          </ul>
          
          <p>Por favor, verifique os documentos e aprove ou rejeite a solicitação.</p>
        `
      });
      
      alert("Solicitação de verificação enviada com sucesso! Você receberá um retorno em até 48 horas.");
      setErro(null); // Clear any previous error
    } catch (error) {
      setErro("Erro ao enviar solicitação de verificação. Por favor, tente novamente.");
      console.error("Error sending verification email:", error);
    }
    setEnviandoVerificacao(false);
  };

  const adicionarTag = () => {
    if (novaTag.trim() && !formData.tags.includes(novaTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, novaTag.trim()]
      }));
      setNovaTag("");
    }
  };

  const removerTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.titulo || !formData.descricao || !formData.categoria || !formData.cidade || !formData.estado || !formData.profissional) {
      setErro("Por favor, preencha todos os campos obrigatórios: Título, Descrição, Categoria, Profissional, Cidade e Estado");
      return;
    }

    // Validação de agendamento
    if (formData.status === 'pendente' && !formData.data_agendamento) {
      setErro("Por favor, selecione uma data e hora para agendar a publicação.");
      return;
    }
    
    try {
      await criarAnuncioMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Erro ao criar anúncio:", error);
      setErro("Erro ao criar anúncio. Por favor, tente novamente.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <style>{`
        /* Estilo para checkboxes - check PRETO */
        input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid #d1d5db;
          border-radius: 0.25rem;
          background-color: white;
          cursor: pointer;
          position: relative;
        }
        
        input[type="checkbox"]:checked {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }
        
        input[type="checkbox"]:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #000000 !important; /* Changed from black to #000000 !important */
          font-size: 0.875rem;
          font-weight: bold;
        }
        
        input[type="checkbox"]:hover {
          border-color: #3b82f6;
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Perfil"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Cadastrar Novo Anúncio
          </h1>
          <p className="text-gray-600">
            Preencha as informações abaixo para criar seu anúncio
          </p>
        </div>

        {sucesso && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Anúncio criado com sucesso! Você será redirecionado em instantes...
            </AlertDescription>
          </Alert>
        )}

        {erro && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{erro}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Informações Básicas</h2>
              <div className="space-y-4">
                {/* Tipo de Anúncio */}
                <div>
                  <Label htmlFor="tipo_anuncio">Tipo de Anúncio *</Label>
                  <Select
                    value={formData.tipo_anuncio}
                    onValueChange={(value) => setFormData({ ...formData, tipo_anuncio: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="servico">
                        <div className="flex items-center gap-2">
                          <span>💼</span>
                          <div>
                            <p className="font-semibold">Serviço</p>
                            <p className="text-xs text-gray-500">Serviços gerais de estética</p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="procedimento">
                        <div className="flex items-center gap-2">
                          <span>🔬</span>
                          <div>
                            <p className="font-semibold">Procedimento</p>
                            <p className="text-xs text-gray-500">Procedimentos específicos</p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="tecnica">
                        <div className="flex items-center gap-2">
                          <span>✨</span>
                          <div>
                            <p className="font-semibold">Técnica</p>
                            <p className="text-xs text-gray-500">Técnicas especializadas</p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="consultorio">
                        <div className="flex items-center gap-2">
                          <span>🏢</span>
                          <div>
                            <p className="font-semibold">Consultório</p>
                            <p className="text-xs text-gray-500">Anúncio de consultório</p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="clinica">
                        <div className="flex items-center gap-2">
                          <span>🏥</span>
                          <div>
                            <p className="font-semibold">Clínica</p>
                            <p className="text-xs text-gray-500">Anúncio de clínica</p>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="promocao">
                        <div className="flex items-center gap-2">
                          <span>🎁</span>
                          <div>
                            <p className="font-semibold">Promoção</p>
                            <p className="text-xs text-gray-500">Ofertas e promoções</p>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="titulo">Título do Anúncio *</Label>
                    <AssistenteAnuncio 
                      campo="titulo" 
                      valor={formData.titulo}
                      onAplicar={(texto) => setFormData({ ...formData, titulo: texto })}
                    />
                  </div>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Harmonização Facial com Ácido Hialurônico"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="descricao">Descrição Detalhada *</Label>
                    <AssistenteAnuncio 
                      campo="descricao" 
                      valor={formData.descricao}
                      onAplicar={(texto) => setFormData({ ...formData, descricao: texto })}
                    />
                  </div>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva detalhadamente seu serviço/procedimento..."
                    className="min-h-[150px]"
                    required
                    rows={6}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="categoria_clinica">Nome do Serviço Clínico</Label>
                    <Input
                      id="categoria_clinica"
                      value={formData.categoria_clinica}
                      onChange={(e) => setFormData({ ...formData, categoria_clinica: e.target.value })}
                      placeholder="Ex: Harmonização Facial Avançada"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Faixa de Preço dos Serviços *</Label>
                    <Select
                      value={formData.faixa_preco}
                      onValueChange={(value) => setFormData({ ...formData, faixa_preco: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="$">
                          <div className="flex flex-col">
                            <span className="font-bold">$ - Até R$ 500</span>
                            <span className="text-xs text-gray-500">Serviços econômicos</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="$$">
                          <div className="flex flex-col">
                            <span className="font-bold">$$ - R$ 500 a R$ 1.000</span>
                            <span className="text-xs text-gray-500">Preço moderado</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="$$$">
                          <div className="flex flex-col">
                            <span className="font-bold">$$$ - R$ 1.000 a R$ 2.000</span>
                            <span className="text-xs text-gray-500">Preço médio-alto</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="$$$$">
                          <div className="flex flex-col">
                            <span className="font-bold">$$$$ - R$ 2.000 a R$ 5.000</span>
                            <span className="text-xs text-gray-500">Preço alto</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="$$$$$">
                          <div className="flex flex-col">
                            <span className="font-bold">$$$$$ - Acima de R$ 5.000</span>
                            <span className="text-xs text-gray-500">Preço premium</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Selecione a faixa geral dos seus serviços
                    </p>
                  </div>

                  <div>
                    <Label>Tipo de Estabelecimento</Label>
                    <Select
                      value={formData.tipo_estabelecimento}
                      onValueChange={(value) => {
                        const tipo = tiposEstabelecimento.find(t => t.nome === value);
                        setFormData({ 
                          ...formData, 
                          tipo_estabelecimento: value,
                          estrelas_estabelecimento: tipo?.estrelas || 1
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposEstabelecimento.map((tipo) => (
                          <SelectItem key={tipo.nome} value={tipo.nome}>
                            {tipo.nome} - {[...Array(tipo.estrelas)].map((_, i) => '⭐').join('')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Tags / Hashtags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={novaTag}
                      onChange={(e) => setNovaTag(e.target.value)}
                      placeholder="Ex: #botox"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarTag())}
                    />
                    <Button type="button" onClick={adicionarTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, i) => (
                      <Badge key={i} className="bg-pink-100 text-pink-800">
                        {tag}
                        <X 
                          className="w-3 h-3 ml-1 cursor-pointer" 
                          onClick={() => removerTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aumente sua Visibilidade */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-purple-900">⭐ Aumente sua Visibilidade</h2>
              <p className="text-sm text-gray-600 mb-4">
                Estas informações aparecem no seu anúncio com ícones destacados
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.amenidades.estacionamento}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      amenidades: { ...formData.amenidades, estacionamento: checked }
                    })}
                    id="estacionamento"
                  />
                  <Label htmlFor="estacionamento">🅿️ Estacionamento</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.amenidades.estacionamento_valet}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      amenidades: { ...formData.amenidades, estacionamento_valet: checked }
                    })}
                    id="estacionamento_valet"
                  />
                  <Label htmlFor="estacionamento_valet">🚗 Estacionamento com Valet</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.amenidades.aceita_pet}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      amenidades: { ...formData.amenidades, aceita_pet: checked }
                    })}
                    id="aceita_pet"
                  />
                  <Label htmlFor="aceita_pet">🐾 Aceita Pet</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.amenidades.lounge}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      amenidades: { ...formData.amenidades, lounge: checked }
                    })}
                    id="lounge"
                  />
                  <Label htmlFor="lounge">🛋️ Lounge</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.amenidades.lounge_bar}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      amenidades: { ...formData.amenidades, lounge_bar: checked }
                    })}
                    id="lounge_bar"
                  />
                  <Label htmlFor="lounge_bar">🍹 Lounge Bar</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.amenidades.musica_ambiente}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      amenidades: { ...formData.amenidades, musica_ambiente: checked }
                    })}
                    id="musica_ambiente"
                  />
                  <Label htmlFor="musica_ambiente">🎵 Música Ambiente</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={formData.amenidades.seguranca}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      amenidades: { ...formData.amenidades, seguranca: checked }
                    })}
                    id="seguranca"
                  />
                  <Label htmlFor="seguranca">🛡️ Possui Segurança</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Informações de Contato</h2>
                <AssistenteAnuncio campo="contato" valor="" onAplicar={() => {}} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profissional">Nome do Profissional *</Label>
                  <Input
                    id="profissional"
                    value={formData.profissional}
                    onChange={(e) => setFormData({ ...formData, profissional: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="site">Website</Label>
                  <Input
                    id="site"
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Localização</h2>
                <AssistenteAnuncio campo="localizacao" valor="" onAplicar={() => {}} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="estado">Estado *</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => setFormData({ ...formData, estado: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        {estados.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="endereco">Endereço Completo</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="status_funcionamento">Status de Funcionamento</Label>
                  <Select
                    value={formData.status_funcionamento}
                    onValueChange={(value) => setFormData({ ...formData, status_funcionamento: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/D">N/D</SelectItem>
                      <SelectItem value="Aberto Agora">Aberto Agora</SelectItem>
                      <SelectItem value="Fechado">Fechado</SelectItem>
                      <SelectItem value="Sempre Aberto">Sempre Aberto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Imagens</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Imagem Principal</Label>
                  <div className="mt-2">
                    {formData.imagem_principal ? (
                      <div className="relative">
                        <img
                          src={formData.imagem_principal}
                          alt="Principal"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => setFormData({ ...formData, imagem_principal: "" })}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-500 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Clique para fazer upload</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files[0], 'imagem_principal')}
                          disabled={uploadingImage}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Logo / Foto do Profissional</Label>
                  <div className="mt-2">
                    {formData.logo ? (
                      <div className="relative">
                        <img
                          src={formData.logo}
                          alt="Logo"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={() => setFormData({ ...formData, logo: "" })}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-500 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Clique para fazer upload</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files[0], 'logo')}
                          disabled={uploadingImage}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verificação de Autoridade */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-900">✅ Verificação de Autoridade</h2>
              <p className="text-sm text-gray-600 mb-4">
                Com todos os 3 documentos verificados, você se torna um <strong>Profissional Verificado</strong>
              </p>

              <div className="space-y-4">
                {/* Licença Sanitária */}
                <div className="border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox 
                      checked={formData.verificacao_autoridade.licenca_sanitaria.possui}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        verificacao_autoridade: {
                          ...formData.verificacao_autoridade,
                          licenca_sanitaria: {
                            ...formData.verificacao_autoridade.licenca_sanitaria,
                            possui: checked,
                            documento_url: checked ? formData.verificacao_autoridade.licenca_sanitaria.documento_url : ""
                          }
                        }
                      })}
                      id="licenca_sanitaria_possui"
                    />
                    <Label htmlFor="licenca_sanitaria_possui" className="font-semibold">Licença Sanitária</Label>
                  </div>
                  {formData.verificacao_autoridade.licenca_sanitaria.possui && (
                    formData.verificacao_autoridade.licenca_sanitaria.documento_url ? (
                      <div className="relative border border-blue-300 rounded-lg p-2 mt-2 flex items-center justify-between text-sm text-blue-700">
                        <span>Documento Enviado ({formData.verificacao_autoridade.licenca_sanitaria.documento_url.split('/').pop()})</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            verificacao_autoridade: {
                              ...prev.verificacao_autoridade,
                              licenca_sanitaria: {
                                ...prev.verificacao_autoridade.licenca_sanitaria,
                                documento_url: ""
                              }
                            }
                          }))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors mt-2">
                        <Upload className="w-6 h-6 text-blue-400 mb-1" />
                        <span className="text-xs text-blue-600">Upload do Documento (PDF ou Imagem)</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleImageUpload(e.target.files[0], 'verificacao_licenca_sanitaria')}
                        />
                      </label>
                    )
                  )}
                </div>

                {/* Alvará de Funcionamento */}
                <div className="border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox 
                      checked={formData.verificacao_autoridade.alvara_funcionamento.possui}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        verificacao_autoridade: {
                          ...formData.verificacao_autoridade,
                          alvara_funcionamento: {
                            ...formData.verificacao_autoridade.alvara_funcionamento,
                            possui: checked,
                            documento_url: checked ? formData.verificacao_autoridade.alvara_funcionamento.documento_url : ""
                          }
                        }
                      })}
                      id="alvara_funcionamento_possui"
                    />
                    <Label htmlFor="alvara_funcionamento_possui" className="font-semibold">Alvará de Funcionamento</Label>
                  </div>
                  {formData.verificacao_autoridade.alvara_funcionamento.possui && (
                    formData.verificacao_autoridade.alvara_funcionamento.documento_url ? (
                      <div className="relative border border-blue-300 rounded-lg p-2 mt-2 flex items-center justify-between text-sm text-blue-700">
                        <span>Documento Enviado ({formData.verificacao_autoridade.alvara_funcionamento.documento_url.split('/').pop()})</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            verificacao_autoridade: {
                              ...prev.verificacao_autoridade,
                              alvara_funcionamento: {
                                ...prev.verificacao_autoridade.alvara_funcionamento,
                                documento_url: ""
                              }
                            }
                          }))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors mt-2">
                        <Upload className="w-6 h-6 text-blue-400 mb-1" />
                        <span className="text-xs text-blue-600">Upload do Documento (PDF ou Imagem)</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleImageUpload(e.target.files[0], 'verificacao_alvara_funcionamento')}
                        />
                      </label>
                    )
                  )}
                </div>

                {/* Registro Profissional */}
                <div className="border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox 
                      checked={formData.verificacao_autoridade.registro_profissional.possui}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        verificacao_autoridade: {
                          ...formData.verificacao_autoridade,
                          registro_profissional: {
                            ...formData.verificacao_autoridade.registro_profissional,
                            possui: checked,
                            documento_url: checked ? formData.verificacao_autoridade.registro_profissional.documento_url : ""
                          }
                        }
                      })}
                      id="registro_profissional_possui"
                    />
                    <Label htmlFor="registro_profissional_possui" className="font-semibold">Registro Profissional</Label>
                  </div>
                  {formData.verificacao_autoridade.registro_profissional.possui && (
                    formData.verificacao_autoridade.registro_profissional.documento_url ? (
                      <div className="relative border border-blue-300 rounded-lg p-2 mt-2 flex items-center justify-between text-sm text-blue-700">
                        <span>Documento Enviado ({formData.verificacao_autoridade.registro_profissional.documento_url.split('/').pop()})</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            verificacao_autoridade: {
                              ...prev.verificacao_autoridade,
                              registro_profissional: {
                                ...prev.verificacao_autoridade.registro_profissional,
                                documento_url: ""
                              }
                            }
                          }))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors mt-2">
                        <Upload className="w-6 h-6 text-blue-400 mb-1" />
                        <span className="text-xs text-blue-600">Upload do Documento (PDF ou Imagem)</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleImageUpload(e.target.files[0], 'verificacao_registro_profissional')}
                        />
                      </label>
                    )
                  )}
                </div>

                <Button
                  type="button"
                  onClick={solicitarVerificacao}
                  disabled={enviandoVerificacao}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {enviandoVerificacao ? "Enviando..." : "Solicitar Verificação de Documentos"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status e Agendamento */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Publicação do Anúncio</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Status do Anúncio</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Publicar Agora</SelectItem>
                      <SelectItem value="pendente">Agendar Publicação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.status === 'pendente' && (
                  <div>
                    <Label>Data de Publicação</Label>
                    <Input
                      type="datetime-local"
                      value={formData.data_agendamento}
                      onChange={(e) => setFormData({ ...formData, data_agendamento: e.target.value })}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      O anúncio será publicado automaticamente nesta data
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <Button
                type="submit"
                disabled={criarAnuncioMutation.isPending}
                className="w-full bg-gradient-to-r from-[#F7D426] to-[#FFE066] hover:from-[#E5C215] hover:to-[#F7D426] text-[#2C2C2C] h-12 text-lg font-bold border-2 border-[#2C2C2C]"
              >
                {criarAnuncioMutation.isPending ? "Criando Anúncio..." : 
                 formData.status === 'ativo' ? "Publicar Anúncio Agora" : "Agendar Publicação"}
              </Button>
              <p className="text-sm text-gray-500 text-center mt-4">
                {formData.status === 'ativo' 
                  ? 'Seu anúncio será publicado imediatamente' 
                  : 'Seu anúncio será publicado na data selecionada'}
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
