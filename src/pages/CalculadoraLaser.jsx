import React from "react";
import CalculadoraLaserSection from "../components/home/CalculadoraLaserSection";

export default function CalculadoraLaser() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Calculadora de Viabilidade de Laser</h1>
      <p className="text-gray-600 mb-6">Use a calculadora abaixo para avaliar a viabilidade de investimentos em laser na sua clínica.</p>
      <CalculadoraLaserSection />
    </div>
  );
}