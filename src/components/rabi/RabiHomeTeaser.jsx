import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { LineChart, BrainCircuit, ShieldCheck } from "lucide-react";

export default function RabiHomeTeaser() {
  return (
    <section className="py-8">
      <div className="rounded-2xl border bg-white p-6 md:p-8">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          <div className="flex-1">
            <motion.p initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-xs font-semibold tracking-widest text-gray-600 uppercase">Centro de Inteligência Estratégica</motion.p>
            <motion.h3 initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">R.A.B.I — Radar AI Business Intelligence</motion.h3>
            <p className="text-gray-700 mt-2 max-w-2xl">Inteligência artificial aplicada ao nicho estético: interpreta, cruza e antecipa — para decisões com menos achismo e mais estratégia.</p>

            <div className="grid sm:grid-cols-3 gap-3 mt-5">
              <div className="p-4 rounded-xl border bg-gray-50">
                <LineChart className="w-5 h-5 text-[#2C2C2C]" />
                <p className="text-sm font-semibold mt-2">Comparado ao comum</p>
                <p className="text-xs text-gray-600">Não é um painel. É leitura estratégica.</p>
              </div>
              <div className="p-4 rounded-xl border bg-gray-50">
                <BrainCircuit className="w-5 h-5 text-[#2C2C2C]" />
                <p className="text-sm font-semibold mt-2">IA no contexto</p>
                <p className="text-xs text-gray-600">Camada invisível orientando hipóteses.</p>
              </div>
              <div className="p-4 rounded-xl border bg-gray-50">
                <ShieldCheck className="w-5 h-5 text-[#2C2C2C]" />
                <p className="text-sm font-semibold mt-2">Dados reais</p>
                <p className="text-xs text-gray-600">Baseado no mercado e no uso da plataforma.</p>
              </div>
            </div>

            <div className="mt-5">
              <Link to={createPageUrl("Radares")}>
                <Button className="bg-[#2C2C2C] text-[#F7D426] border-2 border-[#2C2C2C]">Acessar R.A.B.I</Button>
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-2/5 grid grid-cols-2 gap-3">
            {[
              { t: "IA aplicada ao nicho estético" },
              { t: "Análises exclusivas e interpretativas" },
              { t: "Benefícios competitivos para profissionais" },
              { t: "Dados reais de mercado (plataforma)" },
            ].map((i) => (
              <motion.div key={i.t} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-3 rounded-xl border bg-white shadow-sm text-sm text-gray-800">
                {i.t}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}