
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Profissional } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Briefcase } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const especialidadesDisponiveis = [
  "facial", "corporal", "capilar", "manicure", "pedicure", 
  "depilacao", "massagem", "micropigmentacao", "outros"
];

const diasSemana = [
  { value: "segunda", label: "Seg" }, { value: "terca", label: "Ter" },
  { value: "quarta", label: "Qua" }, { value: "quinta", label: "Qui" },
  { value: "sexta", label: "Sex" }, { value: "sabado", label: "Sáb" },
  { value: "domingo", label: "Dom" }
];

export default function EditarProfissional() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [dados, setDados] = useState(null);
  const [profissionalId, setProfissionalId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const id = new URLSearchParams(location.search).get('id');
    if (id) {
      setProfissionalId(id);
      Profissional.get(id)
        .then(data => {
          setDados(data);
          setFormLoading(false);
        })
        .catch(err => {
          console.error(err);
          navigate(createPageUrl("Profissionais"));
        });
    } else {
      navigate(createPageUrl("Profissionais"));
    }
  }, [location.search, navigate]);

  const validate = () => {
    if (!dados) return false;
    const newErrors = {};
    if (!dados.nome || !dados.nome.trim()) newErrors.nome = "O nome é obrigatório.";
    if (!dados.telefone || !dados.telefone.trim()) newErrors.telefone = "O telefone é obrigatório.";
    if (dados.comissao_percentual < 0 || dados.comissao_percentual > 100) {
      newErrors.comissao_percentual = "A comissão deve ser um valor entre 0 e 100.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (type === 'number') {
      setDados(prev => ({...prev, [id]: parseFloat(value) || 0}));
    } else {
      setDados(prev => ({...prev, [id]: value}));
    }
     if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleCheckboxChange = (field, value) => {
    setDados(prev => {
      const list = prev[field] || [];
      const newList = list.includes(value)
        ? list.filter(item => item !== value)
        : [...list, value];
      return { ...prev, [field]: newList };
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setLoading(true);
    try {
      await Profissional.update(profissionalId, dados);
      navigate(createPageUrl("Profissionais"));
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
    }
    setLoading(false);
  };

  if (formLoading) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-64 mb-8" />
        <Card><CardContent className="p-6 space-y-6">
          <Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" />
          <Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" />
        </CardContent></Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Profissionais"))}><ArrowLeft className="w-4 h-4" /></Button>
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-emerald-500" />
            <h1 className="text-2xl font-bold">Editar Profissional</h1>
          </div>
        </div>
        <Card className="glass-effect">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input 
                  id="nome" 
                  value={dados.nome || ''} 
                  onChange={handleChange}
                  className={errors.nome ? 'border-red-500' : ''}
                />
                {errors.nome && <p className="text-sm text-red-600 mt-1">{errors.nome}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input 
                    id="telefone" 
                    value={dados.telefone || ''} 
                    onChange={handleChange}
                    className={errors.telefone ? 'border-red-500' : ''}
                  />
                  {errors.telefone && <p className="text-sm text-red-600 mt-1">{errors.telefone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={dados.email || ''} onChange={handleChange} />
                </div>
              </div>
               <div className="space-y-2">
                  <Label>Especialidades</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {especialidadesDisponiveis.map(esp => (
                       <div key={esp} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                         <input 
                           type="checkbox" 
                           id={`esp-${esp}`} 
                           checked={dados.especialidades?.includes(esp) || false} 
                           onChange={() => handleCheckboxChange('especialidades', esp)} 
                           className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" 
                         />
                         <Label htmlFor={`esp-${esp}`} className="text-sm capitalize">{esp}</Label>
                       </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comissao_percentual">Comissão (%)</Label>
                  <Input 
                    id="comissao_percentual" 
                    type="number" 
                    min="0" 
                    max="100" 
                    value={dados.comissao_percentual || 0} 
                    onChange={handleChange}
                    className={errors.comissao_percentual ? 'border-red-500' : ''}
                  />
                   {errors.comissao_percentual && <p className="text-sm text-red-600 mt-1">{errors.comissao_percentual}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="horario_inicio">Horário Início</Label>
                    <Input id="horario_inicio" type="time" value={dados.horario_inicio || ''} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horario_fim">Horário Fim</Label>
                    <Input id="horario_fim" type="time" value={dados.horario_fim || ''} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Dias de Trabalho</Label>
                  <div className="flex flex-wrap gap-2">
                    {diasSemana.map(dia => (
                       <div key={dia.value} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                         <input 
                           type="checkbox" 
                           id={`dia-${dia.value}`} 
                           checked={dados.dias_trabalho?.includes(dia.value) || false} 
                           onChange={() => handleCheckboxChange('dias_trabalho', dia.value)} 
                           className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" 
                         />
                         <Label htmlFor={`dia-${dia.value}`}>{dia.label}</Label>
                       </div>
                    ))}
                  </div>
                </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(createPageUrl("Profissionais"))}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-500">
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
