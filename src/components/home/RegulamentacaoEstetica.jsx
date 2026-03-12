import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Scale, FileCheck2, BookOpen } from "lucide-react";

const PROFISSOES = [
  { nome: "Médico Dermatologista", conselho: "CFM", escopo: ["Diagnóstico dermatológico", "Tratamentos médicos da pele", "Procedimentos estéticos invasivos"], procedimentos: ["Toxina botulínica", "Preenchimentos", "Lasers dermatológicos", "Bioestimuladores", "Peelings médicos", "Cirurgia dermatológica"] },
  { nome: "Médico Cirurgião Plástico", conselho: "CFM", escopo: ["Cirurgias estéticas", "Procedimentos estéticos invasivos"], procedimentos: ["Cirurgia plástica", "Preenchimentos", "Toxina botulínica", "Bioestimuladores", "Lasers", "Tratamentos corporais invasivos"] },
  { nome: "Médico em Medicina Estética", conselho: "CFM", escopo: ["Tratamentos estéticos médicos"], procedimentos: ["Toxina botulínica", "Bioestimuladores", "Preenchimentos", "Lasers", "Peelings"] },
  { nome: "Biomédico Esteta", conselho: "CFBM", escopo: ["Estética avançada sob regulamentação"], procedimentos: ["Toxina botulínica", "Bioestimuladores", "Preenchimentos", "Microagulhamento", "Lasers", "Peelings"] },
  { nome: "Farmacêutico Esteta", conselho: "CFF", escopo: ["Estética injetável e não-invasiva"], procedimentos: ["Toxina botulínica", "Bioestimuladores", "Lasers", "Peelings", "Microagulhamento"] },
  { nome: "Enfermeiro Esteta", conselho: "COFEN", escopo: ["Estética clínica"], procedimentos: ["Toxina botulínica", "Bioestimuladores", "Lasers", "Microagulhamento", "Peelings"] },
  { nome: "Fisioterapeuta Dermatofuncional", conselho: "CREFITO", escopo: ["Estética corporal e dermato-funcional"], procedimentos: ["Radiofrequência", "Criolipólise", "Drenagem linfática", "Ultrassom estético", "Tratamentos corporais"] },
  { nome: "Dentista Harmonizador Orofacial", conselho: "CFO", escopo: ["Estética facial (limitação: apenas face)"], procedimentos: ["Toxina botulínica facial", "Preenchimento facial", "Bioestimuladores faciais", "Harmonização orofacial"] },
  { nome: "Biólogo Esteta", conselho: "CFBio", escopo: ["Estética injetável e regenerativa"], procedimentos: ["Injetáveis", "Tratamentos regenerativos", "Bioestimuladores"] },
  { nome: "Nutricionista Estético", conselho: "CFN", escopo: ["Nutrição estética e integrativa", "Tratamento metabólico"], procedimentos: ["Protocolos nutricionais", "Suporte a tratamentos estéticos"] },
  { nome: "Esteticista", conselho: "Lei 13.643/2018", escopo: ["Estética não invasiva"], procedimentos: ["Limpeza de pele", "Peeling superficial", "Drenagem linfática", "Radiofrequência estética", "Massagem estética"] },
  { nome: "Tecnólogo em Estética e Cosmética", conselho: "Lei 13.643/2018", escopo: ["Estética não invasiva"], procedimentos: ["Protocolos faciais", "Estética corporal"] },
  { nome: "Cosmetólogo", conselho: "—", escopo: ["Terapias e cosméticos"], procedimentos: ["Tratamentos cosméticos", "Cuidados com a pele", "Terapias dermatocosméticas"] },
  { nome: "Tricologista", conselho: "—", escopo: ["Estética capilar"], procedimentos: ["Queda de cabelo", "Fortalecimento capilar", "Terapias capilares"] },
  { nome: "Podólogo", conselho: "—", escopo: ["Saúde e estética dos pés"], procedimentos: ["Tratamento de unhas", "Calosidades", "Cuidados estéticos dos pés"] },
  { nome: "Massoterapeuta", conselho: "—", escopo: ["Terapias corporais"], procedimentos: ["Massagem relaxante", "Drenagem", "Massagem modeladora"] },
  { nome: "Terapeuta Capilar", conselho: "—", escopo: ["Tratamentos capilares"], procedimentos: ["Terapias capilares", "Fortalecimento capilar", "Tratamentos do couro cabeludo"] },
];

