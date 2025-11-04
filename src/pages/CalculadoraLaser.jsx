
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    if (isNaN(idade) || idade < 0) {
      alertas.push("Por favor, insira uma idade válida.");
      pontuacao -= 100; // Drastically reduce score for invalid input to prevent proceeding
    } else if (idade < 18) {
      alertas.push("Recomenda-se aguardar até 18 anos para depilação a laser definitiva");
      pontuacao -= 20;
    } else if (idade >= 18 && idade <= 50) {
      pontuacao += 20;
    } else if (idade > 50 && idade <= 70) {
      recomendacoes.push("A eficácia do laser pode ser ligeiramente menor em idades mais avançadas.");
      pontuacao += 10;
    } else {
      alertas.push("Para idades avançadas, a avaliação médica é ainda mais crucial.");
      pontuacao -= 5;
    }


    // Análise de fototipo
    if (dados.fototipo === "1" || dados.fototipo === "2" || dados.fototipo === "3") {
      pontuacao += 25;
      recomendacoes.push("Seu fototipo é ideal para tratamento a laser");
    } else if (dados.fototipo === "4") {
      pontuacao += 15;
      recomendacoes.push("Bons resultados esperados com laser apropriado");
    } else if (dados.fototipo === "5" || dados.fototipo === "6") { // Assuming "6" might be added later, or just covering V. Fototipo 6 missing in options, but good to have condition.
      pontuacao += 5;
      alertas.push("Fototipos mais altos requerem laser específico (Nd:YAG) e maior cautela.");
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
    } else { // baixa
      pontuacao += 5;
    }

    // Expectativas
    if (dados.expectativa === "realista") {
      pontuacao += 15;
      recomendacoes.push("Suas expectativas estão alinhadas com resultados típicos");
    } else {
      alertas.push("É importante ter expectativas realistas sobre redução de 70-90% dos pelos");
      pontuacao -= 10; // Penalize unrealistic expectations slightly
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
        <div className="space-y-3">
          {[
            { value: "1", label: "Tipo I-II: Pele muito clara, sempre queima, nunca bronzeia" },
            { value: "2", label: "Tipo III: Pele clara, às vezes queima, bronzeia gradualmente" },
            { value: "3", label: "Tipo IV: Pele morena clara, raramente queima, sempre bronzeia" },
            { value: "4", label: "Tipo V: Pele morena, nunca queima, bronzeia facilmente" },
            { value: "5", label: "Tipo VI: Pele negra, nunca queima" }
          ].map((option) => (
            <div
              key={option.value}
              onClick={() => setDados({ ...dados, fototipo: option.value })}
              className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                dados.fototipo === option.value
                  ? 'border-[#F7D426] bg-[#FFF9E6]'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                dados.fototipo === option.value
                  ? 'border-[#F7D426] bg-[#F7D426]'
                  : 'border-gray-300'
              }`}>
                {dados.fototipo === option.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2C2C2C]"></div>
                )}
              </div>
              <Label className="flex-1 cursor-pointer">{option.label}</Label>
            </div>
          ))}
        </div>
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
        <div className="space-y-3">
          {[
            { value: "preto", label: "Preto" },
            { value: "castanho-escuro", label: "Castanho Escuro" },
            { value: "castanho-claro", label: "Castanho Claro" },
            { value: "loiro", label: "Loiro/Claro" },
            { value: "ruivo", label: "Ruivo" },
            { value: "branco", label: "Branco/Grisalho" }
          ].map((option) => (
            <div
              key={option.value}
              onClick={() => setDados({ ...dados, corPelo: option.value })}
              className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                dados.corPelo === option.value
                  ? 'border-[#F7D426] bg-[#FFF9E6]'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                dados.corPelo === option.value
                  ? 'border-[#F7D426] bg-[#F7D426]'
                  : 'border-gray-300'
              }`}>
                {dados.corPelo === option.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2C2C2C]"></div>
                )}
              </div>
              <Label className="flex-1 cursor-pointer font-medium">{option.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-lg font-semibold mb-3 block">Qual a densidade dos pelos?</Label>
        <div className="space-y-3">
          {[
            { value: "alta", label: "Alta (muitos pelos)" },
            { value: "media", label: "Média" },
            { value: "baixa", label: "Baixa (poucos pelos)" }
          ].map((option) => (
            <div
              key={option.value}
              onClick={() => setDados({ ...dados, densidadePelos: option.value })}
              className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                dados.densidadePelos === option.value
                  ? 'border-[#F7D426] bg-[#FFF9E6]'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                dados.densidadePelos === option.value
                  ? 'border-[#F7D426] bg-[#F7D426]'
                  : 'border-gray-300'
              }`}>
                {dados.densidadePelos === option.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2C2C2C]"></div>
                )}
              </div>
              <Label className="flex-1 cursor-pointer font-medium">{option.label}</Label>
            </div>
          ))}
        </div>
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
        <div className="space-y-3">
          {[
            { value: "realista", label: "Realista: Redução de 70-90% dos pelos em 6-8 sessões" },
            { value: "alta", label: "Alta: Remoção 100% permanente em poucas sessões" }
          ].map((option) => (
            <div
              key={option.value}
              onClick={() => setDados({ ...dados, expectativa: option.value })}
              className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                dados.expectativa === option.value
                  ? 'border-[#F7D426] bg-[#FFF9E6]'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                dados.expectativa === option.value
                  ? 'border-[#F7D426] bg-[#F7D426]'
                  : 'border-gray-300'
              }`}>
                {dados.expectativa === option.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2C2C2C]"></div>
                )}
              </div>
              <Label className="flex-1 cursor-pointer">{option.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-lg font-semibold mb-3 block">Condições pré-existentes:</Label>
        <div className="space-y-3">
          {[
            { value: "nenhuma", label: "Nenhuma" },
            { value: "pele-sensivel", label: "Pele Sensível" },
            { value: "hormonal", label: "Distúrbios Hormonais (SOP, etc)" },
            { value: "medicamentos", label: "Uso de Medicamentos Fotossensibilizantes" }
          ].map((option) => (
            <div
              key={option.value}
              onClick={() => setDados({ ...dados, condicoesPreexistentes: option.value })}
              className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                dados.condicoesPreexistentes === option.value
                  ? 'border-[#F7D426] bg-[#FFF9E6]'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                dados.condicoesPreexistentes === option.value
                  ? 'border-[#F7D426] bg-[#F7D426]'
                  : 'border-gray-300'
              }`}>
                {dados.condicoesPreexistentes === option.value && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2C2C2C]"></div>
                )}
              </div>
              <Label className="flex-1 cursor-pointer font-medium">{option.label}</Label>
            </div>
          ))}
        </div>
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

        {etapa < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              {[1, 2, 3].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      etapa >= step ? 'bg-[#F7D426] text-[#2C2C2C]' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    <span className={`text-xs mt-2 font-medium text-center w-24 ${
                      etapa >= step ? 'text-[#2C2C2C]' : 'text-gray-500'
                    }`}>
                      {step === 1 && 'Dados Pessoais'}
                      {step === 2 && 'Características'}
                      {step === 3 && 'Avaliação'}
                    </span>
                  </div>
                  {step < 3 && (
                    <div className={`h-1 w-20 mx-2 transition-all ${
                      etapa > step ? 'bg-[#F7D426]' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

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
