import React from "react";
import VisualInsightCard from "./VisualInsightCard";

export default function VisualInsightsGrid({ insights = [] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {insights.map((it, idx) => (
        <VisualInsightCard key={idx} {...it} />
      ))}
    </div>
  );
}