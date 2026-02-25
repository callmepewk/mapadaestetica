import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hoje = new Date();
    const dataKey = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate())).toISOString().slice(0,10);

    // Se já existe para hoje, não recria
    const existentes = await base44.asServiceRole.entities.QuizDiario.filter({ data: dataKey }, '-created_date', 1);
    if (existentes && existentes.length) {
      return Response.json({ status: 'exists', quiz: existentes[0] });
    }

    const prompt = `Gere um quiz relâmpago de conhecimento sobre estética/beleza/bem-estar.
    Retorne um JSON com: { pergunta: string, opcoes: string[3..5], correta_index: number }.
    Linguagem: pt-BR. Curto e claro.`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: 'object',
        properties: {
          pergunta: { type: 'string' },
          opcoes: { type: 'array', items: { type: 'string' } },
          correta_index: { type: 'number' }
        }
      }
    });

    // Sanitizar
    const pergunta = String(res.pergunta || 'Qual cuidado é essencial para a pele?');
    const opcoes = Array.isArray(res.opcoes) && res.opcoes.length >= 3 ? res.opcoes.slice(0,5) : ['Filtro solar', 'Dormir pouco', 'Pular limpeza'];
    let correta_index = Number.isFinite(res.correta_index) ? Number(res.correta_index) : 0;
    if (correta_index < 0 || correta_index >= opcoes.length) correta_index = 0;

    const quiz = await base44.asServiceRole.entities.QuizDiario.create({ data: dataKey, pergunta, opcoes, correta_index });
    return Response.json({ status: 'created', quiz });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});