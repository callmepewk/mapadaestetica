import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, HelpCircle, RotateCcw, MousePointer2 } from "lucide-react";

export default function JogosPontos({ onAward }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <QuizJogo onAward={onAward} />
      <RoletaJogo onAward={onAward} />
      <CliqueRapido onAward={onAward} />
    </div>
  );
}

function QuizJogo({ onAward }) {
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(null);
  const handle = (ok) => {
    if (answered) return;
    setAnswered(true);
    setCorrect(ok);
    onAward(ok ? 20 : 5);
  };
  return (
    <Card className="border-2 border-pink-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2"><HelpCircle className="w-4 h-4 text-pink-600"/><h4 className="font-semibold">Quiz Relâmpago</h4></div>
        <p className="text-sm mb-3">Qual faixa de preço representa valores acima de R$ 5.000?</p>
        <div className="grid gap-2">
          {['$$','$$$$$','$$$'].map(opt => (
            <Button key={opt} size="sm" variant="outline" disabled={answered} onClick={()=>handle(opt==='$$$$$')}>{opt}</Button>
          ))}
        </div>
        {answered && <Badge className={`mt-3 ${correct?'bg-green-100 text-green-800':'bg-gray-100 text-gray-700'}`}>{correct?'Correto! +20 pts':'Quase! +5 pts'}</Badge>}
      </CardContent>
    </Card>
  );
}

function RoletaJogo({ onAward }) {
  const [played, setPlayed] = useState(false);
  const [prize, setPrize] = useState(null);
  const spin = () => {
    if (played) return;
    const options = [5,10,15,20,25];
    const p = options[Math.floor(Math.random()*options.length)];
    setPrize(p); setPlayed(true); onAward(p);
  };
  return (
    <Card className="border-2 border-amber-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2"><RotateCcw className="w-4 h-4 text-amber-600"/><h4 className="font-semibold">Roleta de Pontos</h4></div>
        <p className="text-sm mb-3">Gire e ganhe pontos aleatórios.</p>
        <Button onClick={spin} disabled={played} className="w-full bg-amber-600 hover:bg-amber-700 text-white">{played? 'Você ganhou +' + prize + ' pts' : 'Girar'}</Button>
      </CardContent>
    </Card>
  );
}

function CliqueRapido({ onAward }) {
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);
  const click = () => { if (!done) setCount(c=>c+1); };
  const finalizar = () => { if (done) return; setDone(true); const pts = Math.min(25, 5 + Math.floor(count/3)); onAward(pts); };
  return (
    <Card className="border-2 border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2"><MousePointer2 className="w-4 h-4 text-purple-600"/><h4 className="font-semibold">Clique Rápido</h4></div>
        <p className="text-sm mb-3">Clique o máximo que puder e finalize para ganhar.</p>
        <div className="flex gap-2">
          <Button onClick={click} disabled={done} variant="outline" className="flex-1">Clique ({count})</Button>
          <Button onClick={finalizar} disabled={done} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">Finalizar</Button>
        </div>
        {done && <Badge className="mt-3 bg-purple-100 text-purple-800">Registrado! Pontos adicionados.</Badge>}
      </CardContent>
    </Card>
  );
}