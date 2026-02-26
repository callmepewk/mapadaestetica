import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CheckinCalendario({ user, onCheckin }) {
  const todayISO = new Date().toISOString().slice(0,10);
  const checkins = user?.wellness_checkins || [];
  const hasToday = checkins.includes(todayISO);
  const monthKey = new Date().toISOString().slice(0,7);
  const monthCount = checkins.filter(d => d.startsWith(monthKey)).length;

  return (
    <Card className="border-2 border-emerald-200 bg-emerald-50/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-emerald-900">Check-in Diário</h3>
          <Badge className="bg-emerald-100 text-emerald-800">{monthCount} no mês</Badge>
        </div>
        <p className="text-sm text-emerald-800 mb-3">Faça check-in diário e ganhe pontos extras.</p>
        <Button
          disabled={hasToday}
          onClick={onCheckin}
          className={`w-full ${hasToday ? 'bg-gray-200 text-gray-600' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
        >
          {hasToday ? 'Check-in de hoje realizado' : 'Fazer check-in (+5 pts)'}
        </Button>
      </CardContent>
    </Card>
  );
}