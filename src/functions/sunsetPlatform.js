import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ENTITIES_TO_CLEAR = [
  'Agendamento',
  'AgendamentoAtualizacao',
  'Anuncio',
  'ArtigoBlog',
  'AtendimentoPontos',
  'Banner',
  'BeautySafeClick',
  'BeautySafeSolicitacao',
  'ChatMensagem',
  'ComentarioBlog',
  'ContatoSuporte',
  'DesignIAUso',
  'DisponibilidadeProfissional',
  'Doctor',
  'DoctorInstituteInfo',
  'DoctorValidationAudit',
  'DoctorVersion',
  'EstabelecimentoParceiro',
  'Evento',
  'IndicacaoAmigo',
  'Notificacao',
  'Novidade',
  'PageView',
  'PedidoProduto',
  'PipelineRun',
  'Plano',
  'Procedimento',
  'ProcedimentoCatalogo',
  'ProcedimentoMestre',
  'Produto',
  'ProfessionalCategory',
  'RadarUsage',
  'RelatorioPreco',
  'RelatorioPrecoConsolidado',
  'SearchEvent',
  'SolicitacaoAtivacaoPlano',
  'SolicitacaoImpulsionamento',
  'SolicitacaoInclusaoLoja',
  'Taxon',
  'TecnologiaCatalogo',
  'TermoBusca',
  'TratamentoCatalogo',
  'VersaoSistema',
  'WellnessMeta',
  'WellnessPlanner'
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const deletions = [];

    for (const entityName of ENTITIES_TO_CLEAR) {
      const entityApi = base44.asServiceRole.entities[entityName];
      if (!entityApi) continue;

      let skip = 0;
      const pageSize = 200;

      while (true) {
        const records = await entityApi.list('-created_date', pageSize, skip);
        if (!records || records.length === 0) break;

        for (const record of records) {
          await entityApi.delete(record.id);
          deletions.push({ entity: entityName, id: record.id });
        }

        if (records.length < pageSize) break;
      }
    }

    return Response.json({
      success: true,
      blocked: true,
      deleted_records: deletions.length,
      message: 'Encerramento total executado com limpeza de dados.'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});