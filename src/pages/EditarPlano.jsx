import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plano } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Gem } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function EditarPlano() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [planoId, setPlanoId] = useState(null);
  const [valorDisplay, setValorDisplay] = useState("R$ 0,00");
  const [dados, setDados] = useState({
    nome: "",
    descricao: "",
    valor_mensal: 0,
    recursos: "",
    ativo: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setPlanoId(id);
      carregarPlano(id);
    } else {
      setCarregando(false);
      navigate(createPageUrl("Planos"));
    }
  }, []);

  const carregarPlano = async (id) => {
    try {
      const planoExistente = await Plano.get(id);
      if (planoExistente) {
        setDados({
          ...planoExistente,
          valor_mensal: planoExistente.valor_mensal || 0,
          recursos: planoExistente.recursos ? planoExistente.recursos.join('\n') : '',
        });
        const formattedValue = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(planoExistente.valor_mensal || 0);
        setValorDisplay(formattedValue);
      }
    } catch (error) {
      console.error("Erro ao carregar plano:", error);
    }
    setCarregando(false);
  };
  
  const validate = () => {
    const newErrors = {};
    if (!dados.nome.trim()) newErrors.nome = "O nome do plano é obrigatório.";
    if (!dados.valor_mensal || dados.valor_mensal <= 0) newErrors.valor_mensal = "O valor mensal deve ser maior que zero.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setDados(prev => ({
      ...prev,
      [id]: value
    }));
     if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleValorChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value === '') value = '0';

    const numberValue = parseInt(value, 10) / 100;
    setDados(prev => ({ ...prev, valor_mensal: numberValue }));

    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numberValue);
    setValorDisplay(formattedValue);

    if (errors.valor_mensal) {
        setErrors(prev => ({ ...prev, valor_mensal: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const dadosParaEnviar = {
        ...dados,
        recursos: dados.recursos.split('\n').filter(r => r.trim() !== ''),
      };
      await Plano.update(planoId, dadosParaEnviar);
      navigate(createPageUrl("Planos"));
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      setErrors(prev => ({ ...prev, geral: "Ocorreu um erro ao atualizar o plano."}));
    }
    setLoading(false);
  };

  if (carregando) {
    return <div className="p-8">Carregando dados do plano...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Planos"))}><ArrowLeft className="w-4 h-4" /></Button>
          <div className="flex items-center gap-2">
            <Gem className="w-6 h-6 text-violet-500" />
            <h1 className="text-2xl font-bold">Editar Plano</h1>
          </div>
        </div>
        <Card className="glass-effect">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.geral && <p className="text-sm text-red-600 text-center">{errors.geral}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Plano *</Label>
                  <Input id="nome" value={dados.nome} onChange={handleChange} className={errors.nome ? 'border-red-500' : ''}/>
                   {errors.nome && <p className="text-sm text-red-600 mt-1">{errors.nome}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_mensal">Valor Mensal (R$) *</Label>
                  <Input 
                    id="valor_mensal" 
                    type="text" 
                    value={valorDisplay} 
                    onChange={handleValorChange} 
                    className={errors.valor_mensal ? 'border-red-500' : ''}
                  />
                  {errors.valor_mensal && <p className="text-sm text-red-600 mt-1">{errors.valor_mensal}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" value={dados.descricao} onChange={handleChange} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recursos">Recursos (um por linha)</Label>
                <Textarea id="recursos" value={dados.recursos} onChange={handleChange} rows={5} />
              </div>
              <div className="flex items-center space-x-3">
                 <Switch 
                  id="ativo" 
                  checked={dados.ativo} 
                  onCheckedChange={(checked) => setDados(p => ({...p, ativo: checked}))}
                />
                <Label htmlFor="ativo">Plano ativo</Label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(createPageUrl("Planos"))}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-violet-500 to-indigo-500">
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