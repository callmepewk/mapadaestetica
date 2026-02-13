import React from "react";
import { motion } from "framer-motion";
import { IdCard, BadgeCheck, LineChart } from "lucide-react";

export default function ValidationThreeSteps() {
  const steps = [
    {
      icon: IdCard,
      title: "Verificação documental",
      text: "Licenças e registros profissionais validados.",
    },
    {
      icon: BadgeCheck,
      title: "Análise técnica e reputacional",
      text: "Curadoria por especialistas e histórico de atendimento.",
    },
    {
      icon: LineChart,
      title: "Monitoramento contínuo por IA",
      text: "Detecção de padrões e alertas de qualidade em tempo real.",
    },
  ];

  return (
    <section className="mt-10">
      <div className="rounded-2xl border bg-white p-6 md:p-8">
        <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-2xl md:text-3xl font-extrabold text-gray-900">
          Processo de Qualidade Técnica
        </motion.h2>
        <p className="text-gray-600 mt-2">Transparente, rigoroso e contínuo — sem burocracia para o usuário.</p>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {steps.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.05 }} className="p-5 rounded-xl border bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#FFF9E6] border">
                  <s.icon className="w-5 h-5 text-[#2C2C2C]" />
                </div>
                <h3 className="font-bold text-gray-900">{s.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mt-2">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}