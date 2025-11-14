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
  const [sucesso, setSucesso] = useState(null);
  const [erro, setErro] = useState(null);

  const concederPlanosMutation = useMutation({
    mutationFn: async ({ usuario, planos, tipo }) => {
      console.log("🎁 CONCEDENDO PLANOS:");
      console.log("Usuário completo:", usuario);
      console.log("Email:", usuario.email);
      console.log("Tipo:", tipo);
      console.log("Planos:", planos);

      const updateData = {
        tipo_usuario: tipo,
        plano_ativo: planos.mapa,
        plano_clube_beleza: planos.clube,
        plano_patrocinador: planos.patrocinador,
      };

      console.log("📤 Enviando update:", updateData);

      // Atualizar usando a entidade User diretamente
      const resultado = await base44.entities.User.update(usuario.email, updateData);
      console.log("✅ Update executado:", resultado);

      // Criar notificação para o usuário
      try {
        await base44.entities.Notificacao.create({
          usuario_email: usuario.email,
          tipo: 'planos_atualizados',
          titulo: '🎉 Seus Planos Foram Atualizados!',
          mensagem: `Planos atualizados: Mapa (${PLANOS_INFO[planos.mapa]?.nome}), Clube (${planos.clube}), Patrocinador (${planos.patrocinador})`,
          link_acao: '/perfil'
        });
      } catch (err) {
        console.log("⚠️ Erro ao criar notificação (não crítico):", err);
      }

      return { usuario, updateData };
    },
    onSuccess: (data) => {
      console.log("✅ Planos concedidos com sucesso:", data);
      
      setSucesso(`✅ Planos concedidos para ${usuarioSelecionado?.full_name}!`);
      setTimeout(() => setSucesso(null), 3000);
      
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['todos-usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios-profissionais'] });
      queryClient.invalidateQueries({ queryKey: ['testers'] });
      
      // Reload após 1s
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error) => {
      console.error("❌ Erro ao conceder planos:", error);
      setErro("Erro: " + error.message);
      setTimeout(() => setErro(null), 5000);
    }
  });

  const handleConcederPlanos = () => {
    if (!usuarioSelecionado) {
      setErro("Selecione um usuário!");
      setTimeout(() => setErro(null), 3000);
      return;
    }

    console.log("🔵 Iniciando concessão para:", usuarioSelecionado);
    
    concederPlanosMutation.mutate({
      usuario: usuarioSelecionado,
      tipo: tipoUsuario,
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
                      setPlanoMapa(usuario.plano_ativo || 'cobre');
                      setPlanoClube(usuario.plano_clube_beleza || 'nenhum');
                      setPlanoPatrocinador(usuario.plano_patrocinador || 'nenhum');
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
                    <li>• Mapa: <strong>{PLANOS_INFO[planoMapa]?.nome}</strong></li>
                    <li>• Clube: <strong>{planoClube}</strong></li>
                    <li>• Patrocinador: <strong>{planoPatrocinador}</strong></li>
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
                    Conceder Planos
                  </>
                )}
              </Button>
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