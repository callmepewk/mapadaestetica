
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Briefcase, Check, X, TestTube2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const categorias = [
  "Estética Facial", "Estética Corporal", "Estética Capilar e Tricologia",
  "Estética de Mãos e Pés", "Micropigmentação e Design", "Depilação",
  "Massoterapia e Drenagem", "Harmonização Facial", "Medicina Estética",
  "Dermatologia", "Cirurgia Plástica", "Outros"
];

export default function OnboardingModal({ open, onComplete, onClose }) {
  const [etapa, setEtapa] = useState(1);
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [dadosBasicos, setDadosBasicos] = useState({
    telefone: "",
    whatsapp: "",
    cidade: "",
    estado: "",
    endereco_completo: ""
  });
  const [dadosProfissional, setDadosProfissional] = useState({
    tem_google_negocios: false,
    especialidade: "",
    categoria: "",
    subcategoria: "",
    possui_clinica: false,
    possui_ar_condicionado: false,
    possui_estacionamento: false
  });
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    // Redirecionar para login com Google
    const redirectUrl = window.location.origin + window.location.pathname;
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=token&scope=profile%20email`;
  };

  const handleTipoUsuarioSubmit = () => {
    if (!tipoUsuario) return;
    setEtapa(2);
  };

  const handleDadosBasicosSubmit = () => {
    if (!dadosBasicos.telefone || !dadosBasicos.cidade || !dadosBasicos.estado) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    if (tipoUsuario === "paciente" || tipoUsuario === "tester") {
      salvarDados();
    } else {
      setEtapa(3);
    }
  };

  const salvarDados = async () => {
    setLoading(true);
    try {
      const dados = {
        ...dadosBasicos,
        tipo_usuario: tipoUsuario,
        cadastro_completo: true,
        ...(tipoUsuario === "profissional" || tipoUsuario === "tester" ? dadosProfissional : {}),
        ...(tipoUsuario === "tester" ? {
          data_expiracao_teste: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        } : {})
      };

      await base44.auth.updateMe(dados);
      
      // Se for profissional, mostrar notificação com opções antes de recarregar
      if (tipoUsuario === "profissional" || tipoUsuario === "tester") {
        // Criar um overlay com notificação
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
        
        const notification = document.createElement('div');
        notification.style.cssText = 'background:white;border-radius:16px;padding:32px;max-width:500px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);text-align:center;';
        notification.innerHTML = `
          <div style="font-size:48px;margin-bottom:16px;">🤔</div>
          <h3 style="font-size:24px;font-weight:bold;margin-bottom:16px;color:#2C2C2C;">Dúvidas sobre qual plano é melhor para você?</h3>
          <p style="color:#666;margin-bottom:24px;line-height:1.6;">
            Escolha como podemos te ajudar:
          </p>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <a href="https://wa.me/5531972595643?text=${encodeURIComponent('Olá! Acabei de me cadastrar no Mapa da Estética e gostaria de saber qual plano é o melhor para mim! 💼')}" 
               target="_blank" 
               style="display:block;background:linear-gradient(to right, #25D366, #128C7E);color:white;padding:16px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">
              💬 Falar com Especialista
            </a>
            <button onclick="window.open('/pesquisa-especializada?origem=cadastro', '_blank')"
                    style="width:100%;background:linear-gradient(to right, #F7D426, #FFE066);color:#2C2C2C;padding:16px 32px;border-radius:8px;border:none;cursor:pointer;font-weight:bold;">
              🩺 Falar com Dr. Beleza
            </button>
            <button onclick="this.closest('.relative').remove();window.location.reload();" 
                    style="width:100%;background:transparent;color:#666;padding:12px;border:none;cursor:pointer;text-decoration:underline;margin-top:8px;">
              Continuar sem consultar
            </button>
          </div>
        `;
        
        overlay.appendChild(notification);
        document.body.appendChild(overlay);
        
        // Aguardar 60 segundos ou clique antes de recarregar automaticamente
        setTimeout(() => {
          if (document.body.contains(overlay)) {
            overlay.remove();
            window.location.reload();
          }
        }, 60000);
      } else {
        // Paciente: recarregar imediatamente
        window.location.reload();
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      alert("Erro ao salvar seus dados. Tente novamente.");
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && onClose) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => {
        // Permitir fechar clicando fora
        if (onClose) {
          onClose();
        }
      }}>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-2xl">Bem-vindo ao Mapa da Estética! 🎉</DialogTitle>
          <DialogDescription>
            Complete seu cadastro em {tipoUsuario === "paciente" ? "2" : "3"} passos rápidos
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Etapa 1: Tipo de Usuário */}
          {etapa === 1 && (
            <motion.div
              key="etapa1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 py-4"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Você é um paciente, profissional ou quer testar?</h3>
                <p className="text-sm text-gray-600">Isso nos ajuda a personalizar sua experiência</p>
              </div>

              {/* Botão de Login com Google */}
              <div className="mb-6">
                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full h-12 border-2 hover:border-[#F7D426] hover:bg-[#FFF9E6]"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </Button>
                <p className="text-xs text-center text-gray-500 mt-2">
                  Seus dados serão preenchidos automaticamente
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou continue manualmente</span>
                </div>
              </div>

              <RadioGroup value={tipoUsuario} onValueChange={setTipoUsuario}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label
                    className={`relative cursor-pointer rounded-xl border-2 p-6 hover:border-pink-500 transition-colors ${
                      tipoUsuario === "paciente" ? "border-pink-500 bg-pink-50" : "border-gray-200"
                    }`}
                  >
                    <RadioGroupItem value="paciente" id="paciente" className="sr-only" />
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center">
                        <User className="w-8 h-8 text-pink-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg">Paciente/Cliente</p>
                        <p className="text-xs text-gray-600">Busco serviços de estética</p>
                      </div>
                    </div>
                    {tipoUsuario === "paciente" && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 rounded-full bg-pink-600 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </label>

                  <label
                    className={`relative cursor-pointer rounded-xl border-2 p-6 hover:border-purple-500 transition-colors ${
                      tipoUsuario === "profissional" ? "border-purple-500 bg-purple-50" : "border-gray-200"
                    }`}
                  >
                    <RadioGroupItem value="profissional" id="profissional" className="sr-only" />
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-purple-600" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg">Profissional</p>
                        <p className="text-xs text-gray-600">Ofereço serviços de estética</p>
                      </div>
                    </div>
                    {tipoUsuario === "profissional" && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </label>

                  <label
                    className={`relative cursor-pointer rounded-xl border-2 p-6 hover:border-[#F7D426] transition-colors ${
                      tipoUsuario === "tester" ? "border-[#F7D426] bg-[#FFF9E6]" : "border-gray-200"
                    }`}
                  >
                    <RadioGroupItem value="tester" id="tester" className="sr-only" />
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-[#FFF9E6] flex items-center justify-center border-2 border-[#F7D426]">
                        <TestTube2 className="w-8 h-8 text-[#F7D426]" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg">Teste Grátis</p>
                        <p className="text-xs text-gray-600">7 dias completos</p>
                        <Badge className="mt-1 bg-[#F7D426] text-[#2C2C2C] text-xs">
                          Tudo Ilimitado!
                        </Badge>
                      </div>
                    </div>
                    {tipoUsuario === "tester" && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 rounded-full bg-[#F7D426] flex items-center justify-center">
                          <Check className="w-4 h-4 text-[#2C2C2C]" />
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </RadioGroup>

              {tipoUsuario === "tester" && (
                <div className="bg-gradient-to-r from-[#FFF9E6] to-[#FFE066] p-4 rounded-lg border-2 border-[#F7D426]">
                  <p className="text-sm font-medium text-[#2C2C2C] mb-2">
                    ✨ Teste Grátis por 7 Dias:
                  </p>
                  <ul className="text-xs text-[#2C2C2C] space-y-1 list-disc list-inside">
                    <li>Anúncios ilimitados</li>
                    <li>Tags e especialidades ilimitadas</li>
                    <li>Acesso a todas as funcionalidades</li>
                    <li>Sem necessidade de cartão de crédito</li>
                  </ul>
                </div>
              )}

              <Button
                onClick={handleTipoUsuarioSubmit}
                disabled={!tipoUsuario}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
              >
                Continuar
              </Button>
            </motion.div>
          )}

          {/* Etapa 2: Dados Básicos */}
          {etapa === 2 && (
            <motion.div
              key="etapa2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 py-4"
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold mb-2">Informações Básicas</h3>
                <p className="text-sm text-gray-600">Preencha seus dados de contato</p>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    placeholder="(00) 00000-0000"
                    value={dadosBasicos.telefone}
                    onChange={(e) => setDadosBasicos({ ...dadosBasicos, telefone: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="(00) 00000-0000"
                    value={dadosBasicos.whatsapp}
                    onChange={(e) => setDadosBasicos({ ...dadosBasicos, whatsapp: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      placeholder="Sua cidade"
                      value={dadosBasicos.cidade}
                      onChange={(e) => setDadosBasicos({ ...dadosBasicos, cidade: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="estado">Estado *</Label>
                    <Input
                      id="estado"
                      placeholder="UF"
                      maxLength={2}
                      value={dadosBasicos.estado}
                      onChange={(e) => setDadosBasicos({ ...dadosBasicos, estado: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="endereco">Endereço Completo</Label>
                  <Input
                    id="endereco"
                    placeholder="Rua, número, bairro"
                    value={dadosBasicos.endereco_completo}
                    onChange={(e) => setDadosBasicos({ ...dadosBasicos, endereco_completo: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEtapa(1)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleDadosBasicosSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                >
                  {tipoUsuario === "paciente" || tipoUsuario === "tester" ? "Finalizar" : "Continuar"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Etapa 3: Dados Profissionais (apenas para profissionais e testers) */}
          {etapa === 3 && (tipoUsuario === "profissional" || tipoUsuario === "tester") && (
            <motion.div
              key="etapa3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 py-4"
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold mb-2">Informações Profissionais</h3>
                <p className="text-sm text-gray-600">Conte-nos sobre seu negócio (opcional)</p>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label>Você possui Google Negócios?</Label>
                  <RadioGroup
                    value={dadosProfissional.tem_google_negocios.toString()}
                    onValueChange={(value) => setDadosProfissional({ ...dadosProfissional, tem_google_negocios: value === "true" })}
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="google-sim" />
                        <Label htmlFor="google-sim">Sim</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="google-nao" />
                        <Label htmlFor="google-nao">Não</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria Principal</Label>
                  <Select
                    value={dadosProfissional.categoria}
                    onValueChange={(value) => setDadosProfissional({ ...dadosProfissional, categoria: value })}
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
                  <Label htmlFor="especialidade">Especialidade</Label>
                  <Input
                    id="especialidade"
                    placeholder="Ex: Harmonização Facial, Depilação a Laser..."
                    value={dadosProfissional.especialidade}
                    onChange={(e) => setDadosProfissional({ ...dadosProfissional, especialidade: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Seu estabelecimento possui:</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dadosProfissional.possui_clinica}
                        onChange={(e) => setDadosProfissional({ ...dadosProfissional, possui_clinica: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Clínica própria</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dadosProfissional.possui_ar_condicionado}
                        onChange={(e) => setDadosProfissional({ ...dadosProfissional, possui_ar_condicionado: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Ar condicionado</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dadosProfissional.possui_estacionamento}
                        onChange={(e) => setDadosProfissional({ ...dadosProfissional, possui_estacionamento: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Estacionamento</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEtapa(2)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={salvarDados}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                >
                  {loading ? "Salvando..." : "Finalizar Cadastro"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
