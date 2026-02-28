import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Briefcase, 
  AlertCircle, 
  Phone, 
  Loader2,
  Crown,
  CheckCircle
} from "lucide-react";

export default function SeletorTipoUsuario({ open, onClose, user, onSuccess }) {
  const [tipoSelecionado, setTipoSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(false);

  // Verificar se pode trocar de tipo (7 dias de espera)
  const podeTrocarTipo = () => {
    if (!user) return true; // Novo usuário pode escolher livremente
    if (user.role === 'admin') return true; // Admin pode trocar sempre
    
    if (!user.ultima_troca_tipo) return true; // Primeira vez escolhendo
    
    const ultimaTroca = new Date(user.ultima_troca_tipo);
    const hoje = new Date();
    const diasDesdeUltimaTroca = Math.floor((hoje - ultimaTroca) / (1000 * 60 * 60 * 24));
    
    return diasDesdeUltimaTroca >= 7;
  };

  const diasRestantes = () => {
    if (!user || !user.ultima_troca_tipo) return 0;
    
    const ultimaTroca = new Date(user.ultima_troca_tipo);
    const hoje = new Date();
    const diasDesdeUltimaTroca = Math.floor((hoje - ultimaTroca) / (1000 * 60 * 60 * 24));
    
    return Math.max(0, 7 - diasDesdeUltimaTroca);
  };

  const handleConfirmar = async () => {
    if (!tipoSelecionado) return;
    
    setCarregando(true);
    try {
      await base44.auth.updateMe({
        tipo_usuario: tipoSelecionado,
        ultima_troca_tipo: new Date().toISOString().split('T')[0]
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar tipo:", error);
      alert("Erro ao atualizar tipo de usuário. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const handleContatarSuporte = () => {
    const mensagem = `Olá! Gostaria de alterar o tipo da minha conta antes do prazo de 7 dias.\n\nDados:\nNome: ${user?.full_name}\nEmail: ${user?.email}\nTipo atual: ${user?.tipo_usuario}\nNovo tipo desejado: ${tipoSelecionado}\n\nPor favor, me ajudem com essa alteração.`;
    window.open(`https://wa.me/5521980343873?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {user?.tipo_usuario ? "Trocar Tipo de Conta" : "Escolha o Tipo da Sua Conta"}
          </DialogTitle>
          <DialogDescription>
            {user?.tipo_usuario 
              ? "Selecione o novo tipo da sua conta (é possível trocar a cada 7 dias)" 
              : "Selecione como você deseja usar o Mapa da Estética"}
          </DialogDescription>
        </DialogHeader>

        {!podeTrocarTipo() ? (
          <div className="py-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">⏰ Você só pode trocar de tipo a cada 7 dias</p>
                <p>Faltam <strong>{diasRestantes()} dias</strong> para poder trocar novamente.</p>
                <p className="mt-3 text-sm">
                  Última troca: {new Date(user.ultima_troca_tipo).toLocaleDateString('pt-BR')}
                </p>
              </AlertDescription>
            </Alert>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 mb-3">
                <strong>Precisa trocar antes?</strong> Entre em contato com o suporte:
              </p>
              <Button
                onClick={handleContatarSuporte}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Phone className="w-4 h-4 mr-2" />
                Contatar Suporte via WhatsApp
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-6">
            {user?.tipo_usuario && (
              <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-900">
                  <strong>Atenção:</strong> Ao trocar o tipo da sua conta, você terá acesso a recursos diferentes. Seu tipo atual: <strong>{user.tipo_usuario}</strong>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              {/* Card Paciente */}
              <Card 
                onClick={() => setTipoSelecionado("paciente")}
                className={`cursor-pointer transition-all hover:shadow-xl ${
                  tipoSelecionado === "paciente" 
                    ? "border-4 border-blue-500 bg-blue-50" 
                    : "border-2 border-gray-200 hover:border-blue-300"
                }`}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    tipoSelecionado === "paciente" ? "bg-blue-500" : "bg-blue-100"
                  }`}>
                    <User className={`w-10 h-10 ${
                      tipoSelecionado === "paciente" ? "text-white" : "text-blue-600"
                    }`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">👤 Paciente</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Buscar profissionais, agendar serviços e comprar produtos
                  </p>
                  {tipoSelecionado === "paciente" && (
                    <Badge className="bg-blue-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Selecionado
                    </Badge>
                  )}
                  <div className="mt-4 pt-4 border-t text-xs text-left space-y-1">
                    <p>✅ Buscar profissionais</p>
                    <p>✅ Salvar favoritos</p>
                    <p>✅ Comprar produtos</p>
                    <p>✅ Clube da Beleza</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card Profissional */}
              <Card 
                onClick={() => setTipoSelecionado("profissional")}
                className={`cursor-pointer transition-all hover:shadow-xl ${
                  tipoSelecionado === "profissional" 
                    ? "border-4 border-purple-500 bg-purple-50" 
                    : "border-2 border-gray-200 hover:border-purple-300"
                }`}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    tipoSelecionado === "profissional" ? "bg-purple-500" : "bg-purple-100"
                  }`}>
                    <Briefcase className={`w-10 h-10 ${
                      tipoSelecionado === "profissional" ? "text-white" : "text-purple-600"
                    }`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">💼 Profissional</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Criar anúncios, gerenciar clientes e expandir seu negócio
                  </p>
                  {tipoSelecionado === "profissional" && (
                    <Badge className="bg-purple-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Selecionado
                    </Badge>
                  )}
                  <div className="mt-4 pt-4 border-t text-xs text-left space-y-1">
                    <p>✅ Criar anúncios</p>
                    <p>✅ Ferramentas IA</p>
                    <p>✅ Relatórios de preço</p>
                    <p>✅ Calculadoras</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card Patrocinador/Parceiro */}
              <Card 
                onClick={() => setTipoSelecionado("patrocinador")}
                className={`cursor-pointer transition-all hover:shadow-xl ${
                  tipoSelecionado === "patrocinador" 
                    ? "border-4 border-green-500 bg-green-50" 
                    : "border-2 border-gray-200 hover:border-green-300"
                }`}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    tipoSelecionado === "patrocinador" ? "bg-green-500" : "bg-green-100"
                  }`}>
                    <Crown className={`w-10 h-10 ${
                      tipoSelecionado === "patrocinador" ? "text-white" : "text-green-600"
                    }`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">👑 Patrocinador</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Anunciar sua marca e alcançar milhares de profissionais
                  </p>
                  {tipoSelecionado === "patrocinador" && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Selecionado
                    </Badge>
                  )}
                  <div className="mt-4 pt-4 border-t text-xs text-left space-y-1">
                    <p>✅ Banners rotativos</p>
                    <p>✅ Posts patrocinados</p>
                    <p>✅ Produtos destacados</p>
                    <p>✅ Estatísticas avançadas</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {tipoSelecionado && (
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  disabled={carregando}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmar}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={carregando}
                >
                  {carregando ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar Seleção
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}