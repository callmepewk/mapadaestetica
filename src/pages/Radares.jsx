import React from "react";
import RadarSection from "../components/analytics/RadarSection";

export default function Radares() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Radares</h1>
        <RadarSection />
      </div>
    </div>
  );
}