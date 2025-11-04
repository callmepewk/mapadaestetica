
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, CheckCircle, AlertCircle, ArrowLeft, Plus } from "lucide-react";

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

export default function EditarAnuncio() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [anuncioId, setAnuncioId] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState(null);
  const [novaTag, setNovaTag] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.descricao || !formData.categoria) {
      setErro("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    try {
      await atualizarAnuncioMutation.mutateAsync(formData);
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
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Informações Básicas</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título do Anúncio *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo || ""}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao || ""}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    className="min-h-[150px]"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
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
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Contato</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={formData.telefone || ""}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>WhatsApp</Label>
                  <Input
                    value={formData.whatsapp || ""}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Localização</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Cidade *</Label>
                  <Input
                    value={formData.cidade || ""}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Estado *</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => setFormData({ ...formData, estado: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
