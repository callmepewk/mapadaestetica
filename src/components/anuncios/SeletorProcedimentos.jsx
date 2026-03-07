import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const procedimentosComuns = [
  // Estética facial
  "Limpeza de pele", "Peeling químico", "Peeling de diamante", "Microagulhamento",
  "Hidratação facial", "Rejuvenescimento facial", "Skinbooster",
  // Estética corporal
  "Drenagem linfática", "Massagem modeladora", "Massagem relaxante", "Criolipólise",
  "Radiofrequência", "Ultrassom estético", "Lipocavitação",
  // Depilação
  "Depilação a laser", "Depilação com cera", "Depilação egípcia", "Depilação masculina",
  // Harmonização
  "Botox", "Preenchimento facial", "Bioestimuladores", "Fios de sustentação",
  // Profissionais
  "Barbeiros", "Cabeleireiros", "Designers de sobrancelha", "Micropigmentadores",
  "Tatuadores estéticos", "Nail designers", "Podólogos",
  // Itens existentes úteis
  "Fios de PDO", "Bioestimuladores de Colágeno", "Design de Sobrancelhas",
  "Micropigmentação de Sobrancelhas", "Alongamento de Cílios",
  "Manicure", "Pedicure", "Spa dos Pés", "Spa das Mãos", "Hair Skincare", "Corte de Cabelo",
  "Hidratação Capilar", "Coloração", "Tratamento para Acne",
  "Contorno Corporal", "Ultrassom Microfocado",
  "Enzimas Injetáveis", "Tratamento para Celulite", "Tratamento para Estrias",
  "Esmaltação em Gel", "Unha de Fibra", "Reflexologia Podal", "Podoprofilaxia",
  "Tricologia Capilar", "Consultoria de Imagem", "Maquiagem Profissional", "Pós-operatório"
];

export default function SeletorProcedimentos({ open, onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredProcedimentos = procedimentosComuns.filter(proc =>
    proc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Procedimentos/Serviços</DialogTitle>
          <DialogDescription>
            Escolha os procedimentos ou serviços que você oferece para o seu anúncio.
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Buscar procedimento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />

        <ScrollArea className="h-[300px] pr-4">
          <div className="grid grid-cols-1 gap-2">
            {filteredProcedimentos.length > 0 ? (
              filteredProcedimentos.map((proc) => (
                <Button
                  key={proc}
                  variant="outline"
                  onClick={() => onSelect(proc)}
                  className="justify-start hover:bg-blue-50"
                >
                  {proc}
                </Button>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum procedimento encontrado.</p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}