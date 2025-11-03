import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TermosCondicoes({ open, onAccept }) {
  const [aceitoTermos, setAceitoTermos] = useState(false);
  const [aceitoPrivacidade, setAceitoPrivacidade] = useState(false);

  const handleAceitar = () => {
    if (aceitoTermos && aceitoPrivacidade) {
      localStorage.setItem('termos_aceitos', 'true');
      localStorage.setItem('data_aceite', new Date().toISOString());
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C2C2C]">
            Termos e Condições de Uso
          </DialogTitle>
          <DialogDescription>
            Por favor, leia atentamente e aceite os termos para continuar
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="termos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="termos">Termos de Uso</TabsTrigger>
            <TabsTrigger value="privacidade">Política de Privacidade</TabsTrigger>
          </TabsList>

          <TabsContent value="termos">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="space-y-4 text-sm">
                <h3 className="font-bold text-lg">1. TERMOS DE USO DO MAPA DA ESTÉTICA</h3>
                
                <div>
                  <h4 className="font-semibold mt-4">1.1. Aceitação dos Termos</h4>
                  <p>Ao acessar e usar a plataforma Mapa da Estética ("Plataforma"), você concorda em cumprir e estar vinculado a estes Termos e Condições de Uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossa Plataforma.</p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">1.2. Descrição do Serviço</h4>
                  <p>O Mapa da Estética é uma plataforma digital que conecta profissionais de estética, beleza e bem-estar a potenciais clientes. Oferecemos:</p>
                  <ul className="list-disc ml-6 mt-2">
                    <li>Cadastro e divulgação de profissionais e serviços</li>
                    <li>Sistema de busca e filtros por localização e categoria</li>
                    <li>Clube de benefícios com planos Light, Gold e VIP</li>
                    <li>Programa de pontos e descontos em rede parceira</li>
                    <li>Blog com conteúdo sobre estética e beleza</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">1.3. Cadastro e Conta de Usuário</h4>
                  <p>Para utilizar certos recursos da Plataforma, você deve criar uma conta fornecendo informações precisas, completas e atualizadas. Você é responsável por:</p>
                  <ul className="list-disc ml-6 mt-2">
                    <li>Manter a confidencialidade de sua senha</li>
                    <li>Todas as atividades que ocorrem em sua conta</li>
                    <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">1.4. Uso Aceitável</h4>
                  <p>Você concorda em usar a Plataforma apenas para fins legítimos e de acordo com estes Termos. É proibido:</p>
                  <ul className="list-disc ml-6 mt-2">
                    <li>Publicar conteúdo falso, enganoso, difamatório ou ilegal</li>
                    <li>Violar direitos de propriedade intelectual de terceiros</li>
                    <li>Usar a Plataforma para spam ou comunicações não solicitadas</li>
                    <li>Tentar acessar áreas restritas sem autorização</li>
                    <li>Interferir ou interromper o funcionamento da Plataforma</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">1.5. Anúncios de Profissionais</h4>
                  <p>Profissionais que anunciam na Plataforma são responsáveis por:</p>
                  <ul className="list-disc ml-6 mt-2">
                    <li>Fornecer informações precisas sobre serviços, preços e qualificações</li>
                    <li>Possuir licenças e certificações necessárias</li>
                    <li>Cumprir todas as leis e regulamentos aplicáveis</li>
                    <li>Responder a consultas de clientes de forma profissional</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">1.6. Planos e Pagamentos</h4>
                  <p>A Plataforma oferece diferentes níveis de planos (Light, Gold, VIP). Os termos específicos, preços e benefícios de cada plano são detalhados na seção de Planos. O pagamento é processado de forma segura e os valores podem ser alterados mediante aviso prévio.</p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">1.7. Propriedade Intelectual</h4>
                  <p>Todo o conteúdo da Plataforma, incluindo textos, gráficos, logos, ícones e software, é propriedade do Mapa da Estética ou de seus licenciadores e está protegido pelas leis de direitos autorais.</p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">1.8. Isenção de Responsabilidade</h4>
                  <p>O Mapa da Estética atua como intermediário entre profissionais e clientes. Não somos responsáveis por:</p>
                  <ul className="list-disc ml-6 mt-2">
                    <li>Qualidade dos serviços prestados por profissionais anunciantes</li>
                    <li>Disputas entre profissionais e clientes</li>
                    <li>Resultados de tratamentos ou procedimentos</li>
                    <li>Veracidade das informações fornecidas por terceiros</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">1.9. Limitação de Responsabilidade</h4>
                  <p>Na máxima extensão permitida por lei, o Mapa da Estética não será responsável por quaisquer danos indiretos, incidentais, especiais ou consequenciais decorrentes do uso ou incapacidade de usar a Plataforma.</p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">1.10. Modificações dos Termos</h4>
                  <p>Reservamo-nos o direito de modificar estes Termos a qualquer momento. As modificações entrarão em vigor imediatamente após a publicação na Plataforma. O uso continuado após as modificações constitui aceitação dos novos termos.</p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">1.11. Rescisão</h4>
                  <p>Podemos suspender ou encerrar sua conta e acesso à Plataforma, sem aviso prévio, por violação destes Termos ou por qualquer outro motivo que considerarmos apropriado.</p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">1.12. Lei Aplicável</h4>
                  <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida nos tribunais do Rio de Janeiro, RJ.</p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">1.13. Contato</h4>
                  <p>Para dúvidas sobre estes Termos, entre em contato:</p>
                  <ul className="list-none ml-6 mt-2">
                    <li>Email: contato@mapadaestetica.com.br</li>
                    <li>Telefone: (21) 98034-3873</li>
                  </ul>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="privacidade">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="space-y-4 text-sm">
                <h3 className="font-bold text-lg">2. POLÍTICA DE PRIVACIDADE</h3>
                
                <div>
                  <h4 className="font-semibold mt-4">2.1. Informações que Coletamos</h4>
                  <p>Coletamos as seguintes informações:</p>
                  <ul className="list-disc ml-6 mt-2">
                    <li><strong>Dados de Cadastro:</strong> nome, email, telefone, cidade, estado</li>
                    <li><strong>Dados de Navegação:</strong> endereço IP, tipo de navegador, páginas visitadas</li>
                    <li><strong>Dados de Localização:</strong> com seu consentimento, para melhorar recomendações</li>
                    <li><strong>Dados de Pagamento:</strong> processados por parceiros seguros, não armazenamos cartões</li>
                    <li><strong>Dados de Uso:</strong> interações com anúncios, buscas, visualizações</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">2.2. Como Usamos suas Informações</h4>
                  <p>Utilizamos seus dados para:</p>
                  <ul className="list-disc ml-6 mt-2">
                    <li>Fornecer e melhorar nossos serviços</li>
                    <li>Processar transações e gerenciar sua conta</li>
                    <li>Enviar notificações sobre atualizações e ofertas</li>
                    <li>Personalizar sua experiência na Plataforma</li>
                    <li>Analisar padrões de uso e melhorar funcionalidades</li>
                    <li>Cumprir obrigações legais e regulatórias</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">2.3. Compartilhamento de Informações</h4>
                  <p>Podemos compartilhar suas informações com:</p>
                  <ul className="list-disc ml-6 mt-2">
                    <li><strong>Profissionais Anunciantes:</strong> quando você demonstra interesse em seus serviços</li>
                    <li><strong>Parceiros de Serviço:</strong> que nos ajudam a operar a Plataforma</li>
                    <li><strong>Autoridades Legais:</strong> quando exigido por lei</li>
                    <li><strong>Transferências Empresariais:</strong> em caso de fusão, aquisição ou venda de ativos</li>
                  </ul>
                  <p className="mt-2"><strong>Importante:</strong> Nunca vendemos suas informações pessoais a terceiros.</p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">2.4. Cookies e Tecnologias Similares</h4>
                  <p>Utilizamos cookies e tecnologias similares para:</p>
                  <ul className="list-disc ml-6 mt-2">
                    <li>Manter você conectado à sua conta</li>
                    <li>Lembrar suas preferências</li>
                    <li>Analisar o tráfego e uso da Plataforma</li>
                    <li>Personalizar conteúdo e anúncios</li>
                  </ul>
                  <p className="mt-2">Você pode configurar seu navegador para recusar cookies, mas isso pode limitar algumas funcionalidades.</p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">2.5. Segurança dos Dados</h4>
                  <p>Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger suas informações, incluindo:</p>
                  <ul className="list-disc ml-6 mt-2">
                    <li>Criptografia de dados sensíveis</li>
                    <li>Controles de acesso rigorosos</li>
                    <li>Monitoramento regular de segurança</li>
                    <li>Treinamento de equipe em práticas de privacidade</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">2.6. Seus Direitos (LGPD)</h4>
                  <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
                  <ul className="list-disc ml-6 mt-2">
                    <li><strong>Confirmação:</strong> saber se processamos seus dados</li>
                    <li><strong>Acesso:</strong> obter cópia dos seus dados</li>
                    <li><strong>Correção:</strong> corrigir dados incompletos ou desatualizados</li>
                    <li><strong>Anonimização ou Bloqueio:</strong> de dados desnecessários</li>
                    <li><strong>Eliminação:</strong> de dados tratados com seu consentimento</li>
                    <li><strong>Portabilidade:</strong> transferir dados a outro fornecedor</li>
                    <li><strong>Revogação de Consentimento:</strong> a qualquer momento</li>
                  </ul>
                  <p className="mt-2">Para exercer esses direitos, entre em contato: privacidade@mapadaestetica.com.br</p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">2.7. Retenção de Dados</h4>
                  <p>Mantemos suas informações pelo tempo necessário para cumprir os fins descritos nesta Política ou conforme exigido por lei. Dados de transações são mantidos por 5 anos para fins contábeis e fiscais.</p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">2.8. Dados de Menores</h4>
                  <p>Nossa Plataforma não é destinada a menores de 18 anos. Não coletamos intencionalmente informações de menores. Se tomarmos conhecimento de coleta inadvertida, excluiremos os dados imediatamente.</p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">2.9. Transferências Internacionais</h4>
                  <p>Seus dados podem ser transferidos e processados em outros países. Garantimos que tais transferências cumprem os requisitos legais aplicáveis e que seus dados recebem proteção adequada.</p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">2.10. Atualizações desta Política</h4>
                  <p>Podemos atualizar esta Política periodicamente. Notificaremos sobre mudanças significativas por email ou aviso na Plataforma. O uso continuado após atualizações constitui aceitação da nova política.</p>
                </div>

                <div>
                  <h4 className="font-semibold mt-4">2.11. Encarregado de Dados (DPO)</h4>
                  <p>Para questões sobre privacidade e proteção de dados:</p>
                  <ul className="list-none ml-6 mt-2">
                    <li>Email: dpo@mapadaestetica.com.br</li>
                    <li>Telefone: (21) 98034-3873</li>
                  </ul>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="space-y-4 mt-4">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="termos" 
              checked={aceitoTermos}
              onCheckedChange={setAceitoTermos}
            />
            <label
              htmlFor="termos"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Li e aceito os Termos e Condições de Uso
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="privacidade" 
              checked={aceitoPrivacidade}
              onCheckedChange={setAceitoPrivacidade}
            />
            <label
              htmlFor="privacidade"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Li e aceito a Política de Privacidade
            </label>
          </div>

          <Button 
            onClick={handleAceitar}
            disabled={!aceitoTermos || !aceitoPrivacidade}
            className="w-full bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Aceitar e Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}