import React from "react";
import { motion } from "framer-motion";

export default function HomeSectionDivider({ title }) {
  return (
    <div className="flex items-center gap-3 mt-10 mb-4">
      <motion.div initial={{ width: 0 }} whileInView={{ width: 36 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="h-1 bg-[#F7D426] rounded" />
      <h3 className="text-sm uppercase tracking-widest text-gray-500 font-semibold">{title}</h3>
    </div>
  );
}