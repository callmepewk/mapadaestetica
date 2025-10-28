import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Search, 
  MapPin, 
  ArrowRight,
  Sparkles,
  Clock,
  Star,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CardAnuncio from "../components/anuncios/CardAnuncio";
import CardCategoria from "../components/home/CardCategoria";

const categorias = [
  { nome: "Depilação", cor: "from-pink-500 to-rose-500", icon: "✨" },
  { nome: "Estética Facial", cor: "from-purple-500 to-pink-500", icon: "💆" },
  { nome: "Estética Corporal", cor: "from-blue-500 to-cyan-500", icon: "💪" },
  { nome: "Massoterapia", cor: "from-green-500 to-emerald-500", icon: "🌿" },
  { nome: "Micropigmentação", cor: "from-orange-500 to-amber-500", icon: "🎨" },
  { nome: "Design de Sobrancelhas", cor: "from-indigo-500 to-purple-500", icon: "👁️" },
  { nome: "Manicure e Pedicure", cor: "from-red-500 to-pink-500", icon: "💅" },
  { nome: "Harmonização Facial", cor: "from-violet-500 to-purple-500", icon: "✨" }
];

const cidades = [
  "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Brasília", 
  "Curitiba", "Porto Alegre", "Salvador", "Fortaleza"
];

export default function Inicio() {
  const [buscaCidade, setBuscaCidade] = useState("");
  const [buscaCategoria, setBuscaCategoria] = useState("");

  const { data: anunciosDestaque, isLoading } = useQuery({
    queryKey: ['anuncios-destaque'],
    queryFn: () => base44.entities.Anuncio.filter(
      { status: 'ativo', em_destaque: true },
      '-visualizacoes',
      6
    ),
    initialData: [],
  });

  const { data: anunciosRecentes } = useQuery({
    queryKey: ['anuncios-recentes'],
    queryFn: () => base44.entities.Anuncio.filter(
      { status: 'ativo' },
      '-created_date',
      9
    ),
    initialData: [],
  });

  const handleBuscar = () => {
    const params = new URLSearchParams();
    if (buscaCidade) params.append('cidade', buscaCidade);
    if (buscaCategoria) params.append('categoria', buscaCategoria);
    window.location.href = createPageUrl("Anuncios") + (params.toString() ? `?${params.toString()}` : '');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-600 via-rose-500 to-pink-500 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-rose-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Mais de 500+ profissionais cadastrados</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Explore a sua cidade!
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-2xl mx-auto">
            Os melhores serviços e especialistas você encontra aqui
          </p>

          {/* Search Box */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Cidade, ex: São Paulo"
                  value={buscaCidade}
                  onChange={(e) => setBuscaCidade(e.target.value)}
                  className="pl-10 h-12 text-gray-800 border-gray-200"
                />
              </div>
              
              <Select value={buscaCategoria} onValueChange={setBuscaCategoria}>
                <SelectTrigger className="h-12 text-gray-800">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.nome} value={cat.nome}>
                      {cat.icon} {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                onClick={handleBuscar}
                className="h-12 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Search className="w-5 h-5 mr-2" />
                Buscar
              </Button>
            </div>
          </div>

          {/* Quick Cities */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <span className="text-white/80 text-sm">Cidades populares:</span>
            {cidades.slice(0, 5).map((cidade) => (
              <button
                key={cidade}
                onClick={() => {
                  setBuscaCidade(cidade);
                  handleBuscar();
                }}
                className="text-sm bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full transition-all"
              >
                {cidade}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Categorias Especiais
            </h2>
            <p className="text-gray-600 text-lg">
              Explore os melhores profissionais em cada área
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categorias.map((categoria, index) => (
              <CardCategoria key={index} categoria={categoria} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold text-pink-600 uppercase tracking-wide">
                  Separamos para você
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Profissionais em Destaque
              </h2>
            </div>
            <Link to={createPageUrl("Anuncios")}>
              <Button variant="outline" className="hidden md:flex items-center gap-2">
                Ver Todos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="h-80 animate-pulse bg-gray-100" />
              ))
            ) : (
              anunciosDestaque.map((anuncio) => (
                <CardAnuncio key={anuncio.id} anuncio={anuncio} destaque />
              ))
            )}
          </div>

          <div className="text-center mt-8">
            <Link to={createPageUrl("Anuncios")}>
              <Button className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white">
                <Search className="w-4 h-4 mr-2" />
                Ver Mais Anúncios
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-6 h-6 text-pink-600" />
              <span className="text-sm font-semibold text-pink-600 uppercase tracking-wide">
                Novidades
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todos os Dias Novos Profissionais
            </h2>
            <p className="text-gray-600 text-lg">
              Procuramos sempre indicar para você o que há de novo no mapa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {anunciosRecentes.map((anuncio) => (
              <CardAnuncio key={anuncio.id} anuncio={anuncio} />
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6 text-pink-600" />
              <span className="text-sm font-semibold text-pink-600 uppercase tracking-wide">
                Fique por dentro
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Do Universo da Estética
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
              Acompanhe as últimas tendências, novidades e dicas do mundo da estética e beleza
            </p>
            <Link to={createPageUrl("Blog")}>
              <Button size="lg" className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white">
                Acessar Blog
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 to-rose-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Você é um profissional da estética?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Cadastre-se gratuitamente e comece a receber clientes hoje mesmo!
          </p>
          <Link to={createPageUrl("CadastrarAnuncio")}>
            <Button size="lg" className="bg-white text-pink-600 hover:bg-gray-100 font-semibold shadow-xl">
              Cadastrar Meu Anúncio Grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}