import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#f59e0b", "#10b981", "#6366f1", "#ec4899", "#06b6d4"]; // amber, emerald, indigo, pink, cyan

export default function TrendSharePie({ data, title }) {
  return (
    <Card className="border-2 border-amber-200">
      <CardContent className="p-4">
        <div className="text-amber-800 font-semibold mb-2">{title || "Distribuição por Categoria"}</div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}