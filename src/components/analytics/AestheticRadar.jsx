import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Eye, Heart, Megaphone, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import TrendRadar from "./TrendRadar/TrendRadar";

export default function AestheticRadar({ title = "Aesthetic Radar", subtitle = "Tendências e interações em tempo real", stats = {} }) {
  const items = [
    { label: "Visualizações", value: stats.views || 0, Icon: Eye, color: "from-blue-500 to-cyan-500" },
    { label: "Curtidas", value: stats.likes || 0, Icon: Heart, color: "from-pink-500 to-rose-500" },
    { label: "Campanhas (views)", value: stats.campaignViews || 0, Icon: Megaphone, color: "from-amber-500 to-yellow-500" },
    { label: "Em Alta", value: stats.trending || 0, Icon: TrendingUp, color: "from-violet-500 to-purple-500" },
  ];

  return (
    <section className="py-10">
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 text-white text-[10px] md:text-xs px-2.5 py-1"><TrendingUp className="w-3 h-3"/> Estatísticas em Tempo Real</span>
        <h2 className="text-xl md:text-3xl font-bold mt-2">{title}</h2>
        <p className="text-gray-600 text-xs md:text-sm mt-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {items.map((it, idx) => (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 overflow-hidden">
              <CardHeader className={`pb-2 bg-gradient-to-r ${it.color} text-white`}>
                <CardTitle className="text-sm flex items-center gap-2"><it.Icon className="w-4 h-4"/>{it.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.p
                  key={it.value}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 14 }}
                  className="text-2xl font-extrabold"
                >
                  {it.value}
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-2">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-pink-500"/> Tendências Agora</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendRadar />
        </CardContent>
      </Card>
    </section>
  );
}