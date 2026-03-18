import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({ summary: '', sections: [], profession: '' }));
    const summary = String(body?.summary || 'Relatório RABI');
    const sections = Array.isArray(body?.sections) ? body.sections : [];
    const profession = String(body?.profession || '').trim();

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 60;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('RABI — Radar AI Business Intelligence', pageWidth/2, y, { align: 'center' });
    y += 18;

    if (profession) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Relatório Estratégico Personalizado — Profissão: ${profession}`, pageWidth/2, y, { align: 'center' });
      y += 18;
    } else {
      y += 6;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const summaryLines = doc.splitTextToSize(summary, pageWidth - 80);
    doc.text(summaryLines, 40, y);
    y += 20 + (summaryLines.length * 14);

    const drawSection = (title, items) => {
      if (y > 740) { doc.addPage(); y = 60; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(title, 40, y);
      y += 18;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const arr = Array.isArray(items) ? items : [];
      for (const it of arr) {
        if (y > 760) { doc.addPage(); y = 60; }
        const lines = doc.splitTextToSize(`• ${it}`, pageWidth - 80);
        doc.text(lines, 40, y);
        y += (lines.length * 14) + 6;
      }
      y += 8;
    };

    const wantedOrder = [
      'Radar de tendências',
      'Nuvem de oportunidades',
      'Market share por categoria',
      'Sazonalidade',
      'Mapa por região',
      'Áreas anatômicas mais buscadas',
      'Dicas de conteúdo para profissionais'
    ];

    // Print preferred sections first, then the rest
    const byTitle = new Map((sections||[]).map(s => [String(s.title||'').toLowerCase(), s]));
    for (const t of wantedOrder) {
      const s = Array.from(sections||[]).find(x => String(x.title||'').toLowerCase().includes(t.split(' ')[0]));
      if (s) drawSection(s.title, s.items);
    }
    // Remaining
    for (const s of sections) {
      if (!wantedOrder.some(t => s.title?.toLowerCase().includes(t.split(' ')[0]))) {
        drawSection(s.title || 'Seção', s.items || []);
      }
    }

    const dataUri = doc.output('datauristring');
    return Response.json({ pdf_data_uri: dataUri });
  } catch (err) {
    return Response.json({ error: err?.message || 'Internal Error' }, { status: 500 });
  }
});