import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, CheckCircle, AlertCircle, ArrowLeft, Plus, MapPin, Loader2 } from "lucide-react";

const categorias = [
  "Estética Facial - Tratamentos Básicos",
  "Estética Facial - Rejuvenescimento",
  "Estética Facial - Tratamento de Condições",
  "Estética Facial - Harmonização",
  "Estética Corporal - Redução de Medidas",
  "Estética Corporal - Celulite e Estrias",
  "Estética Corporal - Flacidez e Contorno",
  "Depilação",
  "Drenagem Linfática",
  "Estética Capilar e Tricologia",
  "Transplante Capilar",
  "Manicure e Pedicure",
  "Podologia",
  "Micropigmentação e Design de Sobrancelhas",
  "Micropigmentação - Olhos e Lábios",
  "Extensão e Alongamento de Cílios",
  "Medicina Estética",
  "Dermatologia",
  "Cirurgia Plástica",
  "Fisioterapia Dermato Funcional",
  "Nutrição Estética",
  "Psicologia e Coaching de Imagem",
  "Pilates e Fitness",
  "Acupuntura Estética",
  "Terapias Integrativas e Complementares",
  "Biomedicina Estética",
  "Enfermagem Estética",
  "Farmácia Estética",
  "Odontologia Estética",
  "Massoterapia",
  "Barbearia",
  "Tatuagem e Piercing",
  "Spa e Bem-Estar",
  "Longevidade e Medicina Integrativa",
  "Clínicas e Consultórios",
  "Salões de Beleza",
  "Equipamentos - Venda",
  "Equipamentos - Locação",
  "Equipamentos - Seminovos",
  "Cosméticos e Produtos",
  "Injetáveis e Preenchedores",
  "Nutracêuticos e Suplementos",
  "Móveis e Decoração para Clínicas",
  "Softwares de Gestão",
  "Uniformes e Vestuário Profissional",
  "Roupas de Compressão Pós-Cirúrgica",
  "Alimentação Saudável e Fitness",
  "Educação - Cursos e Workshops",
  "Eventos - Congressos e Feiras",
  "Consultoria e Assessoria",
  "Franquias",
  "Turismo de Saúde",
  "Seguros e Financiamentos",
  "Marketing e Design",
  "Outros"
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
  { valor: "Consultório", label: "Consultório", estrelas: 1 },
  { valor: "Clínica", label: "Clínica", estrelas: 2 },
  { valor: "Centro Clínico", label: "Centro Clínico (Médico)", estrelas: 3 },
  { valor: "Centro de Especialidade", label: "Centro Estético", estrelas: 4 },
  { valor: "Clínica de Luxo", label: "Clínica de Luxo", estrelas: 5 }
];

const ESTADOS_BRASIL = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "TO", nome: "Tocantins" }
];

