import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ENTITIES_TO_CLEAR = [
  'Agendamento','AgendamentoAtualizacao','Anuncio','ArtigoBlog','AtendimentoPontos','Banner','BeautySafeClick','BeautySafeSolicitacao','ChatMensagem','ComentarioBlog','ContatoSuporte','DesignIAUso','DisponibilidadeProfissional','Doctor','DoctorInstituteInfo','DoctorValidationAudit','DoctorVersion','EstabelecimentoParceiro','Evento','IndicacaoAmigo','Notificacao','Novidade','PageView','PedidoProduto','PipelineRun','Plano','Procedimento','ProcedimentoCatalogo','ProcedimentoMestre','Produto','ProfessionalCategory','RadarUsage','RelatorioPreco','RelatorioPrecoConsolidado','SearchEvent','SolicitacaoAtivacaoPlano','SolicitacaoImpulsionamento','SolicitacaoInclusaoLoja','Taxon','TecnologiaCatalogo','TermoBusca','TratamentoCatalogo','VersaoSistema','WellnessMeta','WellnessPlanner'
];

globalThis.Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const entityIndex = Number(payload.entityIndex || 0);
    const entityName = ENTITIES_TO_CLEAR[entityIndex];

    if (!entityName) {
      return Response.json({ success: true, done: true, blocked: true, message: 'Encerramento total concluído.' });
    }

    const entityApi = base44.asServiceRole.entities[entityName];
    if (!entityApi) {
      return Response.json({ success: true, done: false, nextEntityIndex: entityIndex + 1, skipped: entityName });
    }

    const records = await entityApi.list('-created_date', 50);
    for (const record of records || []) {
      await entityApi.delete(record.id);
    }

    const hasMore = (records || []).length === 50;

    return Response.json({
      success: true,
      blocked: true,
      entity: entityName,
      deleted_records: (records || []).length,
      done: false,
      nextEntityIndex: hasMore ? entityIndex : entityIndex + 1,
      repeatCurrentEntity: hasMore
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});