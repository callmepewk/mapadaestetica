import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const procedimentosComuns = [
  // Estética facial
  "limpeza de pele", "peeling químico", "peeling de diamante", "microagulhamento", "hidratação facial", "rejuvenescimento facial",
  // Estética corporal
  "drenagem linfática", "massagem modeladora", "massagem relaxante", "criolipólise", "radiofrequência", "ultrassom estético",
  // Depilação
  "depilação a laser", "depilação com cera", "depilação egípcia",
  // Harmonização
  "botox", "preenchimento facial", "bioestimuladores", "fios de sustentação",
  // Profissionais da estética
  "barbeiros", "cabeleireiros", "designers de sobrancelha", "micropigmentadores", "tatuadores estéticos", "nail designers", "podólogos",
  // Extras comuns da base antiga
  "Design de Sobrancelhas", "Micropigmentação de Sobrancelhas", "Alongamento de Cílios",
  "Manicure", "Pedicure", "Spa dos Pés", "Spa das Mãos", "Tratamento para Acne",
  "Ultrassom Microfocado", "Enzimas Injetáveis", "Tratamento para Celulite", "Tratamento para Estrias",
  "Maquiagem Profissional"
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