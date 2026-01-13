import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ExternalLink, Activity, Users, Eye, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AbaSEO = () => {
  const { data: users = [] } = useQuery({ queryKey: ['seo-users'], queryFn: () => base44.entities.User.list('-created_date', 2000), staleTime: 0 });
  const { data: pageviews = [] } = useQuery({ queryKey: ['seo-pageviews'], queryFn: () => base44.entities.PageView.list('-created_date', 2000), staleTime: 0 });
  const { data: searches = [] } = useQuery({ queryKey: ['seo-searches'], queryFn: () => base44.entities.SearchEvent.list('-created_date', 2000), staleTime: 0 });

  const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
  const fiveMinAgo = Date.now() - 5*60*1000;
  const visitsToday = pageviews.filter(v => new Date(v.created_date) >= startOfDay).length;
  const uniqueToday = (() => { const s = new Set(pageviews.filter(v => new Date(v.created_date) >= startOfDay).map(v => v.session_id)); return s.size; })();
  const onlineNow = (() => { const s = new Set(pageviews.filter(v => new Date(v.created_date).getTime() >= fiveMinAgo).map(v => v.session_id)); return s.size; })();
  const searchesToday = searches.filter(s => new Date(s.created_date) >= startOfDay).length;

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
              <CardTitle className="text-sm font-medium">Visitas hoje</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{visitsToday}</div>
              <p className="text-xs text-muted-foreground">Baseado em PageView</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários online</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onlineNow}</div>
              <p className="text-xs text-muted-foreground">Sessões ativas (5 min)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pesquisas hoje</CardTitle>
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{searchesToday}</div>
              <p className="text-xs text-muted-foreground">Eventos de busca internos</p>
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

export default AbaSEO;