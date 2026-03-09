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
    // Scheduled/automation context: use service role
    const now = Date.now();
    const PAGE = 500;
    let skip = 0;
    let totalExpired = 0;

    // Fetch batches of active ads
    while (true) {
      const batch = await base44.asServiceRole.entities.Anuncio.filter({ status: 'ativo' }, '-created_date', PAGE, skip);
      const anuncios = Array.isArray(batch) ? batch : [];
      if (!anuncios.length) break;

      for (const a of anuncios) {
        const dias = a.dias_exposicao || diasPorPlano(a.plano);
        const created = a.created_date ? new Date(a.created_date).getTime() : now;
        const expAt = a.data_expiracao ? new Date(a.data_expiracao).getTime() : (created + dias*DAY_MS);
        if (now >= expAt) {
          await base44.asServiceRole.entities.Anuncio.update(a.id, { status: 'expirado' });
          totalExpired += 1;
        } else if (!a.data_expiracao) {
          // backfill expiration date for consistency
          await base44.asServiceRole.entities.Anuncio.update(a.id, { data_expiracao: new Date(expAt).toISOString(), dias_exposicao: dias });
        }
      }
      if (anuncios.length < PAGE) break;
      skip += PAGE;
    }

    return Response.json({ status: 'ok', expired: totalExpired });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
});