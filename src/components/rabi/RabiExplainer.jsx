import React from "react";
import { motion } from "framer-motion";

export default function RabiExplainer() {
  return (
    <section className="mt-6">
      <div className="rounded-2xl border bg-white p-5 md:p-6">
        <motion.p initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }} className="text-gray-700">
          O R.A.B.I interpreta, cruza e prevê. Em tempo real, identifica padrões de comportamento, conecta métricas de mercado e apoia decisões estratégicas com uma camada invisível de IA.
        </motion.p>
        <ul className="mt-3 grid md:grid-cols-2 gap-2 text-sm text-gray-700">
          {[
            "Analisa dados em tempo real",
            "Identifica padrões de comportamento",
            "Cruza métricas de mercado",
            "Apoia decisões estratégicas",
            "IA como camada invisível",
          ].map((li) => (
            <motion.li key={li} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="p-2 rounded-lg bg-gray-50 border">
              {li}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}