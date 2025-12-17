import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Image as ImageIcon, Sparkles, Check, X, Rocket } from "lucide-react";

export default function GeradorCampanhas() {
  const queryClient = useQueryClient();
  const [admin, setAdmin] = useState(null);
  const [formato, setFormato] = useState("barra"); // barra | carrossel
  const [posicao, setPosicao] = useState("home_topo");
  const [corTema, setCorTema] = useState("#F7D426");
  const [aplicarTema, setAplicarTema] = useState(false);
  const [selecionados, setSelecionados] = useState([]); // ids de anuncios
  const [itens, setItens] = useState({}); // id -> {titulo, descricao, imagem, substituirImagem}
  const [gerandoImgId, setGerandoImgId] = useState(null);
  const [gerandoTexto, setGerandoTexto] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    (async () => {
      try { setAdmin(await base44.auth.me()); } catch { setAdmin(null);} 
    })();
  }, []);

  const { data: anuncios = [], isLoading } = useQuery({
    queryKey: ['campanhas-anuncios'],
    queryFn: async () => base44.entities.Anuncio.list('-created_date', 200),
    staleTime: 0,
  });

  const anunciosMap = useMemo(() => Object.fromEntries(anuncios.map(a => [a.id, a])), [anuncios]);

  const toggleSelecionado = (id) => {
    setSelecionados(prev => {
      const novo = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      return novo.slice(0, 5); // máximo 5
    });
  };

  const handleUpload = async (id, file) => {
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setItens(prev => ({ ...prev, [id]: { ...(prev[id]||{}), imagem: file_url } }));
  };

  const gerarImagemIA = async (id) => {
    try {
      setGerandoImgId(id);
      const a = anunciosMap[id];
      const prompt = `Imagem publicitária limpa, moderna e atrativa para campanha de ${a.categoria || 'estética'} com foco em ${a.titulo || 'serviços'}. Paleta suave, alta qualidade, sem texto.`;
      const { url } = await base44.integrations.Core.GenerateImage({ prompt });
      setItens(prev => ({ ...prev, [id]: { ...(prev[id]||{}), imagem: url } }));
    } finally { setGerandoImgId(null); }
  };

  const gerarTextosIA = async () => {
    setGerandoTexto(true);
    try {
      const prompt = `Você é redator. Para cada item abaixo, gere um título curto e uma descrição de até 120 caracteres, úteis para campanha do site Mapa da Estética, apenas para usuários comuns (não admins). Responda como array JSON de objetos {id,titulo,descricao}.\nItens:\n${selecionados.map(id => { const a = anunciosMap[id]; return `- id:${id}, base:"${a.titulo||''}" categoria:${a.categoria||''}`;}).join("\n")}`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      const arr = Array.isArray(res) ? res : (()=>{ try { return JSON.parse(res); } catch { return []; }})();
      setItens(prev => {
        const novo = { ...prev };
        arr.forEach(({ id, titulo, descricao }) => {
          novo[id] = { ...(novo[id]||{}), titulo: (titulo||'').trim(), descricao: (descricao||'').trim() };
        });
        return novo;
      });
    } finally { setGerandoTexto(false); }
  };

  const salvar = async () => {
    if (selecionados.length === 0) return alert('Selecione pelo menos 1 anúncio');
    setEnviando(true);
    try {
      const toCreate = [];
      selecionados.forEach(id => {
        const a = anunciosMap[id];
        const info = itens[id] || {};
        const baseTitulo = info.titulo || a.titulo || 'Campanha Mapa da Estética';
        const baseDesc = info.descricao || a.descricao || '';
        const img = info.imagem || a.imagem_principal || a.logo || '';
        toCreate.push({
          titulo: `Campanha - ${baseTitulo}`,
          descricao: baseDesc,
          plano_patrocinador: a.plano || 'cobre',
          imagem_banner: img,
          tipo_midia: 'imagem',
          nome_empresa: admin?.full_name || a.profissional || 'Admin',
          posicao: posicao,
          status: 'ativo',
          cor_tema: aplicarTema ? corTema : null,
          aplicar_tema_global: aplicarTema
        });
      });
      // Criar 1 (barra) ou vários (carrossel)
      if (formato === 'barra') {
        await base44.entities.Banner.create(toCreate[0]);
      } else {
        for (const b of toCreate) { await base44.entities.Banner.create(b); }
      }
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      alert('Campanha criada com sucesso!');
      setSelecionados([]); setItens({});
    } catch (e) {
      alert('Erro ao criar campanha: ' + (e?.message||''));
    } finally { setEnviando(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-blue-600" /> Gerador de Campanhas (Barra/Carrossel)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <Label>Formato</Label>
            <Select value={formato} onValueChange={setFormato}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="barra">Barra (1 banner)</SelectItem>
                <SelectItem value="carrossel">Carrossel (vários)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Posição</Label>
            <Select value={posicao} onValueChange={setPosicao}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="home_topo">Home - Topo</SelectItem>
                <SelectItem value="home_meio">Home - Meio</SelectItem>
                <SelectItem value="home_rodape">Home - Rodapé</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="produtos">Produtos</SelectItem>
                <SelectItem value="mapa">Mapa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cor do Tema</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input type="color" value={corTema} onChange={(e)=> setCorTema(e.target.value)} className="w-12 h-10 p-0"/>
              <div className="flex items-center gap-2 text-sm">
                <Checkbox checked={aplicarTema} onCheckedChange={setAplicarTema} />
                <span>Aplicar como tema global</span>
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border md:col-span-2">
            <p className="text-sm text-gray-700">
              Selecione até 5 anúncios; gere imagens com IA apenas se não houver imagem. Depois, opcionalmente gere título e descrição por IA. Definindo uma cor e marcando "tema global", o site inteiro usará esta cor automaticamente.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="font-semibold">Selecionar Anúncios (até 5)</Label>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {isLoading ? (
              <div className="col-span-3 flex items-center gap-2 text-gray-600"><Loader2 className="w-4 h-4 animate-spin" />Carregando anúncios...</div>
            ) : anuncios.map(a => (
              <Card key={a.id} className={`border-2 ${selecionados.includes(a.id) ? 'border-blue-400' : 'border-gray-200'}`}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm line-clamp-2">{a.titulo}</p>
                      <Badge variant="outline" className="mt-1 text-xs">{a.categoria}</Badge>
                    </div>
                    <Checkbox checked={selecionados.includes(a.id)} onCheckedChange={() => toggleSelecionado(a.id)} />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Imagem</Label>
                    { (itens[a.id]?.imagem || a.imagem_principal || a.logo) ? (
                      <img src={itens[a.id]?.imagem || a.imagem_principal || a.logo} alt="img" className="h-24 w-full object-cover rounded" />
                    ) : (
                      <div className="h-24 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-xs"><ImageIcon className="w-4 h-4 mr-1"/>Sem imagem</div>
                    )}
                    <Input type="file" accept="image/*" onChange={(e)=> handleUpload(a.id, e.target.files?.[0])} />
                    {!(itens[a.id]?.imagem || a.imagem_principal || a.logo) ? (
                      <Button size="sm" variant="outline" onClick={()=>gerarImagemIA(a.id)} disabled={gerandoImgId===a.id}>
                        {gerandoImgId===a.id ? <Loader2 className="w-3 h-3 mr-2 animate-spin"/> : <Sparkles className="w-3 h-3 mr-2"/>}
                        Gerar Imagem IA
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Checkbox checked={!!itens[a.id]?.substituir} onCheckedChange={(v)=> setItens(p=>({...p,[a.id]:{...(p[a.id]||{}), substituir: Boolean(v)}}))} />
                        <span>Substituir por IA?</span>
                        {itens[a.id]?.substituir && (
                          <Button size="sm" variant="outline" onClick={()=>gerarImagemIA(a.id)} disabled={gerandoImgId===a.id}>
                            {gerandoImgId===a.id ? <Loader2 className="w-3 h-3 mr-2 animate-spin"/> : <Sparkles className="w-3 h-3 mr-2"/>}
                            Gerar nova imagem
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Título</Label>
                    <Input value={itens[a.id]?.titulo || ''} onChange={(e)=> setItens(p=>({...p,[a.id]:{...(p[a.id]||{}), titulo:e.target.value}}))} placeholder={a.titulo} />
                    <Label className="text-xs">Descrição</Label>
                    <Textarea rows={2} value={itens[a.id]?.descricao || ''} onChange={(e)=> setItens(p=>({...p,[a.id]:{...(p[a.id]||{}), descricao:e.target.value}}))} placeholder={a.descricao} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={gerarTextosIA} disabled={selecionados.length===0 || gerandoTexto}>
            {gerandoTexto ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Sparkles className="w-4 h-4 mr-2"/>}
            Gerar Título/Descrição por IA
          </Button>
          <Button onClick={salvar} disabled={enviando || selecionados.length===0} className="bg-blue-600 hover:bg-blue-700">
            {enviando ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Check className="w-4 h-4 mr-2"/>}
            Criar Campanha
          </Button>
        </div>

        <div className="text-xs text-gray-600">
          {admin && (
            <p>Autopreenchido: Responsável {admin.full_name} ({admin.email})</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}