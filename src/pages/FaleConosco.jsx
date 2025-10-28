import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  CheckCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FaleConosco() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    assunto: "",
    mensagem: ""
  });
  const [chatAberto, setChatAberto] = useState(false);
  const [mensagemChat, setMensagemChat] = useState("");
  const [respostaIA, setRespostaIA] = useState(null);
  const [sucesso, setSucesso] = useState(false);

  const enviarContatoMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.ContatoSuporte.create(data);
    },
    onSuccess: () => {
      setSucesso(true);
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        assunto: "",
        mensagem: ""
      });
      setTimeout(() => setSucesso(false), 5000);
    },
  });

  const perguntarIAMutation = useMutation({
    mutationFn: async (pergunta) => {
      const resposta = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um assistente virtual do Mapa da Estética e Clube da Beleza. 
        
        Responda à seguinte pergunta de forma amigável, útil e profissional:
        "${pergunta}"
        
        Informações importantes:
        - Somos uma plataforma que conecta profissionais de estética a clientes
        - Temos 3 planos: Light (grátis), Gold e VIP
        - Oferecemos mais de 64 categorias de serviços de estética
        - Temos mais de 3.000 profissionais parceiros
        - Contato: (21) 98034-3873 / WhatsApp
        - Horário de atendimento: Segunda a Sexta, 9h às 18h
        
        Responda de forma direta e objetiva em até 3 parágrafos.`,
      });
      return resposta;
    },
    onSuccess: (resposta) => {
      setRespostaIA(resposta);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    enviarContatoMutation.mutate(formData);
  };

  const handlePerguntarIA = () => {
    if (mensagemChat.trim()) {
      perguntarIAMutation.mutate(mensagemChat);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-pink-100 text-pink-700">
            Estamos Aqui Para Ajudar
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Fale Conosco
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Entre em contato conosco ou converse com nosso assistente virtual
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-4">Informações de Contato</h3>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium">Telefone / WhatsApp</p>
                    <a href="tel:21980343873" className="text-sm text-gray-600 hover:text-pink-600">
                      (21) 98034-3873
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:contato@mapadaestetica.com.br" className="text-sm text-gray-600 hover:text-pink-600">
                      contato@mapadaestetica.com.br
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium">Localização</p>
                    <p className="text-sm text-gray-600">
                      Rio de Janeiro, RJ - Brasil
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="font-medium">Horário de Atendimento</p>
                    <p className="text-sm text-gray-600">
                      Segunda a Sexta: 9h às 18h
                    </p>
                    <p className="text-sm text-gray-600">
                      Sábado: 9h às 13h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant Card */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-6 h-6" />
                  <h3 className="font-semibold text-lg">Assistente Virtual</h3>
                </div>
                <p className="text-white/90 text-sm mb-4">
                  Tire suas dúvidas instantaneamente com nossa IA. Pergunte sobre planos, 
                  serviços, como funciona a plataforma e muito mais!
                </p>
                <Button
                  onClick={() => setChatAberto(!chatAberto)}
                  className="w-full bg-white text-purple-600 hover:bg-gray-100"
                >
                  {chatAberto ? "Fechar Chat" : "Abrir Chat IA"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 space-y-6">
            {sucesso && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Mensagem enviada com sucesso! Entraremos em contato em breve.
                </AlertDescription>
              </Alert>
            )}

            <Card className="border-none shadow-lg">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-2xl font-bold mb-6">Envie uma Mensagem</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="assunto">Assunto *</Label>
                      <Input
                        id="assunto"
                        value={formData.assunto}
                        onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mensagem">Mensagem *</Label>
                    <Textarea
                      id="mensagem"
                      value={formData.mensagem}
                      onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
                      required
                      className="mt-1 min-h-[150px]"
                      placeholder="Escreva sua mensagem aqui..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={enviarContatoMutation.isPending}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                  >
                    {enviarContatoMutation.isPending ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Mensagem
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* AI Chat Box */}
            {chatAberto && (
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                    Assistente Virtual
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite sua pergunta..."
                        value={mensagemChat}
                        onChange={(e) => setMensagemChat(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !perguntarIAMutation.isPending) {
                            handlePerguntarIA();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={handlePerguntarIA}
                        disabled={perguntarIAMutation.isPending || !mensagemChat.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>

                    {perguntarIAMutation.isPending && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600">Pensando...</p>
                      </div>
                    )}

                    {respostaIA && (
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-purple-900 mb-2">Resposta:</p>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{respostaIA}</p>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <p className="text-xs text-gray-500">
                        💡 Exemplos de perguntas: "Quais são os planos disponíveis?", 
                        "Como faço para anunciar?", "Quais categorias vocês oferecem?"
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                pergunta: "Como faço para anunciar?",
                resposta: "Basta criar uma conta, escolher seu plano e preencher as informações do seu anúncio. É rápido e fácil!"
              },
              {
                pergunta: "Quais são os planos disponíveis?",
                resposta: "Oferecemos 3 planos: Light (grátis), Gold e VIP, cada um com benefícios exclusivos."
              },
              {
                pergunta: "Como funciona o programa de pontos?",
                resposta: "Você acumula pontos ao consumir serviços e produtos na rede parceira e pode trocá-los por prêmios."
              },
              {
                pergunta: "Posso alterar meu plano depois?",
                resposta: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento."
              }
            ].map((item, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">{item.pergunta}</h3>
                  <p className="text-gray-600 text-sm">{item.resposta}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}