export default function EditarAnuncio() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [anuncioId, setAnuncioId] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState(null);
  const [novaTag, setNovaTag] = useState("");
  const [obtendoLocalizacao, setObtendoLocalizacao] = useState(false);

  const handleObterLocalizacao = () => {
    if (!navigator.geolocation) {
      alert("Seu navegador não suporta geolocalização");
      return;
    }

    setObtendoLocalizacao(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt-BR`
          );
          const data = await response.json();
          
          if (data.address) {
            const cidade = data.address.city || data.address.town || data.address.village || data.address.municipality || "";
            const estadoRetornado = data.address.state || "";
            
            // Converter nome do estado para sigla
            const estadoEncontrado = ESTADOS_BRASIL.find(e => 
              e.nome.toLowerCase() === estadoRetornado.toLowerCase() ||
              e.nome.toLowerCase().includes(estadoRetornado.toLowerCase()) ||
              estadoRetornado.toLowerCase().includes(e.nome.toLowerCase())
            );
            const estadoSigla = estadoEncontrado ? estadoEncontrado.sigla : estadoRetornado;
            
            setFormData(prev => ({
              ...prev,
              latitude,
              longitude,
              cidade: cidade,
              estado: estadoSigla,
              bairro: data.address.suburb || data.address.neighbourhood || prev?.bairro || "",
              rua: data.address.road || prev?.rua || "",
              cep: data.address.postcode || prev?.cep || "",
              compartilhar_localizacao_exata: true
            }));
          } else {
            setFormData(prev => ({ ...prev, latitude, longitude, compartilhar_localizacao_exata: true }));
          }
        } catch (error) {
          console.error("Erro ao obter localização:", error);
          setFormData(prev => ({ ...prev, latitude, longitude, compartilhar_localizacao_exata: true }));
        }
        
        setObtendoLocalizacao(false);
      },
      (error) => {
        console.error("Erro ao obter geolocalização:", error);
        alert("Não foi possível obter sua localização. Por favor, preencha manualmente.");
        setObtendoLocalizacao(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    setAnuncioId(id);
  }, []);

  const { data: anuncio, isLoading } = useQuery({
    queryKey: ['anuncio-edit', anuncioId],
    queryFn: async () => {
      const anuncios = await base44.entities.Anuncio.filter({ id: anuncioId });
      return anuncios[0];
    },
    enabled: !!anuncioId,
    staleTime: 15 * 60 * 1000, // 15 minutos
    cacheTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (anuncio) {
      setFormData(anuncio);
    }
  }, [anuncio]);

  const atualizarAnuncioMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Anuncio.update(anuncioId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['anuncio', anuncioId]);
      queryClient.invalidateQueries(['meus-anuncios']);
      setSucesso(true);
      setTimeout(() => {
        navigate(createPageUrl("Perfil"));
      }, 2000);
    },
    onError: (error) => {
      setErro("Erro ao atualizar anúncio. Por favor, tente novamente.");
      console.error(error);
    },
  });

  const handleImageUpload = async (file, tipo) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, [tipo]: file_url }));
    } catch (error) {
      setErro("Erro ao fazer upload da imagem");
    }
    setUploadingImage(false);
  };

  const adicionarTag = () => {
    if (novaTag.trim() && !formData.tags?.includes(novaTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), novaTag.trim()]
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.descricao || !formData.categoria) {
      setErro("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    // Montar endereço completo
    const enderecoCompleto = [
      formData.rua,
      formData.numero,
      formData.bairro
    ].filter(Boolean).join(', ');

    try {
      await atualizarAnuncioMutation.mutateAsync({
        ...formData,
        endereco: enderecoCompleto || formData.endereco
      });
    } catch (error) {
      console.error("Erro ao atualizar anúncio:", error);
    }
  };

  if (isLoading || !formData) {
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
          color: #000000 !important;
          font-size: 0.875rem;
          font-weight: bold;
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
            Editar Anúncio
          </h1>
          <p className="text-gray-600">
            Atualize as informações do seu anúncio
          </p>
        </div>

        {sucesso && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Anúncio atualizado com sucesso!
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
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Anúncio *</Label>
                  <Select
                    value={formData.tipo_anuncio}
                    onValueChange={(value) => handleInputChange("tipo_anuncio", value)}
                  >
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
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => handleInputChange("categoria", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tipo de Estabelecimento com Estrelas */}
              {(formData.tipo_anuncio === "consultorio" || formData.tipo_anuncio === "clinica") && (
                <div>
                  <Label>Tipo de Estabelecimento</Label>
                  <p className="text-xs text-gray-500 mb-2">
                    Selecione o tipo do seu estabelecimento. Cada tipo possui uma classificação em estrelas.
                  </p>
                  <Select
                    value={formData.tipo_estabelecimento}
                    onValueChange={(value) => handleInputChange("tipo_estabelecimento", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de estabelecimento" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposEstabelecimento.map(tipo => (
                        <SelectItem key={tipo.valor} value={tipo.valor}>
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
                <Label htmlFor="titulo">Título do Anúncio *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo || ""}
                  onChange={(e) => handleInputChange("titulo", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao || ""}
                  onChange={(e) => handleInputChange("descricao", e.target.value)}
                  className="min-h-[150px]"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                 <div>
                   <Label>Status</Label>
                   <Select
                     value={formData.status}
                     onValueChange={(value) => handleInputChange("status", value)}
                   >
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="ativo">Ativo</SelectItem>
                       <SelectItem value="pendente">Pendente</SelectItem>
                       <SelectItem value="expirado">Expirado</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div>
                   <Label>Faixa de Preço</Label>
                   <Select
                     value={formData.faixa_preco}
                     onValueChange={(value) => handleInputChange("faixa_preco", value)}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Selecione a faixa de preço" />
                     </SelectTrigger>
                     <SelectContent>
                       {faixasPreco.map((faixa) => (
                         <SelectItem key={faixa.valor} value={faixa.valor}>{faixa.label}</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
               </div>

               {/* Forma de Cobrança e Ocultar após venda */}
               <div className="grid md:grid-cols-2 gap-4">
                 <div>
                   <Label>Forma de Cobrança</Label>
                   <Select
                     value={formData.forma_cobranca || 'dinheiro'}
                     onValueChange={(value) => handleInputChange('forma_cobranca', value)}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Selecione" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="dinheiro">Dinheiro (Faixa de Preço)</SelectItem>
                       <SelectItem value="pontos">Pontos</SelectItem>
                       <SelectItem value="beauty_coins">Beauty Coins</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="flex items-center gap-2 pt-6">
                   <Checkbox
                     id="ocultar_apos_venda"
                     checked={formData.ocultar_apos_venda || false}
                     onCheckedChange={(checked) => handleInputChange('ocultar_apos_venda', checked)}
                   />
                   <Label htmlFor="ocultar_apos_venda">Ocultar anúncio após a venda</Label>
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
                  {(formData.tags || []).map((tag, i) => (
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
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Profissional e Contato</h2>
              
              <div>
                <Label>Nome do Profissional / Empresa *</Label>
                <Input
                  value={formData.profissional || ""}
                  onChange={(e) => handleInputChange("profissional", e.target.value)}
                  placeholder="Nome que aparecerá no anúncio"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este é o nome que será exibido publicamente no seu anúncio
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={formData.telefone || ""}
                    onChange={(e) => handleInputChange("telefone", e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    value={formData.whatsapp || ""}
                    onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="email@exemplo.com"
                    type="email"
                  />
                </div>
                <div>
                  <Label>Site</Label>
                  <Input
                    value={formData.site || ""}
                    onChange={(e) => handleInputChange("site", e.target.value)}
                    placeholder="https://www.seusite.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={formData.instagram || ""}
                    onChange={(e) => handleInputChange("instagram", e.target.value)}
                    placeholder="@seuperfil"
                  />
                </div>
                <div>
                  <Label>Facebook</Label>
                  <Input
                    value={formData.facebook || ""}
                    onChange={(e) => handleInputChange("facebook", e.target.value)}
                    placeholder="facebook.com/seuperfil"
                  />
                </div>
              </div>

              <div>
                <Label>Horário de Funcionamento</Label>
                <Input
                  value={formData.horario_funcionamento || ""}
                  onChange={(e) => handleInputChange("horario_funcionamento", e.target.value)}
                  placeholder="Ex: Seg a Sex: 9h às 18h"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Localização</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleObterLocalizacao}
                  disabled={obtendoLocalizacao}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  {obtendoLocalizacao ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4 mr-2" />
                  )}
                  Obter Localização Automática
                </Button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Cidade *</Label>
                  <Input
                    value={formData.cidade || ""}
                    onChange={(e) => handleInputChange("cidade", e.target.value)}
                    required
                    placeholder="Ex: São Paulo"
                  />
                </div>
                <div>
                  <Label>Estado *</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => handleInputChange("estado", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {ESTADOS_BRASIL.map((estado) => (
                        <SelectItem key={estado.sigla} value={estado.sigla}>
                          {estado.sigla} - {estado.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>CEP</Label>
                  <Input
                    value={formData.cep || ""}
                    onChange={(e) => handleInputChange("cep", e.target.value)}
                    placeholder="00000-000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label>Rua</Label>
                  <Input
                    value={formData.rua || ""}
                    onChange={(e) => handleInputChange("rua", e.target.value)}
                    placeholder="Ex: Av. Paulista"
                  />
                </div>
                <div>
                  <Label>Número</Label>
                  <Input
                    value={formData.numero || ""}
                    onChange={(e) => handleInputChange("numero", e.target.value)}
                    placeholder="Ex: 1000"
                  />
                </div>
              </div>

              <div>
                <Label>Bairro</Label>
                <Input
                  value={formData.bairro || ""}
                  onChange={(e) => handleInputChange("bairro", e.target.value)}
                  placeholder="Ex: Bela Vista"
                />
              </div>

              <div>
                <Label>Complemento</Label>
                <Input
                  value={formData.complemento || ""}
                  onChange={(e) => handleInputChange("complemento", e.target.value)}
                  placeholder="Ex: Sala 1005, Torre A"
                />
              </div>

              <div>
                <Label>Observações do Endereço</Label>
                <Input
                  value={formData.observacoes_endereco || ""}
                  onChange={(e) => handleInputChange("observacoes_endereco", e.target.value)}
                  placeholder="Ex: Próximo ao metrô"
                />
              </div>

              {/* Checkbox para compartilhar localização exata */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg">
                <Checkbox
                  id="compartilhar_localizacao_exata"
                  checked={formData.compartilhar_localizacao_exata || false}
                  onCheckedChange={(checked) => handleInputChange("compartilhar_localizacao_exata", checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="compartilhar_localizacao_exata" className="cursor-pointer font-semibold text-blue-900">
                    📍 Deseja compartilhar a localização exata?
                  </Label>
                  <p className="text-xs text-blue-700 mt-1">
                    Permite que clientes obtenham direções precisas via GPS (Google Maps).
                  </p>
                </div>
              </div>

              {formData.latitude && formData.longitude && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Localização GPS salva: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

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
                          onClick={() => handleInputChange("imagem_principal", "")}
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
                  <Label>Logo</Label>
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
                          onClick={() => handleInputChange("logo", "")}
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

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <Button
                type="submit"
                disabled={atualizarAnuncioMutation.isPending}
                className="w-full bg-gradient-to-r from-[#F7D426] to-[#FFE066] hover:from-[#E5C215] hover:to-[#F7D426] text-[#2C2C2C] h-12 text-lg font-bold border-2 border-[#2C2C2C]"
              >
                {atualizarAnuncioMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}