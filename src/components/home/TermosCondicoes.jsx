import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function TermosCondicoes({ open, onAccept }) {
  const [aceitou, setAceitou] = React.useState(false);

  const handleAccept = () => {
    if (aceitou) {
      localStorage.setItem('termos_aceitos', 'true');
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Termos e Condições de Uso</DialogTitle>
          <DialogDescription>
            Por favor, leia e aceite nossos termos para continuar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <section>
            <h3 className="font-semibold mb-2">1. Aceitação dos Termos</h3>
            <p className="text-gray-600">
              Ao acessar e usar o Mapa da Estética, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">2. Uso da Plataforma</h3>
            <p className="text-gray-600">
              O Mapa da Estética é uma plataforma que conecta profissionais de estética a clientes. Você concorda em usar a plataforma apenas para fins legítimos e de acordo com todas as leis aplicáveis.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">3. Cadastro e Conta</h3>
            <p className="text-gray-600">
              Ao criar uma conta, você concorda em fornecer informações precisas e atualizadas. Você é responsável por manter a confidencialidade de suas credenciais de acesso.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">4. Anúncios e Conteúdo</h3>
            <p className="text-gray-600">
              Profissionais que publicam anúncios são responsáveis pela veracidade das informações fornecidas. O Mapa da Estética não se responsabiliza por conteúdo de terceiros.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">5. Privacidade e Dados</h3>
            <p className="text-gray-600">
              Respeitamos sua privacidade e protegemos seus dados pessoais de acordo com a LGPD. Consulte nossa Política de Privacidade para mais informações.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">6. Planos e Pagamentos</h3>
            <p className="text-gray-600">
              Os planos pagos são cobrados conforme especificado. Cancelamentos e reembolsos estão sujeitos às políticas descritas em cada plano.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">7. Limitação de Responsabilidade</h3>
            <p className="text-gray-600">
              O Mapa da Estética atua apenas como intermediador. Não nos responsabilizamos por serviços prestados por profissionais anunciantes.
            </p>
          </section>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="termos" 
              checked={aceitou} 
              onCheckedChange={setAceitou}
            />
            <Label htmlFor="termos" className="text-sm cursor-pointer">
              Li e aceito os Termos e Condições de Uso
            </Label>
          </div>
          <Button
            onClick={handleAccept}
            disabled={!aceitou}
            className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
          >
            Aceitar e Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}