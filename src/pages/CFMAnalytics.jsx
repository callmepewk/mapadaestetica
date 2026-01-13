import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { AlertCircle } from "lucide-react";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#e11d48", "#059669", "#f97316", "#0ea5e9"]; 

export default function CFMAnalytics() {
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => { (async () => { try { const u = await base44.auth.me(); setUser(u); } catch {} })(); }, []);
  useEffect(() => { (async () => { try { const data = await base44.entities.Doctor.list('-created_date', 10000); setDoctors(data || []);} catch {} })(); }, []);

  const isAdmin = user?.role === 'admin';
  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-600">Carregando...</div>;
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center text-gray-600">Acesso restrito aos administradores.</div>;

  const porUF = useMemo(() => {
    const m = new Map();
    doctors.forEach(d => m.set(d.uf_crm, (m.get(d.uf_crm) || 0) + 1));
    return Array.from(m.entries()).map(([uf, count]) => ({ uf, count }));
  }, [doctors]);

  const porSituacao = useMemo(() => {
    const m = new Map();
    doctors.forEach(d => m.set(d.situacao, (m.get(d.situacao) || 0) + 1));
    return Array.from(m.entries()).map(([situacao, count]) => ({ situacao, count }));
  }, [doctors]);

  const porEspecialidade = useMemo(() => {
    const m = new Map();
    doctors.forEach(d => { const esp = (d.especialidade || 'N/D').split(',')[0]; m.set(esp, (m.get(esp) || 0) + 1); });
    return Array.from(m.entries()).sort((a,b)=> b[1]-a[1]).slice(0, 20).map(([especialidade, count]) => ({ especialidade, count }));
  }, [doctors]);

  const crescimento = useMemo(() => {
    const m = new Map();
    doctors.forEach(d => { const k = (d.created_date || '').slice(0,10); if (k) m.set(k, (m.get(k)||0)+1); });
    return Array.from(m.entries()).sort((a,b)=> a[0].localeCompare(b[0])).map(([data, count]) => ({ data, count }));
  }, [doctors]);

  const inconsistencias = useMemo(() => doctors.filter(d => d.status_validacao === 'inconsistente').length, [doctors]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="text-center">
          <Badge className="mb-3">CFM Analytics</Badge>
          <h1 className="text-3xl font-bold mb-2">Indicadores e Auditoria</h1>
          <p className="text-gray-600">Contagem por UF, situação, evolução temporal e distribuição por especialidade</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-2 border-gray-200"><CardContent className="p-6">
            <h3 className="font-bold mb-3">Contagem por UF</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porUF}>
                  <XAxis dataKey="uf" /><YAxis /><Tooltip />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent></Card>

          <Card className="border-2 border-gray-200"><CardContent className="p-6">
            <h3 className="font-bold mb-3">Ativos vs Inativos/Suspensos/Cancelados</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={porSituacao} dataKey="count" nameKey="situacao" outerRadius={100} label>
                    {porSituacao.map((e, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent></Card>

          <Card className="border-2 border-gray-200 md:col-span-2"><CardContent className="p-6">
            <h3 className="font-bold mb-3">Crescimento Temporal (ingestões)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={crescimento}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" /><YAxis /><Tooltip /><Legend />
                  <Line type="monotone" dataKey="count" stroke="#16a34a" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent></Card>

          <Card className="border-2 border-gray-200 md:col-span-2"><CardContent className="p-6">
            <h3 className="font-bold mb-3">Top 20 Especialidades</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porEspecialidade}>
                  <XAxis dataKey="especialidade" hide /><YAxis /><Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent></Card>
        </div>

        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 text-sm">
            Dados exibidos conforme registros já ingeridos. Para atualizar, execute o pipeline em CFMPipeline. Indicadores de inconsistência são baseados em validações de normalização (CRM/UF ausentes).
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}