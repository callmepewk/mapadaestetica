import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MapPin,
  Phone,
  User,
  Mail,
  Briefcase,
  Crown,
  Loader2,
  AlertCircle,
  ExternalLink,
  CreditCard
} from "lucide-react";

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

// Função para converter nome do estado para sigla
const converterEstadoParaSigla = (estado) => {
  if (!estado) return "";
  const estadoUpper = estado.toUpperCase().trim();
  
  // Se já é sigla válida
  const encontradoPorSigla = ESTADOS_BRASIL.find(e => e.sigla === estadoUpper);
  if (encontradoPorSigla) return encontradoPorSigla.sigla;
  
  // Buscar por nome
  const estadoNormalizado = estado.toLowerCase().trim();
  const encontrado = ESTADOS_BRASIL.find(e => 
    e.nome.toLowerCase() === estadoNormalizado ||
    e.nome.toLowerCase().includes(estadoNormalizado) ||
    estadoNormalizado.includes(e.nome.toLowerCase())
  );
  
  return encontrado ? encontrado.sigla : estado;
};

const ESPECIALIDADES = [
  "Estética Facial", "Estética Corporal", "Micropigmentação",
  "Depilação", "Massoterapia", "Podologia", "Design de Sobrancelhas",
  "Harmonização Facial", "Dermatologia", "Medicina Estética"
];

const PLANOS_PATROCINADOR = {
  cobre: {
    nome: "Cobre",
    valor: 197,
    link: "https://mpago.la/2DmMtKp",
    beneficios: ["1 banner rotativo", "5 dias/mês de exposição", "Estatísticas básicas"]
  },
  prata: {
    nome: "Prata",
    valor: 397,
    link: "https://mpago.la/1c5UPJe",
    beneficios: ["3 banners rotativos", "10 dias/mês", "1 post mensal", "Métricas avançadas"]
  },
  ouro: {
    nome: "Ouro",
    valor: 697,
    link: "https://mpago.la/2g3Nv4L",
    beneficios: ["5 banners", "15 dias/mês", "2 posts mensais", "Produtos em destaque"]
  },
  diamante: {
    nome: "Diamante",
    valor: 997,
    link: "https://mpago.la/1LkRbVz",
    beneficios: ["10 banners", "20 dias/mês", "4 posts mensais", "Prioridade máxima"]
  },
  platina: {
    nome: "Platina",
    valor: 1497,
    link: "https://mpago.la/2Pc8QrX",
    beneficios: ["15 banners", "30 dias/mês", "Posts ilimitados", "Consultoria inclusa"]
  }
};

