import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle, ArrowRight, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CardAnuncio from "../anuncios/CardAnuncio";

const passos = [
  {
    numero: 1,
    titulo: "Cadastre-se Gratuitamente",
    descricao: "Crie sua conta em menos de 2 minutos e comece com o plano COBRE gratuito",
    icone: "✨"
  },
  {
    numero: 2,
    titulo: "Complete Seu Perfil",
    descricao: "Adicione suas informações profissionais, especialidades e fotos",
    icone: "📝"
  },
  {
    numero: 3,
    titulo: "Publique Seu Anúncio",
    descricao: "Use nossas ferramentas de IA para criar anúncios profissionais em minutos",
    icone: "🚀"
  },
  {
    numero: 4,
    titulo: "Receba Clientes",
    descricao: "Apareça nas buscas e comece a receber contatos de novos clientes",
    icone: "💰"
  }
];

export default function Tutorial() {
  const [videoAberto, setVideoAberto] = useState(false);
  const [mostrarExemplos, setMostrarExemplos] = useState(false);
  const [anunciosExemplo, setAnunciosExemplo] = useState([]);
  const [loading, setLoading] = useState(false);

  const carregarExemplos = async () => {
    setLoading(true);
    try {
      const anuncios = await base44.entities.Anuncio.filter(
        { status: 'ativo', plano: { $in: ['ouro', 'diamante', 'platina'] } },
        '-created_date',
        6
      );
      setAnunciosExemplo(anuncios);
      setMostrarExemplos(true);
    } catch (error) {
      console.error("Erro ao carregar exemplos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-600 text-white">
            Tutorial Rápido
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Como Começar no Mapa da Estética
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Siga estes 4 passos simples e comece a atrair mais clientes hoje mesmo
          </p>
        </div>

        {/* Passos do Tutorial */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {passos.map((passo, index) => (
            <motion.div
              key={passo.numero}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-none shadow-lg hover:shadow-xl transition-all h-full">
                <CardContent className="p-6">
                  <div className="text-5xl mb-4 text-center">{passo.icone}</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
                    {passo.numero}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                    {passo.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    {passo.descricao}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            onClick={() => setVideoAberto(true)}
            size="lg"
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold"
          >
            <Play className="w-5 h-5 mr-2" />
            Assistir Vídeo Tutorial
          </Button>

          <Button
            onClick={carregarExemplos}
            size="lg"
            variant="outline"
            disabled={loading}
            className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-bold"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                Carregando...
              </>
            ) : (
              <>
                <Star className="w-5 h-5 mr-2" />
                Veja Exemplos de Anúncios
              </>
            )}
          </Button>
        </div>

        {/* Seção de Exemplos */}
        <AnimatePresence>
          {mostrarExemplos && anunciosExemplo.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <Badge className="mb-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    Exemplos Reais
                  </Badge>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Anúncios de Sucesso
                  </h3>
                  <p className="text-gray-600">
                    Veja como profissionais estão se destacando na plataforma
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {anunciosExemplo.map((anuncio) => (
                    <CardAnuncio key={anuncio.id} anuncio={anuncio} destaque={true} />
                  ))}
                </div>

                <div className="text-center mt-8">
                  <Button
                    onClick={() => window.location.href = '/anuncios'}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Ver Mais Anúncios
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Benefícios */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold mb-2">100% Gratuito para Começar</h3>
              <p className="text-sm text-gray-600">
                Comece sem compromisso e faça upgrade quando quiser
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Assistência com IA</h3>
              <p className="text-sm text-gray-600">
                Ferramentas inteligentes para criar anúncios profissionais
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-bold mb-2">Suporte Dedicado</h3>
              <p className="text-sm text-gray-600">
                Nossa equipe está sempre pronta para ajudar você
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Vídeo */}
      {videoAberto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setVideoAberto(false)}>
          <div className="bg-white rounded-2xl p-4 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Tutorial em Vídeo</h3>
              <Button variant="ghost" onClick={() => setVideoAberto(false)}>✕</Button>
            </div>
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              <p className="text-white">Vídeo tutorial em breve...</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}