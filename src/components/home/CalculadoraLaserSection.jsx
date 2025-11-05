
import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  FileDown, 
  Lock,
  HelpCircle,
  Lightbulb,
  Search,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Calendar,
  Zap,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// Removed html2canvas and jsPDF as they are no longer used for HTML report generation

export default function CalculadoraLaserSection() {
  const [user, setUser] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [abaAtual, setAbaAtual] = useState("investimento");
  const [dados, setDados] = useState({
    modeloLaser: "Ex: CO2 Fracionado",
    marcaLaser: "Ex: Ibramed",
    custoAquisicao: 150000,
    custosAdicionais: 5000,
    custoAluguel: 4000,
    manutencaoAnual: 12000,
    vidaUtil: 5,
    custoVariavel: 50,
    custoFixoClinica: 20000, // This fixed cost is not explicitly used in calculations, consider if it should be.
    precoMedio: 800,
    descontoMedio: 15,
    sessoesHora: 2,
    diasMes: 20,
    horasDia: 6,
    taxaSelic: 10
  });

  const [resultados, setResultados] = useState({
    precoLiquido: 0,
    margemBruta: 0,
    margemBrutaPct: 0,
    capacidadeMaxima: 0,
    receitaPotencialMes: 0,
    paybackCompra: 0,
    paybackAluguel: 0,
    vplCompra: 0,
    vplAluguel: 0,
    tirCompra: 0,
    tirAluguel: 0
  });

  const [mostrarAjuda, setMostrarAjuda] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Cálculo automático para preview (SEM abrir o modal)
  const resultadosPreview = useMemo(() => {
    const precoLiquido = dados.precoMedio * (1 - dados.descontoMedio / 100);
    const margemBruta = precoLiquido - dados.custoVariavel;
    const margemBrutaPct = isNaN((margemBruta / precoLiquido) * 100) ? 0 : (margemBruta / precoLiquido) * 100; // Handle division by zero
    const capacidadeMaxima = dados.sessoesHora * dados.horasDia * dados.diasMes;
    const receitaPotencialMes = precoLiquido * capacidadeMaxima;

    return {
      precoLiquido,
      margemBruta,
      margemBrutaPct,
      capacidadeMaxima,
      receitaPotencialMes
    };
  }, [dados]);

  const calcular = () => {
    const precoLiquido = dados.precoMedio * (1 - dados.descontoMedio / 100);
    const margemBruta = precoLiquido - dados.custoVariavel;
    const margemBrutaPct = isNaN((margemBruta / precoLiquido) * 100) ? 0 : (margemBruta / precoLiquido) * 100; // Handle division by zero
    const capacidadeMaxima = dados.sessoesHora * dados.horasDia * dados.diasMes;
    const receitaPotencialMes = precoLiquido * capacidadeMaxima;

    const investimentoTotal = dados.custoAquisicao + dados.custosAdicionais;
    
    // Using 70% of capacity for payback calculations to be more conservative
    const capacidadeEfetiva = capacidadeMaxima * 0.7; 

    const receitaMensalEfetiva = precoLiquido * capacidadeEfetiva;
    const custosVariaveisMensaisEfetivos = dados.custoVariavel * capacidadeEfetiva;
    const margemContribuicaoMensalEfetiva = receitaMensalEfetiva - custosVariaveisMensaisEfetivos;

    const custoManutencaoMensal = dados.manutencaoAnual / 12;

    // Payback Compra: (Investimento Inicial) / (Margem de Contribuição Mensal Efetiva - Custo Manutenção Mensal)
    const denominadorPaybackCompra = margemContribuicaoMensalEfetiva - custoManutencaoMensal;
    const paybackCompra = (denominadorPaybackCompra > 0 && investimentoTotal > 0) ? (investimentoTotal / denominadorPaybackCompra) : Infinity;

    // Payback Aluguel: (Valor do Aluguel) / (Margem de Contribuição Mensal Efetiva - Custo Aluguel Mensal - Custo Manutenção Mensal)
    const denominadorPaybackAluguel = margemContribuicaoMensalEfetiva - dados.custoAluguel - custoManutencaoMensal;
    const paybackAluguel = (denominadorPaybackAluguel > 0 && dados.custoAluguel > 0) ? (dados.custoAluguel / denominadorPaybackAluguel) : Infinity;


    const fluxoMensalCompra = margemContribuicaoMensalEfetiva - custoManutencaoMensal;
    const fluxoMensalAluguel = margemContribuicaoMensalEfetiva - dados.custoAluguel - custoManutencaoMensal;
    
    const taxaMensal = dados.taxaSelic / 12 / 100;
    const meses = dados.vidaUtil * 12;
    
    let vplCompra = -investimentoTotal;
    let vplAluguel = 0;
    
    for (let i = 1; i <= meses; i++) {
      vplCompra += fluxoMensalCompra / Math.pow(1 + taxaMensal, i);
      vplAluguel += fluxoMensalAluguel / Math.pow(1 + taxaMensal, i);
    }

    // TIR calculation approximation
    // This is a simplified approximation and might not be accurate for all scenarios.
    // For a more robust solution, a financial library or more sophisticated iterative algorithm would be needed.
    const approximateTIR = (cashFlows, initialInvestment) => {
      if (initialInvestment === 0) return 0;
      let low = -1.0; // -100%
      let high = 10.0; // 1000%
      let tir = 0;
      for (let i = 0; i < 100; i++) { // 100 iterations for approximation
        let mid = (low + high) / 2;
        let npv = initialInvestment; // Start with initial investment (usually negative)
        for (let j = 0; j < cashFlows.length; j++) {
          npv += cashFlows[j] / Math.pow(1 + mid, j + 1);
        }
        if (npv > 0) {
          low = mid;
        } else {
          high = mid;
        }
        if (Math.abs(high - low) < 0.000001) { // Convergence check
          tir = mid;
          break;
        }
      }
      return tir * 100 * 12; // Annualize for percentage
    };

    const cashFlowsCompra = Array(meses).fill(fluxoMensalCompra);
    const tirCompra = approximateTIR(cashFlowsCompra, -investimentoTotal);

    const cashFlowsAluguel = Array(meses).fill(fluxoMensalAluguel);
    // For TIR Aluguel, the initial "investment" is usually considered 0 as it's a recurring cost,
    // or the cost of acquiring the right to rent for the period.
    // This calculation is more complex for aluguel as there's no initial lump sum to recover.
    // A simplified approach might treat the recurring aluguel cost as a 'negative investment' spread out.
    // Given the difficulty, for aluguel, we can use a very simplified return on the *opportunity cost*
    // or set it to 0 if it doesn't make sense in this context. Let's use the same approximation.
    // If the base is '0', the TIR calculator might fail.
    // For rental, VPL is usually the primary metric. Let's return a nominal value if it's too complex/misleading.
    const tirAluguel = approximateTIR(cashFlowsAluguel, 0); // No initial investment for aluguel, which makes TIR tricky.

    setResultados({
      precoLiquido,
      margemBruta,
      margemBrutaPct,
      capacidadeMaxima,
      receitaPotencialMes,
      paybackCompra: isFinite(paybackCompra) && paybackCompra > 0 ? paybackCompra : 0, // Handle Infinity or negative payback
      paybackAluguel: isFinite(paybackAluguel) && paybackAluguel > 0 ? paybackAluguel : 0, // Handle Infinity or negative payback
      vplCompra: vplCompra,
      vplAluguel: vplAluguel,
      tirCompra: isFinite(tirCompra) ? tirCompra : 0,
      tirAluguel: isFinite(tirAluguel) ? tirAluguel : 0
    });

    setMostrarResultados(true);
  };

  const handleChange = (campo, valor) => {
    setDados(prev => ({ ...prev, [campo]: parseFloat(valor) || 0 }));
  };

  const handleChangeTexto = (campo, valor) => {
    setDados(prev => ({ ...prev, [campo]: valor }));
  };

  const handleProximaAba = () => {
    if (abaAtual === "investimento") {
      setAbaAtual("operacao");
    } else if (abaAtual === "operacao") {
      setAbaAtual("receita");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleBaixarRelatorio = () => {
    if (!user || user.plano_ativo === 'free' || !user.plano_ativo) {
      return; 
    }

    // Pre-calculate values needed for the report
    const investimentoTotal = dados.custoAquisicao + dados.custosAdicionais;
    const custoManutencaoMensal = dados.manutencaoAnual / 12;
    const capacidadeEfetiva = resultados.capacidadeMaxima * 0.7; // 70% utilization
    
    const receitaMensalEfetiva = resultados.precoLiquido * capacidadeEfetiva;
    const custosVariaveisMensaisEfetivos = dados.custoVariavel * capacidadeEfetiva;
    const margemContribuicaoMensalEfetiva = receitaMensalEfetiva - custosVariaveisMensaisEfetivos;

    const lucroOperacionalMensalCompra = margemContribuicaoMensalEfetiva - custoManutencaoMensal;
    const lucroOperacionalMensalAluguel = margemContribuicaoMensalEfetiva - dados.custoAluguel - custoManutencaoMensal;
    
    // Choose the better option for general "lucro mensal" and "tempo de retorno"
    const isCompraBetter = resultados.vplCompra > resultados.vplAluguel;
    const lucroMensalReport = isCompraBetter ? lucroOperacionalMensalCompra : lucroOperacionalMensalAluguel;
    const tempoRetornoReport = isCompraBetter ? resultados.paybackCompra : resultados.paybackAluguel;

    const roiAnualCompra = (investimentoTotal > 0) ? ((lucroOperacionalMensalCompra * 12) / investimentoTotal * 100) : 0;
    const roiAnualAluguel = (dados.custoAluguel > 0) ? ((lucroOperacionalMensalAluguel * 12) / (dados.custoAluguel * 12)) * 100 : 0; // Simple ratio for aluguel
    const roiAnualReport = isCompraBetter ? roiAnualCompra : roiAnualAluguel;
    
    const recomendacoes = [];
    if (resultados.vplCompra > resultados.vplAluguel) {
      recomendacoes.push("Com base nos dados fornecidos, a COMPRA apresenta melhor retorno financeiro no longo prazo. O VPL positivo e o payback aceitável indicam que este é um investimento viável para sua clínica.");
    } else {
      recomendacoes.push("Com base nos dados fornecidos, o ALUGUEL pode ser mais vantajoso considerando os riscos e a flexibilidade operacional. Esta opção oferece menor comprometimento de capital e permite ajustes conforme a demanda.");
    }
    if (resultados.paybackCompra === 0 || !isFinite(resultados.paybackCompra)) {
        recomendacoes.push("O payback para compra não pode ser calculado ou é infinito com os dados atuais. Revise seus custos/receitas.");
    }
    if (resultados.paybackAluguel === 0 || !isFinite(resultados.paybackAluguel)) {
        recomendacoes.push("O payback para aluguel não pode ser calculado ou é infinito com os dados atuais. Revise seus custos/receitas.");
    }
    if (lucroMensalReport <= 0) {
      recomendacoes.push("O lucro mensal estimado é negativo ou zero, o que indica que o investimento pode não ser viável nas condições atuais.");
    }

    // Generate projections
    const projecoes = [];
    let cumulativeProfit = 0;
    let cumulativeInvestment = 0; // For cumulative ROI if needed

    for (let i = 1; i <= dados.vidaUtil; i++) {
        const receitaAnual = receitaMensalEfetiva * 12;
        const lucroAnual = (isCompraBetter ? lucroOperacionalMensalCompra : lucroOperacionalMensalAluguel) * 12;
        cumulativeProfit += lucroAnual;
        
        let roiAnualProj = 0;
        if (isCompraBetter) {
            // Simple cumulative ROI for purchase
            roiAnualProj = (investimentoTotal > 0) ? ((cumulativeProfit / investimentoTotal) * 100) : 0;
        } else {
            // For rental, perhaps show annual return relative to annual cost
            roiAnualProj = (dados.custoAluguel * 12 > 0) ? (lucroAnual / (dados.custoAluguel * 12)) * 100 : 0;
        }

        projecoes.push({
            periodo: `Ano ${i}`,
            receita: receitaAnual,
            lucro: lucroAnual,
            roi: roiAnualProj >= 0 ? roiAnualProj.toFixed(2) : 'N/A'
        });
    }

    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR');
    
    const conteudoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Viabilidade - ${dados.marcaLaser}</title>
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; font-size: 11pt; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #007bff; padding-bottom: 20px; }
          h1 { color: #2C2C2C; margin: 0; font-size: 24pt; }
          h2 { color: #007bff; border-bottom: 2px solid #e0e0e0; padding-bottom: 5px; margin-top: 30px; font-size: 16pt; }
          h3 { color: #333; margin-top: 20px; font-size: 14pt; }
          .info-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; border: 1px solid #e0e0e0; }
          .info-box p { margin: 5px 0; }
          .metric { background: white; border-left: 4px solid #007bff; padding: 15px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-radius: 8px; }
          .metric p { margin: 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #007bff; color: white; padding: 12px; text-align: left; border: 1px solid #ddd; }
          td { padding: 10px; border: 1px solid #ddd; }
          .footer { margin-top: 40px; text-align: center; font-size: 9pt; color: #999; }
          .highlight { background: #e6f2ff; padding: 3px 8px; border-radius: 4px; font-weight: bold; color: #0056b3; }
          .text-green { color: #28a745; font-weight: bold; }
          .text-red { color: #dc3545; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Relatório de Viabilidade</h1>
          <p>Calculadora de Laser - Mapa da Estética</p>
          <p>Gerado em: ${dataAtual} às ${horaAtual}</p>
          <p>Análise para: <strong>${dados.marcaLaser} - ${dados.modeloLaser}</strong></p>
        </div>
        
        <div class="info-box">
          <h2>📋 Informações do Equipamento</h2>
          <p><strong>Modelo:</strong> ${dados.modeloLaser}</p>
          <p><strong>Marca:</strong> ${dados.marcaLaser}</p>
          <p><strong>Custo de Aquisição (Compra):</strong> ${formatCurrency(dados.custoAquisicao)}</p>
          <p><strong>Custos Adicionais:</strong> ${formatCurrency(dados.custosAdicionais)}</p>
          <p><strong>Custo de Aluguel/Leasing Mensal:</strong> ${formatCurrency(dados.custoAluguel)}</p>
          <p><strong>Custo de Manutenção Anual:</strong> ${formatCurrency(dados.manutencaoAnual)}</p>
          <p><strong>Vida Útil Estimada:</strong> ${dados.vidaUtil} anos</p>
          <p><strong>Taxa Selic/CDI Anual:</strong> ${dados.taxaSelic}%</p>
        </div>

        <div class="info-box">
          <h2>⚙️ Dados Operacionais e de Receita</h2>
          <p><strong>Preço Médio por Sessão (Tabela):</strong> ${formatCurrency(dados.precoMedio)}</p>
          <p><strong>Desconto Médio em Pacotes:</strong> ${dados.descontoMedio}%</p>
          <p><strong>Preço Líquido por Sessão:</strong> ${formatCurrency(resultados.precoLiquido)}</p>
          <p><strong>Custo Variável por Procedimento:</strong> ${formatCurrency(dados.custoVariavel)}</p>
          <p><strong>Margem Bruta por Sessão:</strong> ${formatCurrency(resultados.margemBruta)} (${resultados.margemBrutaPct.toFixed(1)}%)</p>
          <p><strong>Capacidade Máxima Mensal:</strong> ${resultados.capacidadeMaxima.toFixed(0)} sessões</p>
          <p><strong>Utilização Efetiva (70%):</strong> ${capacidadeEfetiva.toFixed(0)} sessões/mês</p>
        </div>

        <h2>💰 Análise Financeira</h2>
        
        <div class="metric">
          <h3>Receita Potencial Mensal (Efetiva)</h3>
          <p class="highlight" style="font-size: 24px;">${formatCurrency(receitaMensalEfetiva)}</p>
        </div>

        <div class="metric">
          <h3>Lucro Operacional Mensal Estimado</h3>
          <p class="highlight" style="font-size: 24px;">${formatCurrency(lucroMensalReport)}</p>
        </div>

        <div class="metric">
          <h3>Tempo de Retorno (Payback)</h3>
          <p class="highlight" style="font-size: 24px;">
            ${isFinite(tempoRetornoReport) && tempoRetornoReport > 0 ? `${tempoRetornoReport.toFixed(1)} meses` : 'N/A ou Inválido'}
          </p>
        </div>

        <div class="info-box">
            <h3>Comparativo Compra vs Aluguel</h3>
            <p><strong>VPL (Compra):</strong> <span class="${resultados.vplCompra >= 0 ? 'text-green' : 'text-red'}">${formatCurrency(resultados.vplCompra)}</span></p>
            <p><strong>VPL (Aluguel):</strong> <span class="${resultados.vplAluguel >= 0 ? 'text-green' : 'text-red'}">${formatCurrency(resultados.vplAluguel)}</span></p>
            <p><strong>TIR (Compra):</strong> ${isFinite(resultados.tirCompra) ? resultados.tirCompra.toFixed(2) + '%' : 'N/A'}</p>
            <p><strong>TIR (Aluguel):</strong> ${isFinite(resultados.tirAluguel) ? resultados.tirAluguel.toFixed(2) + '%' : 'N/A'}</p>
            <p><strong>Payback (Compra):</strong> ${isFinite(resultados.paybackCompra) && resultados.paybackCompra > 0 ? resultados.paybackCompra.toFixed(1) + ' meses' : 'N/A'}</p>
            <p><strong>Payback (Aluguel):</strong> ${isFinite(resultados.paybackAluguel) && resultados.paybackAluguel > 0 ? resultados.paybackAluguel.toFixed(1) + ' meses' : 'N/A'}</p>
        </div>

        <h2>📈 Projeções de Longo Prazo (${dados.vidaUtil} Anos)</h2>
        <table>
          <thead>
            <tr>
              <th>Período</th>
              <th>Receita Anual</th>
              <th>Lucro Anual</th>
              <th>ROI Acumulado (%)</th>
            </tr>
          </thead>
          <tbody>
            ${projecoes.map(proj => `
              <tr>
                <td><strong>${proj.periodo}</strong></td>
                <td>${formatCurrency(proj.receita)}</td>
                <td>${formatCurrency(proj.lucro)}</td>
                <td class="${parseFloat(proj.roi) >= 0 ? 'text-green' : 'text-red'}">${proj.roi}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="info-box">
          <h2>💡 Recomendações</h2>
          ${recomendacoes.map(rec => `<p>• ${rec}</p>`).join('')}
        </div>

        <div class="footer">
          <p>Mapa da Estética - Clube da Beleza</p>
          <p>www.mapadaestetica.com.br | (31) 97259-5643</p>
          <p>Esta análise é uma ferramenta de apoio à decisão. Consulte um profissional financeiro para orientação específica.</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([conteudoHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-viabilidade-${dados.marcaLaser}-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Relatório exportado em HTML!\n\nPara converter em PDF:\n1. Abra o arquivo HTML no seu navegador de internet.\n2. Pressione Ctrl+P (Windows) ou Cmd+P (Mac) para abrir a janela de impressão.\n3. Na caixa de diálogo de impressão, selecione "Salvar como PDF" ou "Microsoft Print to PDF" como impressora.\n4. Clique em "Salvar" para gerar o arquivo PDF.');
  };

  const isUserFree = !user || user.plano_ativo === 'free' || !user.plano_ativo;

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-600 text-white">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe4/f54646e8e_drbeleza.png"
              alt="Dr. Beleza"
              className="w-4 h-4 rounded-full mr-2 inline-block object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/16?text=Dr';
              }}
            />
            Ferramenta Exclusiva
          </Badge>
          <div className="flex items-center justify-center gap-4 mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Calculadora de Viabilidade de Laser
            </h2>
            <Button
              onClick={() => setMostrarAjuda(true)}
              size="sm"
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Preciso de Ajuda
            </Button>
          </div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Desenvolvida pelo <span className="font-bold text-blue-600">Dr. Jauru Nunes de Freitas</span> - 
            Analise a viabilidade financeira de investir em equipamento de laser para sua clínica
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Dados de Entrada
              </h3>

              <Tabs value={abaAtual} onValueChange={setAbaAtual} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="investimento">Investimento</TabsTrigger>
                  <TabsTrigger value="operacao">Operação</TabsTrigger>
                  <TabsTrigger value="receita">Receita</TabsTrigger>
                </TabsList>

                <TabsContent value="investimento" className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Modelo do Laser</Label>
                    <Input
                      type="text"
                      value={dados.modeloLaser}
                      onChange={(e) => handleChangeTexto('modeloLaser', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Marca do Laser</Label>
                    <Input
                      type="text"
                      value={dados.marcaLaser}
                      onChange={(e) => handleChangeTexto('marcaLaser', e.target.value)}
                      className="mt-1"
                      placeholder="Ex: Ibramed, Fotona, Lumenis"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Custo de Aquisição (Compra)</Label>
                    <Input
                      type="number"
                      value={dados.custoAquisicao}
                      onChange={(e) => handleChange('custoAquisicao', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Custos Adicionais (Frete, Instalação)</Label>
                    <Input
                      type="number"
                      value={dados.custosAdicionais}
                      onChange={(e) => handleChange('custosAdicionais', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Custo de Aluguel/Leasing Mensal</Label>
                    <Input
                      type="number"
                      value={dados.custoAluguel}
                      onChange={(e) => handleChange('custoAluguel', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Custo de Manutenção Anual</Label>
                    <Input
                      type="number"
                      value={dados.manutencaoAnual}
                      onChange={(e) => handleChange('manutencaoAnual', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Vida Útil Estimada (anos)</Label>
                    <Input
                      type="number"
                      value={dados.vidaUtil}
                      onChange={(e) => handleChange('vidaUtil', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Taxa Renda Fixa (Selic/CDI Anual %)</Label>
                    <Input
                      type="number"
                      value={dados.taxaSelic}
                      onChange={(e) => handleChange('taxaSelic', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    onClick={handleProximaAba}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-12 text-lg font-bold"
                  >
                    Próximo
                  </Button>
                </TabsContent>

                <TabsContent value="operacao" className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Custo Variável por Procedimento</Label>
                    <Input
                      type="number"
                      value={dados.custoVariavel}
                      onChange={(e) => handleChange('custoVariavel', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Custos Fixos Atuais da Clínica (Mensal)</Label>
                    <Input
                      type="number"
                      value={dados.custoFixoClinica}
                      onChange={(e) => handleChange('custoFixoClinica', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Sessões por Hora (Produtividade)</Label>
                    <Input
                      type="number"
                      value={dados.sessoesHora}
                      onChange={(e) => handleChange('sessoesHora', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Dias/Mês Dedicados ao Laser</Label>
                    <Input
                      type="number"
                      value={dados.diasMes}
                      onChange={(e) => handleChange('diasMes', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Horas/Dia Dedicadas ao Laser</Label>
                    <Input
                      type="number"
                      value={dados.horasDia}
                      onChange={(e) => handleChange('horasDia', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    onClick={handleProximaAba}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-12 text-lg font-bold"
                  >
                    Próximo
                  </Button>
                </TabsContent>

                <TabsContent value="receita" className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Preço Médio por Sessão (Tabela)</Label>
                    <Input
                      type="number"
                      value={dados.precoMedio}
                      onChange={(e) => handleChange('precoMedio', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Desconto Médio em Pacotes (%)</Label>
                    <Input
                      type="number"
                      value={dados.descontoMedio}
                      onChange={(e) => handleChange('descontoMedio', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    onClick={calcular}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-12 text-lg font-bold"
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    Calcular Viabilidade
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Análise de Viabilidade (Preview)
                </h3>
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm text-white/80 mb-1">Preço Líquido por Sessão</p>
                    <p className="text-2xl font-bold">{formatCurrency(resultadosPreview.precoLiquido)}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm text-white/80 mb-1">Margem Bruta</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(resultadosPreview.margemBruta)} 
                      <span className="text-base ml-2">({resultadosPreview.margemBrutaPct.toFixed(1)}%)</span>
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm text-white/80 mb-1">Capacidade Máxima Mensal</p>
                    <p className="text-2xl font-bold">{resultadosPreview.capacidadeMaxima.toFixed(0)} sessões</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm text-white/80 mb-1">Receita Potencial Mensal</p>
                    <p className="text-2xl font-bold">{formatCurrency(resultadosPreview.receitaPotencialMes)}</p>
                  </div>
                </div>
                <p className="text-xs text-white/70 mt-4 text-center">
                  Preencha as 3 etapas e clique em "Calcular Viabilidade" para ver o relatório completo
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Dialog */}
        <Dialog open={mostrarResultados} onOpenChange={setMostrarResultados}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Relatório Completo de Viabilidade
              </DialogTitle>
              <DialogDescription>
                Análise detalhada para {dados.marcaLaser} - {dados.modeloLaser}
              </DialogDescription>
            </DialogHeader>

            <div id="relatorio-completo" className="space-y-6 py-4">
              {/* Informações do Equipamento */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Informações do Equipamento</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Modelo</p>
                    <p className="font-bold text-gray-900">{dados.modeloLaser}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Marca</p>
                    <p className="font-bold text-gray-900">{dados.marcaLaser}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Custo de Aquisição</p>
                    <p className="font-bold text-gray-900">{formatCurrency(dados.custoAquisicao + dados.custosAdicionais)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Custo de Aluguel Mensal</p>
                    <p className="font-bold text-gray-900">{formatCurrency(dados.custoAluguel)}</p>
                  </div>
                </div>
              </div>

              {/* Análise Financeira */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Análise Financeira</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Preço Líquido por Sessão</p>
                    <p className="text-xl font-bold text-green-700">{formatCurrency(resultados.precoLiquido)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Margem Bruta por Sessão</p>
                    <p className="text-xl font-bold text-green-700">{formatCurrency(resultados.margemBruta)}</p>
                    <p className="text-xs text-gray-500">({resultados.margemBrutaPct.toFixed(1)}%)</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Receita Potencial/Mês (100% cap)</p>
                    <p className="text-xl font-bold text-green-700">{formatCurrency(resultados.receitaPotencialMes)}</p>
                  </div>
                </div>
              </div>

              {/* Compra vs Aluguel */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Compra vs Aluguel (70% de Ocupação)</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-purple-700">COMPRA</h4>
                    <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                      <p className="text-sm text-gray-600 mb-1">Payback (meses)</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {resultados.paybackCompra > 0 && isFinite(resultados.paybackCompra) ? `${resultados.paybackCompra.toFixed(1)}` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                      <p className="text-sm text-gray-600 mb-1">VPL (Valor Presente Líquido)</p>
                      <p className={`text-xl font-bold ${resultados.vplCompra >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(resultados.vplCompra)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                      <p className="text-sm text-gray-600 mb-1">TIR Estimada (Anual)</p>
                      <p className="text-xl font-bold text-purple-700">{isFinite(resultados.tirCompra) ? resultados.tirCompra.toFixed(2) : 'N/A'}%</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-pink-700">ALUGUEL</h4>
                    <div className="bg-white rounded-lg p-4 border-2 border-pink-200">
                      <p className="text-sm text-gray-600 mb-1">Payback (meses)</p>
                      <p className="text-2xl font-bold text-pink-700">
                        {resultados.paybackAluguel > 0 && isFinite(resultados.paybackAluguel) ? `${resultados.paybackAluguel.toFixed(1)}` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-pink-200">
                      <p className="text-sm text-gray-600 mb-1">VPL (Valor Presente Líquido)</p>
                      <p className={`text-xl font-bold ${resultados.vplAluguel >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatCurrency(resultados.vplAluguel)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-pink-200">
                      <p className="text-sm text-gray-600 mb-1">TIR Estimada (Anual)</p>
                      <p className="text-xl font-bold text-pink-700">{isFinite(resultados.tirAluguel) ? resultados.tirAluguel.toFixed(2) : 'N/A'}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recomendação */}
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-6 border-2 border-yellow-300">
                <h3 className="text-lg font-bold text-amber-900 mb-4">💡 Recomendação Final</h3>
                <p className="text-amber-800 leading-relaxed">
                  {resultados.vplCompra > resultados.vplAluguel 
                    ? "Com base nos dados fornecidos, a COMPRA apresenta melhor retorno financeiro no longo prazo. O VPL positivo e o payback aceitável indicam que este é um investimento viável para sua clínica." 
                    : "Com base nos dados fornecidos, o ALUGUEL pode ser mais vantajoso considerando os riscos e a flexibilidade operacional. Esta opção oferece menor comprometimento de capital e permite ajustes conforme a demanda."}
                </p>
              </div>

              {/* Download Button */}
              <div className="flex justify-end gap-4">
                <TooltipProvider>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          onClick={handleBaixarRelatorio}
                          disabled={isUserFree}
                          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUserFree ? <Lock className="w-4 h-4 mr-2" /> : <FileDown className="w-4 h-4 mr-2" />}
                          Baixar Relatório (HTML)
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {isUserFree && (
                      <TooltipContent className="bg-yellow-50 border-2 border-yellow-300 text-yellow-900 p-4 max-w-xs z-50">
                        <p className="font-semibold mb-2">🔒 Recurso Premium</p>
                        <p className="text-sm">Para baixar o relatório, é necessário ter um plano PRATA ou superior.</p>
                        <Button
                          onClick={() => window.location.href = createPageUrl("Planos")}
                          className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
                          size="sm"
                        >
                          Ver Planos
                        </Button>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="mt-12 text-center bg-blue-900 text-white rounded-xl p-8">
          <p className="text-lg font-bold mb-2">
            Calculadora desenvolvida por Dr. Jauru Nunes de Freitas
          </p>
          <p className="text-sm text-blue-200">
            Ferramenta exclusiva do Mapa da Estética - Use para tomar decisões mais inteligentes sobre investimentos em equipamentos
          </p>
        </div>
      </div>

      {/* Modal de Ajuda com Dr. Beleza */}
      <Dialog open={mostrarAjuda} onOpenChange={setMostrarAjuda}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe4/f54646e8e_drbeleza.png"
                alt="Dr. Beleza"
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-600"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/64?text=Dr';
                }}
              />
              <div>
                <DialogTitle className="text-2xl">Como Usar a Calculadora de Viabilidade</DialogTitle>
                <DialogDescription>Dr. Beleza explica tudo para você!</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* O que é */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-6 h-6" />
                O que é esta Calculadora?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Esta é uma ferramenta profissional desenvolvida pelo <strong>Dr. Jauru Nunes de Freitas</strong> para ajudar você a tomar decisões financeiras inteligentes sobre investir em equipamentos de laser para sua clínica. 
                <br/><br/>
                Ela analisa todos os custos envolvidos (compra ou aluguel), projeções de receita, capacidade operacional e retorno sobre investimento, te dando um panorama completo para decidir se vale a pena ou não.
              </p>
            </div>

            {/* Como funciona */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
              <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                <Calculator className="w-6 h-6" />
                Como Funciona?
              </h3>
              <p className="text-gray-700 mb-4">A calculadora está dividida em <strong>3 etapas simples</strong>:</p>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">📊 Investimento</h4>
                      <p className="text-sm text-gray-600">
                        Preencha os dados de <strong>custo de compra</strong> ou <strong>aluguel</strong> do equipamento, custos adicionais, manutenção e vida útil esperada.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">⚙️ Operação</h4>
                      <p className="text-sm text-gray-600">
                        Informe os <strong>custos variáveis</strong> por procedimento, custos fixos, e sua <strong>capacidade operacional</strong> (quantos procedimentos consegue fazer por dia/mês).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">💰 Receita</h4>
                      <p className="text-sm text-gray-600">
                        Coloque o <strong>preço médio</strong> que você cobra por sessão e eventuais descontos em pacotes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Onde obter as informações */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-200">
              <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                <Search className="w-6 h-6" />
                Onde Obter as Informações?
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Custos do Equipamento:</strong>
                    <p className="text-sm text-gray-600">Solicite orçamentos de fornecedores (Ibramed, Fotona, Lumenis, etc)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Preços de Mercado:</strong>
                    <p className="text-sm text-gray-600">Pesquise quanto clínicas similares cobram na sua região (use nosso relatório de preços!)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Capacidade Operacional:</strong>
                    <p className="text-sm text-gray-600">Calcule quantos procedimentos você consegue fazer por hora/dia considerando sua agenda</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Custos Variáveis:</strong>
                    <p className="text-sm text-gray-600">Some consumíveis, descartáveis, energia e outros custos por procedimento</p>
                  </div>
                </div>
              </div>
            </div>

            {/* O que você vai descobrir */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
              <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                O Que Você Vai Descobrir?
              </h3>
              
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-semibold text-purple-900">💎 Margem de Lucro</p>
                  <p className="text-xs text-gray-600">Quanto você lucra por procedimento</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-semibold text-purple-900">⏱️ Payback</p>
                  <p className="text-xs text-gray-600">Em quanto tempo recupera o investimento</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-semibold text-purple-900">📈 VPL</p>
                  <p className="text-xs text-gray-600">Valor Presente Líquido do investimento</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-semibold text-purple-900">🎯 TIR</p>
                  <p className="text-xs text-gray-600">Taxa Interna de Retorno</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-semibold text-purple-900">💰 Receita Potencial</p>
                  <p className="text-xs text-gray-600">Quanto pode faturar mensalmente</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-sm font-semibold text-purple-900">🏆 Comparação</p>
                  <p className="text-xs text-gray-600">Comprar vs Alugar lado a lado</p>
                </div>
              </div>
            </div>

            {/* Dica Final */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                💡 Dica do Dr. Beleza
              </h3>
              <p className="leading-relaxed">
                Não se preocupe se não tiver todas as informações exatas! Use estimativas conservadoras e 
                faça diversos cenários (otimista, realista, pessimista). Nenhuma informação é obrigatória, 
                mas quanto mais dados você preencher, mais precisa será a análise.
                <br/><br/>
                <strong>Lembre-se:</strong> Esta ferramenta é um guia de apoio à decisão. Sempre consulte 
                um contador ou consultor financeiro antes de fazer grandes investimentos! 🚀
              </p>
            </div>

            <div className="text-center">
              <Button
                onClick={() => setMostrarAjuda(false)}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                Entendi! Vamos Calcular
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
