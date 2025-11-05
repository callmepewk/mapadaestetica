import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const categorias = [
  "Cuidados com a Pele",
  "Maquiagem",
  "Cabelos",
  "Perfumaria",
  "Suplementos",
  "Equipamentos",
  "Acessórios",
  "Outros"
];

export default function AdicionarProduto() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [produto, setProduto] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    preco: 0,
    preco_promocional: 0,
    pontos_ganhos: 5,
    pontos_necessarios: 0,
    estoque: 0,
    marca: "",
    imagens: [],
    em_destaque: false,
    status: "ativo"
  });

  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (!produto.nome || !produto.descricao || !produto.categoria) {
        alert("Preencha os campos obrigatórios: Nome, Descrição e Categoria");
        setLoading(false);
        return;
      }

      // Se tem preço 0 e pontos_necessarios 0, alertar
      if (produto.preco === 0 && produto.pontos_necessarios === 0) {
        const confirma = window.confirm(
          "Este produto não tem preço nem pontos necessários. Deseja continuar?"
        );
        if (!confirma) {
          setLoading(false);
          return;
        }
      }

      await base44.entities.Produto.create(produto);

      alert("✅ Produto criado com sucesso!");
      navigate(createPageUrl("Produtos"));
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      alert("Erro ao criar produto. Verifique o console.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = () => {
    if (imageUrl) {
      setProduto({
        ...produto,
        imagens: [...produto.imagens, imageUrl]
      });
      setImageUrl("");
    }
  };

  const handleRemoveImage = (index) => {
    setProduto({
      ...produto,
      imagens: produto.imagens.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Produtos"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Produtos
        </Button>

        <Card className="border-none shadow-2xl">
          <CardContent className="p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Adicionar Produto/Serviço
              </h1>
              <p className="text-gray-600">
                Preencha as informações abaixo para adicionar um novo produto
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div>
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  value={produto.nome}
                  onChange={(e) => setProduto({ ...produto, nome: e.target.value })}
                  placeholder="Ex: Sérum Facial Premium"
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={produto.descricao}
                  onChange={(e) => setProduto({ ...produto, descricao: e.target.value })}
                  placeholder="Descrição detalhada do produto..."
                  rows={4}
                  required
                />
              </div>

              {/* Categoria e Marca */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    value={produto.categoria}
                    onValueChange={(value) => setProduto({ ...produto, categoria: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="marca">Marca</Label>
                  <Input
                    id="marca"
                    value={produto.marca}
                    onChange={(e) => setProduto({ ...produto, marca: e.target.value })}
                    placeholder="Nome da marca"
                  />
                </div>
              </div>

              {/* Preços */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={produto.preco}
                    onChange={(e) => setProduto({ ...produto, preco: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="preco_promocional">Preço Promocional (R$)</Label>
                  <Input
                    id="preco_promocional"
                    type="number"
                    step="0.01"
                    value={produto.preco_promocional}
                    onChange={(e) => setProduto({ ...produto, preco_promocional: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="estoque">Estoque</Label>
                  <Input
                    id="estoque"
                    type="number"
                    value={produto.estoque}
                    onChange={(e) => setProduto({ ...produto, estoque: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Pontos */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pontos_ganhos">Pontos Ganhos (ao comprar)</Label>
                  <Input
                    id="pontos_ganhos"
                    type="number"
                    value={produto.pontos_ganhos}
                    onChange={(e) => setProduto({ ...produto, pontos_ganhos: parseInt(e.target.value) || 0 })}
                    placeholder="5"
                  />
                </div>

                <div>
                  <Label htmlFor="pontos_necessarios">Pontos Necessários (para resgatar)</Label>
                  <Input
                    id="pontos_necessarios"
                    type="number"
                    value={produto.pontos_necessarios}
                    onChange={(e) => setProduto({ ...produto, pontos_necessarios: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deixe 0 se não for um produto de resgate de pontos
                  </p>
                </div>
              </div>

              {/* Imagens */}
              <div>
                <Label>Imagens do Produto</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Cole a URL da imagem aqui"
                  />
                  <Button type="button" onClick={handleAddImage}>
                    <Upload className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                {produto.imagens.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {produto.imagens.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status e Destaque */}
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="em_destaque"
                    checked={produto.em_destaque}
                    onCheckedChange={(checked) => setProduto({ ...produto, em_destaque: checked })}
                  />
                  <Label htmlFor="em_destaque" className="cursor-pointer">
                    Produto em Destaque
                  </Label>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={produto.status}
                    onValueChange={(value) => setProduto({ ...produto, status: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="esgotado">Esgotado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl("Produtos"))}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Produto
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}