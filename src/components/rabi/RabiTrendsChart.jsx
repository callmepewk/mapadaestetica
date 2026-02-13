import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function RabiTrendsChart({ gaMetrics = [], trendsSeries = [] }) {
  // Prepare GA series
  const gaData = (gaMetrics || []).map(r => ({ date: r.date, GA_Views: r.views, GA_Sessions: r.sessions }));
  // Prepare Trends (group by date sum values)
  const trendsByDate = {};
  (trendsSeries || []).forEach(r => {
    const key = r.date;
    trendsByDate[key] = (trendsByDate[key] || 0) + (Number(r.value) || 0);
  });
  const trendsData = Object.keys(trendsByDate).map(k => ({ date: k, Trends: trendsByDate[k] }));

  // Merge by date for aligned chart
  const merged = {};
  [...gaData, ...trendsData].forEach(row => {
    const key = row.date;
    merged[key] = { date: key, ...(merged[key] || {}), ...row };
  });
  const data = Object.values(merged).slice(0, 100);

  return (
    <Card className="border-2 border-pink-200 bg-white">
      <CardContent className="p-4">
        <h3 className="font-bold text-gray-900 mb-2">Visão Temporal — GA4 x Google Trends</h3>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <XAxis dataKey="date" hide={false} tick={{ fontSize: 10 }} angle={-20} height={40} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="GA_Views" stroke="#2563EB" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="GA_Sessions" stroke="#10B981" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="Trends" stroke="#EC4899" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}