
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Star, 
  Gift,
  TrendingUp,
  Award,
  Check
} from "lucide-react";

const categorias = [
  "Todas",
  "Cuidados com a Pele",
  "Maquiagem",
  "Cabelos",
  "Perfumaria",
  "Suplementos",
  "Equipamentos",
  "Acessórios",
  "Serviços Contratáveis",
  "Outros"
];

const servicosContrataveis = [
  {
    id: "google-negocios",
    nome: "Criação de Google Negócios Personalizado",
    descricao: "Tenha seu perfil profissional completo no Google com otimização SEO, fotos, descrições e tudo configurado para atrair mais clientes.",
    categoria: "Serviços Contratáveis",
    preco: 0, // Valor a definir
    preco_texto: "Consulte",
    imagens: ["https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80"],
    beneficios: [
      "Criação completa do perfil",
      "Otimização SEO local",
      "Upload de fotos profissionais",
      "Configuração de horários e serviços",
      "Integração com seu site/WhatsApp",
      "Suporte pós-criação"
    ],
    em_destaque: true,
    status: 'ativo'
  },
  {
    id: "geracao-imagens-ia",
    nome: "Geração de Imagens Profissionais com IA",
    descricao: "Imagens de alta qualidade geradas por inteligência artificial para seu anúncio. Imagens únicas, profissionais e personalizadas para destacar seu negócio.",
    categoria: "Serviços Contratáveis",
    preco: 0,
    preco_texto: "A partir de R$ 50",
    imagens: ["https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80"],
    beneficios: [
      "Até 10 imagens personalizadas",
      "Alta resolução e qualidade",
      "Entrega em até 24h",
      "Revisões ilimitadas",
      "Imagens exclusivas para seu negócio",
      "Suporte técnico incluso"
    ],
    em_destaque: true,
    status: 'ativo'
  }
];

