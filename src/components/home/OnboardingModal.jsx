
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Added
import { User, Briefcase, X, Sparkles, AlertCircle, LogIn } from "lucide-react"; // AlertCircle, LogIn added
import { AnimatePresence, motion } from "framer-motion";

const estadosBrasil = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

const especialidades = [
  "Estética Facial", "Estética Corporal", "Depilação", "Micropigmentação",
  "Harmonização Facial", "Dermatologia", "Medicina Estética", "Cirurgia Plástica",
  "Biomedicina Estética", "Enfermagem Estética", "Fisioterapia Dermato Funcional",
  "Massoterapia", "Design de Sobrancelhas", "Manicure e Pedicure", "Podologia",
  "Estética Capilar", "Transplante Capilar", "Nutrição Estética", "Outros"
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
    especialidade: "",
    categoria: "",
    subcategoria: "",
    possui_clinica: false,
    possui_ar_condicionado: false,
    possui_estacionamento: false,
    tem_google_negocios: false
  });
  const [loading, setLoading] = useState(false);
  const [mostrarAlertaPerfil, setMostrarAlertaPerfil] = useState(false); // Added

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
        tipo_usuario: tipoUsuario === "tester" ? "profissional" : tipoUsuario,
        cadastro_completo: true,
        ...(tipoUsuario === "profissional" || tipoUsuario === "tester" ? dadosProfissional : {}),
        ...(tipoUsuario === "tester" ? {
          data_expiracao_teste: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        } : {})
      };

      await base44.auth.updateMe(dados);

      // Mostrar alerta para completar perfil
      setMostrarAlertaPerfil(true);
      
      setTimeout(() => { // Wrapped existing logic in a new setTimeout
        if (tipoUsuario === "profissional" || tipoUsuario === "tester") {
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
              <button onclick="this.closest('div').parentElement.parentElement.remove();window.location.reload();"
                      style="width:100%;background:transparent;color:#666;padding:12px;border:none;cursor:pointer;text-decoration:underline;margin-top:8px;">
                Continuar sem consultar
              </button>
            </div>
          `;

          overlay.appendChild(notification);
          document.body.appendChild(overlay);

          setTimeout(() => {
            if (document.body.contains(overlay)) {
              overlay.remove();
              window.location.reload();
            }
          }, 60000);
        } else {
          window.location.reload();
        }
      }, 2000); // Delay for 2 seconds

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      alert("Erro ao salvar seus dados. Tente novamente.");
      setLoading(false);
    }
  };

  // Added handleLogin function
  const handleLogin = () => {
    const currentPath = window.location.pathname + window.location.search;
    base44.auth.redirectToLogin(currentPath);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen && onClose) {
          onClose();
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-[95vw] md:max-w-[600px] max-h-[90vh] overflow-y-auto p-4 sm:p-6"
        onPointerDownOutside={(e) => {
          // Não fazer nada - permitir clique fora para fechar
        }}
      >
        <button
          onClick={() => {
            if (onClose) onClose();
          }}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors z-50"
          type="button"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl sm:text-2xl pr-8">Bem-vindo ao Mapa da Estética! 🎉</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Complete seu cadastro em {tipoUsuario === "paciente" ? "2" : "3"} passos rápidos
          </DialogDescription>
        </DialogHeader>

        {/* Alerta para completar perfil - Added */}
        {mostrarAlertaPerfil && (
          <Alert className="bg-blue-50 border-blue-200 mb-4">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              ✅ Cadastro inicial completo! Não esqueça de completar seu perfil com foto e mais informações para atrair mais clientes.
            </AlertDescription>
          </Alert>
        )}

        <AnimatePresence mode="wait">
          {/* Etapa 1 */}
          {etapa === 1 && (
            <motion.div
              key="etapa1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 sm:space-y-6 py-2 sm:py-4"
            >
              <div className="text-center">
                <h3 className="text-lg sm:text-xl font-bold mb-2">Você é um paciente, profissional ou quer testar?</h3>
                <p className="text-xs sm:text-sm text-gray-600">Isso nos ajuda a personalizar sua experiência</p>
              </div>

              {/* Opção de Login - Added */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200 text-center">
                <p className="text-sm text-gray-700 mb-3">
                  Já possui cadastro?
                </p>
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar na Minha Conta
                </Button>
              </div>

              {/* Separator - Added */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Ou cadastre-se agora</span>
                </div>
              </div>

              <RadioGroup value={tipoUsuario} onValueChange={setTipoUsuario} className="space-y-3">
                <div 
                  className={`flex items-center space-x-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    tipoUsuario === 'paciente' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
                  }`}
                  onClick={() => setTipoUsuario('paciente')}
                >
                  <RadioGroupItem value="paciente" id="paciente" />
                  <Label htmlFor="paciente" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">Paciente/Cliente</p>
                      <p className="text-xs sm:text-sm text-gray-600">Busco serviços de estética</p>
                    </div>
                  </Label>
                </div>

                <div 
                  className={`flex items-center space-x-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    tipoUsuario === 'profissional' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => setTipoUsuario('profissional')}
                >
                  <RadioGroupItem value="profissional" id="profissional" />
                  <Label htmlFor="profissional" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">Profissional</p>
                      <p className="text-xs sm:text-sm text-gray-600">Ofereço serviços de estética</p>
                    </div>
                  </Label>
                </div>

                <div 
                  className={`flex items-center space-x-3 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    tipoUsuario === 'tester' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setTipoUsuario('tester')}
                >
                  <RadioGroupItem value="tester" id="tester" />
                  <Label htmlFor="tester" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">Teste Grátis (7 dias)</p>
                      <p className="text-xs sm:text-sm text-gray-600">Experimente como profissional</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {tipoUsuario === "tester" && (
                <Badge className="w-full bg-blue-100 text-blue-800 text-xs sm:text-sm py-2 justify-center">
                  ⏰ 7 dias de teste com todos os recursos!
                </Badge>
              )}

              <Button
                onClick={handleTipoUsuarioSubmit}
                disabled={!tipoUsuario}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-sm sm:text-base py-5 sm:py-6"
              >
                Continuar
              </Button>
            </motion.div>
          )}

          {/* Etapa 2 */}
          {etapa === 2 && (
            <motion.div
              key="etapa2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3 sm:space-y-4 py-2 sm:py-4"
            >
              <h3 className="text-lg sm:text-xl font-bold text-center mb-2 sm:mb-4">Informações Básicas</h3>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="telefone" className="text-sm">Telefone *</Label>
                  <Input
                    id="telefone"
                    placeholder="(00) 00000-0000"
                    value={dadosBasicos.telefone}
                    onChange={(e) => setDadosBasicos({...dadosBasicos, telefone: e.target.value})}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp" className="text-sm">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="(00) 00000-0000"
                    value={dadosBasicos.whatsapp}
                    onChange={(e) => setDadosBasicos({...dadosBasicos, whatsapp: e.target.value})}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="cidade" className="text-sm">Cidade *</Label>
                    <Input
                      id="cidade"
                      placeholder="Sua cidade"
                      value={dadosBasicos.cidade}
                      onChange={(e) => setDadosBasicos({...dadosBasicos, cidade: e.target.value})}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="estado" className="text-sm">Estado *</Label>
                    <Input
                      id="estado"
                      placeholder="UF"
                      value={dadosBasicos.estado}
                      onChange={(e) => setDadosBasicos({...dadosBasicos, estado: e.target.value.toUpperCase()})}
                      maxLength={2}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="endereco" className="text-sm">Endereço Completo</Label>
                  <Input
                    id="endereco"
                    placeholder="Rua, número, bairro"
                    value={dadosBasicos.endereco_completo}
                    onChange={(e) => setDadosBasicos({...dadosBasicos, endereco_completo: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  onClick={() => setEtapa(1)}
                  variant="outline"
                  className="w-full sm:flex-1 text-sm"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleDadosBasicosSubmit}
                  disabled={loading}
                  className="w-full sm:flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-sm"
                >
                  {loading ? "Salvando..." : (tipoUsuario === "profissional" || tipoUsuario === "tester" ? "Continuar" : "Finalizar")}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Etapa 3 */}
          {etapa === 3 && (
            <motion.div
              key="etapa3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3 sm:space-y-4 py-2 sm:py-4"
            >
              <h3 className="text-lg sm:text-xl font-bold text-center mb-2 sm:mb-4">Informações Profissionais</h3>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="especialidade" className="text-sm">Especialidade Principal *</Label>
                  <select
                    id="especialidade"
                    value={dadosProfissional.especialidade}
                    onChange={(e) => setDadosProfissional({...dadosProfissional, especialidade: e.target.value})}
                    className="w-full mt-1 p-2 border rounded-md text-sm"
                    required
                  >
                    <option value="">Selecione...</option>
                    {especialidades.map(esp => (
                      <option key={esp} value={esp}>{esp}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Recursos do Estabelecimento</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dadosProfissional.possui_clinica}
                        onChange={(e) => setDadosProfissional({...dadosProfissional, possui_clinica: e.target.checked})}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">Possuo clínica própria</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dadosProfissional.possui_ar_condicionado}
                        onChange={(e) => setDadosProfissional({...dadosProfissional, possui_ar_condicionado: e.target.checked})}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">Ar condicionado</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dadosProfissional.possui_estacionamento}
                        onChange={(e) => setDadosProfissional({...dadosProfissional, possui_estacionamento: e.target.checked})}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">Estacionamento</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dadosProfissional.tem_google_negocios}
                        onChange={(e) => setDadosProfissional({...dadosProfissional, tem_google_negocios: e.target.checked})}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">Tenho Google Negócios</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  onClick={() => setEtapa(2)}
                  variant="outline"
                  className="w-full sm:flex-1 text-sm"
                  disabled={loading}
                >
                  Voltar
                </Button>
                <Button
                  onClick={salvarDados}
                  disabled={loading || !dadosProfissional.especialidade}
                  className="w-full sm:flex-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-sm"
                >
                  {loading ? "Finalizando..." : "Finalizar Cadastro"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
