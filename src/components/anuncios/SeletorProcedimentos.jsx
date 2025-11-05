import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";

const procedimentosPorCategoria = {
  "Estética Facial": [
    "Limpeza de Pele", "Peeling Químico", "Peeling de Diamante", "Microagulhamento",
    "Tratamento de Acne", "Harmonização Facial", "Preenchimento Labial", "Preenchimento de Olheiras",
    "Botox", "Toxina Botulínica", "Fios de Sustentação", "Bichectomia", "Skincare",
    "Máscara Facial", "Drenagem Facial", "Radiofrequência Facial", "Ultrassom Microfocado",
    "Lifting Facial", "Bigode Chinês", "Contorno Mandibular", "Projeção de Queixo",
    "Rinomodelação", "Ácido Hialurônico", "Bioestimuladores de Colágeno"
  ],
  "Estética Corporal": [
    "Drenagem Linfática", "Massagem Modeladora", "Criolipólise", "Radiofrequência Corporal",
    "Ultrassom Estético", "Carboxiterapia", "Endermologia", "Lipocavitação",
    "Manthus", "Ventosaterapia", "Tratamento de Celulite", "Gordura Localizada",
    "Flacidez Corporal", "Estrias", "Modelagem Corporal", "Lipo sem Corte"
  ],
  "Depilação": [
    "Depilação a Laser", "Depilação a Laser Soprano Ice", "Depilação a Laser Alexandrite",
    "Depilação a Laser Diodo", "Depilação com Cera", "Depilação Egípcia",
    "Luz Pulsada", "Depilação Definitiva", "Depilação Facial", "Depilação Corpo Completo"
  ],
  "Harmonização Facial": [
    "Preenchimento Facial", "Rinomodelação", "Mentoplastia", "Malar",
    "Contorno Mandibular", "Preenchimento de Têmporas", "Lifting Líquido",
    "Skinbooster", "Protocolo MD Codes"
  ],
  "Massoterapia e Drenagem": [
    "Massagem Relaxante", "Massagem Terapêutica", "Shiatsu", "Reflexologia",
    "Quick Massage", "Massagem com Pedras Quentes", "Massagem Tailandesa",
    "Massagem Sueca", "Bambuterapia", "Aromaterapia"
  ],
  "Micropigmentação e Design": [
    "Micropigmentação de Sobrancelhas", "Design de Sobrancelhas", "Henna",
    "Microblading", "Fio a Fio", "Shadow", "Ombré Sobrancelhas",
    "Remoção de Micropigmentação", "Camuflagem de Cicatrizes"
  ],
  "Extensão de Cílios": [
    "Extensão de Cílios Fio a Fio", "Volume Russo", "Mega Volume",
    "Volume Brasileiro", "Lifting de Cílios", "Laminação de Sobrancelhas"
  ],
  "Manicure e Pedicure": [
    "Manicure", "Pedicure", "Unha em Gel", "Fibra de Vidro",
    "Alongamento de Unhas", "Nail Art", "Unhas Decoradas",
    "Esmaltação em Gel", "Spa dos Pés", "Spa das Mãos"
  ],
  "Cabelos": [
    "Tratamento Capilar", "Botox Capilar", "Queratina", "Cauterização",
    "Hidratação Profunda", "Reconstrução Capilar", "Progressiva",
    "Alisamento", "Luzes", "Balayage", "Ombré Hair", "Coloração",
    "Mechas", "Corte Feminino", "Corte Masculino", "Penteados"
  ],
  "Podologia": [
    "Tratamento de Unhas Encravadas", "Calosidades", "Micose",
    "Onicomicose", "Tratamento de Rachaduras", "Verrugas Plantares"
  ],
  "Acupuntura": [
    "Acupuntura Estética", "Acupuntura Sistêmica", "Auriculoterapia",
    "Acupuntura para Emagrecimento", "Acupuntura Facial"
  ],
  "Medicina Estética": [
    "Laser CO2 Fracionado", "Laser Nd:Yag", "Laser para Manchas",
    "Laser para Vasinhos", "Laser para Rejuvenescimento",
    "Intradermoterapia", "Mesoterapia"
  ]
};

