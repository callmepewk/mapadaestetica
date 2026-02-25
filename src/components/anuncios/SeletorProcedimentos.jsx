import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Lista oficial agrupada por macro-categorias (parcial por brevidade)
const LISTA_OFICIAL = {
  "ESTÉTICA FACIAL": {
    "Limpeza e Renovação": [
      "Limpeza de pele profunda","Limpeza de pele com extração","Limpeza de pele acneica","Higienização facial express","Detox facial",
      "Peeling químico superficial","Peeling enzimático","Peeling de diamante","Peeling de cristal","Microdermoabrasão","Dermaplaning"
    ],
    "Rejuvenescimento": [
      "Radiofrequência facial","LED terapia","Luz pulsada (IPL)","Skinbooster","Bioestimuladores de colágeno","Microagulhamento","Nanopuntura","Eletrolifting","Hidratação profunda facial"
    ],
    "Tratamentos Específicos": [
      "Tratamento para acne","Tratamento para rosácea","Tratamento para melasma","Tratamento para manchas","Tratamento para poros dilatados","Tratamento para flacidez facial","Tratamento para olheiras"
    ]
  },
  "ESTÉTICA AVANÇADA / MÉDICA": {
    "Procedimentos": [
      "Toxina botulínica","Preenchimento facial (ácido hialurônico)","Rinomodelação","Harmonização facial","Fios de sustentação (PDO)",
      "Lipoenzimática de papada","Intradermoterapia / Mesoterapia","PRP (Plasma Rico em Plaquetas)","Bichectomia","Blefaroplastia não cirúrgica","Laser fracionado","Laser CO2"
    ]
  },
  "ESTÉTICA CORPORAL": {
    "Redução de Medidas": [
      "Criolipólise","Criolipólise de placas","Ultrassom cavitacional","Lipo sem cortes","Radiofrequência corporal","Endermologia","Corrente russa","Lipocavitação"
    ],
    "Celulite e Flacidez": [
      "Drenagem linfática","Drenagem pós-operatória","Massagem modeladora","Massagem redutora","Carboxiterapia","Tratamento para estrias","Tratamento para flacidez"
    ],
    "Relaxamento": [
      "Massagem relaxante","Massagem terapêutica","Massagem com pedras quentes","Massagem ayurvédica","Massagem sueca","Shiatsu","Reflexologia"
    ]
  },
  "ESTÉTICA CAPILAR / TRICOLOGIA": {
    "Capilar": [
      "Detox capilar","Terapia capilar","Tratamento antiqueda","Tratamento para alopecia","Microagulhamento capilar","Intradermoterapia capilar","Laser capilar","Ozonioterapia capilar","Implante capilar","Transplante capilar"
    ]
  },
  "MÃOS, PÉS E UNHAS": { "Serviços": ["Manicure tradicional","Pedicure","Spa dos pés","Alongamento em gel","Alongamento em fibra de vidro","Unhas acrílicas","Nail art","Esmaltação em gel","Podologia clínica","Tratamento para onicomicose"] },
  "CÍLIOS E SOBRANCELHAS": { "Serviços": ["Design de sobrancelhas","Henna para sobrancelhas","Brow lamination","Microblading","Micropigmentação","Extensão de cílios","Volume russo","Lash lifting","Tintura de cílios"] },
  "DEPILAÇÃO": { "Serviços": ["Depilação com cera quente","Depilação com cera fria","Depilação egípcia (linha)","Depilação íntima","Depilação masculina","Depilação a laser","Fotodepilação"] },
  "TERAPIAS INTEGRATIVAS": { "Serviços": ["Aromaterapia","Reiki","Ventosaterapia","Auriculoterapia","Acupuntura estética","Cromoterapia","Ozonioterapia"] },
  "ODONTOLOGIA ESTÉTICA": { "Serviços": ["Clareamento dental","Lentes de contato dental","Facetas","Harmonização orofacial"] },
  "ESTÉTICA MASCULINA": { "Serviços": ["Limpeza de pele masculina","Tratamento para barba","Depilação masculina","Tratamento capilar masculino"] },
  "ESTÉTICA ÍNTIMA": { "Serviços": ["Clareamento íntimo","Rejuvenescimento íntimo a laser","Harmonização íntima","Labioplastia"] },
  "SERVIÇOS COMPLEMENTARES": { "Serviços": ["Consultoria de imagem","Análise facial","Análise corporal","Plano de tratamento estético","Venda de dermocosméticos","Avaliação estética personalizada","Check-up estético"] }
};

