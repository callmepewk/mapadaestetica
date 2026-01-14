import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, User, Briefcase, Map, BarChart3 } from "lucide-react";

export default function SecaoTutoriais({ tipoUsuario }) {
  const tutoriaisProfissionais = [
    {
      titulo: "🎬 Como Começar - Cadastro e Primeiros Passos",
      descricao: "Aprenda a criar sua conta e fazer o primeiro acesso na plataforma",
      url: "https://www.loom.com/share/34fa81433149443ca4eada62be93c882",
      duracao: "5 min",
      icon: User
    },
    {
      titulo: "📊 Visão Geral e Meu Plano",
      descricao: "Entenda todos os recursos disponíveis e como gerenciar seu plano",
      url: "https://www.loom.com/share/c6576e1e2d3f47aaa914f325b48f00e8",
      duracao: "8 min",
      icon: BarChart3
    },
    {
      titulo: "🗺️ Mapa e Anúncios - Como Funciona",
      descricao: "Descubra como seu anúncio aparece no mapa e como otimizar sua visibilidade",
      url: "https://www.loom.com/share/117b17e8280f4427b1f3d7bd85182e02",
      duracao: "10 min",
      icon: Map
    }
  ];

  const tutoriaisPacientes = [
    {
      titulo: "🎯 Como Usar o Mapa da Estética - Guia Completo",
      descricao: "Aprenda a encontrar os melhores profissionais perto de você",
      url: "https://www.loom.com/share/17e2afe4d42c4c31a2dad4d7adf8bae2",
      duracao: "7 min",
      icon: Map
    }
  ];

  const tutoriais = tipoUsuario === 'profissional' ? tutoriaisProfissionais : tutoriaisPacientes;

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none">
            {tipoUsuario === 'profissional' ? <Briefcase className="w-3 h-3 mr-1 inline" /> : <User className="w-3 h-3 mr-1 inline" />}
            {tipoUsuario === 'profissional' ? 'Para Profissionais' : 'Para Pacientes'}
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            🎓 Tutoriais em Vídeo
          </h2>
          <p className="text-gray-600 text-base sm:text-lg px-4 max-w-2xl mx-auto">
            {tipoUsuario === 'profissional' 
              ? 'Aprenda a usar todas as ferramentas da plataforma e maximize seus resultados'
              : 'Descubra como aproveitar ao máximo o Mapa da Estética'
            }
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutoriais.map((tutorial, index) => {
            const Icon = tutorial.icon;
            return (
              <a
                key={index}
                href={tutorial.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="h-full border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all overflow-hidden">
                  {/* Thumbnail com imagem de capa */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&q=60&sig=${index}`}
                      alt={tutorial.titulo}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"/>
                    <PlayCircle className="absolute inset-0 m-auto w-16 h-16 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-purple-100 text-purple-800">
                        Tutorial {index + 1}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {tutorial.duracao}
                      </Badge>
                    </div>

                    <h3 className="font-bold text-lg mb-2 group-hover:text-purple-600 transition-colors">
                      {tutorial.titulo}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {tutorial.descricao}
                    </p>

                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                      <span className="text-purple-600 font-medium group-hover:underline">
                        Assistir Agora
                      </span>
                      <PlayCircle className="w-5 h-5 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>

        {tipoUsuario === 'paciente' && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              💡 Mais tutoriais em breve!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}