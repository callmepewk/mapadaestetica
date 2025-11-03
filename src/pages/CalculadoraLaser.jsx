import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Calculator, 
  User, 
  Palette, 
  Sun, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft,
  Award
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CalculadoraLaser() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [dados, setDados] = useState({
    idade: "",
    fototipo: "",
    areaCorpo: "",
    densidadePelos: "",
    corPelo: "",
    expectativa: "",
    condicoesPreexistentes: ""
  });
  const [resultado, setResultado] = useState(null);

  const calcularViabilidade = () => {
    let pontuacao = 0;
    let alertas = [];
    let recomendacoes = [];

    // Análise de idade
    const idade = parseInt(dados.idade);
    if (idade < 18) {
      alertas.push("Recomenda-se aguardar até 18 anos para depilação a laser definitiva");
      pontuacao -= 20;
    } else if (idade >= 18 && idade <= 50) {
      pontuacao += 20;
    }

    // Análise de fototipo
    if (dados.fototipo === "1" || dados.fototipo === "2" || dados.fototipo === "3") {
      pontuacao += 25;
      recomendacoes.push("Seu fototipo é ideal para tratamento a laser");
    } else if (dados.fototipo === "4") {
      pontuacao += 15;
      recomendacoes.push("Bons resultados esperados com laser apropriado");
    } else {
      pontuacao += 5;
      alertas.push("Fototipos mais altos requerem laser específico (Nd:YAG)");
    }

    // Análise de cor do pelo
    if (dados.corPelo === "preto" || dados.corPelo === "castanho-escuro") {
      pontuacao += 25;
      recomendacoes.push("Cor do pelo ideal para absorção de laser");
    } else if (dados.corPelo === "castanho-claro") {
      pontuacao += 15;
    } else {
      pontuacao += 5;
      alertas.push("Pelos claros, ruivos ou brancos têm menor resposta ao laser");
    }

    // Análise de densidade
    if (dados.densidadePelos === "alta") {
      pontuacao += 15;
      recomendacoes.push("Alta densidade permite melhores resultados");
    } else if (dados.densidadePelos === "media") {
      pontuacao += 10;
    } else {
      pontuacao += 5;
    }

    // Expectativas
    if (dados.expectativa === "realista") {
      pontuacao += 15;
      recomendacoes.push("Suas expectativas estão alinhadas com resultados típicos");
    } else {
      alertas.push("É importante ter expectativas realistas sobre redução de 70-90% dos pelos");
    }

    // Condições pré-existentes
    if (dados.condicoesPreexistentes !== "nenhuma") {
      alertas.push("Consulta médica prévia é essencial devido a condições de saúde");
      pontuacao -= 10;
    }

    let viabilidade = "";
    let cor = "";
    if (pontuacao >= 80) {
      viabilidade = "EXCELENTE";
      cor = "text-green-600";
    } else if (pontuacao >= 60) {
      viabilidade = "BOA";
      cor = "text-blue-600";
    } else if (pontuacao >= 40) {
      viabilidade = "MODERADA";
      cor = "text-yellow-600";
    } else {
      viabilidade = "BAIXA";
      cor = "text-red-600";
    }

    setResultado({
      pontuacao,
      viabilidade,
      cor,
      alertas,
      recomendacoes
    });
    setEtapa(4);
  };

  const renderEtapa1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="idade" className="text-lg font-semibold">Qual sua idade?</Label>
        <Input
          id="idade"
          type="number"
          value={dados.idade}
          onChange={(e) => setDados({ ...dados, idade: e.target.value })}
          placeholder="Ex: 25"
          className="mt-2 h-12 text-lg"
        />
      </div>

      <div>
        <Label className="text-lg font-semibold mb-3 block">Qual seu fototipo de pele?</Label>
        <RadioGroup value={dados.fototipo} onValueChange={(value) => setDados({ ...dados, fototipo: value })}>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="1" id="f1" />
              <Label htmlFor="f1" className="flex-1 cursor-pointer">
                <span className="font-medium">Tipo I-II:</span> Pele muito clara, sempre queima, nunca bronzeia
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="2" id="f2" />
              <Label htmlFor="f2" className="flex-1 cursor-pointer">
                <span className="font-medium">Tipo III:</span> Pele clara, às vezes queima, bronzeia gradualmente
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="3" id="f3" />
              <Label htmlFor="f3" className="flex-1 cursor-pointer">
                <span className="font-medium">Tipo IV:</span> Pele morena clara, raramente queima, sempre bronzeia
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="4" id="f4" />
              <Label htmlFor="f4" className="flex-1 cursor-pointer">
                <span className="font-medium">Tipo V:</span> Pele morena, nunca queima, bronzeia facilmente
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="5" id="f5" />
              <Label htmlFor="f5" className="flex-1 cursor-pointer">
                <span className="font-medium">Tipo VI:</span> Pele negra, nunca queima
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <Button
        onClick={() => setEtapa(2)}
        disabled={!dados.idade || !dados.fototipo}
        className="w-full h-12 bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold text-lg"
      >
        Próxima Etapa
      </Button>
    </div>
  );

  const renderEtapa2 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-semibold mb-3 block">Qual a cor predominante dos pelos?</Label>
        <RadioGroup value={dados.corPelo} onValueChange={(value) => setDados({ ...dados, corPelo: value })}>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="preto" id="p1" />
              <Label htmlFor="p1" className="flex-1 cursor-pointer font-medium">Preto</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="castanho-escuro" id="p2" />
              <Label htmlFor="p2" className="flex-1 cursor-pointer font-medium">Castanho Escuro</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="castanho-claro" id="p3" />
              <Label htmlFor="p3" className="flex-1 cursor-pointer font-medium">Castanho Claro</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="loiro" id="p4" />
              <Label htmlFor="p4" className="flex-1 cursor-pointer font-medium">Loiro/Claro</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="ruivo" id="p5" />
              <Label htmlFor="p5" className="flex-1 cursor-pointer font-medium">Ruivo</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="branco" id="p6" />
              <Label htmlFor="p6" className="flex-1 cursor-pointer font-medium">Branco/Grisalho</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-lg font-semibold mb-3 block">Qual a densidade dos pelos?</Label>
        <RadioGroup value={dados.densidadePelos} onValueChange={(value) => setDados({ ...dados, densidadePelos: value })}>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="alta" id="d1" />
              <Label htmlFor="d1" className="flex-1 cursor-pointer font-medium">Alta (muitos pelos)</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="media" id="d2" />
              <Label htmlFor="d2" className="flex-1 cursor-pointer font-medium">Média</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="baixa" id="d3" />
              <Label htmlFor="d3" className="flex-1 cursor-pointer font-medium">Baixa (poucos pelos)</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setEtapa(1)}
          variant="outline"
          className="flex-1 h-12 text-lg"
        >
          Voltar
        </Button>
        <Button
          onClick={() => setEtapa(3)}
          disabled={!dados.corPelo || !dados.densidadePelos}
          className="flex-1 h-12 bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold text-lg"
        >
          Próxima Etapa
        </Button>
      </div>
    </div>
  );

  const renderEtapa3 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-semibold mb-3 block">Suas expectativas são:</Label>
        <RadioGroup value={dados.expectativa} onValueChange={(value) => setDados({ ...dados, expectativa: value })}>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="realista" id="e1" />
              <Label htmlFor="e1" className="flex-1 cursor-pointer">
                <span className="font-medium">Realista:</span> Redução de 70-90% dos pelos em 6-8 sessões
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="alta" id="e2" />
              <Label htmlFor="e2" className="flex-1 cursor-pointer">
                <span className="font-medium">Alta:</span> Remoção 100% permanente em poucas sessões
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-lg font-semibold mb-3 block">Condições pré-existentes:</Label>
        <RadioGroup value={dados.condicoesPreexistentes} onValueChange={(value) => setDados({ ...dados, condicoesPreexistentes: value })}>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="nenhuma" id="c1" />
              <Label htmlFor="c1" className="flex-1 cursor-pointer font-medium">Nenhuma</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="pele-sensivel" id="c2" />
              <Label htmlFor="c2" className="flex-1 cursor-pointer font-medium">Pele Sensível</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="hormonal" id="c3" />
              <Label htmlFor="c3" className="flex-1 cursor-pointer font-medium">Distúrbios Hormonais (SOP, etc)</Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="medicamentos" id="c4" />
              <Label htmlFor="c4" className="flex-1 cursor-pointer font-medium">Uso de Medicamentos Fotossensibilizantes</Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setEtapa(2)}
          variant="outline"
          className="flex-1 h-12 text-lg"
        >
          Voltar
        </Button>
        <Button
          onClick={calcularViabilidade}
          disabled={!dados.expectativa || !dados.condicoesPreexistentes}
          className="flex-1 h-12 bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold text-lg"
        >
          Ver Resultado
        </Button>
      </div>
    </div>
  );

  const renderResultado = () => (
    <div className="space-y-6">
      <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-[#F7D426]">
        <Award className={`w-20 h-20 mx-auto mb-4 ${resultado.cor}`} />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Viabilidade do Tratamento</h3>
        <p className={`text-5xl font-bold ${resultado.cor} mb-2`}>{resultado.viabilidade}</p>
        <p className="text-gray-600">Pontuação: {resultado.pontuacao}/100</p>
      </div>

      {resultado.alertas.length > 0 && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <AlertDescription>
            <p className="font-semibold text-yellow-900 mb-2">Atenção:</p>
            <ul className="list-disc list-inside space-y-1 text-yellow-800">
              {resultado.alertas.map((alerta, i) => (
                <li key={i}>{alerta}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {resultado.recomendacoes.length > 0 && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertDescription>
            <p className="font-semibold text-green-900 mb-2">Recomendações:</p>
            <ul className="list-disc list-inside space-y-1 text-green-800">
              {resultado.recomendacoes.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-5 w-5 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <p className="font-semibold mb-2">Importante:</p>
          <p>Este resultado é uma estimativa educacional. É fundamental consultar um médico dermatologista ou especialista em depilação a laser para avaliação personalizada e prescrição adequada do tratamento.</p>
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <Button
          onClick={() => {
            setEtapa(1);
            setDados({
              idade: "",
              fototipo: "",
              areaCorpo: "",
              densidadePelos: "",
              corPelo: "",
              expectativa: "",
              condicoesPreexistentes: ""
            });
            setResultado(null);
          }}
          className="w-full h-12 bg-[#2C2C2C] hover:bg-[#3A3A3A] text-[#F7D426] font-bold text-lg"
        >
          Fazer Nova Avaliação
        </Button>
        <Button
          onClick={() => navigate(createPageUrl("Anuncios") + "?categoria=Depilação")}
          variant="outline"
          className="w-full h-12 text-lg"
        >
          Encontrar Profissionais
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Inicio"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center mb-8">
          <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold">
            Desenvolvido por Dr. Jauru Nunes de Freitas
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C2C2C] mb-3">
            Calculadora de Viabilidade de Laser
          </h1>
          <p className="text-gray-600 text-lg">
            Descubra se a depilação a laser é adequada para você
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  etapa >= step ? 'bg-[#F7D426] text-[#2C2C2C]' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    etapa > step ? 'bg-[#F7D426]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Dados Pessoais</span>
            <span>Características</span>
            <span>Avaliação</span>
          </div>
        </div>

        <Card className="border-none shadow-2xl">
          <CardContent className="p-6 md:p-8">
            {etapa === 1 && renderEtapa1()}
            {etapa === 2 && renderEtapa2()}
            {etapa === 3 && renderEtapa3()}
            {etapa === 4 && renderResultado()}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© 2025 Clube da Beleza - Mapa da Estética</p>
          <p className="mt-1">Ferramenta educacional - Não substitui consulta médica</p>
        </div>
      </div>
    </div>
  );
}