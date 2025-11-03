
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  Plus
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

export default function CadastrarAnuncio() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  React.useEffect(() => {
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
    titulo: "",
    descricao: "",
    categoria: "",
    subcategoria: "",
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
    servicos_oferecidos: []
  });

  const [novoServico, setNovoServico] = useState({
    nome: "",
    preco: "",
    duracao: ""
  });

  const criarAnuncioMutation = useMutation({
    mutationFn: async (data) => {
      const anuncio = await base44.entities.Anuncio.create({
        ...data,
        status: "pendente",
        plano: user?.plano_ativo || "light",
        em_destaque: false,
        visualizacoes: 0
      });
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
      setFormData(prev => ({ ...prev, [tipo]: file_url }));
    } catch (error) {
      setErro("Erro ao fazer upload da imagem");
    }
    setUploadingImage(false);
  };

  const adicionarServico = () => {
    if (novoServico.nome) {
      setFormData(prev => ({
        ...prev,
        servicos_oferecidos: [
          ...prev.servicos_oferecidos,
          {
            ...novoServico,
            preco: parseFloat(novoServico.preco) || 0
          }
        ]
      }));
      setNovoServico({ nome: "", preco: "", duracao: "" });
    }
  };

  const removerServico = (index) => {
    setFormData(prev => ({
      ...prev,
      servicos_oferecidos: prev.servicos_oferecidos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.descricao || !formData.categoria || !formData.cidade) {
      setErro("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    try {
      await criarAnuncioMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Erro ao criar anúncio:", error);
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
                    placeholder="Ex: Harmonização Facial com Resultados Naturais"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label htmlFor="descricao">Descrição *</Label>
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
                    placeholder="Descreva seus serviços, diferenciais, experiência..."
                    className="min-h-[150px]"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="categoria">Categoria *</Label>
                      <AssistenteAnuncio campo="categoria" valor={formData.categoria} onAplicar={() => {}} />
                    </div>
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
                    <Label htmlFor="subcategoria">Subcategoria</Label>
                    <Input
                      id="subcategoria"
                      value={formData.subcategoria}
                      onChange={(e) => setFormData({ ...formData, subcategoria: e.target.value })}
                      placeholder="Ex: Preenchimento Labial"
                    />
                  </div>
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

          {/* Services */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Serviços Oferecidos</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Nome do serviço"
                      value={novoServico.nome}
                      onChange={(e) => setNovoServico({ ...novoServico, nome: e.target.value })}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Preço"
                      value={novoServico.preco}
                      onChange={(e) => setNovoServico({ ...novoServico, preco: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Duração"
                      value={novoServico.duracao}
                      onChange={(e) => setNovoServico({ ...novoServico, duracao: e.target.value })}
                    />
                    <Button type="button" onClick={adicionarServico}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {formData.servicos_oferecidos.length > 0 && (
                  <div className="space-y-2">
                    {formData.servicos_oferecidos.map((servico, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{servico.nome}</p>
                          <p className="text-sm text-gray-500">
                            R$ {servico.preco} • {servico.duracao}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removerServico(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
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
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 h-12 text-lg"
              >
                {criarAnuncioMutation.isPending ? "Criando Anúncio..." : "Cadastrar Anúncio"}
              </Button>
              <p className="text-sm text-gray-500 text-center mt-4">
                Seu anúncio será revisado e publicado em até 24 horas
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
