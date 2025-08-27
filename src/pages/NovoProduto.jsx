
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Produto, User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ShoppingBag } from "lucide-react";

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

export default function NovoProduto() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    nome: "",
    categoria: "outros",
    marca: "",
    quantidade_estoque: 0,
    quantidade_minima: 10,
    preco_custo: 0,
    preco_venda: 0,
    unidade_medida: "unidade",
    empresa_id: "",
    ativo: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUserEmpresa = async () => {
        try {
            const user = await User.me();
            if (user && user.empresa_id) {
                setDados(prev => ({...prev, empresa_id: user.empresa_id}));
            } else {
                setErrors(prev => ({ ...prev, geral: "Não foi possível identificar a empresa. Faça login novamente." }));
            }
        } catch (e) {
            console.error("Não foi possível buscar os dados da empresa do usuário.", e);
            setErrors(prev => ({ ...prev, geral: "Não foi possível identificar a empresa. Faça login novamente." }));
        }
    };
    fetchUserEmpresa();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!dados.nome.trim()) newErrors.nome = "O nome do produto é obrigatório.";
    if (dados.quantidade_estoque < 0) newErrors.quantidade_estoque = "O estoque inicial não pode ser negativo.";
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
    // Clear general error when any field changes
    if (errors.geral) {
      setErrors(prev => ({ ...prev, geral: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    if (!dados.empresa_id) {
      setErrors(prev => ({ ...prev, geral: "Não foi possível identificar a empresa do usuário. Tente recarregar a página ou fazer login novamente." }));
      return;
    }
    setLoading(true);
    try {
      await Produto.create(dados);
      navigate(createPageUrl("Produtos"));
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      setErrors(prev => ({ ...prev, geral: "Erro ao criar produto. Por favor, tente novamente." }));
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Produtos"))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold">Novo Produto</h1>
          </div>
        </div>
        <Card className="glass-effect">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.geral && <p className="text-sm text-red-600 mb-4 text-center">{errors.geral}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input 
                    id="nome" 
                    value={dados.nome} 
                    onChange={handleChange} 
                    className={errors.nome ? 'border-red-500' : ''}
                  />
                  {errors.nome && <p className="text-sm text-red-600 mt-1">{errors.nome}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Input id="marca" value={dados.marca} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <select 
                  id="categoria" 
                  value={dados.categoria} 
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
                    step="0.01"
                    value={dados.preco_custo} 
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
                    step="0.01"
                    value={dados.preco_venda} 
                    onChange={handleChange}
                    className={errors.preco_venda ? 'border-red-500' : ''}
                  />
                  {errors.preco_venda && <p className="text-sm text-red-600 mt-1">{errors.preco_venda}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="unidade_medida">Unidade</Label>
                  <select 
                    id="unidade_medida" 
                    value={dados.unidade_medida} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  >
                    {unidadesMedida.map(un => 
                      <option key={un} value={un}>{un}</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade_estoque">Estoque Inicial *</Label>
                  <Input 
                    id="quantidade_estoque" 
                    type="number" 
                    value={dados.quantidade_estoque} 
                    onChange={handleChange} 
                    className={errors.quantidade_estoque ? 'border-red-500' : ''}
                  />
                  {errors.quantidade_estoque && <p className="text-sm text-red-600 mt-1">{errors.quantidade_estoque}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantidade_minima">Estoque Mínimo</Label>
                  <Input 
                    id="quantidade_minima" 
                    type="number" 
                    value={dados.quantidade_minima} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(createPageUrl("Produtos"))}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-orange-500 to-amber-500">
                  {loading ? "Salvando..." : "Criar Produto"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
