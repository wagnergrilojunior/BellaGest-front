
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Servico, User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";

const categoriasDisponiveis = ["facial", "corporal", "capilar", "manicure", "pedicure", "depilacao", "massagem", "outros"];

export default function NovoServico() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    nome: "",
    descricao: "",
    categoria: "outros",
    preco: 0,
    duracao_minutos: 30,
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
    if (!dados.nome.trim()) {
      newErrors.nome = "O nome do serviço é obrigatório.";
    }
    // Preço e duração_minutos são inicializados como 0, então 0 é um valor válido para o campo, mas inválido para o negócio
    // A validação verifica se é maior que 0
    if (dados.preco <= 0) {
      newErrors.preco = "O preço deve ser um número maior que zero.";
    }
    if (dados.duracao_minutos <= 0) {
      newErrors.duracao_minutos = "A duração deve ser maior que zero.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value, type } = e.target;
    setDados(prev => ({
      ...prev,
      [id]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null })); // Clear error for the specific field
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return; // Stop submission if validation fails
    }
    if (!dados.empresa_id) {
      setErrors(prev => ({ ...prev, geral: "Não foi possível identificar a empresa do usuário." }));
      return;
    }
    setLoading(true);
    try {
      await Servico.create(dados);
      navigate(createPageUrl("Servicos"));
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      // Optionally set a general error message to display to the user
      setErrors(prev => ({ ...prev, geral: "Erro ao criar serviço. Tente novamente." }));
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Servicos"))}><ArrowLeft className="w-4 h-4" /></Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h1 className="text-2xl font-bold">Novo Serviço</h1>
          </div>
        </div>
        <Card className="glass-effect">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.geral && <p className="text-sm text-red-600 mt-1">{errors.geral}</p>}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Serviço *</Label>
                <Input
                  id="nome"
                  value={dados.nome}
                  onChange={handleChange}
                  className={errors.nome ? 'border-red-500' : ''}
                />
                {errors.nome && <p className="text-sm text-red-600 mt-1">{errors.nome}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="categoria">Categoria</Label>
                  <select id="categoria" value={dados.categoria} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white capitalize">
                    {categoriasDisponiveis.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (R$) *</Label>
                  <Input
                    id="preco"
                    type="number"
                    value={dados.preco}
                    onChange={handleChange}
                    className={errors.preco ? 'border-red-500' : ''}
                  />
                  {errors.preco && <p className="text-sm text-red-600 mt-1">{errors.preco}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duracao_minutos">Duração (minutos) *</Label>
                  <Input
                    id="duracao_minutos"
                    type="number"
                    value={dados.duracao_minutos}
                    onChange={handleChange}
                    className={errors.duracao_minutos ? 'border-red-500' : ''}
                  />
                  {errors.duracao_minutos && <p className="text-sm text-red-600 mt-1">{errors.duracao_minutos}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" value={dados.descricao} onChange={handleChange} rows={4} />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(createPageUrl("Servicos"))}>Cancelar</Button>
                <Button type="submit" disabled={loading || !dados.empresa_id} className="bg-gradient-to-r from-purple-500 to-pink-500">
                  {loading ? "Salvando..." : "Criar Serviço"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