export default function SeletorProcedimentos({ open, onClose, onSelect, procedimentoAtual }) {
  const [busca, setBusca] = useState("");
  const [categoriaExpandida, setCategoriaExpandida] = useState(null);

  const todosProcedimentos = Object.values(procedimentosPorCategoria).flat();
  
  const procedimentosFiltrados = busca
    ? todosProcedimentos.filter(proc => 
        proc.toLowerCase().includes(busca.toLowerCase())
      )
    : null;

  const handleSelect = (procedimento) => {
    onSelect(procedimento);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold">
            Selecionar Procedimento
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Escolha um procedimento específico para buscar profissionais especializados
          </p>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar procedimento... (ex: Botox, Limpeza de Pele, Microagulhamento)"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 h-12 text-base"
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {procedimentoAtual && (
            <div className="mt-3">
              <Badge className="bg-purple-100 text-purple-800 text-sm py-1 px-3">
                Selecionado: {procedimentoAtual}
                <X 
                  className="w-3 h-3 ml-2 cursor-pointer" 
                  onClick={() => onSelect("")}
                />
              </Badge>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 px-6 pb-6">
          {procedimentosFiltrados ? (
            // Resultado da busca
            <div className="space-y-2">
              {procedimentosFiltrados.length > 0 ? (
                procedimentosFiltrados.map((proc) => (
                  <button
                    key={proc}
                    onClick={() => handleSelect(proc)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      procedimentoAtual === proc
                        ? 'border-[#F7D426] bg-[#FFF9E6] font-semibold'
                        : 'border-gray-200 hover:border-[#F7D426] hover:bg-gray-50'
                    }`}
                  >
                    {proc}
                  </button>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-600">Nenhum procedimento encontrado</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Tente buscar com outros termos
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Lista categorizada com ScrollArea
            <div className="space-y-6">
              {Object.entries(procedimentosPorCategoria).map(([categoria, procedimentos]) => (
                <div key={categoria}>
                  <button
                    onClick={() => setCategoriaExpandida(
                      categoriaExpandida === categoria ? null : categoria
                    )}
                    className="w-full text-left mb-3 flex items-center justify-between group"
                  >
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#F7D426] transition-colors">
                      {categoria}
                      <span className="ml-2 text-sm text-gray-500 font-normal">
                        ({procedimentos.length} procedimentos)
                      </span>
                    </h3>
                    <span className="text-2xl text-gray-400 group-hover:text-[#F7D426] transition-colors">
                      {categoriaExpandida === categoria ? '−' : '+'}
                    </span>
                  </button>

                  {categoriaExpandida === categoria && (
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {procedimentos.map((proc) => (
                          <button
                            key={proc}
                            onClick={() => handleSelect(proc)}
                            className={`text-left p-3 rounded-lg border-2 transition-all text-sm ${
                              procedimentoAtual === proc
                                ? 'border-[#F7D426] bg-[#FFF9E6] font-semibold'
                                : 'border-gray-200 hover:border-[#F7D426] hover:bg-gray-50'
                            }`}
                          >
                            {proc}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  {categoriaExpandida !== categoria && (
                    <div className="flex flex-wrap gap-2">
                      {procedimentos.slice(0, 6).map((proc) => (
                        <Badge
                          key={proc}
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSelect(proc)}
                        >
                          {proc}
                        </Badge>
                      ))}
                      {procedimentos.length > 6 && (
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => setCategoriaExpandida(categoria)}
                        >
                          +{procedimentos.length - 6} mais
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-6 pt-4 border-t bg-gray-50">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            {procedimentoAtual && (
              <Button
                onClick={() => {
                  onSelect("");
                  onClose();
                }}
                variant="outline"
                className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
              >
                Limpar Seleção
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}