export default function OnboardingModal({ open, onClose, onComplete }) {
  const [etapa, setEtapa] = useState(1);
  const [tipoUsuario, setTipoUsuario] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [user, setUser] = useState(null);
  const [obtendoLocalizacao, setObtendoLocalizacao] = useState(false);
  
  const [dados, setDados] = useState({
    full_name: "",
    telefone: "",
    whatsapp: "",
    cidade: "",
    estado: "",
    pais: "Brasil",
    latitude: null,
    longitude: null,
    nome_marca: "",
    plano_patrocinador_selecionado: "",
    especialidade: "",
    cpf: "",
    instagram: "",
    facebook: ""
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setTipoUsuario(userData.tipo_usuario);
        
        // Preencher dados existentes
        setDados({
          full_name: userData.full_name || "",
          telefone: userData.telefone || "",
          whatsapp: userData.whatsapp || "",
          cidade: userData.cidade || "",
          estado: userData.estado || "",
          pais: userData.pais || "Brasil",
          latitude: userData.latitude || null,
          longitude: userData.longitude || null,
          nome_marca: userData.nome_marca || "",
          plano_patrocinador_selecionado: "",
          especialidade: userData.especialidade || "",
          cpf: userData.cpf || "",
          instagram: userData.instagram || "",
          facebook: userData.facebook || ""
        });
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };
    
    if (open) {
      fetchUser();
    }
  }, [open]);

  const handleObterLocalizacao = () => {
    if (!navigator.geolocation) {
      alert("Seu navegador não suporta geolocalização");
      return;
    }

    setObtendoLocalizacao(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Tentar obter cidade/estado via reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt-BR`
          );
          const data = await response.json();
          
          if (data.address) {
            const cidade = data.address.city || data.address.town || data.address.village || data.address.municipality || "";
            const estadoRetornado = data.address.state || "";
            const estadoSigla = converterEstadoParaSigla(estadoRetornado);
            
            setDados(prev => ({
              ...prev,
              latitude,
              longitude,
              cidade: cidade,
              estado: estadoSigla,
              pais: data.address.country || "Brasil"
            }));
          } else {
            setDados(prev => ({ ...prev, latitude, longitude }));
          }
        } catch (error) {
          console.error("Erro ao obter localização:", error);
          setDados(prev => ({ ...prev, latitude, longitude }));
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

  const handleProximaEtapa = () => {
    if (etapa === 1 && !tipoUsuario) {
      alert("Selecione um tipo de usuário");
      return;
    }
    
    if (etapa === 2) {
      const nomeValido = dados.full_name && dados.full_name.trim().length > 0;
      const telefoneValido = dados.telefone && dados.telefone.trim().length > 0;
      const cidadeValida = dados.cidade && dados.cidade.trim().length > 0;
      const estadoValido = dados.estado && dados.estado.trim().length > 0;
      
      if (!nomeValido || !telefoneValido || !cidadeValida || !estadoValido) {
        alert("Preencha todos os campos obrigatórios: Nome, Telefone, Cidade e Estado");
        return;
      }
    }

    if (etapa === 3 && tipoUsuario === "patrocinador") {
      if (!dados.nome_marca || !dados.plano_patrocinador_selecionado) {
        alert("Preencha o nome da marca e selecione um plano");
        return;
      }
    }

    setEtapa(prev => prev + 1);
  };

  const handleFinalizarCadastro = async () => {
    setCarregando(true);
    try {
      const dadosAtualizacao = {
        full_name: dados.full_name,
        telefone: dados.telefone,
        whatsapp: dados.whatsapp || dados.telefone,
        cidade: dados.cidade,
        estado: dados.estado,
        pais: dados.pais,
        latitude: dados.latitude,
        longitude: dados.longitude,
        tipo_usuario: tipoUsuario,
        cadastro_completo: true,
      };

      // Dados específicos por tipo
      if (tipoUsuario === "profissional") {
        dadosAtualizacao.especialidade = dados.especialidade;
        dadosAtualizacao.cpf = dados.cpf;
        dadosAtualizacao.instagram = dados.instagram;
        dadosAtualizacao.facebook = dados.facebook;
      } else if (tipoUsuario === "patrocinador") {
        dadosAtualizacao.nome_marca = dados.nome_marca;
        dadosAtualizacao.instagram = dados.instagram;
        dadosAtualizacao.facebook = dados.facebook;
        // NÃO ativa o plano ainda - apenas registra a solicitação
        
        // Criar solicitação de ativação do plano
        await base44.entities.SolicitacaoAtivacaoPlano.create({
          usuario_email: user.email,
          usuario_nome: dados.full_name,
          plano_solicitado: dados.plano_patrocinador_selecionado,
          tipo_plano: "patrocinador",
          valor_mensal: PLANOS_PATROCINADOR[dados.plano_patrocinador_selecionado].valor,
          link_mercadopago: PLANOS_PATROCINADOR[dados.plano_patrocinador_selecionado].link,
          status: "aguardando_confirmacao",
          data_solicitacao: new Date().toISOString()
        });

        // Criar notificação para o patrocinador
        await base44.entities.Notificacao.create({
          usuario_email: user.email,
          tipo: "plano_patrocinador_pendente",
          titulo: "🎉 Cadastro Completo - Plano em Análise",
          mensagem: `Seu cadastro foi concluído! O plano ${PLANOS_PATROCINADOR[dados.plano_patrocinador_selecionado].nome} será ativado assim que nossa equipe verificar o pagamento. Você já pode explorar a plataforma!`,
          lida: false
        });
      } else if (tipoUsuario === "paciente") {
        dadosAtualizacao.cpf = dados.cpf;
      }

      await base44.auth.updateMe(dadosAtualizacao);

      // Recarregar página para atualizar interface
      if (onComplete) onComplete();
      window.location.reload();
    } catch (error) {
      console.error("Erro ao finalizar cadastro:", error);
      alert("Erro ao finalizar cadastro. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const totalEtapas = tipoUsuario === "profissional" ? 3 : tipoUsuario === "patrocinador" ? 4 : 2;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Complete seu Cadastro
          </DialogTitle>
          <DialogDescription>
            Etapa {etapa} de {totalEtapas}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Barra de Progresso */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {Array.from({ length: totalEtapas }).map((_, i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    i + 1 <= etapa ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}>
                    {i + 1 < etapa ? <CheckCircle className="w-5 h-5" /> : i + 1}
                  </div>
                  {i < totalEtapas - 1 && (
                    <div className={`h-1 flex-1 mx-2 ${
                      i + 1 < etapa ? "bg-purple-600" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Etapa 1: Tipo de Usuário */}
          {etapa === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-center mb-6">
                Como você deseja usar o Mapa da Estética?
              </h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                <Card 
                  onClick={() => setTipoUsuario("paciente")}
                  className={`cursor-pointer transition-all ${
                    tipoUsuario === "paciente" 
                      ? "border-4 border-blue-500 bg-blue-50" 
                      : "border-2 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <CardContent className="p-6 text-center">
                    <User className={`w-12 h-12 mx-auto mb-3 ${
                      tipoUsuario === "paciente" ? "text-blue-600" : "text-gray-400"
                    }`} />
                    <h4 className="font-bold mb-2">Paciente</h4>
                    <p className="text-sm text-gray-600">Buscar serviços e profissionais</p>
                  </CardContent>
                </Card>

                <Card 
                  onClick={() => setTipoUsuario("profissional")}
                  className={`cursor-pointer transition-all ${
                    tipoUsuario === "profissional" 
                      ? "border-4 border-purple-500 bg-purple-50" 
                      : "border-2 border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <CardContent className="p-6 text-center">
                    <Briefcase className={`w-12 h-12 mx-auto mb-3 ${
                      tipoUsuario === "profissional" ? "text-purple-600" : "text-gray-400"
                    }`} />
                    <h4 className="font-bold mb-2">Profissional</h4>
                    <p className="text-sm text-gray-600">Anunciar meus serviços</p>
                  </CardContent>
                </Card>

                <Card 
                  onClick={() => setTipoUsuario("patrocinador")}
                  className={`cursor-pointer transition-all ${
                    tipoUsuario === "patrocinador" 
                      ? "border-4 border-green-500 bg-green-50" 
                      : "border-2 border-gray-200 hover:border-green-300"
                  }`}
                >
                  <CardContent className="p-6 text-center">
                    <Crown className={`w-12 h-12 mx-auto mb-3 ${
                      tipoUsuario === "patrocinador" ? "text-green-600" : "text-gray-400"
                    }`} />
                    <h4 className="font-bold mb-2">Patrocinador</h4>
                    <p className="text-sm text-gray-600">Anunciar minha marca</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Etapa 2: Informações Básicas */}
          {etapa === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Informações Básicas</h3>
              
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={dados.full_name}
                  onChange={(e) => setDados({ ...dados, full_name: e.target.value })}
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={dados.telefone}
                    onChange={(e) => setDados({ ...dados, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={dados.whatsapp}
                    onChange={(e) => setDados({ ...dados, whatsapp: e.target.value })}
                    placeholder="Deixe vazio para usar o telefone"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Localização *</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleObterLocalizacao}
                    disabled={obtendoLocalizacao}
                  >
                    {obtendoLocalizacao ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <MapPin className="w-3 h-3 mr-1" />
                    )}
                    Obter Localização Automática
                  </Button>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      value={dados.cidade}
                      onChange={(e) => setDados({ ...dados, cidade: e.target.value })}
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado *</Label>
                    <Select
                      value={dados.estado}
                      onValueChange={(value) => {
                        setDados(prev => ({ ...prev, estado: value }));
                      }}
                    >
                      <SelectTrigger id="estado">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {ESTADOS_BRASIL.map(estado => (
                          <SelectItem key={estado.sigla} value={estado.sigla}>
                            {estado.sigla} - {estado.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pais">País</Label>
                    <Input
                      id="pais"
                      value={dados.pais}
                      onChange={(e) => setDados({ ...dados, pais: e.target.value })}
                      placeholder="Brasil"
                    />
                  </div>
                </div>
                {dados.latitude && dados.longitude && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Geolocalização obtida com sucesso!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Etapa 3: Específico Profissional */}
          {etapa === 3 && tipoUsuario === "profissional" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Informações Profissionais</h3>
              
              <div>
                <Label htmlFor="especialidade">Especialidade *</Label>
                <Select
                  value={dados.especialidade}
                  onValueChange={(value) => setDados({ ...dados, especialidade: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESPECIALIDADES.map(esp => (
                      <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={dados.cpf}
                  onChange={(e) => setDados({ ...dados, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagram">Instagram (opcional)</Label>
                  <Input
                    id="instagram"
                    value={dados.instagram}
                    onChange={(e) => setDados({ ...dados, instagram: e.target.value })}
                    placeholder="@seuperfil"
                  />
                </div>
                <div>
                  <Label htmlFor="facebook">Facebook (opcional)</Label>
                  <Input
                    id="facebook"
                    value={dados.facebook}
                    onChange={(e) => setDados({ ...dados, facebook: e.target.value })}
                    placeholder="facebook.com/seuperfil"
                  />
                </div>
              </div>

              <Alert className="bg-purple-50 border-purple-200">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800 text-sm">
                  ✨ Após concluir, você poderá criar anúncios gratuitamente!
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Etapa 3: Específico Patrocinador - Nome da Marca */}
          {etapa === 3 && tipoUsuario === "patrocinador" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">Informações da Marca</h3>
              
              <div>
                <Label htmlFor="nome_marca">Nome de Exibição da Marca *</Label>
                <Input
                  id="nome_marca"
                  value={dados.nome_marca}
                  onChange={(e) => setDados({ ...dados, nome_marca: e.target.value })}
                  placeholder="Ex: Dermacosméticos XYZ"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este nome será exibido nos seus banners e posts patrocinados
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagram-marca">Instagram da Marca</Label>
                  <Input
                    id="instagram-marca"
                    value={dados.instagram}
                    onChange={(e) => setDados({ ...dados, instagram: e.target.value })}
                    placeholder="@suamarca"
                  />
                </div>
                <div>
                  <Label htmlFor="facebook-marca">Facebook da Marca</Label>
                  <Input
                    id="facebook-marca"
                    value={dados.facebook}
                    onChange={(e) => setDados({ ...dados, facebook: e.target.value })}
                    placeholder="facebook.com/suamarca"
                  />
                </div>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <Crown className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  👑 Na próxima etapa você escolherá seu plano de patrocínio
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Etapa 4: Seleção de Plano Patrocinador */}
          {etapa === 4 && tipoUsuario === "patrocinador" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4 text-center">Escolha seu Plano de Patrocínio</h3>
              
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  💡 Selecione um plano abaixo. Após finalizar o cadastro, você poderá efetuar o pagamento e seu plano será ativado pela nossa equipe.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(PLANOS_PATROCINADOR).map(([key, plano]) => (
                  <Card
                    key={key}
                    onClick={() => setDados({ ...dados, plano_patrocinador_selecionado: key })}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      dados.plano_patrocinador_selecionado === key
                        ? "border-4 border-green-500 bg-green-50"
                        : "border-2 border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-lg">{plano.nome}</h4>
                        {dados.plano_patrocinador_selecionado === key && (
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Selecionado
                          </Badge>
                        )}
                      </div>
                      <div className="text-center mb-3">
                        <p className="text-3xl font-bold text-green-600">
                          R$ {plano.valor}
                        </p>
                        <p className="text-xs text-gray-500">por mês</p>
                      </div>
                      <div className="space-y-1 text-xs text-gray-700 mb-3">
                        {plano.beneficios.map((beneficio, i) => (
                          <p key={i} className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                            {beneficio}
                          </p>
                        ))}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="w-full border-green-300 text-green-700 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(plano.link, '_blank');
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Ver Detalhes do Plano
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {dados.plano_patrocinador_selecionado && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 text-sm">
                    <p className="font-semibold mb-2">
                      ✅ Plano {PLANOS_PATROCINADOR[dados.plano_patrocinador_selecionado].nome} selecionado!
                    </p>
                    <p>Após finalizar o cadastro, você receberá instruções para pagamento e seu plano será ativado pela nossa equipe em até 24 horas.</p>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Navegação */}
          <div className="flex gap-3 mt-8">
            {etapa > 1 && (
              <Button
                onClick={() => setEtapa(etapa - 1)}
                variant="outline"
                className="flex-1"
                disabled={carregando}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}

            {etapa < totalEtapas ? (
              <Button
                onClick={handleProximaEtapa}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={!tipoUsuario && etapa === 1}
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleFinalizarCadastro}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={carregando}
              >
                {carregando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Finalizar Cadastro
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}