import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function slugify(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Público: usar service role somente para leitura de anúncios
    const anuncios = await base44.asServiceRole.entities.Anuncio.list();
    const origin = new URL(req.url).origin;

    const urls = new Set();
    // Home
    urls.add(`${origin}/`);
    // Páginas estáticas principais
    ['Mapa','Produtos','Blog','SobreNos','Planos'].forEach(p => urls.add(`${origin}/${p}`));

    const cidades = new Set();
    const categorias = new Set();

    for (const a of anuncios) {
      if (a.cidade) cidades.add(slugify(a.cidade));
      if (a.categoria) categorias.add(slugify(a.categoria));
      const path = `/${slugify(a.cidade||'cidade')}/${slugify(a.categoria||'categoria')}/${slugify(a.profissional||a.titulo||'profissional')}`;
      urls.add(`${origin}${path}`);
    }

    // Guías por cidade e categoria (derivadas dos anúncios)
    cidades.forEach(c => urls.add(`${origin}/guia/${c}`));
    categorias.forEach(c => urls.add(`${origin}/categoria/${c}`));

    const now = new Date().toISOString();
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      Array.from(urls).map(u => `  <url>\n    <loc>${u}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>`).join('\n') +
      `\n</urlset>`;

    return new Response(body, { status: 200, headers: { 'Content-Type': 'application/xml' } });
  } catch (e) {
    return new Response('Error generating sitemap', { status: 500 });
  }
});