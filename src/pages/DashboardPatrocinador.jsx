
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Crown,
  Image as ImageIcon,
  ShoppingBag,
  Newspaper,
  TrendingUp,
  BarChart3,
  Eye,
  MousePointerClick, // Replaced MousePointer
  Share2,
  Package,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  ChevronRight,
  Sparkles, // Added
  ExternalLink, // Added
  Star, // Added for ads likes
  Download, // Added for report export
  Send, // Added for WhatsApp send
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input as InputUI } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { // Added for the new Table component in "Anúncios" tab
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


export default function DashboardPatrocinador() {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Added queryClient
  const [user, setUser] = useState(null);
  const [periodoRelatorio, setPeriodoRelatorio] = useState("tempo_real");
  
  // Paginação
  const [paginaBanners, setPaginaBanners] = useState(1);
  const [paginaProdutos, setPaginaProdutos] = useState(1);
  const [paginaPosts, setPaginaPosts] = useState(1); // Renamed from paginaArtigos
  const [paginaAnuncios, setPaginaAnuncios] = useState(1); // Added
  const itensPorPagina = 5; // Renamed and changed value from ITEMS_POR_PAGINA

  // WhatsApp export - Kept as per "preserve all other features"
  const [mostrarExportWhatsApp, setMostrarExportWhatsApp] = useState(false);
  const [numeroWhatsApp, setNumeroWhatsApp] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        
        const isPatrocinador = userData.plano_patrocinador && userData.plano_patrocinador !== 'nenhum';
        const isAdmin = userData.role === 'admin';
        
        if (!isPatrocinador && !isAdmin) {
          alert("Acesso negado! Esta área é exclusiva para Patrocinadores e Administradores.");
          navigate(createPageUrl("Inicio"));
          return;
        }
        
        setUser(userData);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        navigate(createPageUrl("Inicio"));
      }
      // Removed setLoading(false) as `loading` state was removed
    };
    fetchUser();
  }, [navigate]);

  const { data: meusBanners = [], refetch: refetchBanners } = useQuery({ // Renamed from banners
    queryKey: ['meus-banners', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Banner.filter({ created_by: user.email }, '-created_date', 100);
    },
    enabled: !!user,
  });

  const { data: meusProdutos = [], refetch: refetchProdutos } = useQuery({
    queryKey: ['meus-produtos-patrocinador', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Produto.filter({ created_by: user.email }, '-created_date', 100);
    },
    enabled: !!user,
  });

  const { data: meusPosts = [], refetch: refetchPosts } = useQuery({ // Renamed from meusArtigos
    queryKey: ['meus-posts-patrocinador', user?.email], // Updated key
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.ArtigoBlog.filter({ created_by: user.email }, '-created_date', 100);
    },
    enabled: !!user,
  });

  const { data: meusAnuncios = [], isLoading: isLoadingAnuncios, refetch: refetchAnuncios } = useQuery({ // NEW: Anuncios query
    queryKey: ['meus-anuncios', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Anuncio.filter({ created_by: user.email }, '-created_date', 100);
    },
    enabled: !!user,
  });

  const handleExcluirBanner = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este banner?")) return;
    
    try {
      await base44.entities.Banner.delete(id);
      queryClient.invalidateQueries(['meus-banners']); // Changed to invalidate query
    } catch (error) {
      console.error("Erro ao excluir banner:", error);
      alert("Erro ao excluir banner");
    }
  };

  const handleExcluirProduto = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    
    try {
      await base44.entities.Produto.delete(id);
      queryClient.invalidateQueries(['meus-produtos-patrocinador']); // Changed to invalidate query
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Erro ao excluir produto");
    }
  };

  const handleExcluirPost = async (id) => { // Renamed from handleExcluirArtigo
    if (!confirm("Tem certeza que deseja excluir este artigo?")) return;
    
    try {
      await base44.entities.ArtigoBlog.delete(id);
      queryClient.invalidateQueries(['meus-posts-patrocinador']); // Changed to invalidate query
    } catch (error) {
      console.error("Erro ao excluir artigo:", error);
      alert("Erro ao excluir artigo");
    }
  };

  const handleExcluirAnuncio = async (id) => { // NEW: Excluir Anuncio
    if (!confirm("Tem certeza que deseja excluir este anúncio?")) return;
    try {
      await base44.entities.Anuncio.delete(id);
      queryClient.invalidateQueries(['meus-anuncios']);
    } catch (error) {
      console.error("Erro ao excluir anúncio:", error);
      alert("Erro ao excluir anúncio");
    }
  };

  const gerarRelatorioHTML = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Performance - ${user?.full_name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 1200px; margin: 0 auto; }
          h1 { color: #7C3AED; border-bottom: 3px solid #7C3AED; padding-bottom: 10px; }
          .header { background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 30px; }
          .metric { background: #F3F4F6; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #7C3AED; }
          .metric h3 { margin: 0 0 10px 0; color: #374151; }
          .metric p { margin: 5px 0; font-size: 14px; }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
          .card { background: white; border: 2px solid #E5E7EB; padding: 15px; border-radius: 8px; }
          .card h4 { margin: 0 0 10px 0; color: #7C3AED; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #E5E7EB; padding: 12px 8px; text-align: left; font-size: 14px; }
          th { background: #7C3AED; color: white; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #E5E7EB; color: #6B7280; font-size: 12px; }
          @media print {
            .no-print { display: none; }
            body { padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; color: white; border: none;">📊 Relatório de Performance</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;"><strong>Período:</strong> ${periodoRelatorio.toUpperCase().replace('_', ' ')}</p>
        </div>
        
        <div style="background: #F9FAFB; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 5px 0;"><strong>Patrocinador:</strong> ${user?.full_name || user?.nome_empresa}</p>
          <p style="margin: 5px 0;"><strong>Plano:</strong> ${user?.plano_patrocinador?.toUpperCase()}</p>
          <p style="margin: 5px 0;"><strong>Data do Relatório:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
        
        <div class="grid">
          <div class="card">
            <h4>👁️ Visualizações</h4>
            <p style="font-size: 32px; font-weight: bold; color: #3B82F6; margin: 10px 0;">${totalVisualizacoesBanners.toLocaleString()}</p>
          </div>
          <div class="card">
            <h4>🖱️ Cliques</h4>
            <p style="font-size: 32px; font-weight: bold; color: #10B981; margin: 10px 0;">${totalCliquesBanners.toLocaleString()}</p>
          </div>
          <div class="card">
            <h4>📊 Taxa de Cliques (CTR)</h4>
            <p style="font-size: 32px; font-weight: bold; color: #8B5CF6; margin: 10px 0;">${totalVisualizacoesBanners > 0 ? ((totalCliquesBanners / totalVisualizacoesBanners) * 100).toFixed(2) : 0}%</p>
          </div>
          <div class="card">
            <h4>🎯 Conversões</h4>
            <p style="font-size: 32px; font-weight: bold; color: #F59E0B; margin: 10px 0;">${totalConversoes.toLocaleString()}</p>
          </div>
        </div>

        <div class="metric">
          <h3>🎨 Banners</h3>
          <p><strong>Total de Banners:</strong> ${meusBanners.length}</p>
          <p><strong>Banners Ativos:</strong> ${meusBanners.filter(b => b.status === 'ativo').length}</p>
          <p><strong>Banners Pausados:</strong> ${meusBanners.filter(b => b.status === 'pausado').length}</p>
          <p><strong>Total de Compartilhamentos:</strong> ${totalCompartilhamentos}</p>
          <p><strong>Banners Fechados por Usuários:</strong> ${meusBanners.reduce((acc, b) => acc + (b.metricas?.banners_fechados || 0), 0)}</p>
          <p><strong>Banners Pulados:</strong> ${meusBanners.reduce((acc, b) => acc + (b.metricas?.banners_pulados || 0), 0)}</p>
        </div>

        <div class="metric">
          <h3>🛍️ Produtos na Loja</h3>
          <p><strong>Total de Produtos:</strong> ${meusProdutos.length}</p>
          <p><strong>Produtos Ativos:</strong> ${meusProdutos.filter(p => p.status === 'ativo').length}</p>
          <p><strong>Produtos Inativos:</strong> ${meusProdutos.filter(p => p.status === 'inativo').length}</p>
          <p><strong>Produtos Esgotados:</strong> ${meusProdutos.filter(p => p.status === 'esgotado').length}</p>
        </div>

        <div class="metric">
          <h3>📰 Posts no Blog</h3>
          <p><strong>Total de Posts:</strong> ${meusPosts.length}</p>
          <p><strong>Posts Publicados:</strong> ${meusPosts.filter(a => a.status === 'publicado').length}</p>
          <p><strong>Posts Programados:</strong> ${meusPosts.filter(a => a.status === 'programado').length}</p>
          <p><strong>Total de Visualizações:</strong> ${meusPosts.reduce((acc, a) => acc + (a.visualizacoes || 0), 0)}</p>
          <p><strong>Total de Curtidas:</strong> ${meusPosts.reduce((acc, a) => acc + (a.total_curtidas || 0), 0)}</p>
        </div>

        <h2 style="margin-top: 40px; color: #374151;">📋 Detalhamento de Banners</h2>
        <table>
          <thead>
            <tr>
              <th>Banner</th>
              <th>Status</th>
              <th>Visualizações</th>
              <th>Cliques</th>
              <th>CTR</th>
              <th>Conversões</th>
            </tr>
          </thead>
          <tbody>
            ${meusBanners.map(b => `
              <tr>
                <td>${b.titulo}</td>
                <td>${b.status}</td>
                <td>${b.metricas?.visualizacoes || 0}</td>
                <td>${b.metricas?.cliques || 0}</td>
                <td>${b.metricas?.visualizacoes > 0 ? ((b.metricas?.cliques / b.metricas?.visualizacoes) * 100).toFixed(2) : 0}%</td>
                <td>${b.metricas?.conversoes_produtos || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p><strong>Mapa da Estética</strong> - Plataforma de Marketing para Profissionais de Estética</p>
          <p>Relatório gerado em ${new Date().toLocaleString('pt-BR')}</p>
          <p>www.mapadaestetica.com.br | Suporte: (31) 97259-5643</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-patrocinador-${periodoRelatorio}-${new Date().toISOString().split('T')[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);

    alert("📄 Relatório HTML baixado!\n\nPara converter em PDF:\n1. Abra o arquivo no navegador\n2. Pressione Ctrl+P (Cmd+P no Mac)\n3. Selecione 'Salvar como PDF'\n4. Clique em 'Salvar'");
  };

  const gerarMensagemWhatsApp = () => {
    const mensagem = `
📊 *RELATÓRIO DE PERFORMANCE*
*${periodoRelatorio.toUpperCase().replace('_', ' ')}*

👤 *Patrocinador:* ${user?.full_name || user?.nome_empresa}
🏆 *Plano:* ${user?.plano_patrocinador?.toUpperCase()}
📅 *Data:* ${new Date().toLocaleDateString('pt-BR')}

━━━━━━━━━━━━━━━━━━━━━
📈 *MÉTRICAS PRINCIPAIS*
━━━━━━━━━━━━━━━━━━━━━

👁️ *Visualizações:* ${totalVisualizacoesBanners.toLocaleString()}
🖱️ *Cliques:* ${totalCliquesBanners.toLocaleString()}
📊 *CTR:* ${totalVisualizacoesBanners > 0 ? ((totalCliquesBanners / totalVisualizacoesBanners) * 100).toFixed(2) : 0}%
📤 *Compartilhamentos:* ${totalCompartilhamentos.toLocaleString()}
🎯 *Conversões:* ${totalConversoes.toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━
🎨 *BANNERS*
━━━━━━━━━━━━━━━━━━━━━

📋 Total: ${meusBanners.length}
✅ Ativos: ${meusBanners.filter(b => b.status === 'ativo').length}
⏸️ Pausados: ${meusBanners.filter(b => b.status === 'pausado').length}
❌ Fechados por usuários: ${meusBanners.reduce((acc, b) => acc + (b.metricas?.banners_fechados || 0), 0)}
⏭️ Pulados: ${meusBanners.reduce((acc, b) => acc + (b.metricas?.banners_pulados || 0), 0)}

━━━━━━━━━━━━━━━━━━━━━
🛍️ *PRODUTOS NA LOJA*
━━━━━━━━━━━━━━━━━━━━━

📦 Total: ${meusProdutos.length}
✅ Ativos: ${meusProdutos.filter(p => p.status === 'ativo').length}
🎯 Conversões: ${totalConversoes}

━━━━━━━━━━━━━━━━━━━━━
📰 *POSTS NO BLOG*
━━━━━━━━━━━━━━━━━━━━━

📝 Total: ${meusPosts.length}
✅ Publicados: ${meusPosts.filter(a => a.status === 'publicado').length}
📅 Programados: ${meusPosts.filter(a => a.status === 'programado').length}
👁️ Visualizações: ${meusPosts.reduce((acc, a) => acc + (a.visualizacoes || 0), 0).toLocaleString()}
❤️ Curtidas: ${meusPosts.reduce((acc, a) => acc + (a.total_curtidas || 0), 0).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━
📱 *Mapa da Estética*
━━━━━━━━━━━━━━━━━━━━━
www.mapadaestetica.com.br
📞 Suporte: (31) 97259-5643
    `.trim();

    return mensagem;
  };

  const handleEnviarWhatsApp = () => {
    if (!numeroWhatsApp) {
      alert("Digite o número do WhatsApp");
      return;
    }

    const mensagem = gerarMensagemWhatsApp();
    const numeroLimpo = numeroWhatsApp.replace(/\D/g, '');
    const url = `https://wa.me/${numeroLimpo}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
    setMostrarExportWhatsApp(false);
    setNumeroWhatsApp(""); // Clear number after sending
  };

  // Removed `if (loading)` block

  const isAdmin = user?.role === 'admin';
  const planoNome = user?.plano_patrocinador === 'nenhum' ? 'Nenhum' : user?.plano_patrocinador?.toUpperCase() || "Grátis"; // Updated default

  // Métricas agregadas
  const totalVisualizacoesBanners = meusBanners.reduce((acc, b) => acc + (b.metricas?.visualizacoes || 0), 0);
  const totalCliquesBanners = meusBanners.reduce((acc, b) => acc + (b.metricas?.cliques || 0), 0);
  const totalCompartilhamentos = meusBanners.reduce((acc, b) => acc + (b.metricas?.compartilhamentos || 0), 0);
  const totalConversoes = meusBanners.reduce((acc, b) => acc + (b.metricas?.conversoes_produtos || 0), 0);

  // Paginação
  const bannersPaginados = meusBanners.slice((paginaBanners - 1) * itensPorPagina, paginaBanners * itensPorPagina);
  const produtosPaginados = meusProdutos.slice((paginaProdutos - 1) * itensPorPagina, paginaProdutos * itensPorPagina);
  const postsPaginados = meusPosts.slice((paginaPosts - 1) * itensPorPagina, paginaPosts * itensPorPagina); // Renamed
  const anunciosPaginados = meusAnuncios.slice((paginaAnuncios - 1) * itensPorPagina, paginaAnuncios * itensPorPagina); // Added

  const totalPaginasBanners = Math.ceil(meusBanners.length / itensPorPagina);
  const totalPaginasProdutos = Math.ceil(meusProdutos.length / itensPorPagina);
  const totalPaginasPosts = Math.ceil(meusPosts.length / itensPorPagina); // Renamed
  const totalPaginasAnuncios = Math.ceil(meusAnuncios.length / itensPorPagina); // Added

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header - Replaced */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
                Dashboard Patrocinador
              </h1>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Gerencie seus banners, produtos, posts e anúncios
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <Button
                onClick={() => navigate(createPageUrl("CriacaoBanner"))}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-10 text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Banner
              </Button>
              <Button
                onClick={() => navigate(createPageUrl("CadastrarAnuncio"))}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-10 text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Anúncio
              </Button>
            </div>
          </div>

          {user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Plano Atual</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {planoNome}
                      </p>
                    </div>
                    <Crown className="w-12 h-12 text-purple-600 opacity-80" />
                  </div>
                  {user.plano_patrocinador === 'nenhum' && (
                    <Button
                      size="sm"
                      className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => navigate(createPageUrl("Planos"))}
                    >
                      Contratar Plano
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Minha Marca</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {user.nome_empresa || user.full_name}
                      </p>
                    </div>
                    <Sparkles className="w-12 h-12 text-blue-600 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Métricas Principais - CARDS RESPONSIVOS (kept as per outline) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card className="border-none shadow-lg">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {totalVisualizacoesBanners.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Visualizações</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <MousePointerClick className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" /> {/* Changed icon */}
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {totalCliquesBanners.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Cliques</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <Share2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {totalCompartilhamentos.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Compartilhamentos</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {totalConversoes.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Conversões</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Conteúdo - Replaced TabsList, added new tabs */}
        <Tabs defaultValue="banners" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-6 h-auto gap-1"> {/* Adjusted grid for 5 items */}
            <TabsTrigger value="banners" className="text-xs sm:text-sm py-2 sm:py-2.5">
              <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Banners ({meusBanners.length})
            </TabsTrigger>
            <TabsTrigger value="posts" className="text-xs sm:text-sm py-2 sm:py-2.5"> {/* New Tab */}
              <Newspaper className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Posts ({meusPosts.length})
            </TabsTrigger>
            <TabsTrigger value="produtos" className="text-xs sm:text-sm py-2 sm:py-2.5"> {/* New Tab */}
              <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Produtos ({meusProdutos.length})
            </TabsTrigger>
            <TabsTrigger value="anuncios" className="text-xs sm:text-sm py-2 sm:py-2.5"> {/* New Tab */}
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Anúncios ({meusAnuncios.length})
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="text-xs sm:text-sm py-2 sm:py-2.5"> {/* Kept existing tab */}
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Tab Banners - COM PAGINAÇÃO E MÉTRICAS EXPANDIDAS */}
          <TabsContent value="banners">
            <Card className="border-none shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl">Meus Banners</CardTitle>
                  {totalPaginasBanners > 1 && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPaginaBanners(Math.max(1, paginaBanners - 1))}
                        disabled={paginaBanners === 1}
                        className="h-8 text-xs"
                      >
                        ←
                      </Button>
                      <span className="flex items-center px-3 text-xs sm:text-sm">
                        {paginaBanners} / {totalPaginasBanners}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPaginaBanners(Math.min(totalPaginasBanners, paginaBanners + 1))}
                        disabled={paginaBanners === totalPaginasBanners}
                        className="h-8 text-xs"
                      >
                        →
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {meusBanners.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
                    <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      Você ainda não criou nenhum banner
                    </p>
                    <Button
                      onClick={() => navigate(createPageUrl("CriacaoBanner"))}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-10 sm:h-11"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Banner
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bannersPaginados.map((banner) => (
                      <div key={banner.id} className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <div className="w-full sm:w-32 md:w-40 h-20 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={banner.imagem_banner} alt={banner.titulo} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-sm sm:text-base truncate">{banner.titulo}</h3>
                                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{banner.descricao}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={banner.status === 'ativo' ? 'bg-green-100 text-green-800 text-xs' : 'bg-gray-100 text-gray-800 text-xs'}>
                                    {banner.status}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    📅 {banner.dias_exibidos_mes_atual || 0}/{banner.dias_exibicao_mes || 0} dias este mês
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Métricas Detalhadas */}
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3 text-xs">
                              <div className="text-center">
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-auto mb-0.5" />
                                <p className="font-bold">{banner.metricas?.visualizacoes || 0}</p>
                                <p className="text-gray-500 text-xs">Views</p>
                              </div>
                              <div className="text-center">
                                <MousePointerClick className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-auto mb-0.5" /> {/* Changed icon */}
                                <p className="font-bold">{banner.metricas?.cliques || 0}</p>
                                <p className="text-gray-500 text-xs">Cliques</p>
                              </div>
                              <div className="text-center">
                                <Share2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-auto mb-0.5" />
                                <p className="font-bold">{banner.metricas?.compartilhamentos || 0}</p>
                                <p className="text-gray-500 text-xs">Shares</p>
                              </div>
                              <div className="text-center">
                                <Package className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-auto mb-0.5" />
                                <p className="font-bold">{banner.metricas?.conversoes_produtos || 0}</p>
                                <p className="text-gray-500 text-xs">Vendas</p>
                              </div>
                              <div className="text-center">
                                <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-auto mb-0.5" />
                                <p className="font-bold">{banner.metricas?.banners_fechados || 0}</p>
                                <p className="text-gray-500 text-xs">Fechado</p>
                              </div>
                              <div className="text-center">
                                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mx-auto mb-0.5" />
                                <p className="font-bold">{banner.metricas?.banners_pulados || 0}</p>
                                <p className="text-gray-500 text-xs">Pulado</p>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs h-8"
                                onClick={() => navigate(`${createPageUrl("CriacaoBanner")}?id=${banner.id}`)}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs h-8 text-red-600"
                                onClick={() => handleExcluirBanner(banner.id)}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Alerta de Limite */}
                    {meusBanners.length > 0 && (
                      <Alert className="mt-4 bg-purple-50 border-purple-200">
                        <AlertCircle className="h-4 w-4 text-purple-600" />
                        <AlertDescription className="text-purple-800 text-xs sm:text-sm">
                          📊 Você tem <strong>{meusBanners.length}</strong> banners cadastrados. 
                          {meusBanners.filter(b => b.status === 'ativo').length < (user?.plano_patrocinador === 'platina' ? 999 : 15) && 
                            ` Você ainda pode criar mais banners!`
                          }
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Posts - NEW */}
          <TabsContent value="posts">
            <Card className="border-none shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl">Meus Posts de Blog</CardTitle>
                  {totalPaginasPosts > 1 && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPaginaPosts(Math.max(1, paginaPosts - 1))}
                        disabled={paginaPosts === 1}
                        className="h-8 text-xs"
                      >
                        ←
                      </Button>
                      <span className="flex items-center px-3 text-xs sm:text-sm">
                        {paginaPosts} / {totalPaginasPosts}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPaginaPosts(Math.min(totalPaginasPosts, paginaPosts + 1))}
                        disabled={paginaPosts === totalPaginasPosts}
                        className="h-8 text-xs"
                      >
                        →
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {meusPosts.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
                    <Newspaper className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      Você ainda não publicou nenhum post no blog
                    </p>
                    <Button
                      onClick={() => navigate(createPageUrl("ArtigoBlog"))}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-10 sm:h-11"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Post
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {postsPaginados.map((post) => (
                      <div key={post.id} className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm sm:text-base truncate">{post.titulo}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={post.status === 'publicado' ? 'bg-green-100 text-green-800 text-xs' : 'bg-gray-100 text-gray-800 text-xs'}>
                                {post.status}
                              </Badge>
                              {post.status === 'programado' && (
                                <Badge variant="outline" className="text-xs">
                                  📅 {format(new Date(post.data_publicacao), 'dd/MM/yyyy', { locale: ptBR })}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mt-2">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" /> {post.visualizacoes || 0} Visualizações
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" /> {post.total_curtidas || 0} Curtidas
                              </span>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs h-8"
                                onClick={() => navigate(`${createPageUrl("ArtigoBlog")}?id=${post.id}`)}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs h-8 text-red-600"
                                onClick={() => handleExcluirPost(post.id)}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Produtos - NEW */}
          <TabsContent value="produtos">
            <Card className="border-none shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl">Meus Produtos</CardTitle>
                  {totalPaginasProdutos > 1 && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPaginaProdutos(Math.max(1, paginaProdutos - 1))}
                        disabled={paginaProdutos === 1}
                        className="h-8 text-xs"
                      >
                        ←
                      </Button>
                      <span className="flex items-center px-3 text-xs sm:text-sm">
                        {paginaProdutos} / {totalPaginasProdutos}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPaginaProdutos(Math.min(totalPaginasProdutos, paginaProdutos + 1))}
                        disabled={paginaProdutos === totalPaginasProdutos}
                        className="h-8 text-xs"
                      >
                        →
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {meusProdutos.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
                    <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      Você ainda não cadastrou nenhum produto
                    </p>
                    <Button
                      onClick={() => navigate(createPageUrl("AdicionarProduto"))}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-10 sm:h-11"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Primeiro Produto
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {produtosPaginados.map((produto) => (
                      <div key={produto.id} className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <div className="w-full sm:w-32 md:w-40 h-20 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {produto.imagens?.[0] && (
                              <img src={produto.imagens[0]} alt={produto.nome} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm sm:text-base truncate">{produto.nome}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {produto.preco ? `R$ ${produto.preco.toFixed(2)}` : produto.preco_texto || "Consultar"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={produto.status === 'ativo' ? 'bg-green-100 text-green-800 text-xs' : 'bg-gray-100 text-gray-800 text-xs'}>
                                {produto.status}
                              </Badge>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs h-8"
                                onClick={() => navigate(`${createPageUrl("AdicionarProduto")}?id=${produto.id}`)}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs h-8 text-red-600"
                                onClick={() => handleExcluirProduto(produto.id)}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOVA Aba: Anúncios */}
          <TabsContent value="anuncios">
            <Card className="border-none shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-pink-600" />
                    Meus Anúncios ({meusAnuncios.length})
                  </CardTitle>
                  <Button
                    onClick={() => navigate(createPageUrl("CadastrarAnuncio"))}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 h-10 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Anúncio
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {isLoadingAnuncios ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
                  </div>
                ) : meusAnuncios.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
                    <div className="text-6xl mb-4 text-gray-400">📢</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Nenhum anúncio cadastrado
                    </h3>
                    <p className="text-gray-600 mb-6 text-sm sm:text-base">
                      Crie anúncios no mapa para aumentar sua visibilidade
                    </p>
                    <Button
                      onClick={() => navigate(createPageUrl("CadastrarAnuncio"))}
                      className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 h-10 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Anúncio
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Visualizações</TableHead>
                            <TableHead>Curtidas</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {anunciosPaginados.map((anuncio) => (
                            <TableRow key={anuncio.id}>
                              <TableCell className="font-medium max-w-[200px]">
                                <p className="truncate text-sm">{anuncio.titulo}</p>
                                <p className="text-xs text-gray-500">{anuncio.profissional}</p>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">{anuncio.categoria}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  anuncio.status === 'ativo' ? 'bg-green-100 text-green-800 text-xs' :
                                  anuncio.status === 'pendente' ? 'bg-yellow-100 text-yellow-800 text-xs' :
                                  'bg-gray-100 text-gray-800 text-xs'
                                }>
                                  {anuncio.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                <div className="flex items-center gap-1">
                                  <Eye className="w-4 h-4 text-gray-400" />
                                  {anuncio.visualizacoes || 0}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-gray-400" />
                                  {anuncio.curtidas || 0}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => navigate(`${createPageUrl("DetalhesAnuncio")}?id=${anuncio.id}`)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => navigate(`${createPageUrl("EditarAnuncio")}?id=${anuncio.id}`)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 text-red-600"
                                    onClick={() => handleExcluirAnuncio(anuncio.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {totalPaginasAnuncios > 1 && (
                      <div className="flex justify-center gap-2 pt-4 border-t mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPaginaAnuncios(Math.max(1, paginaAnuncios - 1))}
                          disabled={paginaAnuncios === 1}
                          className="h-8 text-xs"
                        >
                          Anterior
                        </Button>
                        <span className="flex items-center px-3 text-xs sm:text-sm">
                          {paginaAnuncios} / {totalPaginasAnuncios}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPaginaAnuncios(Math.min(totalPaginasAnuncios, paginaAnuncios + 1))}
                          disabled={paginaAnuncios === totalPaginasAnuncios}
                          className="h-8 text-xs"
                        >
                          Próxima
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Relatórios - ATUALIZADO COM MÉTRICAS DE ENGAJAMENTO (kept as per outline) */}
          <TabsContent value="relatorios">
            <Card className="border-none shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <CardTitle className="text-lg sm:text-xl">Relatórios de Performance</CardTitle>
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                      <Button
                        size="sm"
                        variant={periodoRelatorio === "tempo_real" ? "default" : "outline"}
                        onClick={() => setPeriodoRelatorio("tempo_real")}
                        className="flex-shrink-0 h-8 sm:h-9 text-xs"
                      >
                        ⚡ Tempo Real
                      </Button>
                      <Button
                        size="sm"
                        variant={periodoRelatorio === "semanal" ? "default" : "outline"}
                        onClick={() => setPeriodoRelatorio("semanal")}
                        className="flex-shrink-0 h-8 sm:h-9 text-xs"
                      >
                        📅 Semanal
                      </Button>
                      <Button
                        size="sm"
                        variant={periodoRelatorio === "mensal" ? "default" : "outline"}
                        onClick={() => setPeriodoRelatorio("mensal")}
                        className="flex-shrink-0 h-8 sm:h-9 text-xs"
                      >
                        📊 Mensal
                      </Button>
                    </div>
                  </div>

                  {/* Botões de Exportação */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={gerarRelatorioHTML}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto h-9 text-xs sm:text-sm"
                    >
                      <Download className="w-3 h-3 mr-1.5" />
                      Exportar PDF
                    </Button>
                    <Button
                      onClick={() => setMostrarExportWhatsApp(true)}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto h-9 text-xs sm:text-sm"
                    >
                      <Send className="w-3 h-3 mr-1.5" />
                      Enviar WhatsApp
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Alcance dos Banners */}
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                    <h4 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      Alcance dos Banners
                    </h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Visualizações:</span>
                        <span className="font-bold text-blue-900">{totalVisualizacoesBanners}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Taxa de Cliques:</span>
                        <span className="font-bold text-blue-900">
                          {totalVisualizacoesBanners > 0 ? ((totalCliquesBanners / totalVisualizacoesBanners) * 100).toFixed(2) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Tempo Médio:</span>
                        <span className="font-bold text-blue-900">
                          {meusBanners.length > 0 ? Math.floor(meusBanners.reduce((acc, b) => acc + (b.metricas?.tempo_medio_visualizacao || 0), 0) / meusBanners.length) : 0}s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Produtos na Loja */}
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                    <h4 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      Produtos na Loja
                    </h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Total Produtos:</span>
                        <span className="font-bold text-purple-900">{meusProdutos.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Produtos Ativos:</span>
                        <span className="font-bold text-purple-900">
                          {meusProdutos.filter(p => p.status === 'ativo').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Conversões:</span>
                        <span className="font-bold text-purple-900">{totalConversoes}</span>
                      </div>
                    </div>
                  </div>

                  {/* Posts no Blog */}
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border-2 border-orange-200">
                    <h4 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
                      <Newspaper className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      Posts no Blog
                    </h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Total Posts:</span>
                        <span className="font-bold text-orange-900">{meusPosts.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Visualizações:</span>
                        <span className="font-bold text-orange-900">
                          {meusPosts.reduce((acc, a) => acc + (a.visualizacoes || 0), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Curtidas:</span>
                        <span className="font-bold text-orange-900">
                          {meusPosts.reduce((acc, a) => acc + (a.total_curtidas || 0), 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compartilhamentos */}
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                    <h4 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      Compartilhamentos
                    </h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Total:</span>
                        <span className="font-bold text-green-900">{totalCompartilhamentos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Alcance Estimado:</span>
                        <span className="font-bold text-green-900">
                          {(totalCompartilhamentos * 150).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Engajamento dos Banners */}
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border-2 border-red-200">
                    <h4 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                      Engajamento
                    </h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Taxa de Engajamento:</span>
                        <span className="font-bold text-red-900">
                          {totalVisualizacoesBanners > 0 
                            ? (((totalCliquesBanners + totalCompartilhamentos) / totalVisualizacoesBanners) * 100).toFixed(2) 
                            : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Banners Fechados:</span>
                        <span className="font-bold text-red-900">
                          {meusBanners.reduce((acc, b) => acc + (b.metricas?.banners_fechados || 0), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Banners Pulados:</span>
                        <span className="font-bold text-red-900">
                          {meusBanners.reduce((acc, b) => acc + (b.metricas?.banners_pulados || 0), 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert className="mt-6 bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-xs sm:text-sm">
                    📊 <strong>Relatórios {periodoRelatorio === 'tempo_real' ? 'em Tempo Real' : periodoRelatorio === 'semanal' ? 'Semanais' : 'Mensais'}</strong> - Dados atualizados constantemente
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal WhatsApp Export (kept as per "preserve all other features") */}
      <Dialog open={mostrarExportWhatsApp} onOpenChange={setMostrarExportWhatsApp}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Enviar Relatório via WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="whatsapp-number" className="text-sm sm:text-base">Número do WhatsApp (com DDD)</Label>
              <InputUI
                id="whatsapp-number"
                value={numeroWhatsApp}
                onChange={(e) => setNumeroWhatsApp(e.target.value)}
                placeholder="Ex: 5531999999999"
                className="mt-1.5 h-10 sm:h-11 text-sm sm:text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: Código do país + DDD + número (apenas números)
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setMostrarExportWhatsApp(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEnviarWhatsApp}
                disabled={!numeroWhatsApp}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                📱 Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
