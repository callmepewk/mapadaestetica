import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, ShieldCheck } from "lucide-react";

export default function PlannerWellness() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Chat state
  const [step, setStep] = useState(1);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Olá! Eu sou seu assistente do Planner de Wellness." },
    { from: "bot", text: "Vamos começar com algumas perguntas rápidas para entendermos seu momento." },
  ]);

  // Answers
  const [ansPrev, setAnsPrev] = useState(null); // 'sim' | 'nao'
  const [ansLastWhen, setAnsLastWhen] = useState("");
  const [ansLastName, setAnsLastName] = useState("");
  const [ansLastType, setAnsLastType] = useState(""); // 'procedimento' | 'tratamento'
  const [ansSatisf, setAnsSatisf] = useState(null); // 'sim' | 'nao'
  const [ansWants, setAnsWants] = useState(null); // 'sim' | 'nao'
  const [ansGoal, setAnsGoal] = useState("");
  const [ansBudget, setAnsBudget] = useState("");
  const [completed, setCompleted] = useState(false);

  // Input state (for free text steps)
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Keyword detection (sem IA) usando listas conhecidas
  const detectItemType = (txt) => {
    const q = (txt || "").toLowerCase();
    // Procedimentos
    const procedimentos = [
      "botox","toxina botulinica","toxina botulínica","preenchimento","ácido hialurônico","acido hialuronico",
      "bioestimulador","skinbooster","microagulhamento","peeling","peeling químico","laser","laser co2","depilação a laser","depilacao a laser","fios de sustentação","fios de pdo"
    ];
    // Tratamentos
    const tratamentos = [
      "rejuvenescimento facial","rugas","linhas de expressão","melasma","acne","cicatriz de acne","flacidez facial",
      "gordura localizada","celulite","queda de cabelo","calvície","estrias","manchas na pele","olheiras","poros dilatados"
    ];
    if (procedimentos.some(k => q.includes(k))) return "procedimento";
    if (tratamentos.some(k => q.includes(k))) return "tratamento";
    return "procedimento"; // padrão
  };

  const pushBot = (text) => setMessages((m) => [...m, { from: "bot", text }]);
  const pushUser = (text) => setMessages((m) => [...m, { from: "user", text }]);

  // Step handlers
  useEffect(() => {
    if (step === 1) {
      pushBot("Você já realizou procedimentos ou tratamentos estéticos antes?");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const handlePrev = (val) => {
    setAnsPrev(val);
    pushUser(val === "sim" ? "Sim" : "Não");
    if (val === "sim") {
      setStep(2);
      setTimeout(() => pushBot("Quanto tempo faz desde o último procedimento ou tratamento?"), 200);
    } else {
      setStep(5);
      setTimeout(() => pushBot("Você tem vontade de realizar algum outro procedimento ou tratamento estético?"), 200);
    }
  };

  const handleSendText = () => {
    const txt = input.trim();
    if (!txt) return;

    if (step === 2) {
      setAnsLastWhen(txt);
      pushUser(txt);
      setStep(3);
      setTimeout(() => pushBot("Qual foi o procedimento ou tratamento realizado?"), 200);
      setInput("");
      return;
    }

    if (step === 3) {
      setAnsLastName(txt);
      const t = detectItemType(txt);
      setAnsLastType(t);
      pushUser(txt);
      setStep(4);
      setTimeout(() => pushBot("Você teve um resultado satisfatório?"), 200);
      setInput("");
      return;
    }

    if (step === 6) {
      setAnsGoal(txt);
      pushUser(txt);
      setStep(7);
      setTimeout(() => pushBot("Quanto você está disposto(a) a investir? (valor livre)"), 200);
      setInput("");
      return;
    }

    if (step === 7) {
      setAnsBudget(txt);
      pushUser(txt);
      setInput("");
      // Salvar no perfil (apenas quando completa)
      (async () => {
        try {
          await base44.auth.updateMe({
            plannerWellness: {
              realizou_procedimentos: ansPrev,
              tempo_desde_ultimo: ansPrev === "sim" ? ansLastWhen : "",
              item_identificado: ansPrev === "sim" ? { nome: ansLastName, tipo: ansLastType } : null,
              resultado_satisfatorio: ansPrev === "sim" ? ansSatisf : null,
              objetivo_estetico: txt ? (ansGoal || txt) : ansGoal,
              orcamento_estimado: txt,
              completed_at: new Date().toISOString(),
            },
          });
          setCompleted(true);
          setStep(8);
          setTimeout(() => {
            pushBot("Prontinho! Suas respostas foram salvas.");
            pushBot("Veja abaixo o resumo do seu Planner e, se desejar, já pode agendar uma consulta de telemedicina.");
          }, 200);
        } catch {
          // mesmo que falhe, concluímos o fluxo
          setCompleted(true);
          setStep(8);
          pushBot("Fluxo concluído.");
        }
      })();
      return;
    }
  };

  const handleSatisf = (val) => {
    setAnsSatisf(val);
    pushUser(val === "sim" ? "Sim" : "Não");
    setStep(5);
    setTimeout(() => pushBot("Você tem vontade de realizar algum outro procedimento ou tratamento estético?"), 200);
  };

  const handleWants = (val) => {
    setAnsWants(val);
    pushUser(val === "sim" ? "Sim" : "Não");
    if (val === "nao") {
      // Encerrar sem salvar
      setStep(0);
      setTimeout(() => pushBot("Obrigado por utilizar o Planner de Wellness."), 200);
    } else {
      setStep(6);
      setTimeout(() => pushBot("Qual é o seu objetivo ou meta estética?"), 200);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header minimalista */}
      <div className="border-b bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-700" />
          <h1 className="text-xl font-bold text-gray-900">Planner de Wellness</h1>
          <Badge className="ml-auto bg-emerald-100 text-emerald-800">Beta</Badge>
        </div>
      </div>

      {/* Área principal - Chat */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          {/* Chat viewport */}
          <div ref={scrollRef} className="h-[60vh] sm:h-[70vh] overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`${m.from === "user" ? "bg-emerald-600 text-white rounded-2xl rounded-tr-sm" : "bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm"} px-3 py-2 max-w-[80%] shadow-sm animate-in fade-in slide-in-from-${m.from === "user" ? "right" : "left"}-2`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Perguntas progressivas */}
            {step === 1 && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-left-2">
                <Button onClick={() => handlePrev("sim")} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">Sim</Button>
                <Button variant="outline" onClick={() => handlePrev("nao")} className="rounded-full">Não</Button>
              </div>
            )}

            {step === 2 && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ex.: 3 meses, 1 ano, 2 semanas"
                  className="max-w-xs"
                />
                <Button onClick={handleSendText} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Send className="w-4 h-4 mr-1" /> Enviar
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ex.: Toxina botulínica (botox), peeling químico, microagulhamento"
                  className="max-w-md"
                />
                <Button onClick={handleSendText} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Send className="w-4 h-4 mr-1" /> Enviar
                </Button>
              </div>
            )}

            {step === 4 && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-left-2">
                <Button onClick={() => handleSatisf("sim")} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">Sim</Button>
                <Button variant="outline" onClick={() => handleSatisf("nao")} className="rounded-full">Não</Button>
              </div>
            )}

            {step === 5 && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-left-2">
                <Button onClick={() => handleWants("sim")} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">Sim</Button>
                <Button variant="outline" onClick={() => handleWants("nao")} className="rounded-full">Não</Button>
              </div>
            )}

            {step === 6 && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ex.: melhorar a pele, tratar melasma, reduzir gordura abdominal"
                  className="max-w-md"
                />
                <Button onClick={handleSendText} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Send className="w-4 h-4 mr-1" /> Enviar
                </Button>
              </div>
            )}

            {step === 7 && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ex.: 500 reais, 2000, até 3000"
                  className="max-w-xs"
                />
                <Button onClick={handleSendText} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Sparkles className="w-4 h-4 mr-1" /> Concluir e salvar
                </Button>
              </div>
            )}

            {step === 0 && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-left-2">
                <Button variant="outline" onClick={() => {
                  // reset
                  setStep(1);
                  setAnsPrev(null); setAnsLastWhen(""); setAnsLastName(""); setAnsLastType(""); setAnsSatisf(null); setAnsWants(null); setAnsGoal(""); setAnsBudget("");
                  setMessages([
                    { from: "bot", text: "Olá! Eu sou seu assistente do Planner de Wellness." },
                    { from: "bot", text: "Vamos começar com algumas perguntas rápidas para entendermos seu momento." },
                  ]);
                }}>Reiniciar</Button>
              </div>
            )}
          </div>

          {/* Resumo + Telemedicina quando concluído */}
          {completed && step === 8 && (
            <div className="border-t p-4 bg-emerald-50">
              <p className="text-sm font-semibold text-emerald-900 mb-2">Resumo do seu Planner</p>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-white border">
                  <p className="text-gray-700">Já realizou procedimentos?</p>
                  <p className="font-semibold">{ansPrev || "—"}</p>
                </div>
                {ansPrev === "sim" && (
                  <div className="p-3 rounded-lg bg-white border">
                    <p className="text-gray-700">Último realizado</p>
                    <p className="font-semibold">{ansLastName} {ansLastType ? `(${ansLastType})` : ""}</p>
                    <p className="text-xs text-gray-500">há {ansLastWhen} • Satisfatório: {ansSatisf || "—"}</p>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-white border">
                  <p className="text-gray-700">Objetivo</p>
                  <p className="font-semibold">{ansGoal || "—"}</p>
                </div>
                <div className="p-3 rounded-lg bg-white border">
                  <p className="text-gray-700">Orçamento</p>
                  <p className="font-semibold">{ansBudget || "—"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  onClick={() => {
                    const section = document.getElementById("planner-resumo");
                    if (section) section.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Meu Planner
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const nome = user?.full_name || "";
                    const msg = encodeURIComponent(`Olá, tudo bem? Me chamo ${nome} e desejo agendar uma consulta de Telemedicina com base no meu Planner de Wellness.`);
                    window.open(`https://wa.me/5521980343873?text=${msg}`, "_blank");
                  }}
                >
                  Agendar consulta de telemedicina
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Âncora simples para "Meu Planner" */}
        {completed && (
          <div id="planner-resumo" className="mt-6 p-4 rounded-2xl border bg-white shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Meu Planner</h3>
            <ul className="text-sm text-gray-800 space-y-1">
              <li>• Já realizou procedimentos: <strong>{ansPrev || "—"}</strong></li>
              {ansPrev === "sim" && (
                <li>• Tempo desde o último: <strong>{ansLastWhen}</strong></li>
              )}
              {ansPrev === "sim" && (
                <li>• Procedimento/Tratamento: <strong>{ansLastName}</strong> {ansLastType ? `(${ansLastType})` : ""}</li>
              )}
              {ansPrev === "sim" && (
                <li>• Resultado satisfatório: <strong>{ansSatisf || "—"}</strong></li>
              )}
              <li>• Objetivo estético: <strong>{ansGoal || "—"}</strong></li>
              <li>• Orçamento estimado: <strong>{ansBudget || "—"}</strong></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}