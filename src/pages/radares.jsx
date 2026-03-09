import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function radares() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(createPageUrl("Radares"), { replace: true });
  }, [navigate]);
  return <div className="p-6 text-center text-gray-600">Abrindo RABI…</div>;
}