import React from "react";
import { motion } from "framer-motion";

const items = [
  "Dados não bastam. Interpretação decide.",
  "Veja padrões antes que virem tendência.",
  "Inteligência que antecipa, não apenas reage.",
  "Menos achismo. Mais decisão.",
];

export default function RabiMicrocopyStrip() {
  return (
    <section className="mt-4">
      <div className="grid md:grid-cols-4 gap-3">
        {items.map((t, i) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className="p-3 rounded-xl border bg-white shadow-sm"
          >
            <p className="text-sm text-gray-800">{t}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}