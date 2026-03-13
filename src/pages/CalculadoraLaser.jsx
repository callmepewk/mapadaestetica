import React, { useEffect } from "react";
import { createPageUrl } from "@/utils";

export default function CalculadoraLaser() {
  useEffect(() => {
    // Página descontinuada: redireciona para o Mapa
    window.location.replace(createPageUrl("Mapa"));
  }, []);
  return null;
}