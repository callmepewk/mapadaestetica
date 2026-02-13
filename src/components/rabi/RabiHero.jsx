import React from "react";
import { motion } from "framer-motion";

export default function RabiHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-white">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F7D426]/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#F7D426]/10 rounded-full blur-3xl" />

      <div className="relative p-6 md:p-10">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-xs font-semibold tracking-widest text-gray-600 uppercase">
          Centro de Inteligência Estratégica
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.05 }} className="mt-2 text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          R.A.B.I
        </motion.h1>
        <motion.h2 initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-lg md:text-2xl font-semibold text-gray-800">
          Radar AI Business Intelligence
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.15 }} className="mt-3 max-w-2xl text-gray-700">
          Inteligência artificial aplicada à leitura estratégica do seu negócio.
        </motion.p>
      </div>
    </section>
  );
}