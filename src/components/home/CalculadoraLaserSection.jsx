import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp, DollarSign, Activity } from "lucide-react";

export default function CalculadoraLaserSection() {
  const [dados, setDados] = useState({
    modeloLaser: "Ex: CO2 Fracionado",
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

  const calcular = () => {
    const precoLiquido = dados.precoMedio * (1 - dados.descontoMedio / 100);
    const margemBruta = precoLiquido - dados.custoVariavel;
    const margemBrutaPct = (margemBruta / precoLiquido) * 100;
    const capacidadeMaxima = dados.sessoesHora * dados.horasDia * dados.diasMes;
    const receitaPotencialMes = precoLiquido * capacidadeMaxima;

    // Payback simplificado (em meses)
    const investimentoTotal = dados.custoAquisicao + dados.custosAdicionais;
    const paybackCompra = investimentoTotal / (margemBruta * capacidadeMaxima * 0.7);
    const paybackAluguel = dados.custoAluguel / (margemBruta * capacidadeMaxima * 0.7 - dados.custoAluguel);

    // VPL e TIR simplificados (cálculos aproximados)
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

    const tirCompra = (vplCompra / investimentoTotal) * 100;
    const tirAluguel = (vplAluguel / (dados.custoAluguel * meses)) * 100;

    setResultados({
      precoLiquido,
      margemBruta,
      margemBrutaPct,
      capacidadeMaxima,
      receitaPotencialMes,
      paybackCompra,
      paybackAluguel,
      vplCompra,
      vplAluguel,
      tirCompra,
      tirAluguel
    });
  };

  useEffect(() => {
    calcular();
  }, [dados]);

  const handleChange = (campo, valor) => {
    setDados(prev => ({ ...prev, [campo]: parseFloat(valor) || 0 }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-600 text-white">
            <Calculator className="w-4 h-4 mr-2" />
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
          {/* Inputs */}
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
                      onChange={(e) => setDados({ ...dados, modeloLaser: e.target.value })}
                      className="mt-1"
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
            </CardContent>
          </Card>

          {/* Resultados */}
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

            <Card className="border-none shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Comparativo: Compra vs Aluguel
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-700 font-medium mb-2">Payback Compra</p>
                      <p className="text-xl font-bold text-green-800">
                        {resultados.paybackCompra.toFixed(1)} meses
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-700 font-medium mb-2">Payback Aluguel</p>
                      <p className="text-xl font-bold text-blue-800">
                        {resultados.paybackAluguel > 0 ? `${resultados.paybackAluguel.toFixed(1)} meses` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-purple-700 font-medium mb-2">VPL Compra</p>
                      <p className="text-lg font-bold text-purple-800">
                        {formatCurrency(resultados.vplCompra)}
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-sm text-orange-700 font-medium mb-2">VPL Aluguel</p>
                      <p className="text-lg font-bold text-orange-800">
                        {formatCurrency(resultados.vplAluguel)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border-2 border-yellow-200">
                    <p className="text-sm font-bold text-amber-900 mb-2">💡 Recomendação:</p>
                    <p className="text-sm text-amber-800">
                      {resultados.vplCompra > resultados.vplAluguel 
                        ? "A COMPRA apresenta melhor retorno financeiro no longo prazo!" 
                        : "O ALUGUEL pode ser mais vantajoso considerando os riscos e flexibilidade."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer da Calculadora */}
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