import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function RabiExpandableCard({ title, teaser, children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }} className="rounded-2xl border bg-white overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full text-left p-4 md:p-5 flex items-center justify-between hover:bg-gray-50">
        <div>
          <h4 className="text-lg font-bold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{teaser}</p>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-700 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="p-4 md:p-5 border-t bg-gradient-to-br from-gray-50 to-white text-sm text-gray-800">
          {children}
        </div>
      )}
    </motion.div>
  );
}