import React, { useEffect } from "react";
import { createPageUrl } from "@/utils";

export default function CalculadoraLaser() {
  useEffect(() => {
    window.location.replace(createPageUrl("Mapa"));
  }, []);
  return null;
}