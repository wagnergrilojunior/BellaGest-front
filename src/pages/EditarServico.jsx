
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Servico } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const categoriasDisponiveis = ["facial", "corporal", "capilar", "manicure", "pedicure", "depilacao", "massagem", "outros"];

export default function EditarServico() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [dados, setDados] = useState(null);
  const [servicoId, setServicoId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const id = new URLSearchParams(location.search).get('id');
    if (id) {
      setServicoId(id);
      Servico.get(id)
        .then(data => {
          setDados(data);
          setFormLoading(false);
        })
        .catch(err => {
          console.error(err);
          navigate(createPageUrl("Servicos"));
        });
    } else {
      navigate(createPageUrl("Servicos"));
    }
  }, [location.search, navigate]); // Changed dependency to location.search for more specific updates

  const validate = () => {
    if (!dados) {
      setErrors({}); // Clear errors if no data to validate
      return false;
    }
    const newErrors = {};
    if (!dados.nome || !dados.nome.trim()) newErrors.nome = "O nome do serviço é obrigatório.";
    if (!dados.preco || parseFloat(dados.preco) <= 0) newErrors.preco = "O preço deve ser um número maior que zero.";
    if (!dados.duracao_minutos || parseInt(dados.duracao_minutos, 10) <= 0) newErrors.duracao_minutos = "A duração deve ser maior que zero.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value, type } = e.target;
    setDados(prev => ({
      ...prev,
      [id]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    // Clear error for the specific field when it changes
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: undefined })); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return; // Stop if validation fails
    }
    setLoading(true);
    try {
      await Servico.update(servicoId, dados);
      navigate(createPageUrl("Servicos"));
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
    }
    setLoading(false);
  };
  
  if (formLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64 mb-8" />
        <Card>
          <CardContent className="p-6 space-y-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Servicos"))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h1 className="text-2xl font-bold">Editar Serviço</h1>
          </div>
        </div>
        <Card className="glass-effect">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Serviço *</Label>
                <Input 
                  id="nome" 
                  value={dados?.nome || ''} 
                  onChange={handleChange}
                  className={errors.nome ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                />
                {errors.nome && <p className="text-sm text-red-600 mt-1">{errors.nome}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="categoria">Categoria</Label>
                  <select 
                    id="categoria" 
                    value={dados?.categoria || ''} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white capitalize"
                  >
                    {categoriasDisponiveis.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (R$) *</Label>
                  <Input 
                    id="preco" 
                    type="number" 
                    value={dados?.preco || 0} 
                    onChange={handleChange}
                    className={errors.preco ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.preco && <p className="text-sm text-red-600 mt-1">{errors.preco}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duracao_minutos">Duração (minutos) *</Label>
                  <Input 
                    id="duracao_minutos" 
                    type="number" 
                    value={dados?.duracao_minutos || 0} 
                    onChange={handleChange}
                    className={errors.duracao_minutos ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.duracao_minutos && <p className="text-sm text-red-600 mt-1">{errors.duracao_minutos}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea 
                  id="descricao" 
                  value={dados?.descricao || ''} 
                  onChange={handleChange} 
                  rows={4} 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(createPageUrl("Servicos"))}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-purple-500 to-pink-500">
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
