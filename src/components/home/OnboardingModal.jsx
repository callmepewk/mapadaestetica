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
import { User, Briefcase, MapPin, Phone, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categorias = [
  "Estética Facial", "Estética Corporal", "Estética Capilar e Tricologia",
  "Estética de Mãos e Pés", "Micropigmentação e Design", "Depilação",
  "Massoterapia e Drenagem", "Harmonização Facial", "Medicina Estética",
  "Dermatologia", "Cirurgia Plástica", "Outros"
];

export default function OnboardingModal({ open, onComplete }) {
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

  const handleTipoUsuarioSubmit = () => {
    if (!tipoUsuario) return;
    setEtapa(2);
  };

  const handleDadosBasicosSubmit = () => {
    if (!dadosBasicos.telefone || !dadosBasicos.cidade || !dadosBasicos.estado) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    if (tipoUsuario === "paciente") {
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
        ...(tipoUsuario === "profissional" ? dadosProfissional : {})
      };

      await base44.auth.updateMe(dados);
      onComplete();
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      alert("Erro ao salvar seus dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                <h3 className="text-xl font-bold mb-2">Você é um paciente ou profissional?</h3>
                <p className="text-sm text-gray-600">Isso nos ajuda a personalizar sua experiência</p>
              </div>

              <RadioGroup value={tipoUsuario} onValueChange={setTipoUsuario}>
                <div className="grid grid-cols-2 gap-4">
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
                </div>
              </RadioGroup>

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
                  {tipoUsuario === "paciente" ? "Finalizar" : "Continuar"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Etapa 3: Dados Profissionais (apenas para profissionais) */}
          {etapa === 3 && tipoUsuario === "profissional" && (
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