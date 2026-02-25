import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ExplicadorCadastroAnuncio() {
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="text-amber-900 text-sm">
        Dica: preencha um <strong>título claro</strong>, uma <strong>descrição objetiva</strong> e escolha uma <strong>categoria precisa</strong>.
        O campo <strong>“Quem pode ver”</strong> define se o anúncio aparece para <em>todos</em> (máximo alcance), somente <em>visitantes</em> (clientes finais) ou apenas <em>profissionais</em> (B2B, parcerias/ofertas técnicas).
      </AlertDescription>
    </Alert>
  );
}