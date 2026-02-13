import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Scale, FileCheck } from "lucide-react";

export default function AuthorityStrip() {
  const items = [
    { icon: ShieldCheck, title: "Conformidade LGPD", text: "Proteção de dados e governança digital." },
    { icon: FileCheck, title: "Boas práticas ANVISA", text: "Padrões de segurança e qualidade." },
    { icon: Scale, title: "Padrões UNESCO", text: "Compromisso com ética e educação.", },
  ];
  return (
    <section className="mt-8">
      <div className="rounded-2xl border bg-white overflow-hidden">
        <div className="grid md:grid-cols-3">
          {items.map((it, i) => (
            <motion.div key={it.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }} className="p-5 border-r last:border-r-0">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#FFF9E6] border">
                  <it.icon className="w-5 h-5 text-[#2C2C2C]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{it.title}</h4>
                  <p className="text-sm text-gray-600">{it.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}