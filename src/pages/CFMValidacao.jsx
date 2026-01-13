import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Search } from "lucide-react";
import { createPageUrl } from "@/utils";

function normalizeName(s = "") {
  return s
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ');
}

export default function CFMValidacao() {
  const [user, setUser] = useState(null);
  const [anuncios, setAnuncios] = useState([]);
  const [doctorsByUF, setDoctorsByUF] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtrarUF, setFiltrarUF] = useState("");
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(null);

  useEffect(() => { (async () => { try { const u = await base44.auth.me(); setUser(u); } catch {} })(); }, []);

  useEffect(() => {
    (async () => {
      try {
        const ads = await base44.entities.Anuncio.list('-created_date', 300);
        setAnuncios(ads || []);
        // carrega Doctors agrupados por UF dos anúncios
        const ufs = Array.from(new Set((ads||[]).map(a => (a.estado||'').toUpperCase()).filter(Boolean)));
        const map = {};
        for (const uf of ufs) {
          map[uf] = await base44.entities.Doctor.filter({ uf_crm: uf }, '-created_date', 10000);
        }
        setDoctorsByUF(map);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isAdmin = user?.role === 'admin';
  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-600">Carregando...</div>;
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center text-gray-600">Acesso restrito aos administradores.</div>;

  const lista = useMemo(() => {
    return anuncios.filter(a => {
      const okUF = !filtrarUF || (a.estado||'').toUpperCase() === filtrarUF.toUpperCase();
      const term = normalizeName(busca);
      const alvo = normalizeName(`${a.profissional||''} ${a.cidade||''} ${a.estado||''}`);
      return okUF && (!term || alvo.includes(term));
    });
  }, [anuncios, filtrarUF, busca]);

  const encontrarMatch = (a) => {
    const uf = (a.estado||'').toUpperCase();
    const base = doctorsByUF[uf] || [];
    const nome = normalizeName(a.profissional||'');
    const cidade = normalizeName(a.cidade||'');
    // estratégia simples: contém nome e (opcionalmente) cidade
    const candidatos = base.filter(d => {
      const dn = normalizeName(d.nome_completo||'');
      const mc = normalizeName(d.municipio||'');
      return dn.includes(nome) && (!cidade || mc.includes(cidade));
    });
    // preferir ativo
    candidatos.sort((x,y)=> (y.situacao==='ativo') - (x.situacao==='ativo'));
    return candidatos.slice(0,3);
  };

  const aprovar = async (anuncio, doctor) => {
    setSalvando(anuncio.id);
    try {
      await base44.entities.Anuncio.update(anuncio.id, { profissional_verificado: true });
      await base44.entities.DoctorValidationAudit.create({
        anuncio_id: anuncio.id,
        profissional_nome: anuncio.profissional,
        profissional_cidade: anuncio.cidade,
        profissional_estado: anuncio.estado,
        matched_doctor_id: doctor?.id || '',
        matched_doctor_nome: doctor?.nome_completo || '',
        matched_doctor_crm: doctor?.crm || '',
        matched_doctor_uf: doctor?.uf_crm || '',
        status: 'valido',
        motivo: 'Correspondência por nome/UF e cidade'
      });
      setAnuncios(prev => prev.map(x => x.id === anuncio.id ? { ...x, profissional_verificado: true } : x));
    } finally { setSalvando(null); }
  };

  const reprovar = async (anuncio, motivo = 'Sem correspondência') => {
    setSalvando(anuncio.id);
    try {
      await base44.entities.Anuncio.update(anuncio.id, { profissional_verificado: false });
      await base44.entities.DoctorValidationAudit.create({
        anuncio_id: anuncio.id,
        profissional_nome: anuncio.profissional,
        profissional_cidade: anuncio.cidade,
        profissional_estado: anuncio.estado,
        status: 'inconsistente',
        motivo
      });
      setAnuncios(prev => prev.map(x => x.id === anuncio.id ? { ...x, profissional_verificado: false } : x));
    } finally { setSalvando(null); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="text-center">
          <Badge className="mb-3">Validação CFM</Badge>
          <h1 className="text-3xl font-bold mb-2">Auditar Profissionais (Anúncios)</h1>
          <p className="text-gray-600">Cruza anúncios com base CFM (Doctors) por UF e nome/cidade. Decisão visível apenas para Admins.</p>
        </div>

        <Card className="border-2 border-gray-200"><CardContent className="p-6 space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-semibold">UF</label>
              <Input value={filtrarUF} onChange={e=> setFiltrarUF(e.target.value.toUpperCase())} placeholder="Ex: SP" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold">Busca</label>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-500"/>
                <Input value={busca} onChange={e=> setBusca(e.target.value)} placeholder="Nome ou cidade..." />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-gray-600"><Loader2 className="w-4 h-4 animate-spin"/>Carregando...</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {lista.map(a => {
                const matches = encontrarMatch(a);
                return (
                  <Card key={a.id} className="border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{a.profissional || 'Profissional'}</h3>
                          <p className="text-sm text-gray-500">{a.cidade || 'Cidade'} - {(a.estado||'').toUpperCase()}</p>
                        </div>
                        {a.profissional_verificado ? (
                          <Badge className="bg-green-600 text-white">Verificado</Badge>
                        ) : (
                          <Badge variant="outline">Não verificado</Badge>
                        )}
                      </div>

                      <div className="bg-gray-50 p-3 rounded border">
                        <p className="text-xs text-gray-500 mb-2">Possíveis correspondências (CFM):</p>
                        {matches.length === 0 ? (
                          <p className="text-xs text-gray-500">Nenhuma correspondência</p>
                        ) : matches.map(m => (
                          <div key={m.id} className="flex items-center justify-between py-1">
                            <div>
                              <p className="text-sm font-medium">{m.nome_completo}</p>
                              <p className="text-xs text-gray-500">CRM {m.crm}-{m.uf_crm} • {m.situacao} • {m.municipio}</p>
                            </div>
                            <Button size="sm" onClick={()=> aprovar(a, m)} disabled={salvando===a.id} className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-4 h-4 mr-1"/>Aprovar
                            </Button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={()=> reprovar(a, 'Sem correspondência ou dados inconsistentes')} disabled={salvando===a.id}>
                          <XCircle className="w-4 h-4 mr-1"/>Reprovar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent></Card>

        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-yellow-800 text-sm">
            Importante: este cruzamento é heurístico (nome/UF/cidade). Para validação oficial automática, habilite Backend Functions e integre ao WebService do CFM.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}