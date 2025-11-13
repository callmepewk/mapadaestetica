import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Eye, User, Briefcase, Crown, CheckCircle } from "lucide-react";

export default function SeletorVisaoAdmin({ visaoAtual, onMudarVisao }) {
  const visoes = [
    { 
      tipo: "paciente", 
      label: "Visão Paciente", 
      icon: User,
      cor: "bg-blue-100 text-blue-800",
      descricao: "Ver como paciente"
    },
    { 
      tipo: "profissional", 
      label: "Visão Profissional", 
      icon: Briefcase,
      cor: "bg-purple-100 text-purple-800",
      descricao: "Ver como profissional"
    },
    { 
      tipo: "patrocinador", 
      label: "Visão Patrocinador", 
      icon: Crown,
      cor: "bg-green-100 text-green-800",
      descricao: "Ver como patrocinador"
    }
  ];

  const visaoAtualData = visoes.find(v => v.tipo === visaoAtual);
  const IconeAtual = visaoAtualData?.icon || Eye;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-2 border-orange-400 text-orange-700 hover:bg-orange-50 font-semibold"
        >
          <Eye className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Admin: </span>
          <IconeAtual className="w-4 h-4 mx-1" />
          <span className="hidden md:inline">{visaoAtualData?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-2">
          <p className="text-xs font-semibold text-orange-600 mb-1">
            👑 MODO ADMINISTRADOR
          </p>
          <p className="text-xs text-gray-500">
            Selecione a visão do site
          </p>
        </div>
        <DropdownMenuSeparator />
        
        {visoes.map((visao) => {
          const Icone = visao.icon;
          const isAtual = visao.tipo === visaoAtual;
          
          return (
            <DropdownMenuItem
              key={visao.tipo}
              onClick={() => onMudarVisao(visao.tipo)}
              className={isAtual ? "bg-orange-50" : ""}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Icone className="w-4 h-4" />
                  <div>
                    <p className="font-medium">{visao.label}</p>
                    <p className="text-xs text-gray-500">{visao.descricao}</p>
                  </div>
                </div>
                {isAtual && (
                  <CheckCircle className="w-4 h-4 text-orange-600" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <div className="px-2 py-2">
          <Badge className="bg-orange-100 text-orange-800 text-xs">
            <Eye className="w-3 h-3 mr-1" />
            Visão Atual: {visaoAtualData?.label}
          </Badge>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}