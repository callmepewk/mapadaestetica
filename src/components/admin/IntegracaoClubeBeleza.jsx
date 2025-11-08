import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Crown, AlertCircle } from "lucide-react";

export default function IntegracaoClubeBeleza({ usuario }) {
  const handleSincronizar = () => {
    const dados = {
      email: usuario.email,
      nome: usuario.full_name,
      telefone: usuario.telefone || '',
      whatsapp: usuario.whatsapp || '',
      cidade: usuario.cidade || '',
      estado: usuario.estado || '',
      plano_clube: usuario.plano_clube_beleza || 'nenhum',
      beauty_coins: usuario.beauty_coins || 0,
      pontos: usuario.pontos_acumulados || 0,
      origem: 'mapa_estetica',
      sincronizado_em: new Date().toISOString()
    };
    
    const params = new URLSearchParams(dados);
    window.open(`https://clube-da-beleza.base44.app?${params.toString()}`, '_blank');
  };

  return (
    <div className="space-y-3">
      <Alert className="bg-purple-50 border-purple-200">
        <Crown className="h-4 w-4 text-purple-600" />
        <AlertDescription className="text-purple-800 text-sm">
          <p className="font-semibold mb-2">🔗 Integração com Clube da Beleza</p>
          <p className="mb-3">
            Este usuário possui {usuario.beauty_coins || 0} Beauty Coins e está no plano {usuario.plano_clube_beleza || 'nenhum'}.
          </p>
          <Button
            onClick={handleSincronizar}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Sincronizar com Clube da Beleza
          </Button>
        </AlertDescription>
      </Alert>

      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 text-xs">
          💡 O botão acima envia os dados do usuário ao Clube da Beleza, incluindo Beauty Coins, pontos e informações do plano.
        </AlertDescription>
      </Alert>
    </div>
  );
}