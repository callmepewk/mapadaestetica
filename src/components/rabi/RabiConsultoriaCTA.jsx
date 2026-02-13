import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Wand2 } from "lucide-react";

export default function RabiConsultoriaCTA() {
  const wa = `https://wa.me/5521980343873?text=${encodeURIComponent("Olá, tenho interesse na consultoria de análise de métricas do Mapa da Estética.")}`;
  return (
    <section className="mt-10">
      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="rounded-2xl border bg-gradient-to-br from-gray-50 to-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="p-3 rounded-xl bg-[#FFF9E6] border">
            <Wand2 className="w-6 h-6 text-[#2C2C2C]" />
          </div>
          <div className="flex-1">
            <p className="text-sm uppercase tracking-widest text-gray-600 font-semibold">Consultoria Estratégica</p>
            <h4 className="text-xl md:text-2xl font-extrabold text-gray-900 mt-1">Deseja aprofundar a leitura estratégica do seu negócio?</h4>
            <p className="text-gray-700 mt-2">Análise personalizada com apoio humano especializado. Inteligência aplicada às suas métricas — com discrição e objetividade.</p>
            <p className="text-gray-500 text-sm mt-2">Consultor: Dr Jauru Nunes de Freitas • MD em Marketing • Médico (UFRGS) • Dermatologia (La Sapienza – Roma)</p>
          </div>
          <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow">
            <MessageCircle className="w-4 h-4" /> Falar com consultor
          </a>
        </div>
      </motion.div>
    </section>
  );
}