export default function RegulamentacaoEstetica() {
  return (
    <section id="profissionais-regulamentados" className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <Badge className="mb-3 bg-blue-100 text-blue-800">Institucional</Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Profissionais regulamentados na área da estética no Brasil</h2>
          <p className="text-gray-700 mt-3 max-w-3xl mx-auto">
            No Brasil, os <strong>conselhos profissionais</strong> (CFM, CFO, COFEN, CFF, CFBM, CREFITO, CFN, CFBio, entre outros) definem quem pode realizar cada procedimento estético — não a ANVISA. Nosso papel é <strong>educar pacientes e profissionais</strong>, respeitar limites de atuação e <strong>conectar pessoas qualificadas</strong> aos tratamentos adequados.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-10">
          <Card className="border-2 border-blue-200"><CardContent className="p-5"><div className="flex items-center gap-2 text-blue-700 font-semibold mb-2"><ShieldCheck className="w-5 h-5"/>Profissionais Regulamentados</div><p className="text-sm text-gray-700">Respeitamos as regras dos conselhos e organizamos o mercado com base nelas.</p></CardContent></Card>
          <Card className="border-2 border-emerald-200"><CardContent className="p-5"><div className="flex items-center gap-2 text-emerald-700 font-semibold mb-2"><FileCheck2 className="w-5 h-5"/>Informação Clara ao Paciente</div><p className="text-sm text-gray-700">Explicamos escopos e exemplos de procedimentos para escolhas seguras.</p></CardContent></Card>
          <Card className="border-2 border-amber-200"><CardContent className="p-5"><div className="flex items-center gap-2 text-amber-700 font-semibold mb-2"><Scale className="w-5 h-5"/>Responsabilidade</div><p className="text-sm text-gray-700">Acesso a dados <strong>agregados</strong> para patrocinadores — sem dados individuais.</p></CardContent></Card>
        </div>

        <div className="mb-6 flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-700"/><h3 className="text-xl font-bold text-gray-900">Profissões da Estética — Conselhos, Escopo e Exemplos</h3></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROFISSOES.map((p) => (
            <Card key={p.nome} className="border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2"><h4 className="font-semibold text-gray-900">{p.nome}</h4><Badge className="bg-gray-100 text-gray-800">{p.conselho}</Badge></div>
                {p.escopo?.length>0 && (<div className="mb-2"><p className="text-xs text-gray-500 mb-1">Escopo</p><ul className="text-sm text-gray-700 list-disc list-inside space-y-1">{p.escopo.map((e)=> <li key={e}>{e}</li>)}</ul></div>)}
                {p.procedimentos?.length>0 && (<div><p className="text-xs text-gray-500 mb-1">Exemplos de procedimentos</p><div className="flex flex-wrap gap-1">{p.procedimentos.map((e)=> <Badge key={e} className="bg-blue-50 text-blue-800">{e}</Badge>)}</div></div>)}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Categorias institucionais (agrupadas) */}
        <div className="mt-12 space-y-10">
          {/* Categoria 1 — Profissões Médicas (CFM) */}
          <div className="bg-white border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Categoria 1 — Profissões Médicas</h3>
              <Badge className="bg-gray-100 text-gray-800">CFM</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Profissionais</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Médico Dermatologista</li>
                  <li>Médico Cirurgião Plástico</li>
                  <li>Médico com atuação em Medicina Estética</li>
                </ul>
                <p className="text-sm text-emerald-700 font-semibold mt-3">Autonomia: Máxima autonomia na área estética</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Procedimentos que podem realizar</p>
                <div className="flex flex-wrap gap-2">
                  {['Toxina Botulínica','Preenchimentos faciais','Bioestimuladores de colágeno','Laser médico','Cirurgias estéticas','Procedimentos invasivos','Harmonização facial completa','Tratamentos dermatológicos médicos'].map(x=> (
                    <Badge key={x} className="bg-blue-50 text-blue-800">{x}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Categoria 2 — Profissionais da Saúde com Atuação Estética */}
          <div className="bg-white border rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Categoria 2 — Profissionais da Saúde com Atuação Estética</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Biomédico Esteta — <span className="font-normal">CFBM</span></p>
                <p className="text-xs text-gray-600 mb-2">Pode realizar: toxina botulínica, preenchimento facial, bioestimuladores, microagulhamento, laser estético, intradermoterapia</p>
                <p className="text-sm font-semibold text-gray-800 mb-1">Farmacêutico Esteta — <span className="font-normal">CFF</span></p>
                <p className="text-xs text-gray-600 mb-2">Pode realizar: toxina botulínica, preenchimento facial, bioestimuladores, microagulhamento, laser, intradermoterapia</p>
                <p className="text-sm font-semibold text-gray-800 mb-1">Enfermeiro Esteta — <span className="font-normal">COFEN</span></p>
                <p className="text-xs text-gray-600 mb-2">Pode realizar: toxina botulínica, microagulhamento, laser estético, peelings, intradermoterapia</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Fisioterapeuta Dermatofuncional — <span className="font-normal">COFFITO</span></p>
                <p className="text-xs text-gray-600 mb-2">Pode realizar: tratamentos corporais, drenagem linfática, radiofrequência, criolipólise, pós-operatório, estética corporal</p>
                <p className="text-sm font-semibold text-gray-800 mb-1">Dentista Harmonizador Orofacial — <span className="font-normal">CFO</span></p>
                <p className="text-xs text-gray-600 mb-2">Limitação: apenas face. Procedimentos: toxina botulínica facial, preenchimentos faciais, harmonização orofacial, bioestimuladores, lipo enzimática de papada</p>
                <p className="text-sm font-semibold text-gray-800 mb-1">Biólogo Esteta — <span className="font-normal">CFBio</span></p>
                <p className="text-xs text-gray-600 mb-2">Procedimentos: microagulhamento, peelings, procedimentos minimamente invasivos</p>
                <p className="text-sm font-semibold text-gray-800 mb-1">Nutricionista Estético — <span className="font-normal">CFN</span></p>
                <p className="text-xs text-gray-600">Atuação: nutrição estética, emagrecimento, saúde da pele, nutrição para procedimentos estéticos</p>
              </div>
            </div>
          </div>

          {/* Categoria 3 — Profissionais Técnicos da Estética */}
          <div className="bg-white border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">Categoria 3 — Profissionais Técnicos da Estética</h3>
              <Badge className="bg-amber-100 text-amber-800">Lei 13.643/2018</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Esteticista</li>
                  <li>Tecnólogo em Estética e Cosmética</li>
                  <li>Cosmetólogo</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Procedimentos permitidos</p>
                <div className="flex flex-wrap gap-2">
                  {['Limpeza de pele','Peelings superficiais','Massagens estéticas','Tratamentos corporais','Procedimentos não invasivos'].map(x=> (
                    <Badge key={x} className="bg-green-50 text-green-800">{x}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Categoria 4 — Profissões Complementares */}
          <div className="bg-white border rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Categoria 4 — Profissões Complementares</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-700">
              <div>
                <p className="font-semibold">Tricologista</p>
                <p className="text-xs text-gray-600 mb-1">Estética capilar</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Tratamento capilar</li>
                  <li>Terapia do couro cabeludo</li>
                  <li>Fortalecimento capilar</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Podólogo</p>
                <p className="text-xs text-gray-600 mb-1">Saúde estética dos pés</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Tratamento estético dos pés</li>
                  <li>Correção de unhas</li>
                  <li>Prevenção de patologias</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Massoterapeuta</p>
                <p className="text-xs text-gray-600 mb-1">Terapias corporais</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Massagens relaxantes</li>
                  <li>Massagem modeladora</li>
                  <li>Drenagem linfática</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tipos de estabelecimentos */}
          <div id="tipos-estabelecimentos" className="bg-white border rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tipos de estabelecimentos na área da estética</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {s:1, nome:'Consultório', icon:'🏥', desc:'Pequeno espaço profissional onde normalmente atua um único especialista.'},
                {s:2, nome:'Clínica', icon:'💆', desc:'Estabelecimento com múltiplos profissionais e maior variedade de procedimentos.'},
                {s:3, nome:'Centro Clínico', icon:'✨', desc:'Estrutura com diversas especialidades e tecnologias estéticas.'},
                {s:4, nome:'Centro de Especialidade', icon:'🌿', desc:'Clínica focada em especializações específicas da estética.'},
                {s:5, nome:'Clínica de Luxo', icon:'✨', desc:'Estrutura premium com equipamentos avançados e experiência diferenciada.'},
              ].map((t)=> (
                <div key={t.nome} className={`rounded-xl border p-4 ${t.s===5? 'border-yellow-300':'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl">{t.icon}</div>
                    <div className="text-yellow-500 text-sm">{'⭐'.repeat(t.s)}</div>
                  </div>
                  <p className="font-semibold text-gray-900">{t.nome}</p>
                  <p className="text-sm text-gray-700 mt-1">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}