import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const DAY_MS = 24*60*60*1000;
function norm(str=''){ try { return str.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,''); } catch { return (str||'').toLowerCase(); } }
function diasPorPlano(plano){
  const p = norm(plano||'');
  if (p.includes('premium')) return 90;
  if (p.includes('prime')) return 60;
  if (p.includes('basico')) return 30;
  return 7; // free / default
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // buscar até 5000 anúncios ativos
    const anuncios = await base44.asServiceRole.entities.Anuncio.filter({ status: 'ativo' }, '-created_date', 5000);
    const now = Date.now();
    let totalExpired = 0;

    for (const a of (anuncios || [])) {
      const dias = a.dias_exposicao || diasPorPlano(a.plano);
      const created = a.created_date ? new Date(a.created_date).getTime() : now;
      const expAt = a.data_expiracao ? new Date(a.data_expiracao).getTime() : (created + dias*DAY_MS);
      if (now >= expAt) {
        await base44.asServiceRole.entities.Anuncio.update(a.id, { status: 'expirado' });
        totalExpired += 1;
      } else if (!a.data_expiracao) {
        await base44.asServiceRole.entities.Anuncio.update(a.id, { data_expiracao: new Date(expAt).toISOString(), dias_exposicao: dias });
      }
    }

    return Response.json({ status: 'ok', expired: totalExpired });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
});