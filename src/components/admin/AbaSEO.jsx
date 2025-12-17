import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ExternalLink, Activity, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AbaSEO = () => {
  const { data: anuncios = [] } = useQuery({ queryKey: ['seo-anuncios'], queryFn: () => base44.entities.Anuncio.list('-created_date', 1000), staleTime: 0 });
  const { data: posts = [] } = useQuery({ queryKey: ['seo-posts'], queryFn: () => base44.entities.ArtigoBlog.list('-created_date', 500), staleTime: 0 });
  const { data: banners = [] } = useQuery({ queryKey: ['seo-banners'], queryFn: () => base44.entities.Banner.list('-created_date', 500), staleTime: 0 });
  const { data: users = [] } = useQuery({ queryKey: ['seo-users'], queryFn: () => base44.entities.User.list('-created_date', 2000), staleTime: 0 });

  const totalViews = anuncios.reduce((s,a)=> s + (a.visualizacoes||0), 0) + posts.reduce((s,p)=> s + (p.visualizacoes||0), 0) + banners.reduce((s,b)=> s + (b.metricas?.visualizacoes||0), 0);
  const totalBounces = 0; // não disponível
  const bounceRate = users.length ? Math.round((totalBounces / Math.max(1,totalViews)) * 100) : 0;
  const avgSession = 'N/D';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          Relatórios de SEO e Métricas
        </CardTitle>
        <p className="text-sm text-gray-500">Acompanhe a performance e otimize a visibilidade da plataforma.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">Total de contas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizações (Tempo Real)</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews}</div>
              <p className="text-xs text-muted-foreground">Anúncios, Posts e Banners</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banners Ativos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{banners.filter(b=> b.status==='ativo').length}</div>
              <p className="text-xs text-muted-foreground">Rodando agora</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Posts Publicados</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{posts.filter(p=> p.status==='publicado').length}</div>
              <p className="text-xs text-muted-foreground">Conteúdo ativo</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h3 className="font-semibold">Ferramentas Externas de SEO</h3>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild variant="outline">
              <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" /> Google Search Console
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" /> Google Analytics
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="https://trends.google.com/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" /> Google Trends
              </a>
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

// Mock Icons for AbaSEO as they are not available in ControleAdmin
const Users = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const Eye = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const Clock = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;


export default AbaSEO;