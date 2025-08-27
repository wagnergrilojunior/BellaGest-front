
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Produto } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const categoriasDisponiveis = [
  { value: "creme_facial", label: "Creme Facial" },
  { value: "creme_corporal", label: "Creme Corporal" },
  { value: "oleo_essencial", label: "Óleo Essencial" },
  { value: "oleo_corporal", label: "Óleo Corporal" },
  { value: "serum_facial", label: "Sérum Facial" },
  { value: "serum_capilar", label: "Sérum Capilar" },
  { value: "mascara_facial", label: "Máscara Facial" },
  { value: "mascara_capilar", label: "Máscara Capilar" },
  { value: "shampoo", label: "Shampoo" },
  { value: "condicionador", label: "Condicionador" },
  { value: "hidratante", label: "Hidratante" },
  { value: "protetor_solar", label: "Protetor Solar" },
  { value: "esmalte", label: "Esmalte" },
  { value: "removedor", label: "Removedor" },
  { value: "base_unha", label: "Base para Unha" },
  { value: "agulha_acupuntura", label: "Agulha Acupuntura" },
  { value: "agulha_microagulhamento", label: "Agulha Microagulhamento" },
  { value: "equipamento_estetico", label: "Equipamento Estético" },
  { value: "equipamento_limpeza", label: "Equipamento de Limpeza" },
  { value: "descartavel_hospitalar", label: "Descartável Hospitalar" },
  { value: "descartavel_estetico", label: "Descartável Estético" },
  { value: "toalha_descartavel", label: "Toalha Descartável" },
  { value: "luva_procedimento", label: "Luva de Procedimento" },
  { value: "algodao", label: "Algodão" },
  { value: "gaze", label: "Gaze" },
  { value: "bandagem", label: "Bandagem" },
  { value: "antiseptico", label: "Antisséptico" },
  { value: "anestesico_topico", label: "Anestésico Tópico" },
  { value: "vitamina_ampola", label: "Vitamina em Ampola" },
  { value: "acido_hialuronico", label: "Ácido Hialurônico" },
  { value: "colageno", label: "Colágeno" },
  { value: "outros", label: "Outros" }
];

const unidadesMedida = ["unidade", "ml", "gr", "kg", "litro"];

export default function EditarProduto() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [dados, setDados] = useState(null);
  const [produtoId, setProdutoId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const id = new URLSearchParams(location.search).get('id');
    if (id) {
      setProdutoId(id);
      Produto.get(id)
        .then(data => { setDados(data); setFormLoading(false); })
        .catch(err => { console.error(err); navigate(createPageUrl("Produtos")); });
    } else {
      navigate(createPageUrl("Produtos"));
    }
  }, [location.search, navigate]);

  const validate = () => {
    if (!dados) return false;
    const newErrors = {};
    if (!dados.nome || !dados.nome.trim()) newErrors.nome = "O nome do produto é obrigatório.";
    if (dados.quantidade_estoque < 0) newErrors.quantidade_estoque = "O estoque atual não pode ser negativo.";
    if (dados.preco_venda < 0) newErrors.preco_venda = "O preço de venda não pode ser negativo.";
    if (dados.preco_custo < 0) newErrors.preco_custo = "O preço de custo não pode ser negativo.";
    if (dados.preco_venda < dados.preco_custo) newErrors.preco_venda = "O preço de venda não pode ser menor que o de custo.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value, type } = e.target;
    setDados(prev => ({ ...prev, [id]: type === 'number' ? parseFloat(value) || 0 : value }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setLoading(true);
    try {
      await Produto.update(produtoId, dados);
      navigate(createPageUrl("Produtos"));
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
    }
    setLoading(false);
  };
  
  if (formLoading) {
    return (
      <div className="p-8 max-w-3xl mx-auto"><Skeleton className="h-10 w-64 mb-8" />
        <Card><CardContent className="p-6 space-y-6"><Skeleton className="h-8 w-full" /><Skeleton className="h-24 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Produtos"))}><ArrowLeft className="w-4 h-4" /></Button>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold">Editar Produto</h1>
          </div>
        </div>
        <Card className="glass-effect">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input 
                    id="nome" 
                    value={dados.nome || ''} 
                    onChange={handleChange}
                    className={errors.nome ? 'border-red-500' : ''}
                  />
                  {errors.nome && <p className="text-sm text-red-600 mt-1">{errors.nome}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Input id="marca" value={dados.marca || ''} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <select 
                  id="categoria" 
                  value={dados.categoria || ''} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                >
                  {categoriasDisponiveis.map(cat => 
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  )}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preco_custo">Preço de Custo (R$)</Label>
                  <Input 
                    id="preco_custo" 
                    type="number" 
                    value={dados.preco_custo || 0} 
                    onChange={handleChange}
                    className={errors.preco_custo ? 'border-red-500' : ''}
                  />
                  {errors.preco_custo && <p className="text-sm text-red-600 mt-1">{errors.preco_custo}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preco_venda">Preço de Venda (R$)</Label>
                  <Input 
                    id="preco_venda" 
                    type="number" 
                    value={dados.preco_venda || 0} 
                    onChange={handleChange}
                    className={errors.preco_venda ? 'border-red-500' : ''}
                  />
                  {errors.preco_venda && <p className="text-sm text-red-600 mt-1">{errors.preco_venda}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="unidade_medida">Unidade</Label>
                  <select id="unidade_medida" value={dados.unidade_medida || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white capitalize">
                    {unidadesMedida.map(un => <option key={un} value={un}>{un}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade_estoque">Estoque Atual *</Label>
                  <Input 
                    id="quantidade_estoque" 
                    type="number" 
                    value={dados.quantidade_estoque || 0} 
                    onChange={handleChange}
                    className={errors.quantidade_estoque ? 'border-red-500' : ''}
                  />
                  {errors.quantidade_estoque && <p className="text-sm text-red-600 mt-1">{errors.quantidade_estoque}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantidade_minima">Estoque Mínimo</Label>
                  <Input id="quantidade_minima" type="number" value={dados.quantidade_minima || 0} onChange={handleChange} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(createPageUrl("Produtos"))}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-orange-500 to-amber-500">
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
