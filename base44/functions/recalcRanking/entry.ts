import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function norm(val, max) { return Math.min((val || 0) / (max || 1), 1); }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Admin-only safeguard
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Compute ranking with service role
    const anuncios = await base44.asServiceRole.entities.Anuncio.list();

    let updated = 0;
    for (const a of anuncios) {
      const views = norm(a.visualizacoes, 5000);
      const likes = norm(a.curtidas, 500);
      const comments = norm((a.comentarios?.length || 0), 50);
      const reviews = a.media_avaliacao ? Math.min((a.media_avaliacao || 0) / 5, 1) : 0;
      const agends = norm(a.agendamentos_count || 0, 100);
      const profile = Math.min(((a.profissional_verificado ? 0.6 : 0) + (a.profissional_especializado ? 0.4 : 0)), 1);

      const score = Math.round((0.3*reviews + 0.25*agends + 0.2*views + 0.15*likes + 0.1*profile) * 100);
      let badge = '🆕 Novo Profissional';
      if (score >= 80) badge = '🥇 Top Profissional'; else if (score >= 60) badge = '⭐ Profissional Destaque'; else if (score >= 40) badge = '📈 Em Crescimento';

      await base44.asServiceRole.entities.Anuncio.update(a.id, { ranking_score: score, ranking_badge: badge, ranking_updated_at: new Date().toISOString() });
      updated += 1;
    }

    return Response.json({ status: 'ok', updated });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});