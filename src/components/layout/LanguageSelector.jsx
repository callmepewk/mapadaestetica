import React, { useState } from "react";
import { useTranslation, LANGUAGES } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";

export default function LanguageSelector() {
  const { language, changeLanguage } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLanguage = LANGUAGES[language];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="relative h-9 px-3 border-2 border-[#F7D426] bg-white hover:bg-[#FFF9E6] transition-all shadow-md hover:shadow-lg"
          title={currentLanguage?.name || 'Selecionar idioma'}
        >
          <span className="text-2xl mr-1">{currentLanguage?.flag || '🌐'}</span>
          <span className="hidden sm:inline text-xs font-bold text-[#2C2C2C]">{language.split('-')[0].toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Selecionar Idioma
          </p>
        </div>
        {Object.entries(LANGUAGES).map(([code, { name, flag }]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => {
              changeLanguage(code);
              setOpen(false);
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{flag}</span>
                <span className="font-medium">{name}</span>
              </div>
              {language === code && (
                <Check className="w-4 h-4 text-[#F7D426]" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}