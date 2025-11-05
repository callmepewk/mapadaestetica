import React from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, Sparkles } from "lucide-react";

export default function LoginPromptModal({ open, onClose, pageName }) {
  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.pathname);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-[#F7D426]" />
            Crie sua Conta Grátis
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {pageName === "anuncios" 
              ? "Para acessar os anúncios e encontrar os melhores profissionais, você precisa criar uma conta gratuita!"
              : "Para acessar o blog e todo o conteúdo exclusivo, você precisa criar uma conta gratuita!"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-[#FFF9E6] p-4 rounded-lg border-2 border-[#F7D426]">
            <h3 className="font-bold text-[#2C2C2C] mb-3">
              ✨ Benefícios de criar sua conta:
            </h3>
            <ul className="space-y-2 text-sm text-[#2C2C2C]">
              <li className="flex items-start gap-2">
                <span className="text-[#F7D426] font-bold">✓</span>
                <span>Acesso completo aos anúncios de profissionais</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F7D426] font-bold">✓</span>
                <span>Ganhe pontos em cada compra</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F7D426] font-bold">✓</span>
                <span>Conteúdo exclusivo do blog</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F7D426] font-bold">✓</span>
                <span>Troque pontos por produtos e descontos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F7D426] font-bold">✓</span>
                <span>100% grátis, sem custo nenhum!</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full h-12 bg-gradient-to-r from-[#F7D426] to-[#FFE066] hover:from-[#E5C215] hover:to-[#F7D426] text-[#2C2C2C] font-bold text-lg border-2 border-[#2C2C2C]"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Criar Conta Grátis Agora
          </Button>

          <p className="text-xs text-center text-gray-500">
            Leva apenas 30 segundos para criar sua conta!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}