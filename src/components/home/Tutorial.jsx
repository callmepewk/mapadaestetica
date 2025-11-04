
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, 
  Search, 
  FileText, 
  CheckCircle,
  ArrowRight,
  PlayCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const etapas = [
  {
    numero: 1,
    titulo: "Crie sua Conta",
    descricao: "Cadastre-se gratuitamente em segundos",
    icone: UserPlus,
    cor: "from-blue-500 to-cyan-500",
    imagem: "https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=400&q=80"
  },
  {
    numero: 2,
    titulo: "Explore Profissionais",
    descricao: "Busque por categoria ou localização",
    icone: Search,
    cor: "from-purple-500 to-pink-500",
    imagem: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80"
  },
  {
    numero: 3,
    titulo: "Cadastre seu Anúncio",
    descricao: "Preencha suas informações e serviços",
    icone: FileText,
    cor: "from-orange-500 to-amber-500",
    imagem: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80"
  },
  {
    numero: 4,
    titulo: "Comece a Receber Clientes",
    descricao: "Seu anúncio estará visível para milhares",
    icone: CheckCircle,
    cor: "from-green-500 to-emerald-500",
    imagem: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&q=80"
  }
];

export default function Tutorial() {
  const [etapaAtiva, setEtapaAtiva] = useState(0);
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Helper function to generate page URLs
  const createPageUrl = (pageName) => {
    switch (pageName) {
      case "CadastrarAnuncio":
        return "/cadastrar-anuncio"; // Replace with your actual route for "CadastrarAnuncio"
      default:
        return "/"; // Default fallback route
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-pink-50 to-rose-50"> {/* Updated section className */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold">
            <PlayCircle className="w-4 h-4 mr-2" />
            Tutorial
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-[#2C2C2C] mb-4">
            Como Funciona?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Comece a usar o Mapa da Estética em 4 passos simples
          </p>
        </div>

        {/* Timeline Desktop */}
        <div className="hidden md:block mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
            <div 
              className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#F7D426] to-[#FFE066] transition-all duration-500 -z-10"
              style={{ width: `${(etapaAtiva / (etapas.length - 1)) * 100}%` }}
            ></div>
            
            {etapas.map((etapa, index) => {
              const Icon = etapa.icone;
              return (
                <button
                  key={index}
                  onClick={() => setEtapaAtiva(index)}
                  className={`relative z-10 flex flex-col items-center transition-all ${
                    index <= etapaAtiva ? '' : 'opacity-50'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all ${
                    index === etapaAtiva 
                      ? `bg-gradient-to-br ${etapa.cor} shadow-xl scale-110` 
                      : index < etapaAtiva
                      ? 'bg-[#F7D426]'
                      : 'bg-gray-200'
                  }`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <span className={`text-sm font-semibold text-center max-w-[120px] ${
                    index === etapaAtiva ? 'text-[#2C2C2C]' : 'text-gray-500'
                  }`}>
                    {etapa.titulo}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="md:hidden mb-8 space-y-4">
          {etapas.map((etapa, index) => {
            const Icon = etapa.icone;
            return (
              <button
                key={index}
                onClick={() => setEtapaAtiva(index)}
                className={`w-full flex items-center gap-4 p-4 rounded-lg transition-all ${
                  index === etapaAtiva 
                    ? 'bg-[#FFF9E6] border-2 border-[#F7D426]' 
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  index === etapaAtiva 
                    ? `bg-gradient-to-br ${etapa.cor}` 
                    : index < etapaAtiva
                    ? 'bg-[#F7D426]'
                    : 'bg-gray-200'
                }`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-[#2C2C2C]">{etapa.titulo}</p>
                  <p className="text-sm text-gray-600">{etapa.descricao}</p>
                </div>
                {index === etapaAtiva && (
                  <ArrowRight className="w-5 h-5 text-[#F7D426]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={etapaAtiva}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-none shadow-2xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={etapas[etapaAtiva].imagem}
                    alt={etapas[etapaAtiva].titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${etapas[etapaAtiva].cor}`}>
                    <span className="text-white font-bold text-xl">{etapas[etapaAtiva].numero}</span>
                  </div>
                </div>

                <CardContent className="p-8 md:p-12 flex flex-col justify-center">
                  <Badge className={`mb-4 w-fit bg-gradient-to-r ${etapas[etapaAtiva].cor} text-white border-none`}>
                    Passo {etapas[etapaAtiva].numero}
                  </Badge>
                  <h3 className="text-3xl font-bold text-[#2C2C2C] mb-4">
                    {etapas[etapaAtiva].titulo}
                  </h3>
                  <p className="text-gray-600 text-lg mb-6">
                    {etapas[etapaAtiva].descricao}
                  </p>

                  {etapaAtiva === 0 && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-gray-700">Cadastro gratuito e rápido</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-gray-700">Acesso a todos os profissionais</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-gray-700">Perfil personalizado</p>
                      </div>
                    </div>
                  )}

                  {etapaAtiva === 1 && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-gray-700">Busque por categoria ou localização</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-gray-700">Veja avaliações e portfólios</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-gray-700">Entre em contato direto via WhatsApp</p>
                      </div>
                    </div>
                  )}

                  {etapaAtiva === 2 && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-gray-700">Adicione fotos e descrição dos serviços</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-gray-700">Defina preços e horários</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-gray-700">Publicação em até 24 horas</p>
                      </div>
                    </div>
                  )}

                  {etapaAtiva === 3 && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-gray-700">Visibilidade para milhares de usuários</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-gray-700">Receba contatos diretos de clientes</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-gray-700">Acompanhe estatísticas do seu anúncio</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-8">
                    {etapaAtiva > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => setEtapaAtiva(etapaAtiva - 1)}
                      >
                        Anterior
                      </Button>
                    )}
                    {etapaAtiva < etapas.length - 1 ? (
                      <Button
                        onClick={() => setEtapaAtiva(etapaAtiva + 1)}
                        className="bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold"
                      >
                        Próximo
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => navigate(createPageUrl("CadastrarAnuncio"))} // Updated onClick
                        size="lg" // Added size prop
                        className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700" // Updated className
                      >
                        Começar Agora
                        <ArrowRight className="w-5 h-5 ml-2" /> {/* Changed icon and size */}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
