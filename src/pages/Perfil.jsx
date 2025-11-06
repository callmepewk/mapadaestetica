
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Edit,
  Save,
  LogOut,
  Trash2,
  Eye,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
  MessageCircle,
  ShoppingCart,
  Shield,
  FileText,
  CheckCircle,
  Upload,
  Loader2,
  Bookmark, // New import for Saved Ads
  Handshake, // New import for Indicações
  DollarSign, // New import for Beauty Coins
  Briefcase, // New import for Informações Profissionais
  Zap, // New import for Impulsionados
  CreditCard, // New import for Planos Ativos
  Crown, // New import for Clube da Beleza (and Golden Doctors)
  Users, // New import for Patrocinador
  Award, // New import for Especialização
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Perfil() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // State variables from original file, adjusted or removed as per outline
  const [editando, setEditando] = useState(false); // Replaces editandoPerfil
  // const [mostrarMeusAnuncios, setMostrarMeusAnuncios] = useState(false); // Removed, unused with Tabs
  const [editandoSenha, setEditandoSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({}); // Replaces perfilEditado, used for editing profile
  const [mostrarOnboarding, setMostrarOnboarding] = useState(false); // For "Preencher Cadastro" button

  // Estados para upload de documentos profissionais
  const [uploadingDocumentos, setUploadingDocumentos] = useState({
    licenca_sanitaria: false,
    alvara_funcionamento: false,
    registro_profissional: false
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        // Initialize formData with user data, including new fields and nested objects
        setFormData({
          full_name: userData.full_name || "",
          telefone: userData.telefone || "",
          whatsapp: userData.whatsapp || "",
          cidade: userData.cidade || "",
          estado: userData.estado || "",
          instagram: userData.instagram || "",
          facebook: userData.facebook || "",
          especialidade: userData.especialidade || "",
          cpf: userData.cpf || "", // New field
          data_nascimento: userData.data_nascimento || "", // New field
          documentos_profissionais: userData.documentos_profissionais || {}, // New nested object
          tempo_formacao_anos: userData.tempo_formacao_anos || "", // New professional field
          possui_clinica: userData.possui_clinica || false, // New professional field
          possui_ar_condicionado: userData.possui_ar_condicionado || false, // New professional field
          possui_estacionamento: userData.possui_estacionamento || false, // New professional field
          tem_google_negocios: userData.tem_google_negocios || false, // New professional field
          formacao: userData.formacao || "", // New field
          especializacao: userData.especializacao || "", // New field
          faz_parte_golden_doctors: userData.faz_parte_golden_doctors || false, // New field
          quer_fazer_parte_golden_doctors: userData.quer_fazer_parte_golden_doctors || false, // New field
        });
      } catch (error) {
        navigate(createPageUrl("Inicio"));
      }
    };
    fetchUser();
  }, [navigate]);

  const isPaciente = user?.tipo_usuario === 'paciente';
  const isProfissional = user?.tipo_usuario === 'profissional';

  // CARREGAMENTO INSTANTÂNEO
  const { data: meusAnuncios = [], isLoading: isLoadingAnuncios } = useQuery({
    queryKey: ['meus-anuncios', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Anuncio.filter({ created_by: user.email });
    },
    enabled: !!user && isProfissional, // Only fetch for professionals
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    initialData: [],
  });

  const { data: meusPedidos = [], isLoading: isLoadingPedidos } = useQuery({
    queryKey: ['meus-pedidos', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.PedidoProduto.filter({ usuario_email: user.email });
    },
    enabled: !!user && isPaciente, // Only fetch for patients
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    initialData: [],
  });

  // NEW: Query for saved ads (for patients)
  const { data: anunciosSalvos = [], isLoading: isLoadingAnunciosSalvos } = useQuery({
    queryKey: ['anuncios-salvos', user?.email],
    queryFn: async () => {
      if (!user || !user.anuncios_salvos || user.anuncios_salvos.length === 0) return [];
      // Assuming user.anuncios_salvos is an array of anuncio IDs
      const savedAdsPromises = user.anuncios_salvos.map(anuncioId => base44.entities.Anuncio.get(anuncioId));
      return await Promise.all(savedAdsPromises);
    },
    enabled: !!user && isPaciente && (user.anuncios_salvos?.length > 0),
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    initialData: [],
  });

  // NEW: Query anúncios impulsionados
  const { data: anunciosImpulsionados = [], isLoading: isLoadingImpulsionados } = useQuery({
    queryKey: ['anuncios-impulsionados', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Anuncio.filter({
        created_by: user.email,
        impulsionado: true,
        status: 'ativo'
      });
    },
    enabled: !!user && isProfissional,
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    initialData: [],
  });

  const salvarMutation = useMutation({ // Renamed from updatePerfilMutation
    mutationFn: async (data) => {
      await base44.auth.updateMe(data);
    },
    onSuccess: async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      // Update formData with fresh user data, including new fields
      setFormData({
        full_name: userData.full_name || "",
        telefone: userData.telefone || "",
        whatsapp: userData.whatsapp || "",
        cidade: userData.cidade || "",
        estado: userData.estado || "",
        instagram: userData.instagram || "",
        facebook: userData.facebook || "",
        especialidade: userData.especialidade || "",
        cpf: userData.cpf || "",
        data_nascimento: userData.data_nascimento || "",
        documentos_profissionais: userData.documentos_profissionais || {},
        tempo_formacao_anos: userData.tempo_formacao_anos || "",
        possui_clinica: userData.possui_clinica || false,
        possui_ar_condicionado: userData.possui_ar_condicionado || false,
        possui_estacionamento: userData.possui_estacionamento || false,
        tem_google_negocios: userData.tem_google_negocios || false,
        formacao: userData.formacao || "",
        especializacao: userData.especializacao || "",
        faz_parte_golden_doctors: userData.faz_parte_golden_doctors || false,
        quer_fazer_parte_golden_doctors: userData.quer_fazer_parte_golden_doctors || false,
      });
      setEditando(false); // Exit edit mode
      queryClient.invalidateQueries(['user']);
    },
  });

  const atualizarStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await base44.entities.Anuncio.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meus-anuncios']);
      queryClient.invalidateQueries(['anuncios-impulsionados']);
    },
  });

  const excluirContaMutation = useMutation({
    mutationFn: async () => {
      base44.auth.logout();
    },
  });

  const handleSalvar = () => { // Adjusted to use salvarMutation and formData
    salvarMutation.mutate(formData);
  };

  const handleCancelar = () => { // New function to cancel editing
    setEditando(false);
    // Reset formData to the current user state, including new fields
    setFormData({
      full_name: user?.full_name || "",
      telefone: user?.telefone || "",
      whatsapp: user?.whatsapp || "",
      cidade: user?.cidade || "",
      estado: user?.estado || "",
      instagram: user?.instagram || "",
      facebook: user?.facebook || "",
      especialidade: user?.especialidade || "",
      cpf: user?.cpf || "",
      data_nascimento: user?.data_nascimento || "",
      documentos_profissionais: user?.documentos_profissionais || {},
      tempo_formacao_anos: user?.tempo_formacao_anos || "",
      possui_clinica: user?.possui_clinica || false,
      possui_ar_condicionado: user?.possui_ar_condicionado || false,
      possui_estacionamento: user?.possui_estacionamento || false,
      tem_google_negocios: user?.tem_google_negocios || false,
      formacao: user?.formacao || "",
      especializacao: user?.especializacao || "",
      faz_parte_golden_doctors: user?.faz_parte_golden_doctors || false,
      quer_fazer_parte_golden_doctors: user?.quer_fazer_parte_golden_doctors || false,
    });
  };

  const handleToggleEdicao = () => { // New function to toggle edit mode
    setEditando(!editando);
    if (!editando) { // Entering edit mode
      // Initialize formData with current user data for editing, including new fields
      setFormData({
        full_name: user?.full_name || "",
        telefone: user?.telefone || "",
        whatsapp: user?.whatsapp || "",
        cidade: user?.cidade || "",
        estado: user?.estado || "",
        instagram: user?.instagram || "",
        facebook: user?.facebook || "",
        especialidade: user?.especialidade || "",
        cpf: user?.cpf || "",
        data_nascimento: user?.data_nascimento || "",
        documentos_profissionais: user?.documentos_profissionais || {},
        tempo_formacao_anos: user?.tempo_formacao_anos || "",
        possui_clinica: user?.possui_clinica || false,
        possui_ar_condicionado: user?.possui_ar_condicionado || false,
        possui_estacionamento: user?.possui_estacionamento || false,
        tem_google_negocios: user?.tem_google_negocios || false,
        formacao: user?.formacao || "",
        especializacao: user?.especializacao || "",
        faz_parte_golden_doctors: user?.faz_parte_golden_doctors || false,
        quer_fazer_parte_golden_doctors: user?.quer_fazer_parte_golden_doctors || false,
      });
    }
  };

  const handleUploadDocumento = async (tipo, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDocumentos(prev => ({ ...prev, [tipo]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const documentos = formData.documentos_profissionais || {};
      const novoDocumento = {
        url: file_url,
        data_upload: new Date().toISOString()
      };

      setFormData(prev => ({
        ...prev,
        documentos_profissionais: {
          ...documentos,
          [tipo]: novoDocumento
        }
      }));

      alert("Documento enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload do documento");
    } finally {
      setUploadingDocumentos(prev => ({ ...prev, [tipo]: false }));
    }
  };

  const handleRemoverDocumento = (tipo) => {
    // Create a new object to avoid direct mutation of state
    const updatedDocumentos = { ...(formData.documentos_profissionais || {}) };
    delete updatedDocumentos[tipo];

    setFormData(prev => ({
      ...prev,
      documentos_profissionais: updatedDocumentos
    }));
  };

  const handleSair = () => {
    base44.auth.logout();
    navigate(createPageUrl("Inicio")); // Redirect after logout
  };

  const handleVerAnuncio = (anuncioId) => {
    navigate(`${createPageUrl("DetalhesAnuncio")}?id=${anuncioId}`);
  };

  const handleEditarAnuncio = (anuncioId) => {
    navigate(`${createPageUrl("EditarAnuncio")}?id=${anuncioId}`);
  };

  const handleSolicitarMudancaTipo = () => {
    const mensagem = `Olá! Gostaria de alterar o tipo de conta no Mapa da Estética.\n\nDados do usuário:\nNome: ${user.full_name}\nEmail: ${user.email}\nTipo atual: ${user.tipo_usuario}\n\nPor favor, me ajudem com essa alteração.`;
    window.open(`mailto:pedro_hbfreitas@hotmail.com?subject=Solicitação de Alteração de Tipo de Conta&body=${encodeURIComponent(mensagem)}`, '_blank');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const anunciosAtivos = meusAnuncios.filter(a => a.status === 'ativo').length;
  const anunciosPendentes = meusAnuncios.filter(a => a.status === 'pendente').length;
  const anunciosDestaque = meusAnuncios.filter(a => a.em_destaque).length;
  const anunciosExpirados = meusAnuncios.filter(a => a.status === 'expirado').length;
  const totalVisualizacoes = meusAnuncios.reduce((acc, a) => acc + (a.visualizacoes || 0), 0);

  const planoNome = user?.plano_ativo === 'cobre' ? 'COBRE' :
                   user?.plano_ativo === 'prata' ? 'PRATA' :
                   user?.plano_ativo === 'ouro' ? 'OURO' :
                   user?.plano_ativo === 'diamante' ? 'DIAMANTE' :
                   user?.plano_ativo === 'platina' ? 'PLATINA' : 'COBRE';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* New Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
            <p className="text-gray-600">Gerencie suas informações e anúncios</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleToggleEdicao}
              variant={editando ? "outline" : "default"}
              className={editando ? "border-2 border-gray-300" : "bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold"}
            >
              <Edit className="w-4 h-4 mr-2" />
              {editando ? "Cancelar Edição" : "Editar Perfil"}
            </Button>
            {user && !user.cadastro_completo && (
              <Button
                onClick={() => setMostrarOnboarding(true)}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-[#2C2C2C] font-bold"
              >
                Preencher Cadastro
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area (left 2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="informacoes" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="informacoes">Informações</TabsTrigger>
                <TabsTrigger value="meus-anuncios">
                  {isProfissional ? 'Meus Anúncios' : 'Anúncios Salvos'}
                </TabsTrigger>
                {isProfissional ? (
                  <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
                ) : (
                  <TabsTrigger value="produtos-servicos">Produtos & Serviços</TabsTrigger>
                )}
                <TabsTrigger value="indicacoes">Indicações</TabsTrigger>
              </TabsList>

              {/* TabsContent for "informacoes" */}
              <TabsContent value="informacoes">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6">
                    {!editando ? (
                      <div className="space-y-6">
                        {/* User's general info - AVATAR, NAME, EMAIL, BADGES - when not editing */}
                        <div className="flex flex-col items-center mb-6">
                          <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-xl mb-4">
                            <AvatarImage src={user?.foto_perfil} />
                            <AvatarFallback className="text-3xl bg-gradient-to-br from-[#F7D426] to-[#FFE066] text-[#2C2C2C]">
                              {user?.full_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <h2 className="text-2xl font-bold text-gray-900">{user?.full_name}</h2>
                          <p className="text-gray-600">{user?.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={isPaciente ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
                              {isPaciente ? "👤 Paciente" : "💼 Profissional"}
                            </Badge>
                            <Badge className="bg-[#F7D426] text-[#2C2C2C] font-bold">
                              Plano {planoNome}
                            </Badge>
                          </div>
                        </div>

                        <h3 className="font-semibold text-lg mb-4">Informações de Contato e Redes</h3>
                        {user.telefone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{user.telefone}</span>
                          </div>
                        )}
                        {user.whatsapp && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{user.whatsapp} (WhatsApp)</span>
                          </div>
                        )}
                        {user.cidade && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{user.cidade}, {user.estado}</span>
                          </div>
                        )}
                        {user.instagram && (
                          <div className="flex items-center gap-2 text-sm">
                            <Instagram className="w-4 h-4 text-gray-400" />
                            <a href={user.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">
                              Instagram
                            </a>
                          </div>
                        )}
                        {user.facebook && (
                          <div className="flex items-center gap-2 text-sm">
                            <Facebook className="w-4 h-4 text-gray-400" />
                            <a href={user.facebook} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">
                              Facebook
                            </a>
                          </div>
                        )}
                        {user.cpf && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>CPF: {user.cpf}</span>
                          </div>
                        )}
                        {user.data_nascimento && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>Nascimento: {format(new Date(user.data_nascimento), "dd/MM/yyyy")}</span>
                          </div>
                        )}

                        {/* Informações Profissionais - VIEW MODE */}
                        {isProfissional && (user.formacao || user.especializacao || user.especialidade || user.tempo_formacao_anos > 0 || user.possui_clinica || user.possui_ar_condicionado || user.possui_estacionamento || user.tem_google_negocios || user.faz_parte_golden_doctors || user.quer_fazer_parte_golden_doctors) && (
                          <div className="pt-6 border-t mt-6">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                              <Briefcase className="w-5 h-5 text-purple-600" />
                              Informações Profissionais
                            </h3>
                            <div className="space-y-3">
                              {user.formacao && (
                                <div className="flex items-start gap-2 text-sm">
                                  <Shield className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-semibold">Formação:</span> {user.formacao}
                                  </div>
                                </div>
                              )}
                              {user.especializacao && (
                                <div className="flex items-start gap-2 text-sm">
                                  <Award className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-semibold">Especialização:</span> {user.especializacao}
                                  </div>
                                </div>
                              )}
                              {user.especialidade && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Star className="w-4 h-4 text-gray-400" />
                                  <span>Especialidade: {user.especialidade}</span>
                                </div>
                              )}
                              {user.tempo_formacao_anos > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span>Tempo de Formação: {user.tempo_formacao_anos} anos</span>
                                </div>
                              )}
                              {(user.possui_clinica || user.possui_ar_condicionado || user.possui_estacionamento || user.tem_google_negocios) && (
                                <div className="space-y-1 mt-2">
                                  <p className="text-sm font-semibold">Recursos:</p>
                                  {user.possui_clinica && <p className="text-sm">• Possui clínica própria</p>}
                                  {user.possui_ar_condicionado && <p className="text-sm">• Ar condicionado</p>}
                                  {user.possui_estacionamento && <p className="text-sm">• Estacionamento</p>}
                                  {user.tem_google_negocios && <p className="text-sm">• Tem Google Negócios</p>}
                                </div>
                              )}

                              {/* NOVO: Golden Doctors */}
                              {(user.faz_parte_golden_doctors || user.quer_fazer_parte_golden_doctors) && (
                                <div className="mt-4 pt-4 border-t border-purple-200 bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Crown className="w-5 h-5 text-amber-600" />
                                    <h4 className="font-bold text-amber-900">Golden Doctors</h4>
                                  </div>
                                  {user.faz_parte_golden_doctors ? (
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                      <span className="text-sm font-semibold text-green-800">Membro Ativo do Clube</span>
                                    </div>
                                  ) : user.quer_fazer_parte_golden_doctors ? (
                                    <div>
                                      <p className="text-sm text-amber-800 mb-2">Interessado em fazer parte do Golden Doctors</p>
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          const mensagem = `Olá! Tenho interesse em fazer parte do Golden Doctors!\n\nNome: ${user.full_name}\nEmail: ${user.email}`;
                                          window.open(`https://wa.me/5531972595643?text=${encodeURIComponent(mensagem)}`, '_blank');
                                        }}
                                        className="bg-amber-600 hover:bg-amber-700 text-white"
                                      >
                                        <Phone className="w-3 h-3 mr-2" />
                                        Entrar em Contato
                                      </Button>
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {isProfissional && user.documentos_profissionais && Object.keys(user.documentos_profissionais).length > 0 && (
                          <div className="pt-6 border-t mt-6">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                              <Shield className="w-5 h-5 text-blue-600" />
                              Documentos Profissionais
                            </h3>
                            <div className="space-y-3">
                              {user.documentos_profissionais.licenca_sanitaria?.url && (
                                <div className="flex items-center gap-2 text-sm">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  <span>Licença Sanitária:</span>
                                  <a href={user.documentos_profissionais.licenca_sanitaria.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver Documento</a>
                                </div>
                              )}
                              {user.documentos_profissionais.alvara_funcionamento?.url && (
                                <div className="flex items-center gap-2 text-sm">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  <span>Alvará de Funcionamento:</span>
                                  <a href={user.documentos_profissionais.alvara_funcionamento.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver Documento</a>
                                </div>
                              )}
                              {user.documentos_profissionais.registro_profissional?.url && (
                                <div className="flex items-center gap-2 text-sm">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  <span>Registro Profissional:</span>
                                  <a href={user.documentos_profissionais.registro_profissional.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver Documento</a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Form for editing profile */}
                        <div>
                          <Label htmlFor="full_name">Nome Completo</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name || ""}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="mt-1"
                            placeholder="Seu nome completo"
                          />
                          <p className="text-xs text-gray-500 mt-1">Este é o nome que será exibido publicamente</p>
                        </div>

                        {/* CPF e Data de Nascimento */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cpf">CPF</Label>
                            <Input
                              id="cpf"
                              value={formData.cpf || ""}
                              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                              placeholder="000.000.000-00"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                            <Input
                              id="data_nascimento"
                              type="date"
                              value={formData.data_nascimento ? format(new Date(formData.data_nascimento), 'yyyy-MM-dd') : ""}
                              onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="telefone">Telefone</Label>
                          <Input
                            id="telefone"
                            value={formData.telefone || ""}
                            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="whatsapp">WhatsApp</Label>
                          <Input
                            id="whatsapp"
                            value={formData.whatsapp || ""}
                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cidade">Cidade</Label>
                          <Input
                            id="cidade"
                            value={formData.cidade || ""}
                            onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="estado">Estado</Label>
                          <Input
                            id="estado"
                            value={formData.estado || ""}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="instagram">Instagram</Label>
                          <Input
                            id="instagram"
                            value={formData.instagram || ""}
                            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="facebook">Facebook</Label>
                          <Input
                            id="facebook"
                            value={formData.facebook || ""}
                            onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        {isProfissional && (
                           <div>
                            <Label htmlFor="especialidade">Especialidade</Label>
                            <Input
                              id="especialidade"
                              value={formData.especialidade || ""}
                              onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                        )}

                        {/* Informações Profissionais - EDIT MODE */}
                        {isProfissional && (
                          <div className="pt-6 border-t">
                            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                              <Briefcase className="w-5 h-5 text-purple-600" />
                              Informações Profissionais Adicionais
                            </h4>
                            <div className="space-y-4">
                              {/* NOVO: Formação */}
                              <div>
                                <Label htmlFor="formacao">Formação Acadêmica</Label>
                                <Input
                                  id="formacao"
                                  placeholder="Ex: Graduação em Estética pela USP"
                                  value={formData.formacao || ""}
                                  onChange={(e) => setFormData({ ...formData, formacao: e.target.value })}
                                  className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Informe sua formação acadêmica principal
                                </p>
                              </div>

                              {/* NOVO: Especialização */}
                              <div>
                                <Label htmlFor="especializacao">Especialização</Label>
                                <Input
                                  id="especializacao"
                                  placeholder="Ex: Pós-graduação em Dermatologia Estética"
                                  value={formData.especializacao || ""}
                                  onChange={(e) => setFormData({ ...formData, especializacao: e.target.value })}
                                  className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Informe suas especializações (pós-graduação, MBA, cursos avançados)
                                </p>
                              </div>

                              <div>
                                <Label htmlFor="tempo_formacao">Tempo de Formação (anos)</Label>
                                <Input
                                  id="tempo_formacao"
                                  type="number"
                                  min="0"
                                  placeholder="Ex: 5"
                                  value={formData.tempo_formacao_anos || ""}
                                  onChange={(e) => setFormData({ ...formData, tempo_formacao_anos: parseInt(e.target.value) || 0 })}
                                  className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Quantos anos você atua na área?
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label className="font-semibold">Recursos</Label>
                                <div className="space-y-2">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={formData.possui_clinica || false}
                                      onChange={(e) => setFormData({ ...formData, possui_clinica: e.target.checked })}
                                      className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm">Possuo clínica própria</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={formData.possui_ar_condicionado || false}
                                      onChange={(e) => setFormData({ ...formData, possui_ar_condicionado: e.target.checked })}
                                      className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm">Ar condicionado</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={formData.possui_estacionamento || false}
                                      onChange={(e) => setFormData({ ...formData, possui_estacionamento: e.target.checked })}
                                      className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm">Estacionamento</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={formData.tem_google_negocios || false}
                                      onChange={(e) => setFormData({ ...formData, tem_google_negocios: e.target.checked })}
                                      className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm">Tenho Google Negócios</span>
                                  </label>
                                </div>
                              </div>

                              {/* NOVO: Golden Doctors */}
                              <div className="pt-4 border-t">
                                <div className="flex items-center gap-2 mb-3">
                                  <Crown className="w-5 h-5 text-amber-600" />
                                  <Label className="font-semibold text-lg">Golden Doctors</Label>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                  Clube exclusivo da área médica da medicina estética com recursos e benefícios exclusivos
                                </p>

                                <div className="space-y-3">
                                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-amber-50 rounded-lg border-2 border-amber-200 hover:border-amber-400 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={formData.faz_parte_golden_doctors || false}
                                      onChange={(e) => setFormData({ 
                                        ...formData, 
                                        faz_parte_golden_doctors: e.target.checked,
                                        quer_fazer_parte_golden_doctors: e.target.checked ? false : formData.quer_fazer_parte_golden_doctors
                                      })}
                                      className="w-5 h-5 rounded mt-0.5"
                                    />
                                    <div>
                                      <span className="text-sm font-semibold flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        Já faço parte do Golden Doctors
                                      </span>
                                      <p className="text-xs text-gray-600 mt-1">Sou membro ativo do clube</p>
                                    </div>
                                  </label>

                                  <label className="flex items-start gap-3 cursor-pointer p-3 bg-blue-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={formData.quer_fazer_parte_golden_doctors || false}
                                      onChange={(e) => setFormData({ 
                                        ...formData, 
                                        quer_fazer_parte_golden_doctors: e.target.checked,
                                        faz_parte_golden_doctors: e.target.checked ? false : formData.faz_parte_golden_doctors
                                      })}
                                      className="w-5 h-5 rounded mt-0.5"
                                      disabled={formData.faz_parte_golden_doctors}
                                    />
                                    <div>
                                      <span className="text-sm font-semibold flex items-center gap-2">
                                        <Star className="w-4 h-4 text-blue-600" />
                                        Quero fazer parte do Golden Doctors
                                      </span>
                                      <p className="text-xs text-gray-600 mt-1">Tenho interesse em conhecer o clube</p>
                                    </div>
                                  </label>

                                  {formData.quer_fazer_parte_golden_doctors && (
                                    <Alert className="bg-blue-50 border-blue-200">
                                      <AlertCircle className="h-4 w-4 text-blue-600" />
                                      <AlertDescription className="text-blue-800 text-sm">
                                        <p className="font-semibold mb-2">Entre em contato com nossa Central de Vendas:</p>
                                        <Button
                                          size="sm"
                                          onClick={() => {
                                            const mensagem = `Olá! Tenho interesse em fazer parte do Golden Doctors!\n\nNome: ${formData.full_name || user?.full_name}\nEmail: ${user?.email}\n\nGostaria de mais informações sobre o clube.`;
                                            window.open(`https://wa.me/5531972595643?text=${encodeURIComponent(mensagem)}`, '_blank');
                                          }}
                                          className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                          <Phone className="w-3 h-3 mr-2" />
                                          (31) 97259-5643
                                        </Button>
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* NOVA SEÇÃO: Documentos Profissionais */}
                        {isProfissional && (
                          <div className="pt-6 border-t">
                            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                              <Shield className="w-5 h-5 text-blue-600" />
                              Documentos Profissionais
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">
                              Adicione seus documentos profissionais para exibir no seu perfil e aumentar sua credibilidade
                            </p>

                            <div className="space-y-4">
                              {/* Licença Sanitária */}
                              <div>
                                <Label className="flex items-center gap-2 mb-2">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  Licença Sanitária
                                </Label>
                                {formData.documentos_profissionais?.licenca_sanitaria?.url ? (
                                  <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                      <span className="text-sm text-green-800">Documento enviado</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(formData.documentos_profissionais.licenca_sanitaria.url, '_blank')}
                                      >
                                        Ver
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemoverDocumento('licenca_sanitaria')}
                                      >
                                        Remover
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
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
                                      onChange={(e) => handleUploadDocumento('licenca_sanitaria', e)}
                                      disabled={uploadingDocumentos.licenca_sanitaria}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Alvará de Funcionamento */}
                              <div>
                                <Label className="flex items-center gap-2 mb-2">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  Alvará de Funcionamento
                                </Label>
                                {formData.documentos_profissionais?.alvara_funcionamento?.url ? (
                                  <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                      <span className="text-sm text-green-800">Documento enviado</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(formData.documentos_profissionais.alvara_funcionamento.url, '_blank')}
                                      >
                                        Ver
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemoverDocumento('alvara_funcionamento')}
                                      >
                                        Remover
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
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
                                      onChange={(e) => handleUploadDocumento('alvara_funcionamento', e)}
                                      disabled={uploadingDocumentos.alvara_funcionamento}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Registro Profissional */}
                              <div>
                                <Label className="flex items-center gap-2 mb-2">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  Registro Profissional (CRO, CREFITO, etc)
                                </Label>
                                {formData.documentos_profissionais?.registro_profissional?.url ? (
                                  <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="w-5 h-5 text-green-600" />
                                      <span className="text-sm text-green-800">Documento enviado</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(formData.documentos_profissionais.registro_profissional.url, '_blank')}
                                      >
                                        Ver
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemoverDocumento('registro_profissional')}
                                      >
                                        Remover
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
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
                                      onChange={(e) => handleUploadDocumento('registro_profissional', e)}
                                      disabled={uploadingDocumentos.registro_profissional}
                                    />
                                  </div>
                                )}
                              </div>

                              <Alert className="mt-4 bg-blue-50 border-blue-200">
                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                <AlertDescription className="text-blue-800 text-sm">
                                  Estes documentos ficarão visíveis no seu perfil público, aumentando a confiança dos clientes.
                                </AlertDescription>
                              </Alert>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 pt-6 border-t">
                          <Button
                            onClick={handleSalvar}
                            disabled={salvarMutation.isPending}
                            className="flex-1 bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold"
                          >
                            {salvarMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                          </Button>
                          <Button
                            onClick={handleCancelar}
                            variant="outline"
                            className="flex-1 border-2 border-gray-300"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Meus Anúncios (Profissional) / Anúncios Salvos (Paciente) */}
              <TabsContent value="meus-anuncios">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6">
                    {isProfissional ? (
                      <div>
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                          <Eye className="w-5 h-5 text-pink-600" />
                          Meus Anúncios
                        </h3>

                        {/* NOVA SEÇÃO: Anúncios Impulsionados */}
                        {anunciosImpulsionados.length > 0 && (
                          <div className="mb-8 pb-6 border-b">
                            <div className="flex items-center gap-2 mb-4">
                              <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
                                <Zap className="w-3 h-3 mr-1" />
                                IMPULSIONADOS
                              </Badge>
                              <span className="text-sm text-gray-600">
                                ({anunciosImpulsionados.length} {anunciosImpulsionados.length === 1 ? 'anúncio' : 'anúncios'})
                              </span>
                            </div>

                            <div className="space-y-3">
                              {anunciosImpulsionados.map((anuncio) => {
                                // Calcular dias restantes se tiver data_impulsionamento
                                let diasRestantes = null;
                                if (anuncio.data_impulsionamento) {
                                  const dataInicio = new Date(anuncio.data_impulsionamento);
                                  const hoje = new Date();
                                  const diffTime = hoje.getTime() - dataInicio.getTime();
                                  diasRestantes = Math.max(0, 30 - Math.ceil(diffTime / (1000 * 60 * 60 * 24))); // Assumindo 30 dias de impulsionamento
                                }

                                return (
                                  <div
                                    key={anuncio.id}
                                    className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-lg hover:border-orange-400 transition-colors"
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Zap className="w-4 h-4 text-orange-600" />
                                          <Badge className="bg-orange-600 text-white text-xs">
                                            IMPULSIONADO
                                          </Badge>
                                          {diasRestantes !== null && (
                                            <Badge variant="outline" className="text-xs">
                                              {diasRestantes} dias restantes
                                            </Badge>
                                          )}
                                        </div>
                                        <h5 className="font-medium text-gray-900 mb-1">{anuncio.titulo}</h5>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <Badge className="bg-green-100 text-green-800">
                                            {anuncio.status}
                                          </Badge>
                                          <span>•</span>
                                          <span>{anuncio.categoria}</span>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleEditarAnuncio(anuncio.id)}
                                        >
                                          Editar
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleVerAnuncio(anuncio.id)}
                                        >
                                          Ver
                                        </Button>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-orange-200">
                                      <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                          <Eye className="w-3 h-3 text-gray-400" />
                                          <span className="text-xs text-gray-500">Views</span>
                                        </div>
                                        <p className="text-lg font-bold text-orange-600">{anuncio.visualizacoes || 0}</p>
                                      </div>
                                      <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                          <Star className="w-3 h-3 text-gray-400" />
                                          <span className="text-xs text-gray-500">Curtidas</span>
                                        </div>
                                        <p className="text-lg font-bold text-orange-600">{anuncio.curtidas || 0}</p>
                                      </div>
                                      <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                          <MessageCircle className="w-3 h-3 text-gray-400" />
                                          <span className="text-xs text-gray-500">Coments</span>
                                        </div>
                                        <p className="text-lg font-bold text-orange-600">{anuncio.comentarios?.length || 0}</p>
                                      </div>
                                      <div className="text-center">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                          <TrendingUp className="w-3 h-3 text-gray-400" />
                                          <span className="text-xs text-gray-500">Alcance</span>
                                        </div>
                                        <p className="text-lg font-bold text-orange-600">+{Math.floor((anuncio.visualizacoes || 0) * 1.5)}</p>
                                      </div>
                                    </div>

                                    {anuncio.data_impulsionamento && (
                                      <div className="mt-3 pt-3 border-t border-orange-200">
                                        <p className="text-xs text-gray-600">
                                          <Clock className="w-3 h-3 inline mr-1" />
                                          Impulsionado em: {format(new Date(anuncio.data_impulsionamento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            <Alert className="mt-4 bg-orange-50 border-orange-200">
                              <Zap className="h-4 w-4 text-orange-600" />
                              <AlertDescription className="text-orange-800 text-sm">
                                💡 Anúncios impulsionados recebem até <strong>3x mais visualizações</strong> e aparecem em destaque nas buscas!
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}

                        {/* Lista de todos os anúncios */}
                        {meusAnuncios.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Você ainda não possui anúncios cadastrados.</p>
                            <Button
                              onClick={() => navigate(createPageUrl("CadastrarAnuncio"))}
                              className="w-full mt-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                            >
                              Criar Novo Anúncio
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {meusAnuncios.map((anuncio) => (
                              <div
                                key={anuncio.id}
                                className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-[#F7D426] transition-colors"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 mb-1">{anuncio.titulo}</h5>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <Badge className={
                                        anuncio.status === 'ativo' ? 'bg-green-100 text-green-800' :
                                        anuncio.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                      }>
                                        {anuncio.status}
                                      </Badge>
                                      <span>•</span>
                                      <span>{anuncio.categoria}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    {anuncio.status === 'pendente' && (
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          atualizarStatusMutation.mutate({ id: anuncio.id, status: 'ativo' });
                                        }}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        Ativar
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditarAnuncio(anuncio.id)}
                                    >
                                      Editar
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleVerAnuncio(anuncio.id)}
                                    >
                                      Ver
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t">
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                      <Eye className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs text-gray-500">Visualizações</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">{anuncio.visualizacoes || 0}</p>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                      <Star className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs text-gray-500">Curtidas</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">{anuncio.curtidas || 0}</p>
                                  </div>
                                  <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                      <MessageCircle className="w-3 h-3 text-gray-400" />
                                      <span className="text-xs text-gray-500">Comentários</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">{anuncio.comentarios?.length || 0}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                          <Bookmark className="w-5 h-5 text-purple-600" />
                          Anúncios Salvos
                        </h3>
                        {isLoadingAnunciosSalvos ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <Loader2 className="w-6 h-6 mx-auto animate-spin text-purple-600" />
                            <p className="text-gray-500 mt-2">Carregando anúncios salvos...</p>
                          </div>
                        ) : anunciosSalvos.length === 0 ? (
                          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
                            <div className="text-6xl mb-4">🤍</div>
                            <p className="text-gray-500 mb-4">
                              Você ainda não salvou nenhum anúncio.
                            </p>
                            <Button
                              onClick={() => navigate(createPageUrl("Inicio"))} // Or a specific search page
                              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                            >
                              Explorar Anúncios
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {anunciosSalvos.map((anuncio) => (
                              <div
                                key={anuncio.id}
                                className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors cursor-pointer"
                                onClick={() => handleVerAnuncio(anuncio.id)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 mb-1">{anuncio.titulo}</h5>
                                    <p className="text-sm text-gray-600">{anuncio.descricao.substring(0, 70)}...</p>
                                  </div>
                                  <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleVerAnuncio(anuncio.id); }}>
                                    Ver Detalhes
                                  </Button>
                                </div>
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t text-sm text-gray-500">
                                  <MapPin className="w-4 h-4" /> {anuncio.cidade}, {anuncio.estado}
                                  <Star className="w-4 h-4 ml-auto" /> {anuncio.media_avaliacao || 'N/A'} ({anuncio.total_avaliacoes || 0})
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Estatísticas (APENAS PROFISSIONAIS) */}
              {isProfissional && (
                <TabsContent value="estatisticas" className="space-y-4">
                  {/* Statistics Cards */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className="border-none shadow-lg">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Eye className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold">{totalVisualizacoes}</p>
                        <p className="text-sm text-gray-600">Visualizações</p>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg">
                      <CardContent className="p-4  text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold">{anunciosAtivos}</p>
                        <p className="text-sm text-gray-600">Ativos</p>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Star className="w-6 h-6 text-yellow-600" />
                        </div>
                        <p className="text-2xl font-bold">{anunciosDestaque}</p>
                        <p className="text-sm text-gray-600">Em Destaque</p>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                        <p className="text-2xl font-bold">{anunciosPendentes}</p>
                        <p className="text-sm text-gray-600">Pendentes</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-none shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-pink-600" />
                        Relatórios de Performance
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Acompanhe o desempenho dos seus anúncios com relatórios detalhados, similar ao Google Negócios
                      </p>

                      {/* Overview Cards */}
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-900">Visualizações Totais</span>
                            <Eye className="w-5 h-5 text-blue-600" />
                          </div>
                          <p className="text-3xl font-bold text-blue-900">{totalVisualizacoes}</p>
                          <p className="text-xs text-blue-700 mt-1">Nos últimos 30 dias</p>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-900">Taxa de Cliques</span>
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          </div>
                          <p className="text-3xl font-bold text-green-900">
                            {totalVisualizacoes > 0 ? ((meusAnuncios.length / totalVisualizacoes) * 100).toFixed(1) : 0}%
                          </p>
                          <p className="text-xs text-green-700 mt-1">CTR médio dos anúncios</p>
                        </div>
                      </div>

                      {/* Performance by Ad */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-gray-700 mb-3">Desempenho por Anúncio</h4>
                        {meusAnuncios.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Você ainda não possui anúncios ativos</p>
                            <Button
                              onClick={() => navigate(createPageUrl("CadastrarAnuncio"))}
                              className="mt-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                            >
                              Criar Primeiro Anúncio
                            </Button>
                          </div>
                        ) : (
                          meusAnuncios.slice(0, 5).map((anuncio) => (
                            <div
                              key={anuncio.id}
                              className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-pink-300 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 mb-1">{anuncio.titulo}</h5>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Badge className={
                                      anuncio.status === 'ativo' ? 'bg-green-100 text-green-800' :
                                      anuncio.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }>
                                      {anuncio.status}
                                    </Badge>
                                    <span>•</span>
                                    <span>{anuncio.categoria}</span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => navigate(`${createPageUrl("DetalhesAnuncio")}?id=${anuncio.id}`)}
                                >
                                  Ver Detalhes
                                </Button>
                              </div>

                              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t">
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <Eye className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">Visualizações</span>
                                  </div>
                                  <p className="text-lg font-bold text-gray-900">{anuncio.visualizacoes || 0}</p>
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <Star className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">Curtidas</span>
                                  </div>
                                  <p className="text-lg font-bold text-gray-900">{anuncio.curtidas || 0}</p>
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <MessageCircle className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">Comentários</span>
                                  </div>
                                  <p className="text-lg font-bold text-gray-900">{anuncio.comentarios?.length || 0}</p>
                                </div>
                              </div>

                              {/* Tags/Keywords */}
                              {anuncio.tags && anuncio.tags.length > 0 && (
                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-xs text-gray-500 mb-2">Palavras-chave (Google Business):</p>
                                  <div className="flex flex-wrap gap-1">
                                    {anuncio.tags.slice(0, 5).map((tag, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      <Alert className="mt-6 bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 text-sm">
                          💡 Dica: Use palavras-chave (tags) estratégicas para melhorar seu posicionamento no Google e aumentar suas visualizações!
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Tab Produtos & Serviços (APENAS PACIENTES) */}
              {!isProfissional && (
                <TabsContent value="produtos-servicos" className="space-y-4">
                  <Card className="border-none shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-pink-600" />
                        Meus Produtos e Serviços Contratados
                      </h3>

                      {meusPedidos.length === 0 ? (
                        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
                          <div className="text-6xl mb-4">🛍️</div>
                          <p className="text-gray-500 mb-4">
                            Você ainda não possui produtos ou serviços contratados
                          </p>
                          <Button
                            onClick={() => navigate(createPageUrl("Produtos"))}
                            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                          >
                            Ver Produtos Disponíveis
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {meusPedidos.map((pedido) => (
                            <div
                              key={pedido.id}
                              className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-pink-300 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {pedido.tipo === 'servico' ? (
                                      <Badge className="bg-blue-100 text-blue-800">Serviço</Badge>
                                    ) : (
                                      <Badge className="bg-green-100 text-green-800">Produto</Badge>
                                    )}
                                    <Badge className={
                                      pedido.status_pedido === 'entregue' ? 'bg-green-100 text-green-800' :
                                      pedido.status_pedido === 'em_transito' ? 'bg-blue-100 text-blue-800' :
                                      pedido.status_pedido === 'enviado' ? 'bg-yellow-100 text-yellow-800' :
                                      pedido.status_pedido === 'cancelado' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }>
                                      {pedido.status_pedido.replace(/_/g, ' ')}
                                    </Badge>
                                  </div>
                                  <h5 className="font-medium text-gray-900 mb-1">{pedido.produto_nome}</h5>
                                  <p className="text-sm text-gray-600">
                                    Pedido #{pedido.id.slice(0, 8)} • {format(new Date(pedido.created_date), "dd/MM/yyyy 'às' HH:mm")}
                                  </p>
                                  <p className="text-sm font-bold text-gray-900 mt-2">
                                    Valor: R$ {pedido.valor_total.toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              {/* Rastreamento */}
                              {pedido.codigo_rastreio && (
                                <div className="mt-3 pt-3 border-t bg-blue-50 p-3 rounded">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-blue-900">
                                      📦 Rastreamento
                                    </p>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const url = pedido.transportadora === 'Correios'
                                          ? `https://www.correios.com.br/rastreamento?codigo=${pedido.codigo_rastreio}`
                                          : `https://www.google.com/search?q=rastrear+${pedido.codigo_rastreio}`;
                                        window.open(url, '_blank');
                                      }}
                                      className="text-xs"
                                    >
                                      Rastrear Encomenda
                                    </Button>
                                  </div>
                                  <p className="text-xs text-blue-700">
                                    Código: <span className="font-mono font-bold">{pedido.codigo_rastreio}</span>
                                  </p>
                                  {pedido.transportadora && (
                                    <p className="text-xs text-blue-700 mt-1">
                                      Transportadora: {pedido.transportadora}
                                    </p>
                                  )}

                                  {/* Histórico de Rastreio */}
                                  {pedido.historico_rastreio && pedido.historico_rastreio.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                      <p className="text-xs font-medium text-blue-900">Últimas atualizações:</p>
                                      {pedido.historico_rastreio.slice(-3).reverse().map((item, i) => (
                                        <div key={i} className="text-xs bg-white p-2 rounded border border-blue-200">
                                          <div className="flex justify-between mb-1">
                                            <span className="font-medium">{item.status}</span>
                                            <span className="text-gray-500">
                                              {format(new Date(item.data), "dd/MM HH:mm")}
                                            </span>
                                          </div>
                                          {item.localizacao && (
                                            <p className="text-gray-600">📍 {item.localizacao}</p>
                                          )}
                                          {item.descricao && (
                                            <p className="text-gray-600">{item.descricao}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Endereço de Entrega */}
                              {pedido.endereco_entrega && (
                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-xs font-medium text-gray-700 mb-1">Endereço de Entrega:</p>
                                  <p className="text-xs text-gray-600">
                                    {pedido.endereco_entrega.rua}, {pedido.endereco_entrega.numero}
                                    {pedido.endereco_entrega.complemento && ` - ${pedido.endereco_entrega.complemento}`}
                                    <br />
                                    {pedido.endereco_entrega.bairro} - {pedido.endereco_entrega.cidade}/{pedido.endereco_entrega.estado}
                                    <br />
                                    CEP: {pedido.endereco_entrega.cep}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Tab Indicações (for both) */}
              <TabsContent value="indicacoes">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Handshake className="w-5 h-5 text-green-600" />
                      Programa de Indicações
                    </h3>
                    <div className="text-center py-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-dashed border-green-300">
                      <div className="text-6xl mb-4">🤝</div>
                      <p className="text-gray-800 text-lg mb-4">
                        Indique o Mapa da Estética e ganhe benefícios!
                      </p>
                      <p className="text-gray-600 mb-6">
                        Compartilhe seu código de indicação com amigos e colegas e seja recompensado.
                      </p>
                      <Button
                        onClick={() => alert("Funcionalidade em desenvolvimento!")}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Ver Meu Código de Indicação
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>

          {/* Profile Settings - AMBOS (Right Sidebar) */}
          <div className="space-y-6">
            {/* Tipo de Conta */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Tipo de Conta</h3>
                <div className="text-center mb-4">
                  <Badge className={`text-lg px-4 py-2 ${isPaciente ? "bg-blue-600" : "bg-purple-600"}`}>
                    {isPaciente ? "👤 Paciente" : "💼 Profissional"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  {isPaciente
                    ? "Você tem acesso a busca de profissionais e produtos"
                    : "Você pode criar anúncios e gerenciar seu negócio"}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSolicitarMudancaTipo}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Solicitar Mudança de Tipo
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Entre em contato com o suporte para alterar
                </p>
              </CardContent>
            </Card>

            {/* Plan Info - ATUALIZADO COM TODOS OS PLANOS */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-rose-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-pink-600" />
                  Meus Planos Ativos
                </h3>

                <div className="space-y-4">
                  {/* Plano Mapa da Estética */}
                  <div className="p-4 bg-white rounded-lg border-2 border-pink-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-700">Mapa da Estética</p>
                      <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                        {planoNome}
                      </Badge>
                    </div>
                    {user.data_adesao_plano && (
                      <p className="text-xs text-gray-500">
                        Desde {format(new Date(user.data_adesao_plano), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    )}
                    {isProfissional && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3 text-xs"
                        onClick={() => navigate(createPageUrl("Planos"))}
                      >
                        Fazer Upgrade
                      </Button>
                    )}
                  </div>

                  {/* Plano Clube da Beleza */}
                  <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-purple-600" />
                        <p className="text-sm font-semibold text-gray-700">Clube da Beleza</p>
                      </div>
                      <Badge className={
                        user.plano_clube_beleza === 'nenhum' || !user.plano_clube_beleza ?
                        "bg-gray-100 text-gray-600" :
                        "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      }>
                        {user.plano_clube_beleza === 'nenhum' || !user.plano_clube_beleza ? 'Não Ativo' : user.plano_clube_beleza.toUpperCase()}
                      </Badge>
                    </div>
                    {user.plano_clube_beleza !== 'nenhum' && user.data_adesao_plano_clube && (
                      <p className="text-xs text-gray-500">
                        Desde {format(new Date(user.data_adesao_plano_clube), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    )}
                    {(user.plano_clube_beleza === 'nenhum' || !user.plano_clube_beleza) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3 text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
                        onClick={() => alert("Funcionalidade em breve! Entre em contato conosco.")}
                      >
                        Assinar Clube
                      </Button>
                    )}
                  </div>

                  {/* Plano Patrocinador */}
                  {isProfissional && (
                    <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <p className="text-sm font-semibold text-gray-700">Patrocinador</p>
                        </div>
                        <Badge className={
                          user.plano_patrocinador === 'nenhum' || !user.plano_patrocinador ?
                          "bg-gray-100 text-gray-600" :
                          "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                        }>
                          {user.plano_patrocinador === 'nenhum' || !user.plano_patrocinador ? 'Não Ativo' : user.plano_patrocinador.toUpperCase()}
                        </Badge>
                      </div>
                      {user.plano_patrocinador !== 'nenhum' && user.data_adesao_plano_patrocinador && (
                        <p className="text-xs text-gray-500">
                          Desde {format(new Date(user.data_adesao_plano_patrocinador), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      )}
                      {(user.plano_patrocinador === 'nenhum' || !user.plano_patrocinador) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-3 text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            const mensagem = `Olá! Tenho interesse em contratar um plano de Patrocinador no Mapa da Estética.\n\nDados:\nNome: ${user.full_name}\nEmail: ${user.email}`;
                            window.open(`https://wa.me/5531972595643?text=${encodeURIComponent(mensagem)}`, '_blank');
                          }}
                        >
                          Ser Patrocinador
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Pontos e Beauty Coins */}
                <div className="space-y-3 mt-4 pt-4 border-t">
                  <div className="p-3 bg-white rounded-lg border-2 border-[#F7D426]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-[#F7D426]" />
                        <span className="text-sm text-gray-600">Pontos:</span>
                      </div>
                      <span className="font-bold text-lg text-[#F7D426]">{user.pontos_acumulados || 0}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border-2 border-purple-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-gray-600">Beauty Coins:</span>
                      </div>
                      <span className="font-bold text-lg text-purple-600">{user.beauty_coins || 0}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => navigate(createPageUrl("LojaPontos"))}
                  >
                    Ver Loja de Pontos
                  </Button>
                </div>

                {isProfissional && (
                  <Button
                    className="w-full mt-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                    onClick={() => navigate(createPageUrl("MeuPlano"))}
                  >
                    Ver Detalhes Completos
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Actions - AMBOS */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 space-y-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Saída</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja sair da sua conta?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSair}>
                        Sair
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Separator />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full justify-start">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Conta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Todos os seus dados e anúncios serão permanentemente removidos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => excluirContaMutation.mutate()}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Excluir Definitivamente
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Onboarding Modal Placeholder */}
        {mostrarOnboarding && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
              <h3 className="text-2xl font-bold mb-4">Complete seu Cadastro!</h3>
              <p className="text-gray-700 mb-6">
                Para aproveitar todas as funcionalidades, por favor, preencha as informações adicionais do seu perfil.
              </p>
              <Button onClick={() => {
                setMostrarOnboarding(false);
                setEditando(true); // Automatically switch to edit mode
              }} className="bg-pink-600 hover:bg-pink-700 text-white">
                Preencher Agora
              </Button>
              <Button variant="ghost" onClick={() => setMostrarOnboarding(false)} className="mt-2 w-full">
                Mais tarde
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
