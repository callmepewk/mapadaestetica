import React from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import RealtimeStats from "../components/pro/RealtimeStats";
import BoostProfile from "../components/pro/BoostProfile";

export default function PainelProfissional() {
  const [user, setUser] = React.useState(null);
  React.useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
      } catch {
        base44.auth.redirectToLogin(createPageUrl("PainelProfissional"));
      }
    })();
  }, []);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2"><TrendingUp className="w-6 h-6"/> Painel do Profissional</h1>
            <p className="text-gray-600 text-sm">Estatísticas em tempo real dos seus anúncios e campanhas</p>
          </div>
          <Badge className="bg-[#F7D426] text-[#2C2C2C]">{user.full_name}</Badge>
        </div>

        <RealtimeStats user={user} />
        <BoostProfile />
      </div>
    </div>
  );
}