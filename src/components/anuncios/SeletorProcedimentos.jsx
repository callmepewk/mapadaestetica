
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Plus } from "lucide-react";

const procedimentosPorCategoria = {
  "Estética Facial - Tratamentos Básicos": [
    "Limpeza de Pele Profunda", "Limpeza de Pele com Extração", "Hidratação Facial", 
    "Esfoliação Facial", "Máscara Facial", "Peeling Químico Superficial", 
    "Drenagem Linfática Facial", "Massagem Facial Relaxante", "Tratamento para Acne",
    "Tratamento para Cravos", "Higienização Facial", "Tonificação Facial"
  ],
  "Estética Facial - Rejuvenescimento": [
    "Microagulhamento", "Peeling de Diamante", "Radiofrequência Facial", 
    "Ultrassom Microfocado", "Laser CO2 Fracionado", "Luz Pulsada Intensa (IPL)",
    "Skinbooster", "Bioestimuladores de Colágeno", "Fios de Sustentação PDO",
    "Lifting Facial sem Cirurgia", "Tratamento para Rugas", "Tratamento para Linhas de Expressão",
    "Ácido Hialurônico", "Vitamina C Endovenosa", "Mesoterapia Facial"
  ],
  "Estética Facial - Tratamento de Condições": [
    "Tratamento de Manchas", "Tratamento de Melasma", "Tratamento de Cicatrizes de Acne",
    "Tratamento de Rosácea", "Tratamento de Olheiras", "Clareamento Facial",
    "Peeling para Manchas", "Laser para Manchas", "Tratamento para Pele Oleosa",
    "Tratamento para Pele Seca", "Tratamento para Poros Dilatados"
  ],
  "Estética Facial - Harmonização": [
    "Harmonização Facial Completa", "Preenchimento Labial", "Preenchimento de Olheiras",
    "Preenchimento de Sulco Nasogeniano", "Preenchimento de Bigode Chinês", 
    "Contorno Mandibular", "Projeção de Queixo", "Rinomodelação", "Preenchimento de Maçãs do Rosto",
    "Preenchimento de Têmporas", "Botox Frontal", "Botox para Pés de Galinha", 
    "Botox para Rugas Glabelares", "Bichectomia", "Lifting Líquido", "Protocolo MD Codes"
  ],
  "Estética Corporal - Redução de Medidas": [
    "Criolipólise", "Lipo sem Corte", "Lipoaspiração", "Lipocavitação", 
    "Carboxiterapia", "Intradermoterapia", "Mesoterapia Corporal", "Ultrassom Focado",
    "Redução de Gordura Localizada", "Tratamento de Culote", "Tratamento de Papada",
    "Abdominoplastia", "Lipoescultura"
  ],
  "Estética Corporal - Celulite e Estrias": [
    "Tratamento de Celulite Grau 1", "Tratamento de Celulite Grau 2", 
    "Tratamento de Celulite Grau 3", "Tratamento de Celulite Grau 4",
    "Endermologia", "Ventosaterapia", "Manthus", "Subcisão para Celulite",
    "Tratamento de Estrias Vermelhas", "Tratamento de Estrias Brancas",
    "Microagulhamento Corporal", "Laser para Estrias", "Carboxiterapia para Estrias"
  ],
  "Estética Corporal - Flacidez e Contorno": [
    "Radiofrequência Corporal", "Ultrassom Corporal", "Bioestimuladores Corporais",
    "Tratamento de Flacidez Abdominal", "Tratamento de Flacidez de Braços",
    "Tratamento de Flacidez de Coxas", "Lifting de Braços", "Lifting de Coxas",
    "Modelagem Corporal", "Massagem Modeladora", "Drenagem Linfática Corporal"
  ],
  "Depilação": [
    "Depilação a Laser Soprano Ice", "Depilação a Laser Alexandrite", 
    "Depilação a Laser Diodo", "Depilação a Laser Nd:Yag", "Luz Pulsada (IPL)",
    "Depilação Facial Feminina", "Depilação Facial Masculina", "Depilação de Axilas",
    "Depilação de Pernas", "Depilação de Braços", "Depilação de Virilha", 
    "Depilação Íntima Completa", "Depilação de Buço", "Depilação de Costas",
    "Depilação de Peito", "Depilação com Cera", "Depilação Egípcia", 
    "Depilação Definitiva", "Depilação Corpo Completo"
  ],
  "Drenagem Linfática": [
    "Drenagem Linfática Manual Corporal", "Drenagem Linfática Facial", 
    "Drenagem Linfática Pós-Operatória", "Drenagem Linfática para Gestantes",
    "Drenagem Linfática Redutora", "Drenagem Linfática Modeladora",
    "Drenagem para Retenção de Líquidos", "Drenagem Anti-inchaço"
  ],
  "Estética Capilar e Tricologia": [
    "Tratamento Capilar com Laser", "Microagulhamento Capilar", "Mesoterapia Capilar",
    "Intradermoterapia Capilar", "Tratamento para Queda de Cabelo", "Tratamento para Calvície",
    "Tratamento para Alopecia", "PRP Capilar", "Bioestimuladores Capilares",
    "Botox Capilar", "Queratina", "Cauterização Capilar", "Reconstrução Capilar",
    "Hidratação Profunda", "Cronograma Capilar", "Selagem Capilar", "Blindagem Capilar"
  ],
  "Transplante Capilar": [
    "Transplante Capilar FUE", "Transplante Capilar FUT", "Transplante de Barba",
    "Transplante de Sobrancelhas", "Micropigmentação Capilar (Efeito Raspado)"
  ],
  "Manicure e Pedicure": [
    "Manicure Tradicional", "Manicure Francesa", "Pedicure Tradicional", "Pedicure Spa",
    "Unha em Gel", "Unha de Fibra", "Alongamento de Unhas", "Esmaltação em Gel",
    "Nail Art", "Unhas Decoradas", "Blindagem de Unhas", "Fortalecimento Ungueal",
    "Spa dos Pés", "Spa das Mãos", "Parafina nos Pés", "Parafina nas Mãos"
  ],
  "Podologia": [
    "Tratamento de Unhas Encravadas", "Remoção de Calosidades", "Tratamento de Calos",
    "Tratamento de Rachaduras nos Pés", "Tratamento de Micose nas Unhas", 
    "Tratamento de Onicomicose", "Órtese Ungueal", "Tratamento de Verrugas Plantares",
    "Corte de Unhas Profissional", "Lixamento de Calos", "Hidratação Profunda dos Pés"
  ],
  "Micropigmentação e Design de Sobrancelhas": [
    "Micropigmentação Fio a Fio", "Micropigmentação Shadow", "Micropigmentação Ombré",
    "Micropigmentação Powder Brows", "Design de Sobrancelhas", "Henna nas Sobrancelhas",
    "Laminação de Sobrancelhas", "Despigmentação de Sobrancelhas", 
    "Remoção de Micropigmentação", "Correção de Micropigmentação"
  ],
  "Micropigmentação - Olhos e Lábios": [
    "Micropigmentação de Delineado Superior", "Micropigmentação de Delineado Inferior",
    "Micropigmentação de Eyeliner", "Micropigmentação Labial", "Micropigmentação Aquarela Labial",
    "Camuflagem de Cicatrizes Labiais", "Correção de Cor Labial"
  ],
  "Extensão e Alongamento de Cílios": [
    "Extensão de Cílios Fio a Fio", "Extensão de Cílios Volume Russo", 
    "Extensão de Cílios Mega Volume", "Extensão de Cílios Volume Brasileiro",
    "Extensão de Cílios Híbrida", "Lifting de Cílios", "Permanente de Cílios",
    "Tintura de Cílios", "Laminação de Cílios", "Manutenção de Extensão de Cílios"
  ],
  "Medicina Estética": [
    "Toxina Botulínica (Botox)", "Preenchimento com Ácido Hialurônico", 
    "Bioestimuladores de Colágeno (Sculptra/Radiesse)", "Skinbooster", 
    "Fios de Sustentação (PDO)", "Laser CO2 Fracionado", "Laser Nd:Yag",
    "Laser para Manchas", "Laser para Vasinhos", "Luz Pulsada Intensa",
    "Peeling Químico Médico", "Intradermoterapia", "Mesoterapia Facial e Corporal",
    "Bioestimulação com PDRN", "Exossomos", "Fatores de Crescimento"
  ],
  "Dermatologia": [
    "Consulta Dermatológica", "Tratamento de Acne", "Tratamento de Melasma",
    "Tratamento de Vitiligo", "Tratamento de Psoríase", "Tratamento de Dermatite",
    "Remoção de Sinais e Verrugas", "Cauterização de Lesões", "Biópsia de Pele",
    "Mapeamento de Pintas", "Tratamento de Rosácea", "Tratamento de Queloides",
    "Crioterapia", "Eletrocoagulação", "Peeling Dermatológico"
  ],
  "Cirurgia Plástica": [
    "Rinoplastia", "Blefaroplastia", "Otoplastia", "Ritidoplastia (Lifting Facial)",
    "Mentoplastia", "Lipoaspiração", "Abdominoplastia", "Mamoplastia de Aumento",
    "Mamoplastia Redutora", "Mastopexia", "Prótese de Glúteos", "Lifting de Braços",
    "Lifting de Coxas", "Bichectomia", "Ginecomastia", "Lipoescultura",
    "Cirurgia Pós-Bariátrica"
  ],
  "Fisioterapia Dermato Funcional": [
    "Drenagem Linfática Pós-Operatória", "Tratamento de Fibroses", "Ultrassom Terapêutico",
    "Endermologia", "Radiofrequência", "Corrente Russa", "Eletroestimulação",
    "Massagem Modeladora", "Tratamento de Aderências", "Reabilitação Pós-Cirúrgica"
  ],
  "Nutrição Estética": [
    "Consulta Nutricional para Emagrecimento", "Dieta Anti-Aging", "Nutrição para Pele",
    "Nutrição para Cabelos", "Prescrição de Nutracêuticos", "Avaliação de Composição Corporal",
    "Plano Alimentar Personalizado", "Suplementação Estética", "Detox Nutricional"
  ],
  "Psicologia e Coaching de Imagem": [
    "Consultoria de Imagem", "Personal Stylist", "Análise de Coloração Pessoal",
    "Análise de Estilo", "Montagem de Guarda-Roupa", "Personal Shopper",
    "Psicoterapia Estética", "Coaching de Autoestima"
  ],
  "Pilates e Fitness": [
    "Pilates Solo", "Pilates com Aparelhos", "Pilates para Gestantes", 
    "Pilates Terapêutico", "Personal Trainer", "Treino Funcional",
    "Musculação", "Treino HIIT", "Crossfit", "Ginástica Laboral"
  ],
  "Acupuntura Estética": [
    "Acupuntura Facial", "Acupuntura para Rejuvenescimento", "Acupuntura para Emagrecimento",
    "Auriculoterapia", "Acupuntura Sistêmica", "Acupuntura para Celulite"
  ],
  "Terapias Integrativas e Complementares": [
    "Reiki", "Aromaterapia", "Florais", "Cromoterapia", "Cristaloterapia",
    "Reflexologia", "Shiatsu", "Do-In", "Massagem Ayurvédica", "Ventosaterapia"
  ],
  "Biomedicina Estética": [
    "Microagulhamento", "Peeling Químico", "Intradermoterapia", "Bioestimuladores",
    "Skinbooster", "Laser de Baixa Potência", "LED Terapia", "Correntes Elétricas"
  ],
  "Enfermagem Estética": [
    "Aplicação de Toxina Botulínica", "Aplicação de Preenchedores", 
    "Bioestimuladores Injetáveis", "Fios de Sustentação", "Peeling Químico",
    "Microagulhamento", "Intradermoterapia", "Mesoterapia"
  ],
  "Farmácia Estética": [
    "Manipulação de Cosméticos", "Formulações Personalizadas", "Dermocosméticos",
    "Nutracêuticos", "Suplementos para Pele", "Suplementos para Cabelo",
    "Produtos Anti-Aging", "Produtos para Acne"
  ],
  "Odontologia Estética": [
    "Clareamento Dental", "Lentes de Contato Dental", "Facetas de Porcelana",
    "Facetas de Resina", "Harmonização Orofacial", "Botox Odontológico",
    "Preenchimento Labial Odontológico", "Gengivoplastia", "Restaurações Estéticas"
  ],
  "Massoterapia": [
    "Massagem Relaxante", "Massagem Terapêutica", "Massagem Desportiva",
    "Massagem com Pedras Quentes", "Massagem Tailandesa", "Massagem Sueca",
    "Massagem Shiatsu", "Quick Massage", "Massagem Ayurvédica", "Bambuterapia",
    "Massagem Modeladora", "Drenagem Linfática Manual"
  ],
  "Barbearia": [
    "Corte Masculino", "Barba Completa", "Aparar Barba", "Design de Barba",
    "Barboterapia", "Limpeza de Pele Masculina", "Hidratação de Barba",
    "Tratamento para Barba", "Corte e Barba", "Corte Infantil"
  ],
  "Tatuagem e Piercing": [
    "Tatuagem Colorida", "Tatuagem Preto e Cinza", "Tatuagem Realista",
    "Tatuagem Aquarela", "Tatuagem Old School", "Tatuagem Tribal",
    "Cover Up (Cobertura de Tatuagem)", "Remoção de Tatuagem a Laser",
    "Piercing no Nariz", "Piercing na Orelha", "Piercing no Umbigo",
    "Piercing na Língua", "Piercing Facial", "Alargador"
  ],
  "Spa e Bem-Estar": [
    "Day Spa Completo", "Massagem Relaxante", "Ofurô", "Sauna", "Hidromassagem",
    "Aromaterapia", "Reflexologia", "Banho de Imersão", "Esfoliação Corporal",
    "Hidratação Corporal", "Máscara Corporal", "Ritual de Beleza",
    "Spa dos Pés", "Circuito de Águas"
  ],
  "Longevidade e Medicina Integrativa": [
    "Consulta de Longevidade", "Avaliação de Idade Biológica", "Terapia de Reposição Hormonal",
    "Modulação Hormonal", "Suplementação Anti-Aging", "Quelação", "Ozonioterapia",
    "Sueroterapia", "Vitamina C Endovenosa", "Glutationa Endovenosa", "Check-up Preventivo"
  ],
  "Clínicas e Consultórios": [
    "Aluguel de Sala por Hora", "Aluguel de Sala por Dia", "Aluguel Mensal de Consultório",
    "Sala Equipada", "Consultório Compartilhado", "Espaço Coworking Médico"
  ],
  "Salões de Beleza": [
    "Corte Feminino", "Corte Masculino", "Escova", "Progressiva", "Botox Capilar",
    "Coloração", "Mechas", "Balayage", "Ombré Hair", "Luzes", "Reflexo",
    "Penteados", "Penteado para Noiva", "Hidratação Capilar", "Cauterização"
  ],
  "Equipamentos - Venda": [
    "Laser Diodo", "Laser Alexandrite", "Laser Nd:Yag", "IPL (Luz Pulsada)",
    "Criolipólise", "Radiofrequência", "HIFU", "Ultrassom Estético",
    "Carboxiterapia", "Endermologia", "Microagulhamento Automático",
    "LED Terapia", "Corrente Russa", "Maca Estética", "Cadeira de Estética"
  ],
  "Equipamentos - Locação": [
    "Locação de Laser", "Locação de Criolipólise", "Locação de Radiofrequência",
    "Locação de HIFU", "Locação de IPL", "Locação de Carboxiterapia"
  ],
  "Equipamentos - Seminovos": [
    "Laser Seminovo", "Criolipólise Seminova", "Radiofrequência Seminova",
    "HIFU Seminovo", "IPL Seminovo", "Ultrassom Seminovo"
  ],
  "Cosméticos e Produtos": [
    "Dermocosméticos", "Produtos para Acne", "Produtos Anti-Aging", 
    "Produtos para Manchas", "Produtos para Cabelo", "Shampoos", "Condicionadores",
    "Máscaras Capilares", "Cremes Hidratantes", "Protetores Solares",
    "Ácidos Faciais", "Vitamina C", "Retinol", "Niacinamida"
  ],
  "Injetáveis e Preenchedores": [
    "Toxina Botulínica", "Ácido Hialurônico", "Radiesse", "Sculptra",
    "Ellansé", "Hidroxiapatita de Cálcio", "Policaprolactona"
  ],
  "Nutracêuticos e Suplementos": [
    "Colágeno Hidrolisado", "Vitamina C", "Vitamina D", "Biotina",
    "Ácido Hialurônico Oral", "Antioxidantes", "Ômega 3", "Zinco",
    "Selênio", "Glutationa", "Resveratrol", "Coenzima Q10"
  ],
  "Móveis e Decoração para Clínicas": [
    "Maca para Estética", "Cadeira para Estética", "Carrinho Auxiliar",
    "Escada para Maca", "Biombo", "Espelho Profissional", "Luminária LED",
    "Armário para Produtos", "Recepção Completa", "Cadeiras de Espera"
  ],
  "Softwares de Gestão": [
    "Software de Agendamento", "Sistema de Gestão de Clínica", "CRM para Estética",
    "Sistema de Prontuário Eletrônico", "App de Agendamento", "Sistema de Marketing"
  ],
  "Uniformes e Vestuário Profissional": [
    "Jaleco Feminino", "Jaleco Masculino", "Scrub", "Avental", "Touca Descartável",
    "Máscara Cirúrgica", "Luvas Descartáveis", "Sapato Profissional"
  ],
  "Roupas de Compressão Pós-Cirúrgica": [
    "Cinta Abdominal", "Meia de Compressão", "Sutiã Pós-Cirúrgico",
    "Calcinha Pós-Cirúrgica", "Modelador Corporal", "Faixa Torácica",
    "Faixa de Braço", "Faixa de Coxa"
  ],
  "Alimentação Saudável e Fitness": [
    "Marmitas Fit", "Cardápio Low Carb", "Cardápio Vegano", "Sucos Detox",
    "Snacks Saudáveis", "Refeições para Emagrecimento", "Dieta Balanceada"
  ],
  "Educação - Cursos e Workshops": [
    "Curso de Micropigmentação", "Curso de Extensão de Cílios", "Curso de Drenagem Linfática",
    "Curso de Massagem", "Curso de Depilação", "Curso de Estética Facial",
    "Curso de Estética Corporal", "Curso de Harmonização Facial", "Workshop de Maquiagem",
    "Curso de Barbeiro", "Curso de Tatuagem", "Curso de Podologia"
  ],
  "Eventos - Congressos e Feiras": [
    "Congresso de Estética", "Feira de Beleza", "Workshop Presencial",
    "Simpósio de Medicina Estética", "Curso Intensivo", "Palestra Motivacional"
  ],
  "Consultoria e Assessoria": [
    "Consultoria de Marketing Digital", "Assessoria Jurídica para Clínicas",
    "Consultoria de Gestão", "Mentoria para Profissionais", "Consultoria de Vendas",
    "Assessoria Contábil", "Consultoria de Imagem para Clínicas"
  ],
  "Franquias": [
    "Franquia de Depilação a Laser", "Franquia de Estética", "Franquia de Barbearia",
    "Franquia de Salão de Beleza", "Franquia de Micropigmentação"
  ],
  "Turismo de Saúde": [
    "Pacote de Cirurgia Plástica", "Turismo Médico", "Spa Resort",
    "Retiro de Bem-Estar", "Viagem para Procedimentos Estéticos"
  ],
  "Seguros e Financiamentos": [
    "Seguro de Responsabilidade Civil", "Seguro para Clínicas", "Financiamento de Equipamentos",
    "Crédito para Profissionais", "Consórcio de Equipamentos"
  ],
  "Marketing e Design": [
    "Criação de Logo", "Identidade Visual", "Website para Clínicas", "Gestão de Redes Sociais",
    "Produção de Conteúdo", "Fotografia Profissional", "Design Gráfico", "Marketing Digital"
  ]
};

