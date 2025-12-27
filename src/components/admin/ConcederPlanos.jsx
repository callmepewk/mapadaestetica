import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Search,
  CheckCircle,
  Loader2,
  Crown,
  User,
  Star,
  DollarSign,
  AlertCircle,
  Gift
} from "lucide-react";

const PLANOS_INFO = {
  cobre: { nome: "Cobre", cor: "bg-orange-100 text-orange-800" },
  lite: { nome: "Lite", cor: "bg-rose-100 text-rose-800" },
  prata: { nome: "Prata", cor: "bg-gray-100 text-gray-800" },
  ouro: { nome: "Ouro", cor: "bg-yellow-100 text-yellow-800" },
  diamante: { nome: "Diamante", cor: "bg-blue-100 text-blue-800" },
  platina: { nome: "Platina", cor: "bg-purple-100 text-purple-800" }
};

export default function ConcederPlanos({ todosUsuarios }) {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [planoMapa, setPlanoMapa] = useState("cobre");
  const [planoClube, setPlanoClube] = useState("nenhum");
  const [planoPatrocinador, setPlanoPatrocinador] = useState("nenhum");
  const [tipoUsuario, setTipoUsuario] = useState("paciente");
  const [roleUsuario, setRoleUsuario] = useState("user");
  const [pontosUsuario, setPontosUsuario] = useState(0);
  const [beautyCoinsUsuario, setBeautyCoinsUsuario] = useState(0);
  const [sucesso, setSucesso] = useState(null);
  const [erro, setErro] = useState(null);

  const [trialQtd, setTrialQtd] = useState(7);
  const [trialTipo, setTrialTipo] = useState('dias');

  const concederPlanosMutation = useMutation({
    mutationFn: async ({ userId, planos, tipo, pontos, beautyCoins, role }) => {
      console.log("🆔 UPDATE USER ID:", userId);
      
      const updateData = {
        tipo_usuario: tipo,
        role: role,
        plano_ativo: planos.mapa,
        plano_clube_beleza: planos.clube,
        plano_patrocinador: planos.patrocinador,
        pontos_acumulados: parseInt(pontos) || 0,
        beauty_coins: parseInt(beautyCoins) || 0
      };

      console.log("📦 Data:", updateData);
      
      const resultado = await base44.entities.User.update(userId, updateData);
      
      console.log("✅ Updated:", resultado);
      
      return resultado;
    },
    onSuccess: () => {
      setSucesso(`✅ Atualizado!`);
      
      queryClient.invalidateQueries({ queryKey: ['todos-usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios-profissionais'] });
      queryClient.invalidateQueries({ queryKey: ['testers'] });
      
      setTimeout(() => window.location.reload(), 1500);
    },
    onError: (error) => {
      console.error("❌ Erro:", error);
      setErro(`❌ ${error.message}`);
      setTimeout(() => setErro(null), 5000);
    }
  });

  const concederTrial = async () => {
    if (!usuarioSelecionado) return;
    const agora = new Date();
    const fim = new Date(agora);
    if (trialTipo === 'meses') {
      fim.setMonth(fim.getMonth() + (parseInt(trialQtd) || 0));
    } else {
      fim.setDate(fim.getDate() + (parseInt(trialQtd) || 0));
    }
    await base44.entities.User.update(usuarioSelecionado.id, {
      plano_trial_ativo: true,
      plano_trial_fim: fim.toISOString()
    });
    setUsuarioSelecionado({ ...usuarioSelecionado, plano_trial_ativo: true, plano_trial_fim: fim.toISOString() });
    queryClient.invalidateQueries({ queryKey: ['todos-usuarios'] });
    setSucesso('Período grátis concedido!');
    setTimeout(()=> setSucesso(null), 3000);
  };

  const estenderTrial = async (dias = 7) => {
    if (!usuarioSelecionado?.plano_trial_fim) return;
    const fim = new Date(usuarioSelecionado.plano_trial_fim);
    fim.setDate(fim.getDate() + dias);
    await base44.entities.User.update(usuarioSelecionado.id, { plano_trial_fim: fim.toISOString() });
    setUsuarioSelecionado({ ...usuarioSelecionado, plano_trial_fim: fim.toISOString() });
    setSucesso(`Período grátis estendido em ${dias} dias!`);
    setTimeout(()=> setSucesso(null), 3000);
  };

  const encerrarTrial = async () => {
    if (!usuarioSelecionado) return;
    await base44.entities.User.update(usuarioSelecionado.id, { plano_trial_ativo: false });
    setUsuarioSelecionado({ ...usuarioSelecionado, plano_trial_ativo: false });
    setSucesso('Período grátis encerrado!');
    setTimeout(()=> setSucesso(null), 3000);
  };

  const handleConcederPlanos = () => {
    if (!usuarioSelecionado) {
      alert("❌ Nenhum usuário selecionado!");
      setErro("Selecione um usuário!");
      setTimeout(() => setErro(null), 3000);
      return;
    }

    if (!usuarioSelecionado.id) {
      alert("❌ ERRO: Usuário sem ID!\n\nO objeto do usuário não tem campo 'id'.");
      console.error("Usuário selecionado:", usuarioSelecionado);
      return;
    }

    console.log("🔔 BOTÃO SALVAR CLICADO!");
    console.log("🆔 User ID:", usuarioSelecionado.id);
    console.log("👤 Nome:", usuarioSelecionado.full_name);
    console.log("📧 Email:", usuarioSelecionado.email);
    
    concederPlanosMutation.mutate({
      userId: usuarioSelecionado.id,
      tipo: tipoUsuario,
      role: roleUsuario,
      pontos: pontosUsuario,
      beautyCoins: beautyCoinsUsuario,
      planos: {
        mapa: planoMapa,
        clube: planoClube,
        patrocinador: planoPatrocinador
      }
    });
  };

  const usuariosFiltrados = todosUsuarios.filter(u => 
    !busca || 
    u.full_name?.toLowerCase().includes(busca.toLowerCase()) ||
    u.email?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-purple-600" />
          Conceder Planos aos Usuários
        </CardTitle>
        <p className="text-sm text-gray-600">
          Selecione um usuário e configure os planos que deseja conceder
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {erro && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}

        {sucesso && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{sucesso}</AlertDescription>
          </Alert>
        )}

        {/* Busca de Usuário */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4" />
            Buscar Usuário
          </Label>
          <Input
            placeholder="Digite nome ou email..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="mb-3"
          />
          
          <div className="max-h-[300px] overflow-y-auto border rounded-lg">
            {usuariosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <User className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Nenhum usuário encontrado</p>
              </div>
            ) : (
              <div className="divide-y">
                {usuariosFiltrados.map((usuario) => (
                  <button
                    key={usuario.id}
                    onClick={() => {
                      setUsuarioSelecionado(usuario);
                      setTipoUsuario(usuario.tipo_usuario || 'paciente');
                      setRoleUsuario(usuario.role || 'user');
                      setPlanoMapa(usuario.plano_ativo || 'cobre');
                      setPlanoClube(usuario.plano_clube_beleza || 'nenhum');
                      setPlanoPatrocinador(usuario.plano_patrocinador || 'nenhum');
                      setPontosUsuario(usuario.pontos_acumulados || 0);
                      setBeautyCoinsUsuario(usuario.beauty_coins || 0);
                    }}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      usuarioSelecionado?.id === usuario.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{usuario.full_name}</p>
                        <p className="text-sm text-gray-600">{usuario.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={
                          usuario.tipo_usuario === 'paciente' ? 'bg-blue-600 text-white' :
                          usuario.tipo_usuario === 'profissional' ? 'bg-purple-600 text-white' :
                          usuario.tipo_usuario === 'patrocinador' ? 'bg-green-600 text-white' :
                          'bg-gray-500 text-white'
                        }>
                          {usuario.tipo_usuario || 'N/D'}
                        </Badge>
                        {usuarioSelecionado?.id === usuario.id && (
                          <Badge className="bg-purple-600 text-white">SELECIONADO</Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Configuração de Planos */}
        {usuarioSelecionado && (
          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Configurar Planos para: {usuarioSelecionado.full_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo de Usuário */}
              <div>
                <Label className="font-semibold mb-2 block">👤 Tipo de Usuário</Label>
                <Select value={tipoUsuario} onValueChange={setTipoUsuario}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paciente">👤 Paciente</SelectItem>
                    <SelectItem value="profissional">💼 Profissional</SelectItem>
                    <SelectItem value="patrocinador">👑 Patrocinador</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 mt-1">
                  Atual: <Badge className="bg-blue-600 text-white">
                    {usuarioSelecionado.tipo_usuario || 'N/D'}
                  </Badge>
                </p>
              </div>

              {/* Role do Usuário */}
              <div>
                <Label className="font-semibold mb-2 block">🔑 Role (Permissão)</Label>
                <Select value={roleUsuario} onValueChange={setRoleUsuario}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">👤 User (Padrão)</SelectItem>
                    <SelectItem value="tester">🧪 Tester (7 dias)</SelectItem>
                    <SelectItem value="admin">👑 Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 mt-1">
                  Atual: <Badge className={
                    usuarioSelecionado.role === 'admin' ? 'bg-orange-600 text-white' :
                    usuarioSelecionado.role === 'tester' ? 'bg-blue-600 text-white' :
                    'bg-gray-600 text-white'
                  }>
                    {usuarioSelecionado.role || 'user'}
                  </Badge>
                </p>
              </div>

              {/* Pontos */}
              <div>
                <Label className="font-semibold mb-2 block flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                  Pontos Acumulados
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={pontosUsuario}
                  onChange={(e) => setPontosUsuario(parseInt(e.target.value) || 0)}
                  className="bg-white"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Atual: <Badge className="bg-yellow-600 text-white">
                    {usuarioSelecionado.pontos_acumulados || 0} pontos
                  </Badge>
                </p>
              </div>

              {/* Beauty Coins */}
              <div>
                <Label className="font-semibold mb-2 block flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-purple-600" />
                  Beauty Coins
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={beautyCoinsUsuario}
                  onChange={(e) => setBeautyCoinsUsuario(parseInt(e.target.value) || 0)}
                  className="bg-white"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Atual: <Badge className="bg-purple-600 text-white">
                    {usuarioSelecionado.beauty_coins || 0} coins
                  </Badge>
                </p>
              </div>

              {/* Plano Mapa da Estética */}
              <div>
                <Label className="font-semibold mb-2 block">🗺️ Plano Mapa da Estética</Label>
                <Select value={planoMapa} onValueChange={setPlanoMapa}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(PLANOS_INFO).map(key => (
                      <SelectItem key={key} value={key}>
                        <Badge className={PLANOS_INFO[key].cor}>
                          {PLANOS_INFO[key].nome}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 mt-1">
                  Atual: <Badge className={PLANOS_INFO[usuarioSelecionado.plano_ativo]?.cor || "bg-gray-100"}>
                    {PLANOS_INFO[usuarioSelecionado.plano_ativo]?.nome || 'Cobre'}
                  </Badge>
                </p>
              </div>

              {/* Período Grátis (Trial) */}
              <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                <Label className="font-semibold mb-2 block">🎁 Período Grátis</Label>
                <div className="grid md:grid-cols-3 gap-3 items-end">
                  <div>
                    <Label>Quantidade</Label>
                    <Input type="number" min="1" value={trialQtd} onChange={(e)=> setTrialQtd(parseInt(e.target.value)||1)} className="bg-white"/>
                  </div>
                  <div>
                    <Label>Unidade</Label>
                    <Select value={trialTipo} onValueChange={setTrialTipo}>
                      <SelectTrigger className="bg-white"><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dias">Dias</SelectItem>
                        <SelectItem value="meses">Meses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={concederTrial} className="bg-blue-600 hover:bg-blue-700">Conceder Trial</Button>
                    <Button type="button" variant="outline" onClick={()=> estenderTrial(7)}>+7 dias</Button>
                    <Button type="button" variant="destructive" onClick={encerrarTrial}>Encerrar</Button>
                  </div>
                </div>
                {usuarioSelecionado?.plano_trial_ativo && (
                  <p className="text-xs text-blue-900 mt-2">
                    Ativo até: <strong>{new Date(usuarioSelecionado.plano_trial_fim).toLocaleString('pt-BR')}</strong>
                  </p>
                )}
              </div>

               {/* Clube da Beleza */}
              <div>
                <Label className="font-semibold mb-2 block">👑 Clube da Beleza</Label>
                <Select value={planoClube} onValueChange={setPlanoClube}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                    <SelectItem value="light">LIGHT</SelectItem>
                    <SelectItem value="gold">GOLD</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 mt-1">
                  Atual: <Badge className={
                    usuarioSelecionado.plano_clube_beleza === 'vip' ? 'bg-purple-600 text-white' :
                    usuarioSelecionado.plano_clube_beleza === 'gold' ? 'bg-yellow-600 text-white' :
                    usuarioSelecionado.plano_clube_beleza === 'light' ? 'bg-blue-600 text-white' :
                    'bg-gray-400 text-white'
                  }>
                    {usuarioSelecionado.plano_clube_beleza || 'Nenhum'}
                  </Badge>
                </p>
              </div>

              {/* Plano Patrocinador */}
              <div>
                <Label className="font-semibold mb-2 block">🏢 Plano Patrocinador</Label>
                <Select value={planoPatrocinador} onValueChange={setPlanoPatrocinador}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                    <SelectItem value="cobre">Cobre</SelectItem>
                    <SelectItem value="prata">Prata</SelectItem>
                    <SelectItem value="ouro">Ouro</SelectItem>
                    <SelectItem value="diamante">Diamante</SelectItem>
                    <SelectItem value="platina">Platina</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 mt-1">
                  Atual: <Badge className={
                    usuarioSelecionado.plano_patrocinador === 'platina' ? 'bg-purple-600 text-white' :
                    usuarioSelecionado.plano_patrocinador === 'diamante' ? 'bg-blue-600 text-white' :
                    usuarioSelecionado.plano_patrocinador === 'ouro' ? 'bg-yellow-600 text-white' :
                    usuarioSelecionado.plano_patrocinador === 'prata' ? 'bg-gray-600 text-white' :
                    usuarioSelecionado.plano_patrocinador === 'cobre' ? 'bg-orange-600 text-white' :
                    'bg-gray-400 text-white'
                  }>
                    {usuarioSelecionado.plano_patrocinador || 'Nenhum'}
                  </Badge>
                </p>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>📋 Resumo das Alterações:</strong>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>• Tipo: <strong>{tipoUsuario}</strong></li>
                    <li>• Role: <strong>{roleUsuario}</strong></li>
                    <li>• Plano Mapa: <strong>{PLANOS_INFO[planoMapa]?.nome}</strong></li>
                    <li>• Clube: <strong>{planoClube.toUpperCase()}</strong></li>
                    <li>• Patrocinador: <strong>{planoPatrocinador.toUpperCase()}</strong></li>
                    <li>• Pontos: <strong>{pontosUsuario}</strong></li>
                    <li>• Beauty Coins: <strong>{beautyCoinsUsuario}</strong></li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleConcederPlanos}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                disabled={concederPlanosMutation.isPending}
              >
                {concederPlanosMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Aplicando Alterações...
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    Salvar Todas as Alterações
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-gray-600 mt-2">
                ⚡ As alterações serão aplicadas imediatamente e o usuário verá ao recarregar a página
              </p>
            </CardContent>
          </Card>
        )}

        {!usuarioSelecionado && (
          <div className="text-center py-12 text-gray-500">
            <User className="w-16 h-16 mx-auto mb-3 text-gray-400" />
            <p>Selecione um usuário acima para configurar os planos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}