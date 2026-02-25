import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, HelpCircle, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function JogosPontos({ onAward }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <QuizJogo onAward={onAward} />
      <RoletaJogo onAward={onAward} />
    </div>
  );
}

function useQuizDeHoje() {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const hoje = new Date();
      const dataKey = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()))
        .toISOString()
        .slice(0, 10);
      const existentes = await base44.entities.QuizDiario.filter({ data: dataKey }, "-created_date", 1);
      if (existentes && existentes.length) {
        setQuiz(existentes[0]);
      } else {
        // fallback: invocar função manualmente (sem depender do agendamento)
        await base44.functions.invoke("generateDailyQuiz", {});
        const again = await base44.entities.QuizDiario.filter({ data: dataKey }, "-created_date", 1);
        setQuiz(again?.[0] || null);
      }
      setLoading(false);
    };
    load();
  }, []);

  return { quiz, loading };
}

function QuizJogo({ onAward }) {
  const { quiz, loading } = useQuizDeHoje();
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(null);

  const handle = (idx) => {
    if (answered) return;
    const ok = idx === quiz.correta_index;
    setAnswered(true);
    setCorrect(ok);
    onAward?.(ok ? 20 : 5);
  };

  return (
    <Card className="border-2 border-pink-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-4 h-4 text-pink-600" />
          <h4 className="font-semibold">Quiz Relâmpago (dia)</h4>
        </div>
        {loading || !quiz ? (
          <p className="text-sm text-gray-600">Carregando quiz...</p>
        ) : (
          <>
            <p className="text-sm mb-3">{quiz.pergunta}</p>
            <div className="grid gap-2">
              {quiz.opcoes.map((opt, i) => (
                <Button key={i} size="sm" variant="outline" disabled={answered} onClick={() => handle(i)}>
                  {opt}
                </Button>
              ))}
            </div>
            {answered && (
              <Badge className={`mt-3 ${correct ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                {correct ? "Correto! +20 pts" : "Quase! +5 pts"}
              </Badge>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function RoletaJogo({ onAward }) {
  const segmentos = useMemo(() => [5, 10, 15, 20, 30], []);
  const [girando, setGirando] = useState(false);
  const [prize, setPrize] = useState(null);
  const [angulo, setAngulo] = useState(0);

  const spin = () => {
    if (girando || prize) return;
    setGirando(true);
    const volta = 360 * 5; // 5 voltas
    const idx = Math.floor(Math.random() * segmentos.length);
    const alvo = 360 - (idx * (360 / segmentos.length)) - (360 / segmentos.length) / 2; // alinhar ao ponteiro
    const angFinal = volta + alvo + Math.floor(Math.random() * 10 - 5);
    setAngulo(angFinal);
    setTimeout(() => {
      setGirando(false);
      setPrize(segmentos[idx]);
      onAward?.(segmentos[idx]);
    }, 3500);
  };

  return (
    <Card className="border-2 border-amber-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <RotateCcw className="w-4 h-4 text-amber-600" />
          <h4 className="font-semibold">Roleta de Pontos</h4>
        </div>
        <p className="text-sm mb-3">Gire e ganhe pontos aleatórios.</p>

        <div className="relative mx-auto w-48 h-48">
          {/* Ponteiro */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <div className="w-0 h-0 border-l-8 border-r-8 border-b-[14px] border-l-transparent border-r-transparent border-b-rose-600" />
          </div>

          {/* Roda */}
          <motion.div
            className="w-48 h-48 rounded-full overflow-hidden border-4 border-amber-300 shadow-inner"
            animate={{ rotate: angulo }}
            transition={{ type: 'tween', duration: 3.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: `conic-gradient(#fde68a 0deg, #fde68a ${360 / segmentos.length}deg, #fff ${360 / segmentos.length}deg)`
            }}
          >
            {/* Segmentos */}
            {segmentos.map((p, i) => (
              <div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: `rotate(${(360 / segmentos.length) * i}deg)` }}
              >
                <div className="w-1/2 text-center -rotate-90 text-sm font-bold text-amber-800">+{p} pts</div>
              </div>
            ))}
          </motion.div>
        </div>

        <Button onClick={spin} disabled={girando || !!prize} className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white">
          {girando ? "Girando..." : prize ? `Você ganhou +${prize} pts` : "Girar"}
        </Button>
      </CardContent>
    </Card>
  );
}