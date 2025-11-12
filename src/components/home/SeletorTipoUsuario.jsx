import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Briefcase, AlertCircle, Check, Loader2, MessageCircle } from "lucide-react";

export default function SeletorTipoUsuario({ open, onClose, user, onSuccess }) {
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [podeTrocar, setPodeTrocar] = useState(true);
  const [diasRestantes, setDiasRestantes] = useState(0);

  useEffect(() => {
    if (user && user.data_ultima_troca_tipo) {
      const ultimaTroca = new Date(user.data_ultima_troca_tipo);
      const hoje = new Date();
      const diffTime = hoje - ultimaTroca;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7 && user.role !== 'admin') {
        setPodeTrocar(false);
        setDiasRestantes(7 - diffDays);
      } else {
        setPodeTrocar(true);
      }
    }
  }, [user]);

  const handleConfirmar = async () => {
    if (!tipoSelecionado) return;
    
    setProcessando(true);
    try {
      await base44.auth.updateMe({
        tipo_usuario: tipoSelecionado,
        data_ultima_troca_tipo: new Date().toISOString().split('T')[0],
        pode_trocar_tipo: false
      });

      onSuccess();
      onClose();
    } catch (error) {
      alert("Erro ao alterar tipo de usuário: " + error.message);
    } finally {
      setProcessando(false);
    }
  };

  const handleSolicitarMudanca = () => {
    const mensagem = `Olá! Gostaria de solicitar a mudança do meu tipo de conta.\n\nConta atual: ${user?.tipo_usuario}\nTipo desejado: ${tipoSelecionado}\nEmail: ${user?.email}`;
    window.open(`https://wa.me/5554991554136?text=${encodeURIComponent(mensagem)}`, '_blank');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl text-center">
            {user?.tipo_usuario ? 'Trocar Tipo de Conta' : 'Selecione o Tipo de Conta'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {user?.tipo_usuario 
              ? 'Você pode alterar seu tipo de conta a cada 7 dias' 
              : 'Escolha como você deseja usar a plataforma'
            }
          </DialogDescription>
        </DialogHeader>

        {!podeTrocar && user?.role !== 'admin' ? (
          <div className="py-8">
            <Alert className="bg-yellow-50 border-yellow-200 mb-6">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <p className="font-semibold mb-2">⏳ Período de Espera Ativo</p>
                <p>Você poderá trocar de tipo de conta novamente em <strong>{diasRestantes} dia(s)</strong>.</p>
                <p className="mt-2 text-sm">Última troca: {new Date(user.data_ultima_troca_tipo).toLocaleDateString('pt-BR')}</p>
              </AlertDescription>
            </Alert>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Precisa Trocar Agora?</h3>
                <p className="text-gray-700 mb-4">
                  Entre em contato com nosso suporte para solicitar a troca antecipada
                </p>
                <Button
                  onClick={handleSolicitarMudanca}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Falar com Suporte
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6 py-6">
              {/* Paciente */}
              <Card
                onClick={() => setTipoSelecionado('paciente')}
                className={`cursor-pointer transition-all border-2 ${
                  tipoSelecionado === 'paciente'
                    ? 'border-pink-500 shadow-xl ring-4 ring-pink-200'
                    : 'border-gray-200 hover:border-pink-300 hover:shadow-lg'
                }`}
              >
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-pink-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Sou Paciente</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Procuro profissionais e serviços de estética
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                      <span>Buscar profissionais verificados</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                      <span>Acessar clube de benefícios</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                      <span>Acumular pontos e ganhar prêmios</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                      <span>Consultar Dr. Beleza (IA)</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                      <span>Comprar produtos exclusivos</span>
                    </div>
                  </div>

                  {tipoSelecionado === 'paciente' && (
                    <Badge className="w-full justify-center bg-pink-600 text-white">
                      Selecionado
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* Profissional */}
              <Card
                onClick={() => setTipoSelecionado('profissional')}
                className={`cursor-pointer transition-all border-2 ${
                  tipoSelecionado === 'profissional'
                    ? 'border-purple-500 shadow-xl ring-4 ring-purple-200'
                    : 'border-gray-200 hover:border-purple-300 hover:shadow-lg'
                }`}
              >
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-10 h-10 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Sou Profissional</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Ofereço serviços de estética e beleza
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span>Criar anúncios profissionais</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span>Receber clientes qualificados</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span>Acessar ferramentas de gestão</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span>Verificação profissional</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span>Calculadoras e relatórios</span>
                    </div>
                  </div>

                  {tipoSelecionado === 'profissional' && (
                    <Badge className="w-full justify-center bg-purple-600 text-white">
                      Selecionado
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>

            {user?.tipo_usuario && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <p className="font-semibold mb-1">ℹ️ Atenção:</p>
                  <p>Tipo atual: <strong>{user.tipo_usuario === 'paciente' ? 'Paciente' : 'Profissional'}</strong></p>
                  <p className="mt-2">Após confirmar a troca, você só poderá alterar novamente em 7 dias ou solicitando ao suporte.</p>
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
                disabled={processando}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmar}
                disabled={!tipoSelecionado || processando}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {processando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}