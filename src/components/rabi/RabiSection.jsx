import React from "react";
import { motion } from "framer-motion";

export default function RabiSection({ title, subtitle, children }) {
  return (
    <section className="mt-8">
      <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <h3 className="text-2xl font-extrabold text-gray-900">{title}</h3>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </motion.div>
      <div className="mt-4 rounded-2xl border bg-white p-4 md:p-6">
        {children}
      </div>
    </section>
  );
}