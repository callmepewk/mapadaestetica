import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, X, Users, Loader2 } from "lucide-react";

export default function ModalEnviarNotificacao({ open, onClose, onSuccess }) {
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tiposSelecionados, setTiposSelecionados] = useState({
    paciente: false,
    profissional: false,
    patrocinador: false,
    admin: false,
    tester: false
  });
  const [contadorUsuarios, setContadorUsuarios] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [carregandoContador, setCarregandoContador] = useState(false);

  // Contar usuários que receberão a notificação
  useEffect(() => {
    const contarUsuarios = async () => {
      setCarregandoContador(true);
      try {
        const usuarios = await base44.entities.User.list();
        
        const tiposFiltro = Object.keys(tiposSelecionados).filter(
          tipo => tiposSelecionados[tipo]
        );
        
        if (tiposFiltro.length === 0) {
          setContadorUsuarios(0);
        } else {
          const usuariosFiltrados = usuarios.filter(user => {
            if (tiposFiltro.includes('admin') && user.role === 'admin') return true;
            if (tiposFiltro.includes('tester') && user.role === 'tester') return true;
            if (tiposFiltro.includes(user.tipo_usuario)) return true;
            return false;
          });
          setContadorUsuarios(usuariosFiltrados.length);
        }
      } catch (error) {
        console.error("Erro ao contar usuários:", error);
        setContadorUsuarios(0);
      } finally {
        setCarregandoContador(false);
      }
    };

    if (open) {
      contarUsuarios();
    }
  }, [open, tiposSelecionados]);

  const handleTipoChange = (tipo) => {
    setTiposSelecionados(prev => ({
      ...prev,
      [tipo]: !prev[tipo]
    }));
  };

  const handleSelecionarTodos = () => {
    const todosAtivados = Object.values(tiposSelecionados).every(v => v);
    setTiposSelecionados({
      paciente: !todosAtivados,
      profissional: !todosAtivados,
      patrocinador: !todosAtivados,
      admin: !todosAtivados,
      tester: !todosAtivados
    });
  };

  const handleEnviar = async () => {
    if (!titulo.trim() || !mensagem.trim()) {
      alert("Por favor, preencha o título e a mensagem.");
      return;
    }

    if (contadorUsuarios === 0) {
      alert("Nenhum usuário será notificado. Selecione pelo menos um tipo de usuário.");
      return;
    }

    if (!confirm(`Deseja enviar esta notificação para ${contadorUsuarios} usuário(s)?`)) {
      return;
    }

    setEnviando(true);

    try {
      const usuarios = await base44.entities.User.list();
      
      const tiposFiltro = Object.keys(tiposSelecionados).filter(
        tipo => tiposSelecionados[tipo]
      );
      
      const usuariosAlvo = usuarios.filter(user => {
        if (tiposFiltro.includes('admin') && user.role === 'admin') return true;
        if (tiposFiltro.includes('tester') && user.role === 'tester') return true;
        if (tiposFiltro.includes(user.tipo_usuario)) return true;
        return false;
      });

      // Criar notificações para cada usuário
      const notificacoes = usuariosAlvo.map(user => ({
        usuario_email: user.email,
        tipo: "anuncio_sistema",
        titulo: titulo,
        mensagem: mensagem,
        lida: false
      }));

      // Enviar em lotes de 50 para evitar sobrecarga
      for (let i = 0; i < notificacoes.length; i += 50) {
        const lote = notificacoes.slice(i, i + 50);
        await Promise.all(
          lote.map(notif => base44.entities.Notificacao.create(notif))
        );
      }

      alert(`✅ Notificação enviada com sucesso para ${usuariosAlvo.length} usuário(s)!`);
      
      // Limpar formulário
      setTitulo("");
      setMensagem("");
      setTiposSelecionados({
        paciente: false,
        profissional: false,
        patrocinador: false,
        admin: false,
        tester: false
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao enviar notificações:", error);
      alert("❌ Erro ao enviar notificações. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Send className="w-5 h-5 text-blue-600" />
            Criar Notificação para Usuários
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Título */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">
              Título da Notificação *
            </Label>
            <Input
              placeholder="Ex: Nova funcionalidade disponível!"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Mensagem */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">
              Mensagem *
            </Label>
            <Textarea
              placeholder="Digite a mensagem que será enviada para todos os usuários..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="w-full min-h-[150px] resize-none"
            />
          </div>

          {/* Filtros de Tipo de Usuário */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold">
                Destinatários
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelecionarTodos}
                className="text-xs"
              >
                {Object.values(tiposSelecionados).every(v => v) ? (
                  <>
                    <X className="w-3 h-3 mr-1" />
                    Desmarcar Todos
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3 mr-1" />
                    Selecionar Todos
                  </>
                )}
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="paciente"
                  checked={tiposSelecionados.paciente}
                  onCheckedChange={() => handleTipoChange('paciente')}
                />
                <Label htmlFor="paciente" className="cursor-pointer font-medium">
                  👤 Pacientes
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="profissional"
                  checked={tiposSelecionados.profissional}
                  onCheckedChange={() => handleTipoChange('profissional')}
                />
                <Label htmlFor="profissional" className="cursor-pointer font-medium">
                  💼 Profissionais
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="patrocinador"
                  checked={tiposSelecionados.patrocinador}
                  onCheckedChange={() => handleTipoChange('patrocinador')}
                />
                <Label htmlFor="patrocinador" className="cursor-pointer font-medium">
                  👑 Patrocinadores
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="admin"
                  checked={tiposSelecionados.admin}
                  onCheckedChange={() => handleTipoChange('admin')}
                />
                <Label htmlFor="admin" className="cursor-pointer font-medium">
                  🔑 Admins
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="tester"
                  checked={tiposSelecionados.tester}
                  onCheckedChange={() => handleTipoChange('tester')}
                />
                <Label htmlFor="tester" className="cursor-pointer font-medium">
                  🧪 Testers
                </Label>
              </div>
            </div>
          </div>

          {/* Contador de Usuários */}
          <Alert className="bg-blue-50 border-blue-200">
            <Users className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900 font-semibold">
              {carregandoContador ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Contando usuários...
                </span>
              ) : (
                `${contadorUsuarios} usuário(s) receberão esta notificação por email.`
              )}
            </AlertDescription>
          </Alert>

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={enviando}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEnviar}
              disabled={enviando || contadorUsuarios === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Notificação
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}