function filtrarPorCategorias(selectedCategories) {
  if (!selectedCategories || selectedCategories.length === 0) return null; // sem filtro
  const mapa = [];
  const textoCats = selectedCategories.join(" | ").toLowerCase();
  for (const [macro, grupos] of Object.entries(LISTA_OFICIAL)) {
    // heurística: vincula macro a palavras-chave
    const chave = macro.toLowerCase().split(" ")[1];
    if (textoCats.includes("facial") && macro.includes("FACIAL")) mapa.push([macro, grupos]);
    else if (textoCats.includes("corporal") && macro.includes("CORPORAL")) mapa.push([macro, grupos]);
    else if (textoCats.includes("capilar") && macro.includes("CAPILAR")) mapa.push([macro, grupos]);
    else if (textoCats.includes("depila") && macro.includes("DEPILA")) mapa.push([macro, grupos]);
    else if (textoCats.includes("sobrancel") || textoCats.includes("cílios")) { if (macro.includes("CÍLIOS") ) mapa.push([macro, grupos]); }
    else if (textoCats.includes("mãos") || textoCats.includes("unhas") || textoCats.includes("manicure") || textoCats.includes("pedicure")) { if (macro.includes("MÃOS")) mapa.push([macro, grupos]); }
    else if (textoCats.includes("terapia") || textoCats.includes("integrativa")) { if (macro.includes("TERAPIAS")) mapa.push([macro, grupos]); }
    else if (textoCats.includes("odontologia") || textoCats.includes("dente")) { if (macro.includes("ODONTOLOGIA")) mapa.push([macro, grupos]); }
    else if (textoCats.includes("íntima")) { if (macro.includes("ÍNTIMA")) mapa.push([macro, grupos]); }
    else if (textoCats.includes("masculina")) { if (macro.includes("MASCULINA")) mapa.push([macro, grupos]); }
    else if (textoCats.includes("avançada") || textoCats.includes("médica") || textoCats.includes("injet")) { if (macro.includes("AVANÇADA")) mapa.push([macro, grupos]); }
    else if (textoCats.includes("complementar") || textoCats.includes("consultoria")) { if (macro.includes("COMPLEMENTARES")) mapa.push([macro, grupos]); }
  }
  return mapa.length ? mapa : null;
}

const procedimentosComuns = [
  "Limpeza de Pele Profunda", "Peeling Químico", "Microagulhamento", "Drenagem Linfática",
  "Massagem Modeladora", "Massagem Relaxante", "Botox", "Preenchimento Facial",
  "Fios de PDO", "Bioestimuladores de Colágeno", "Depilação a Laser", "Depilação com Cera",
  "Design de Sobrancelhas", "Micropigmentação de Sobrancelhas", "Alongamento de Cílios",
  "Manicure", "Pedicure", "Spa dos Pés", "Spa das Mãos", "Hair Skincare", "Corte de Cabelo",
  "Hidratação Capilar", "Coloração", "Tratamento para Acne", "Rejuvenescimento Facial",
  "Contorno Corporal", "Criolipólise", "Radiofrequência", "Ultrassom Microfocado",
  "Enzimas Injetáveis", "Tratamento para Celulite", "Tratamento para Estrias",
  "Esmaltação em Gel", "Unha de Fibra", "Reflexologia Podal", "Podoprofilaxia",
  "Tricologia Capilar", "Consultoria de Imagem", "Maquiagem Profissional", "Pós-operatório"
];

export default function SeletorProcedimentos({ open, onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState("");
  const mapaFiltrado = filtrarPorCategorias(selectedCategories);
  const listaAgrupada = mapaFiltrado || Object.entries(LISTA_OFICIAL);
  const todos = listaAgrupada.flatMap(([macro, grupos]) => Object.values(grupos).flat());
  const filteredProcedimentos = todos.filter(proc => proc.toLowerCase().includes(searchTerm.toLowerCase()));

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

        <ScrollArea className="h-[340px] pr-4">
          <div className="space-y-4">
            {listaAgrupada.map(([macro, grupos]) => (
              <div key={macro}>
                <h4 className="text-xs font-bold text-gray-600 mb-2">{macro}</h4>
                {Object.entries(grupos).map(([grupo, itens]) => (
                  <div key={grupo} className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">{grupo}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {itens
                        .filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((proc) => (
                          <Button key={proc} variant="outline" onClick={() => onSelect(proc)} className="justify-start hover:bg-blue-50 text-left">
                            {proc}
                          </Button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {filteredProcedimentos.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhum procedimento encontrado.</p>
            )}
          </div>
        </ScrollArea>
        <div className="mt-3 flex items-center gap-2">
          <Input placeholder="Adicionar personalizado (ex.: Procedimento X)" onKeyDown={(e)=>{ if(e.key==='Enter'){ const v=e.currentTarget.value.trim(); if(v){ onSelect(v); e.currentTarget.value=''; } }}} />
          <Button type="button" variant="outline" onClick={()=>{ /* noop button just to guide user */ }} className="text-xs">Pressione Enter</Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}