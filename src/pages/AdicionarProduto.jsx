import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import ImageWithLoader from "../components/common/ImageWithLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Autocomplete from "@/components/inputs/Autocomplete";
import NovoEventoDialog from "../components/eventos/NovoEventoDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Upload, Loader2, Wand2, Image as ImageIcon, Sparkles, LogIn, CalendarPlus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const categorias = [
  "Cuidados com a Pele",
  "Maquiagem",
  "Cabelos",
  "Perfumaria",
  "Suplementos",
  "Equipamentos",
  "Acessórios",
  "Serviços para Pacientes",
  "Serviços Contratáveis",
  "Produtos para Pacientes",
  "IA",
  "Serviços",
  "Serviços de IA",
  "Mídia e Marketing",
  "Outros"
];

export default function AdicionarProduto() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [gerandoIA, setGerandoIA] = useState(false);
  const [gerandoImagem, setGerandoImagem] = useState(false);
  const [user, setUser] = useState(null);
  const [aiSugerindo, setAiSugerindo] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [novoEventoOpen, setNovoEventoOpen] = useState(false);
  const [especialidadesInput, setEspecialidadesInput] = useState("");
  // Opções sugeridas (extensíveis)
  const [marcaOptions, setMarcaOptions] = useState([
    "Lumenis","Candela","Cynosure","Alma","Lutronic","Fotona","DEKA","Asclepion","Syneron","Sciton","Cutera","Quanta System","Venus Concept","Zimmer","InMode","BTL","Quanta","Milesman","Primelase","Elysion","Asclepion Thunder","Motus","Clarity","LightSheer","Soprano","Icon","PicoSure","PicoWay","Discovery Pico","StarWalker","Nordlys","M22"
  ]);
  const [tipoLaserOptions, setTipoLaserOptions] = useState([
      "Alexandrite","Nd:YAG","Diodo","CO2","Er:YAG","IPL (Luz Pulsada)","PDL (Pulsed Dye)","Thulium","Holmium","Q-Switched","Pico (Picosegundo)","Er:Glass","CO2 Fracionado"
    ]);
  const [modeloOptions, setModeloOptions] = useState([
    "GentleMax Pro","GentleLase","GentleYAG","Soprano ICE","Soprano Titanium","LightSheer Duet","LightSheer Desire","Elite+","Elite iQ","Icon","PicoSure","PicoWay","PicoPlus","Discovery Pico","StarWalker","QX Max","Thunder MT","Motus AX","Motus AY","Clarity","Clarity II","Excel V","Xeo","Genesis","Harmony XL Pro","Quanta Q-Plus","Primelase HR","Milesman Blauman","SP Dynamis","CO2RE","SmartXide Touch","Nordlys","M22"
  ]);
  const [procedimentos, setProcedimentos] = useState([]);
  const [buscaProc, setBuscaProc] = useState("");
  const [produto, setProduto] = useState({
    tipo: "produto", // produto ou servico
    nome: "",
    descricao: "",
    categoria: "",
    preco: 0,
    preco_promocional: 0,
    preco_texto: "", // Para "Consultar", "A partir de X"
    pontos_ganhos: 5,
    pontos_necessarios: 0,
    estoque: 0,
    marca: "",
    imagens: [],
    em_destaque: false,
    status: "ativo",
    link_pagamento: "", // Novo campo
    requer_assinatura: false, // Para produtos exclusivos do clube
    mostrar_tag_clube: false,
    // Novos campos para fornecedores/oferta
    fornecedor_nome: "",
    fornecedor_tipo: "fornecedor", // fornecedor | distribuidor | fabricante | revenda
    tipo_oferta: "unidade", // unidade | lote | sob_demanda
    lote_minimo: 1,
    aceitar_chat: true,
    aceitar_orcamento: false,
    plano_minimo: 'free',
    beauty_club_exclusivo: false,
    beauty_club_minimo: 'basic',
    // Endereço
    endereco: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    latitude: undefined,
    longitude: undefined,
    // Targeting e descontos
    descontos_por_plano: { free: 0, lite: 0, basico: 0, pro: 0, prime: 0, premium: 0 },
    visibilidade_por_plano: [],
    especialidades_alvo: [],
    // Programa 12 meses
    programa_12_meses: false,
    programa_tipo: "",
    finalidade: "",
    valor_programa: 0,
    quantidade_sessoes: 0,
    tempo_dias: 0,
    tempo_meses: 0,
    tratamentos_inclusos_ids: [],
    tratamentos_inclusos_nomes: [],
    // Dropshipping
    dropshipping_prazo_envio_dias: undefined,
    dropshipping_margem_intermediario: 0
    });

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setProduto({
        ...produto,
        imagens: [...produto.imagens, file_url]
      });
      alert("Imagem enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index) => {
    setProduto({
      ...produto,
      imagens: produto.imagens.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (!produto.nome || !produto.descricao || !produto.categoria || !produto.tipo) {
        alert("Preencha os campos obrigatórios: Tipo, Nome, Descrição e Categoria");
        setLoading(false);
        return;
      }

      // Preço promocional não pode ser maior que o preço
      if (produto.preco > 0 && produto.preco_promocional > produto.preco) {
        alert("Preço promocional não pode ser maior que o preço.");
        setLoading(false);
        return;
      }
      // Se não tem preço, precisa ter preco_texto
      if (produto.preco < 0 || produto.preco_promocional < 0 || produto.estoque < 0) {
        alert("Valores não podem ser negativos.");
        setLoading(false);
        return;
      }
      if (produto.preco === 0 && !produto.preco_texto && produto.pontos_necessarios === 0) {
        const confirma = window.confirm(
          "Este produto não tem preço definido. Deseja continuar?"
        );
        if (!confirma) {
          setLoading(false);
          return;
        }
      }

      const payload = { ...produto };
      if (especialidadesInput?.trim()) {
        payload.especialidades_alvo = especialidadesInput.split(',').map(s=>s.trim()).filter(Boolean);
      }
      await base44.entities.Produto.create(payload);

      alert("✅ Produto/Serviço criado com sucesso!");
      navigate(createPageUrl("Produtos"));
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      alert("Erro ao criar produto. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { (async()=>{ try { const u = await base44.auth.me(); setUser(u); } catch {} finally { setAuthChecked(true); } })(); }, []);

  const handleLogin = () => {
  const currentPath = window.location.pathname + window.location.search;
  base44.auth.redirectToLogin(currentPath);
};

// IA: preencher dados a partir do nome
  const handlePreencherComIA = async () => {
    if (!produto.nome) { alert('Informe o nome do produto/serviço antes.'); return; }
    setGerandoIA(true);
    try {
      const schema = {
        type: 'object',
        properties: {
          descricao: { type: 'string' },
          categoria: { type: 'string' },
          preco_texto: { type: 'string' },
          marca: { type: 'string' },
        }
      };
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Gere um resumo objetivo e vendedor para um ${produto.tipo} chamado "${produto.nome}" dentro do setor de estética/beleza. Sugira uma categoria entre: ${categorias.join(', ')}. Retorne JSON com: descricao (máx 400 chars), categoria (exata de uma das opções), preco_texto (opcional, curto), marca (se couber).`,
        response_json_schema: schema
      });
      const dados = res || {};
      const categoriaValida = categorias.includes(dados.categoria) ? dados.categoria : (produto.categoria || '');
      setProduto(p => ({ ...p, descricao: dados.descricao || p.descricao, categoria: categoriaValida, preco_texto: dados.preco_texto || p.preco_texto, marca: dados.marca || p.marca }));
    } finally {
      setGerandoIA(false);
    }
  };

  // IA: gerar imagem a partir do nome
  const handleGerarImagemIA = async () => {
    if (!produto.nome) { alert('Informe o nome antes de gerar a imagem.'); return; }
    setGerandoImagem(true);
    try {
      const prompt = `foto de produto/serviço de estética: ${produto.nome}, fundo limpo, iluminação suave, estilo e-commerce, estética premium`;
      const { url } = await base44.integrations.Core.GenerateImage({ prompt });
      if (url) setProduto(p => ({ ...p, imagens: [...p.imagens, url] }));
    } finally {
      setGerandoImagem(false);
    }
  };

  // Escrita assistida por IA (sugestões de equipamentos)
  React.useEffect(() => {
    if (produto.categoria !== 'Equipamentos') return;
    const query = `${produto.marca || ''} ${produto.modelo || ''} ${produto.tipo_laser || ''}`.trim();
    if (query.length < 2) return;
    const t = setTimeout(async () => {
      setAiSugerindo(true);
      try {
        const schema = {
          type: 'object',
          properties: {
            modelos: { type: 'array', items: { type: 'string' } },
            marcas: { type: 'array', items: { type: 'string' } },
            tipos: { type: 'array', items: { type: 'string' } },
          },
        };
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `Liste sugestões curtas e comerciais de equipamentos de estética (laser e afins) relacionados a: "${query}". Retorne até 12 modelos, 12 marcas e 12 tipos (exatos e reais do segmento).`,
          response_json_schema: schema,
        });
        const modelos = Array.isArray(res?.modelos) ? res.modelos : [];
        const marcas = Array.isArray(res?.marcas) ? res.marcas : [];
        const tipos = Array.isArray(res?.tipos) ? res.tipos : [];
        if (modelos.length) setModeloOptions((prev) => Array.from(new Set([...modelos, ...prev])).slice(0, 50));
        if (marcas.length) setMarcaOptions((prev) => Array.from(new Set([...marcas, ...prev])).slice(0, 50));
        if (tipos.length) setTipoLaserOptions((prev) => Array.from(new Set([...tipos, ...prev])).slice(0, 50));
      } finally {
        setAiSugerindo(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [produto.categoria, produto.marca, produto.modelo, produto.tipo_laser]);

  // Carregar tratamentos (ProcedimentoMestre) para compor programas de 12 meses
  React.useEffect(() => {
    (async () => {
      try {
        const lista = await base44.entities.ProcedimentoMestre.list();
        setProcedimentos(Array.isArray(lista) ? lista : []);
      } catch {
        setProcedimentos([]);
      }
    })();
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#F7D426]" />
      </div>
    );
  }

  if (authChecked && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF9E6] via-white to-[#F7D426]/20 flex items-center justify-center px-6">
        <div className="max-w-3xl w-full text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-[#F7D426] border-2 border-[#F7D426] mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold">Área para Profissionais e Patrocinadores</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Entre na sua conta para cadastrar Produtos e Serviços
          </h1>
          <p className="text-gray-600 mt-3">
            Cadastre seus itens, organize seu portfólio e solicite inclusão na Loja e na Loja de Pontos com 1 clique.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleLogin} className="bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] border-2 border-[#2C2C2C] font-bold">
              <LogIn className="w-4 h-4 mr-2" />
              Entrar na conta
            </Button>
            <Button variant="outline" onClick={()=>window.location.href='/'}>
              Voltar ao início
            </Button>
          </div>
          <div className="mt-8 grid sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-lg border bg-white/70">
              <p className="font-semibold text-gray-900">Cadastro rápido</p>
              <p className="text-sm text-gray-600">Imagens, preço e detalhes em poucos passos.</p>
            </div>
            <div className="p-4 rounded-lg border bg-white/70">
              <p className="font-semibold text-gray-900">Solicitação aos Admins</p>
              <p className="text-sm text-gray-600">Peça para publicar na Loja e na Loja de Pontos.</p>
            </div>
            <div className="p-4 rounded-lg border bg-white/70">
              <p className="font-semibold text-gray-900">Conversão automática</p>
              <p className="text-sm text-gray-600">1 real = 1 ponto na Loja de Pontos.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Produtos"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Produtos
        </Button>

        <Card className="border-2 border-[#F7D426]/50 shadow-2xl rounded-2xl bg-white/90 backdrop-blur">
          <CardContent className="p-8 space-y-2">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">
                Adicionar Produto/Serviço
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Complemente com marca, tipo e modelo (quando for Equipamentos) para melhorar a busca.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={()=>setNovoEventoOpen(true)}
                  variant="outline"
                  className="border-2"
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Adicionar Evento
                </Button>
                <Button
                  type="button"
                  onClick={handlePreencherComIA}
                  disabled={gerandoIA}
                  variant="outline"
                  className="border-2"
                >
                  {gerandoIA ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                  Preencher com IA
                </Button>
                <Button
                  type="button"
                  onClick={handleGerarImagemIA}
                  disabled={gerandoImagem}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {gerandoImagem ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                  Gerar Imagem IA
                </Button>
              </div>

              {/* Plano mínimo para profissionais */}
              <div>
                <Label htmlFor="plano_minimo">Plano mínimo (profissionais)</Label>
                <Select value={produto.plano_minimo || 'free'} onValueChange={(v)=>setProduto({ ...produto, plano_minimo: v })}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="lite">Lite</SelectItem>
                    <SelectItem value="basico">Básico</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="prime">Prime</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Beauty Club */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="beauty_club_exclusivo"
                  checked={produto.beauty_club_exclusivo}
                  onCheckedChange={(checked) => setProduto({ ...produto, beauty_club_exclusivo: checked })}
                />
                <Label htmlFor="beauty_club_exclusivo" className="cursor-pointer">Exclusivo Beauty Club</Label>
              </div>
              <div>
                <Label htmlFor="beauty_club_minimo">Nível mínimo (Beauty Club)</Label>
                <Select value={produto.beauty_club_minimo || 'basic'} onValueChange={(v)=>setProduto({ ...produto, beauty_club_minimo: v })}>
                  <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Beauty Club Basic</SelectItem>
                    <SelectItem value="pro">Beauty Club Pro</SelectItem>
                    <SelectItem value="exclusive">Beauty Club Exclusive (VIP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo: Produto ou Serviço */}
              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={produto.tipo}
                  onValueChange={(value) => setProduto({ ...produto, tipo: value, ...(value === 'servico' ? { estoque: 0 } : {}) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="produto">Produto</SelectItem>
                    <SelectItem value="servico">Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nome */}
              <div>
                <Label htmlFor="nome">Nome do {produto.tipo === 'servico' ? 'Serviço' : 'Produto'} *</Label>
                <Input
                  id="nome"
                  value={produto.nome}
                  onChange={(e) => setProduto({ ...produto, nome: e.target.value })}
                  placeholder={produto.tipo === 'servico' ? "Ex: Consulta Estética Online" : "Ex: Sérum Facial Premium"}
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={produto.descricao}
                  onChange={(e) => setProduto({ ...produto, descricao: e.target.value })}
                  placeholder="Descrição detalhada..."
                  rows={4}
                  required
                />
              </div>

              {/* Categoria e Marca */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    value={produto.categoria}
                    onValueChange={(value) => setProduto({ ...produto, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="marca">Marca</Label>
                  <Autocomplete
                    id="marca"
                    value={produto.marca}
                    onChange={(v) => setProduto({ ...produto, marca: v })}
                    options={marcaOptions}
                    onCreateOption={(v)=> setMarcaOptions((prev)=> [v, ...prev])}
                    placeholder="Selecione ou digite a marca"
                  />
                  <p className="text-xs text-gray-500 mt-1">Sugestões populares e opção de adicionar sua marca</p>
                </div>

                {produto.categoria === 'Equipamentos' && (
                  <div className="md:col-span-2 grid md:grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="tipo_laser">Tipo de Laser</Label>
                      <Autocomplete
                        id="tipo_laser"
                        value={produto.tipo_laser || ""}
                        onChange={(v) => setProduto({ ...produto, tipo_laser: v })}
                        options={tipoLaserOptions}
                        placeholder="Selecione ou digite o tipo (ex: Alexandrite)"
                      />
                      <p className="text-xs text-gray-500 mt-1">Sugestões automáticas de tipos conhecidos de equipamentos.</p>
                    </div>
                    <div>
                      <Label htmlFor="modelo">Modelo</Label>
                      <Autocomplete
                        id="modelo"
                        value={produto.modelo || ""}
                        onChange={(v) => setProduto({ ...produto, modelo: v })}
                        options={modeloOptions}
                        onCreateOption={(v)=> setModeloOptions((prev)=> [v, ...prev])}
                        placeholder="Selecione ou digite o modelo"
                      />
                      <p className="text-xs text-gray-500 mt-1">Escrita assistida por IA: comece a digitar e sugerimos modelos reais ({aiSugerindo ? 'gerando…' : 'sugestões ativas'}).</p>
                    </div>
                  </div>
                )}
              </div>

              {user?.role === 'admin' && (
                <>

              <div className="p-4 rounded-lg border-2 border-amber-200 bg-amber-50 space-y-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="programa_12_meses"
                    checked={produto.programa_12_meses}
                    onCheckedChange={(c)=> setProduto({ ...produto, programa_12_meses: !!c })}
                  />
                  <Label htmlFor="programa_12_meses" className="cursor-pointer font-semibold">
                    Programa contínuo de 12 meses (Spa da Pele)
                  </Label>
                </div>
                {produto.programa_12_meses && (
                  <>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Tipo de Programa</Label>
                      <Select value={produto.programa_tipo || ""} onValueChange={(v)=> setProduto({ ...produto, programa_tipo: v })}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spa_da_pele">Spa da Pele</SelectItem>
                          <SelectItem value="beauty_pass">Beauty Pass</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Qtd. de Sessões</Label>
                      <Input type="number" value={produto.quantidade_sessoes || 0} onChange={(e)=> setProduto({ ...produto, quantidade_sessoes: parseInt(e.target.value)||0 })} />
                    </div>
                    <div>
                      <Label>Valor do Programa (R$)</Label>
                      <Input type="number" step="0.01" value={produto.valor_programa || 0} onChange={(e)=> setProduto({ ...produto, valor_programa: parseFloat(e.target.value)||0 })} />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Tempo de realização (dias)</Label>
                      <Input type="number" value={produto.tempo_dias || 0} onChange={(e)=> setProduto({ ...produto, tempo_dias: parseInt(e.target.value)||0 })} />
                    </div>
                    <div>
                      <Label>Tempo de realização (meses)</Label>
                      <Input type="number" value={produto.tempo_meses || 0} onChange={(e)=> setProduto({ ...produto, tempo_meses: parseInt(e.target.value)||0 })} />
                    </div>
                  </div>

                  <div className="space-y-2 mt-2">
                    <Label>Finalidade (objetivo clínico)</Label>
                    <Textarea rows={3} placeholder="Ex: Redução de manchas, rejuvenescimento, melhora da textura..." value={produto.finalidade} onChange={(e)=> setProduto({ ...produto, finalidade: e.target.value })} />
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label>Adicionar Tratamentos do Banco de Dados</Label>
                    <Input
                      placeholder="Buscar tratamentos (nome técnico)"
                      value={buscaProc}
                      onChange={(e)=>setBuscaProc(e.target.value)}
                    />
                    <div className="max-h-56 overflow-y-auto grid md:grid-cols-2 gap-2 p-2 bg-white rounded border">
                      {procedimentos
                        .filter(p => !buscaProc || p.nome_tecnico?.toLowerCase().includes(buscaProc.toLowerCase()))
                        .slice(0, 50)
                        .map(p => {
                          const checked = produto.tratamentos_inclusos_ids.includes(p.id);
                          return (
                            <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer p-1 rounded hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e)=>{
                                  if (e.target.checked) {
                                    setProduto(prev => ({
                                      ...prev,
                                      tratamentos_inclusos_ids: [...prev.tratamentos_inclusos_ids, p.id],
                                      tratamentos_inclusos_nomes: [...prev.tratamentos_inclusos_nomes, p.nome_tecnico]
                                    }));
                                  } else {
                                    setProduto(prev => ({
                                      ...prev,
                                      tratamentos_inclusos_ids: prev.tratamentos_inclusos_ids.filter(id => id !== p.id),
                                      tratamentos_inclusos_nomes: prev.tratamentos_inclusos_nomes.filter(n => n !== p.nome_tecnico)
                                    }));
                                  }
                                }}
                              />
                              <span className="truncate">{p.nome_tecnico}</span>
                            </label>
                          );
                        })}
                    </div>
                    {produto.tratamentos_inclusos_nomes.length > 0 && (
                      <p className="text-xs text-gray-600">
                        Selecionados: {produto.tratamentos_inclusos_nomes.slice(0,5).join(', ')}{produto.tratamentos_inclusos_nomes.length>5 ? '…' : ''}
                      </p>
                    )}
                  </div>
                </>
                )}
              </div>

              </>
              )}

              {/* Fornecedor e Oferta */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fornecedor_nome">Nome do Fornecedor</Label>
                  <Input id="fornecedor_nome" value={produto.fornecedor_nome} onChange={(e)=>setProduto({ ...produto, fornecedor_nome: e.target.value })} placeholder="Ex: Distribuidora ABC" />
                </div>
                <div>
                  <Label htmlFor="fornecedor_tipo">Classificação</Label>
                  <Select value={produto.fornecedor_tipo} onValueChange={(v)=>setProduto({ ...produto, fornecedor_tipo: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fornecedor">Fornecedor</SelectItem>
                      <SelectItem value="distribuidor">Distribuidor</SelectItem>
                      <SelectItem value="fabricante">Fabricante</SelectItem>
                      <SelectItem value="revenda">Revenda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tipo_oferta">Tipo de Oferta</Label>
                  <Select value={produto.tipo_oferta} onValueChange={(v)=>setProduto({ ...produto, tipo_oferta: v, aceitar_orcamento: v === 'sob_demanda' ? true : produto.aceitar_orcamento })}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unidade">Unidade</SelectItem>
                      <SelectItem value="lote">Lote</SelectItem>
                      <SelectItem value="sob_demanda">Sob demanda (orçamento)</SelectItem>
                      <SelectItem value="dropshipping">Dropshipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {produto.tipo_oferta === 'lote' && (
                  <div>
                    <Label htmlFor="lote_minimo">Lote mínimo</Label>
                    <Input id="lote_minimo" type="number" value={produto.lote_minimo} onChange={(e)=>setProduto({ ...produto, lote_minimo: parseInt(e.target.value)||1 })} />
                  </div>
                )}
                {produto.tipo_oferta === 'dropshipping' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prazo_envio">Prazo de envio (dias)</Label>
                      <Input id="prazo_envio" type="number" value={produto.dropshipping_prazo_envio_dias || ''} onChange={(e)=> setProduto({ ...produto, dropshipping_prazo_envio_dias: parseInt(e.target.value)||0 })} />
                    </div>
                    <div>
                      <Label htmlFor="margem">Margem do intermediário</Label>
                      <Input id="margem" type="number" step="0.01" value={produto.dropshipping_margem_intermediario || 0} onChange={(e)=> setProduto({ ...produto, dropshipping_margem_intermediario: parseFloat(e.target.value)||0 })} />
                    </div>
                  </div>
                )}
                  <div className="flex items-center gap-2">
                  <Checkbox id="aceitar_chat" checked={produto.aceitar_chat} onCheckedChange={(c)=>setProduto({ ...produto, aceitar_chat: c })} />
                  <Label htmlFor="aceitar_chat" className="cursor-pointer">Aceitar chat para este item</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="aceitar_orcamento" checked={produto.aceitar_orcamento} onCheckedChange={(c)=>setProduto({ ...produto, aceitar_orcamento: c })} />
                  <Label htmlFor="aceitar_orcamento" className="cursor-pointer">Permitir solicitar orçamento (sob demanda)</Label>
                </div>
              </div>

              {/* Endereço */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input id="endereco" value={produto.endereco || ""} onChange={(e)=>setProduto({ ...produto, endereco: e.target.value })} placeholder="Rua, número, complemento" />
                </div>
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input id="bairro" value={produto.bairro || ""} onChange={(e)=>setProduto({ ...produto, bairro: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" value={produto.cidade || ""} onChange={(e)=>setProduto({ ...produto, cidade: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input id="estado" value={produto.estado || ""} onChange={(e)=>setProduto({ ...produto, estado: e.target.value })} placeholder="UF" />
                </div>
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" value={produto.cep || ""} onChange={(e)=>setProduto({ ...produto, cep: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="latitude">Latitude (opcional)</Label>
                  <Input id="latitude" type="number" value={produto.latitude || ''} onChange={(e)=>setProduto({ ...produto, latitude: parseFloat(e.target.value) || undefined })} />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude (opcional)</Label>
                  <Input id="longitude" type="number" value={produto.longitude || ''} onChange={(e)=>setProduto({ ...produto, longitude: parseFloat(e.target.value) || undefined })} />
                </div>
              </div>

              {/* Preços */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={produto.preco}
                    onChange={(e) => setProduto({ ...produto, preco: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="preco_promocional">Preço Promocional (R$)</Label>
                  <Input
                    id="preco_promocional"
                    type="number"
                    step="0.01"
                    value={produto.preco_promocional}
                    onChange={(e) => setProduto({ ...produto, preco_promocional: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="preco_texto">Texto do Preço</Label>
                  <Input
                    id="preco_texto"
                    value={produto.preco_texto}
                    onChange={(e) => setProduto({ ...produto, preco_texto: e.target.value })}
                    placeholder="Ex: Consultar"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use para "Consultar", "A partir de X", etc
                  </p>
                </div>
              </div>

              {/* Link de Pagamento */}
              <div>
                <Label htmlFor="link_pagamento">Link de Pagamento (Mercado Pago)</Label>
                <Input
                  id="link_pagamento"
                  value={produto.link_pagamento}
                  onChange={(e) => setProduto({ ...produto, link_pagamento: e.target.value })}
                  placeholder="https://mercadopago.com.br/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Link do Mercado Pago para pagamento deste produto/serviço
                </p>
              </div>

              {/* Estoque (apenas para produtos) */}
              {produto.tipo === 'produto' && (
                <div>
                  <Label htmlFor="estoque">Estoque</Label>
                  <Input
                    id="estoque"
                    type="number"
                    value={produto.estoque}
                    onChange={(e) => setProduto({ ...produto, estoque: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              )}

              {/* Pontos */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pontos_ganhos">Pontos Ganhos (ao comprar)</Label>
                  <Input
                    id="pontos_ganhos"
                    type="number"
                    value={produto.pontos_ganhos}
                    onChange={(e) => setProduto({ ...produto, pontos_ganhos: parseInt(e.target.value) || 0 })}
                    placeholder="5"
                  />
                </div>

                <div>
                  <Label htmlFor="pontos_necessarios">Pontos Necessários (para resgatar)</Label>
                  <Input
                    id="pontos_necessarios"
                    type="number"
                    value={produto.pontos_necessarios}
                    onChange={(e) => setProduto({ ...produto, pontos_necessarios: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe 0 se não for um produto de resgate
                  </p>
                </div>
              </div>

              {/* Upload de Imagens */}
              <div>
                <Label>Imagens do {produto.tipo === 'servico' ? 'Serviço' : 'Produto'}</Label>
                <p className="text-xs text-gray-500 mt-1">Dica: paisagem 1200x900 para cards e retrato 1080x1920 para stories. Nós ajustamos o enquadramento automaticamente.</p>
                <div className="mt-2">
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition-colors">
                      {uploadingImage ? (
                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-pink-600" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <span className="text-sm text-pink-600 font-medium">Clique para fazer upload</span>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG até 5MB</p>
                        </>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadImage}
                    disabled={uploadingImage}
                  />
                </div>

                {produto.imagens.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {produto.imagens.map((img, index) => (
                      <div key={index} className="relative group">
                        <ImageWithLoader
                          src={img}
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status, Destaque e Visibilidade */}
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="em_destaque"
                    checked={produto.em_destaque}
                    onCheckedChange={(checked) => setProduto({ ...produto, em_destaque: checked })}
                  />
                  <Label htmlFor="em_destaque" className="cursor-pointer">
                    {produto.tipo === 'servico' ? 'Serviço' : 'Produto'} em Destaque
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requer_assinatura"
                    checked={produto.requer_assinatura}
                    onCheckedChange={(checked) => setProduto({ ...produto, requer_assinatura: checked })}
                  />
                  <Label htmlFor="requer_assinatura" className="cursor-pointer">
                    Exclusivo Clube da Beleza
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mostrar_tag_clube"
                    checked={produto.mostrar_tag_clube}
                    onCheckedChange={(checked) => setProduto({ ...produto, mostrar_tag_clube: checked })}
                  />
                  <Label htmlFor="mostrar_tag_clube" className="cursor-pointer">
                    Exibir tag do Clube da Beleza
                  </Label>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={produto.status}
                    onValueChange={(value) => setProduto({ ...produto, status: value, ...(value === 'esgotado' ? { estoque: 0 } : {}) })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="esgotado">Esgotado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-6 border-t">
                <p className="text-xs text-gray-500 -mt-4 mb-2">Dica: quanto mais completo, maior a exposição nas buscas ✨</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl("Produtos"))}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar {produto.tipo === 'servico' ? 'Serviço' : 'Produto'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>

    <NovoEventoDialog open={novoEventoOpen} onClose={()=>setNovoEventoOpen(false)} user={user} />
    </>
    );
}