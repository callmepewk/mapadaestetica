import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, ShieldCheck, Sparkles } from "lucide-react";
import ImageWithLoader from "../common/ImageWithLoader";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function HeroPremium() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF9E6] via-white to-[#F7D426]/20 border-2 border-[#F7D426]/40">
      <div className="absolute -top-32 -right-24 w-80 h-80 bg-[#F7D426]/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-24 w-72 h-72 bg-[#F7D426]/20 rounded-full blur-3xl" />

      <div className="grid lg:grid-cols-2 gap-6 p-6 md:p-10">
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-[#F7D426] border-2 border-[#F7D426] mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold">Plataforma viva, inteligente e geolocalizada</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              A plataforma mais confiável e avançada para encontrar profissionais de estética no Brasil
            </h1>
            <p className="text-gray-700 mt-4 max-w-xl">
              Precisão geográfica, inteligência artificial e curadoria técnica rigorosa em uma experiência imersiva. Segurança, qualidade e dados que geram decisões.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link to={createPageUrl("Mapa")}>
                <Button className="bg-[#2C2C2C] text-[#F7D426] border-2 border-[#2C2C2C]">
                  <MapPin className="w-4 h-4 mr-2" /> Explorar no Mapa
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-2"
                onClick={() => document.getElementById('validacao-qualidade')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <ShieldCheck className="w-4 h-4 mr-2" /> Como validamos profissionais
              </Button>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative z-10">
          <div className="rounded-xl border-2 overflow-hidden shadow-xl bg-white">
            <div className="h-64 md:h-80 relative">
              <ImageWithLoader
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop"
                alt="Mapa interativo"
                className="w-full h-full object-cover"
              />
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur rounded-lg border p-3 flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <p className="text-sm text-gray-800">Geolocalização precisa + IA destacam os melhores profissionais perto de você</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}