export default function SeletorProcedimentos({ open, onClose, onSelect, procedimentoAtual }) {
  const [busca, setBusca] = useState("");
  const [categoriaExpandida, setCategoriaExpandida] = useState(null);
  const [procedimentoCustom, setProcedimentoCustom] = useState("");

  const todosProcedimentos = Object.values(procedimentosPorCategoria).flat();
  
  const procedimentosFiltrados = busca
    ? todosProcedimentos.filter(proc => 
        proc.toLowerCase().includes(busca.toLowerCase())
      )
    : null;

  const handleSelect = (procedimento) => {
    onSelect(procedimento);
    setBusca("");
    setProcedimentoCustom("");
  };

  const handleAdicionarCustom = () => {
    if (procedimentoCustom.trim()) {
      onSelect(procedimentoCustom.trim());
      setProcedimentoCustom("");
      setBusca("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] sm:h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 flex-shrink-0 border-b">
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            Selecionar Procedimentos/Serviços
          </DialogTitle>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Escolha procedimentos específicos ou adicione um personalizado. 
            <strong> Total: {todosProcedimentos.length} procedimentos disponíveis</strong>
          </p>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-3 space-y-3 flex-shrink-0 border-b bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-3 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Input
              placeholder="Buscar procedimento... (ex: Botox, Limpeza de Pele)"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 h-10 sm:h-12 text-sm sm:text-base"
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-3 top-3 sm:top-3.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>

          {/* Adicionar procedimento customizado */}
          <div className="flex gap-2">
            <Input
              placeholder="Ou digite um procedimento personalizado..."
              value={procedimentoCustom}
              onChange={(e) => setProcedimentoCustom(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdicionarCustom())}
              className="h-9 sm:h-10 text-sm"
            />
            <Button 
              type="button"
              onClick={handleAdicionarCustom}
              disabled={!procedimentoCustom.trim()}
              className="bg-green-600 hover:bg-green-700 h-9 sm:h-10 text-sm"
            >
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">+</span>
            </Button>
          </div>
        </div>

        {/* ÁREA SCROLLÁVEL - CORRIGIDA */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 min-h-0">
          {procedimentosFiltrados ? (
            // Resultado da busca
            <div className="space-y-2">
              {procedimentosFiltrados.length > 0 ? (
                <>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3">
                    {procedimentosFiltrados.length} procedimento(s) encontrado(s)
                  </p>
                  {procedimentosFiltrados.map((proc) => (
                    <button
                      key={proc}
                      onClick={() => handleSelect(proc)}
                      className="w-full text-left p-3 sm:p-4 rounded-lg border-2 border-gray-200 hover:border-[#F7D426] hover:bg-gray-50 transition-all text-sm"
                    >
                      {proc}
                    </button>
                  ))}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl sm:text-6xl mb-4">🔍</div>
                  <p className="text-gray-600">Nenhum procedimento encontrado</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    Tente buscar com outros termos ou adicione um personalizado acima
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Lista categorizada - TODAS AS CATEGORIAS
            <div className="space-y-4 sm:space-y-6 pb-4">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 sm:p-4 rounded-lg border-2 border-pink-200 mb-4">
                <p className="text-center font-bold text-pink-900 text-sm sm:text-base">
                  📋 {Object.keys(procedimentosPorCategoria).length} Categorias Completas | 
                  {todosProcedimentos.length} Procedimentos Totais
                </p>
                <p className="text-center text-xs sm:text-sm text-pink-700 mt-1">
                  Clique em qualquer categoria para expandir e ver todos os procedimentos
                </p>
              </div>

              {Object.entries(procedimentosPorCategoria).map(([categoria, procedimentos]) => (
                <div key={categoria}>
                  <button
                    onClick={() => setCategoriaExpandida(
                      categoriaExpandida === categoria ? null : categoria
                    )}
                    className="w-full text-left mb-3 flex items-center justify-between group p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-pink-50 hover:to-purple-50 transition-all"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#F7D426] transition-colors">
                      {categoria}
                      <span className="ml-2 text-xs sm:text-sm text-gray-500 font-normal">
                        ({procedimentos.length} procedimentos)
                      </span>
                    </h3>
                    <span className="text-xl sm:text-2xl text-gray-400 group-hover:text-[#F7D426] transition-colors">
                      {categoriaExpandida === categoria ? '−' : '+'}
                    </span>
                  </button>

                  {categoriaExpandida === categoria ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      {procedimentos.map((proc) => (
                        <button
                          key={proc}
                          onClick={() => handleSelect(proc)}
                          className="text-left p-2 sm:p-3 rounded-lg border-2 border-gray-200 hover:border-[#F7D426] hover:bg-white hover:shadow-md transition-all text-xs sm:text-sm"
                        >
                          {proc}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {procedimentos.slice(0, 8).map((proc) => (
                        <Badge
                          key={proc}
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-100 text-xs"
                          onClick={() => handleSelect(proc)}
                        >
                          {proc}
                        </Badge>
                      ))}
                      {procedimentos.length > 8 && (
                        <Badge
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-100 bg-pink-50 text-pink-700 border-pink-300 text-xs font-bold"
                          onClick={() => setCategoriaExpandida(categoria)}
                        >
                          +{procedimentos.length - 8} mais
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
