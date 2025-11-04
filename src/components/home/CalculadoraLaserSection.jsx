
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, DollarSign, Activity, X, Download, Lock } from "lucide-react";
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

export default function CalculadoraLaserSection() {
  const [user, setUser] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [dados, setDados] = useState({
    modeloLaser: "Ex: CO2 Fracionado",
    marcaLaser: "Ex: Ibramed",
    custoAquisicao: 150000,
    custosAdicionais: 5000,
    custoAluguel: 4000,
    manutencaoAnual: 12000,
    vidaUtil: 5,
    custoVariavel: 50,
    custoFixoClinica: 20000,
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

  const calcular = () => {
    const precoLiquido = dados.precoMedio * (1 - dados.descontoMedio / 100);
    const margemBruta = precoLiquido - dados.custoVariavel;
    const margemBrutaPct = (margemBruta / precoLiquido) * 100;
    const capacidadeMaxima = dados.sessoesHora * dados.horasDia * dados.diasMes;
    const receitaPotencialMes = precoLiquido * capacidadeMaxima;

    const investimentoTotal = dados.custoAquisicao + dados.custosAdicionais;
    // Ensure margemBruta * capacidadeMaxima is not zero to avoid division by zero
    const denominadorPaybackCompra = (margemBruta * capacidadeMaxima * 0.7);
    const paybackCompra = denominadorPaybackCompra !== 0 ? investimentoTotal / denominadorPaybackCompra : Infinity;

    const denominadorPaybackAluguel = (margemBruta * capacidadeMaxima * 0.7 - dados.custoAluguel);
    const paybackAluguel = denominadorPaybackAluguel > 0 ? dados.custoAluguel / denominadorPaybackAluguel : Infinity;


    const fluxoMensalCompra = margemBruta * capacidadeMaxima * 0.7 - dados.manutencaoAnual / 12;
    const fluxoMensalAluguel = margemBruta * capacidadeMaxima * 0.7 - dados.custoAluguel - dados.manutencaoAnual / 12;
    
    const taxaMensal = dados.taxaSelic / 12 / 100;
    const meses = dados.vidaUtil * 12;
    
    let vplCompra = -investimentoTotal;
    let vplAluguel = 0;
    
    for (let i = 1; i <= meses; i++) {
      vplCompra += fluxoMensalCompra / Math.pow(1 + taxaMensal, i);
      vplAluguel += fluxoMensalAluguel / Math.pow(1 + taxaMensal, i);
    }

    // TIR calculation is complex and often requires iterative methods or external libraries.
    // The current implementation is a simplified approximation which might not be accurate.
    // For a more robust solution, a financial library or more sophisticated algorithm would be needed.
    // Here, we provide a basic approximation as per the original structure.
    const tirCompra = investimentoTotal !== 0 ? (vplCompra / investimentoTotal) * 100 : 0;
    const tirAluguel = (dados.custoAluguel * meses) !== 0 ? (vplAluguel / (dados.custoAluguel * meses)) * 100 : 0;


    setResultados({
      precoLiquido,
      margemBruta,
      margemBrutaPct,
      capacidadeMaxima,
      receitaPotencialMes,
      paybackCompra: isFinite(paybackCompra) ? paybackCompra : 0, // Handle Infinity
      paybackAluguel: isFinite(paybackAluguel) ? paybackAluguel : 0, // Handle Infinity
      vplCompra,
      vplAluguel,
      tirCompra,
      tirAluguel
    });

    setMostrarResultados(true);
  };

  useEffect(() => {
    // Only calculate initial results if the dialog is not open
    // This prevents re-calculating and opening the dialog on every render for initial values
    if (!mostrarResultados) {
      calcular();
    }
  }, [dados]); // Depend on 'dados' to recalculate when inputs change

  const handleChange = (campo, valor) => {
    setDados(prev => ({ ...prev, [campo]: parseFloat(valor) || 0 }));
  };

  const handleChangeTexto = (campo, valor) => {
    setDados(prev => ({ ...prev, [campo]: valor }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleBaixarRelatorio = () => {
    if (!user || user.plano_ativo === 'free' || !user.plano_ativo) {
      // The tooltip will already handle the message for disabled button
      return; 
    }
    // Download logic here
    alert("Relatório completo sendo gerado... (Funcionalidade em desenvolvimento)");
  };

  const isUserFree = !user || user.plano_ativo === 'free' || !user.plano_ativo;

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-600 text-white">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/894287324_drbeleza.png"
              alt="Dr. Beleza"
              className="w-4 h-4 rounded-full mr-2 inline-block"
            />
            Ferramenta Exclusiva
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Calculadora de Viabilidade de Laser
          </h2>
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

              <Tabs defaultValue="investimento" className="w-full">
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
                </TabsContent>
              </Tabs>

              <Button
                onClick={calcular}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-12 text-lg font-bold"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Calcular Viabilidade
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Análise de Viabilidade
                </h3>
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm text-white/80 mb-1">Preço Líquido por Sessão</p>
                    <p className="text-2xl font-bold">{formatCurrency(resultados.precoLiquido)}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm text-white/80 mb-1">Margem Bruta</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(resultados.margemBruta)} 
                      <span className="text-base ml-2">({resultados.margemBrutaPct.toFixed(1)}%)</span>
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm text-white/80 mb-1">Capacidade Máxima Mensal</p>
                    <p className="text-2xl font-bold">{resultados.capacidadeMaxima.toFixed(0)} sessões</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-sm text-white/80 mb-1">Receita Potencial Mensal</p>
                    <p className="text-2xl font-bold">{formatCurrency(resultados.receitaPotencialMes)}</p>
                  </div>
                </div>
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

            <div className="space-y-6 py-4">
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
                    <p className="font-bold text-gray-900">{formatCurrency(dados.custoAquisicao)}</p>
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
                    <p className="text-sm text-gray-600 mb-1">Margem Bruta</p>
                    <p className="text-xl font-bold text-green-700">{formatCurrency(resultados.margemBruta)}</p>
                    <p className="text-xs text-gray-500">({resultados.margemBrutaPct.toFixed(1)}%)</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Receita Potencial/Mês</p>
                    <p className="text-xl font-bold text-green-700">{formatCurrency(resultados.receitaPotencialMes)}</p>
                  </div>
                </div>
              </div>

              {/* Compra vs Aluguel */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Compra vs Aluguel</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-purple-700">COMPRA</h4>
                    <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                      <p className="text-sm text-gray-600 mb-1">Payback</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {resultados.paybackCompra > 0 && isFinite(resultados.paybackCompra) ? `${resultados.paybackCompra.toFixed(1)} meses` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                      <p className="text-sm text-gray-600 mb-1">VPL (Valor Presente Líquido)</p>
                      <p className="text-xl font-bold text-purple-700">{formatCurrency(resultados.vplCompra)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                      <p className="text-sm text-gray-600 mb-1">TIR Estimada</p>
                      <p className="text-xl font-bold text-purple-700">{resultados.tirCompra.toFixed(2)}%</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-pink-700">ALUGUEL</h4>
                    <div className="bg-white rounded-lg p-4 border-2 border-pink-200">
                      <p className="text-sm text-gray-600 mb-1">Payback</p>
                      <p className="text-2xl font-bold text-pink-700">
                        {resultados.paybackAluguel > 0 && isFinite(resultados.paybackAluguel) ? `${resultados.paybackAluguel.toFixed(1)} meses` : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-pink-200">
                      <p className="text-sm text-gray-600 mb-1">VPL (Valor Presente Líquido)</p>
                      <p className="text-xl font-bold text-pink-700">{formatCurrency(resultados.vplAluguel)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-pink-200">
                      <p className="text-sm text-gray-600 mb-1">TIR Estimada</p>
                      <p className="text-xl font-bold text-pink-700">{resultados.tirAluguel.toFixed(2)}%</p>
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
                          {isUserFree ? <Lock className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                          Baixar Relatório Completo
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {isUserFree && (
                      <TooltipContent className="bg-yellow-50 border-2 border-yellow-300 text-yellow-900 p-4 max-w-xs z-50">
                        <p className="font-semibold mb-2">🔒 Recurso Premium</p>
                        <p className="text-sm">Para baixar o relatório completo, é necessário ter um plano BÁSICO ou superior.</p>
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
    </section>
  );
}