export default function Produtos() {
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [ordenacao, setOrdenacao] = useState("relevancia");

  // CARREGAMENTO INSTANTÂNEO
  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ['produtos', categoriaFiltro, busca, ordenacao],
    queryFn: async () => {
      let filtros = { status: 'ativo' };
      
      if (categoriaFiltro && categoriaFiltro !== "Todas") {
        filtros.categoria = categoriaFiltro;
      }
      
      let ordem = '-created_date';
      if (ordenacao === 'menor_preco') ordem = 'preco';
      if (ordenacao === 'maior_preco') ordem = '-preco';
      if (ordenacao === 'mais_avaliados') ordem = '-media_avaliacoes';
      
      const todosProdutosAPI = await base44.entities.Produto.filter(filtros, ordem);

      return todosProdutosAPI;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    cacheTime: 30 * 60 * 1000, // 30 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    initialData: [],
  });

  const todosProdutos = [...produtos, ...servicosContrataveis];
  
  const produtosFiltrados = todosProdutos.filter(produto => {
    const matchCategoria = categoriaFiltro === "Todas" || produto.categoria === categoriaFiltro;
    const matchBusca = !busca || 
      produto.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      produto.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      produto.marca?.toLowerCase().includes(busca.toLowerCase());
    
    return matchCategoria && matchBusca;
  });

  const handleContratar = (servico) => {
    const mensagem = `Olá! Tenho interesse em contratar: ${servico.nome}. Gostaria de mais informações sobre valores e como funciona! 💼`;
    const whatsapp = "5531972595643";
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold">
            <Gift className="w-4 h-4 mr-2" />
            Marketplace Clube da Beleza
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Produtos com Pontos
          </h1>
          <p className="text-gray-600">
            Compre produtos e ganhe pontos para trocar por prêmios
          </p>
        </div>

        {/* Banner Informativo */}
        <Card className="mb-8 border-none shadow-lg bg-gradient-to-r from-[#F7D426] to-[#FFE066]">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-[#2C2C2C] rounded-2xl flex items-center justify-center flex-shrink-0">
                <Award className="w-8 h-8 text-[#F7D426]" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2">
                  Como Funciona o Sistema de Pontos?
                </h2>
                <p className="text-[#2C2C2C] mb-3">
                  Cada compra acumula pontos automaticamente. Troque seus pontos por produtos exclusivos ou descontos especiais!
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#2C2C2C] rounded-full flex items-center justify-center text-[#F7D426] font-bold">
                      ✓
                    </div>
                    <span className="text-sm text-[#2C2C2C] font-medium">Ganhe pontos a cada compra</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#2C2C2C] rounded-full flex items-center justify-center text-[#F7D426] font-bold">
                      ✓
                    </div>
                    <span className="text-sm text-[#2C2C2C] font-medium">Resgate produtos exclusivos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#2C2C2C] rounded-full flex items-center justify-center text-[#F7D426] font-bold">
                      ✓
                    </div>
                    <span className="text-sm text-[#2C2C2C] font-medium">Descontos especiais</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="p-6 mb-8 shadow-lg border-none">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ordenacao} onValueChange={setOrdenacao}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevancia">Mais Relevantes</SelectItem>
                <SelectItem value="menor_preco">Menor Preço</SelectItem>
                <SelectItem value="maior_preco">Maior Preço</SelectItem>
                <SelectItem value="mais_avaliados">Mais Avaliados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? 's' : ''} encontrado{produtosFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>
        </Card>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <Card key={i} className="h-96 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Em Breve!
            </h3>
            <p className="text-gray-600 mb-6">
              Estamos preparando produtos incríveis para você. Volte em breve!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[#F7D426]" />
                <p className="font-semibold text-sm">Lançamentos em Breve</p>
                <p className="text-xs text-gray-500">Produtos exclusivos</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Gift className="w-8 h-8 mx-auto mb-2 text-[#F7D426]" />
                <p className="font-semibold text-sm">Programa de Pontos</p>
                <p className="text-xs text-gray-500">Acumule e resgate</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Award className="w-8 h-8 mx-auto mb-2 text-[#F7D426]" />
                <p className="font-semibold text-sm">Descontos Exclusivos</p>
                <p className="text-xs text-gray-500">Para membros</p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {produtosFiltrados.map((produto) => (
              <Card
                key={produto.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none cursor-pointer group"
              >
                <div className="relative h-48 bg-gray-100">
                  {produto.imagens && produto.imagens[0] ? (
                    <img
                      src={produto.imagens[0]}
                      alt={produto.nome}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                      {produto.categoria === "Serviços Contratáveis" ? "💼" : "🛍️"}
                    </div>
                  )}
                  
                  {produto.em_destaque && (
                    <Badge className="absolute top-2 left-2 bg-[#F7D426] text-[#2C2C2C] border-none">
                      Destaque
                    </Badge>
                  )}

                  {produto.preco_promocional && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white border-none">
                      Promoção
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  {produto.marca && (
                    <p className="text-xs text-gray-500 mb-1">{produto.marca}</p>
                  )}
                  
                  <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                    {produto.nome}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {produto.descricao}
                  </p>

                  {produto.beneficios && (
                    <div className="mb-3 space-y-1">
                      {produto.beneficios.slice(0, 3).map((beneficio, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                          <Check className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{beneficio}</span>
                        </div>
                      ))}
                      {produto.beneficios.length > 3 && (
                        <p className="text-xs text-gray-500">+{produto.beneficios.length - 3} benefícios</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      {produto.categoria === "Serviços Contratáveis" ? (
                        <p className="text-lg font-bold text-blue-600">
                          {produto.preco_texto || "Consulte"}
                        </p>
                      ) : produto.preco_promocional ? (
                        <div>
                          <p className="text-xs text-gray-500 line-through">
                            R$ {produto.preco.toFixed(2)}
                          </p>
                          <p className="text-lg font-bold text-pink-600">
                            R$ {produto.preco_promocional.toFixed(2)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-lg font-bold text-gray-900">
                          R$ {produto.preco.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => produto.categoria === "Serviços Contratáveis" 
                        ? handleContratar(produto) 
                        : null
                      }
                      className={produto.categoria === "Serviços Contratáveis" 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold"
                      }
                    >
                      {produto.categoria === "Serviços Contratáveis" ? "Contratar" : <ShoppingCart className="w-4 h-4" />}
                    </Button>
                  </div>

                  {produto.pontos_ganhos > 0 && (
                    <div className="mt-2 text-xs text-center bg-green-50 text-green-700 py-1 rounded">
                      +{produto.pontos_ganhos} pontos nesta compra
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#F7D426] rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-[#2C2C2C]" />
              </div>
              <h3 className="font-bold mb-2">Ganhe Pontos</h3>
              <p className="text-sm text-gray-600">
                Acumule pontos em cada compra e troque por produtos
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#F7D426] rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-[#2C2C2C]" />
              </div>
              <h3 className="font-bold mb-2">Descontos Exclusivos</h3>
              <p className="text-sm text-gray-600">
                Membros do clube têm descontos especiais
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#F7D426] rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-[#2C2C2C]" />
              </div>
              <h3 className="font-bold mb-2">Novidades Sempre</h3>
              <p className="text-sm text-gray-600">
                Produtos novos adicionados regularmente
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
