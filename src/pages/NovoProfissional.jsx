
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Profissional, User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, UserPlus } from "lucide-react";

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

export default function NovoProfissional() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    nome: "",
    telefone: "",
    whatsapp: "",
    email: "",
    especialidades: [],
    comissao_percentual: 0,
    horario_inicio: "09:00",
    horario_fim: "18:00",
    dias_trabalho: [],
    empresa_id: "", // Changed from "1" to ""
    ativo: true
  });
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    const fetchUserEmpresa = async () => {
        try {
            const user = await User.me();
            if (user && user.empresa_id) {
                setDados(prev => ({...prev, empresa_id: user.empresa_id}));
            } else {
              setErrors(prev => ({ ...prev, geral: "Não foi possível identificar a empresa do usuário. Faça login novamente." }));
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
    if (!dados.nome.trim()) newErrors.nome = "O nome é obrigatório.";
    if (!dados.telefone.trim()) newErrors.telefone = "O telefone é obrigatório.";
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
    // Clear error for the current field if it exists
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
    if (!dados.empresa_id) {
      setErrors(prev => ({ ...prev, geral: "Não foi possível identificar a empresa do usuário. Tente novamente ou entre em contato com o suporte." }));
      return;
    }
    setLoading(true);
    try {
      await Profissional.create(dados);
      navigate(createPageUrl("Profissionais"));
    } catch (error) {
      console.error('Erro ao criar profissional:', error);
      setErrors(prev => ({ ...prev, geral: "Erro ao criar profissional. " + (error.message || "Tente novamente.") }));
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Profissionais"))}><ArrowLeft className="w-4 h-4" /></Button>
          <h1 className="text-2xl font-bold">Novo Profissional</h1>
        </div>
        <Card className="glass-effect">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
               {errors.geral && <p className="text-sm text-red-600 mt-1">{errors.geral}</p>}
               <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input 
                  id="nome" 
                  value={dados.nome} 
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
                    value={dados.telefone} 
                    onChange={handleChange}
                    className={errors.telefone ? 'border-red-500' : ''}
                  />
                  {errors.telefone && <p className="text-sm text-red-600 mt-1">{errors.telefone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp (Opcional)</Label>
                  <Input 
                    id="whatsapp" 
                    value={dados.whatsapp} 
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={dados.email} onChange={handleChange} />
                </div>
              </div>
               <div className="space-y-2">
                  <Label>Especialidades</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {especialidadesDisponiveis.map(esp => (
                       <div key={esp} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                         <input type="checkbox" id={`esp-${esp}`} checked={dados.especialidades.includes(esp)} onChange={() => handleCheckboxChange('especialidades', esp)} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
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
                    value={dados.comissao_percentual} 
                    onChange={handleChange} 
                    className={errors.comissao_percentual ? 'border-red-500' : ''}
                  />
                  {errors.comissao_percentual && <p className="text-sm text-red-600 mt-1">{errors.comissao_percentual}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="horario_inicio">Horário Início</Label>
                    <Input id="horario_inicio" type="time" value={dados.horario_inicio} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="horario_fim">Horário Fim</Label>
                    <Input id="horario_fim" type="time" value={dados.horario_fim} onChange={handleChange} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Dias de Trabalho</Label>
                  <div className="flex flex-wrap gap-2">
                    {diasSemana.map(dia => (
                       <div key={dia.value} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                         <input type="checkbox" id={`dia-${dia.value}`} checked={dados.dias_trabalho.includes(dia.value)} onChange={() => handleCheckboxChange('dias_trabalho', dia.value)} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                         <Label htmlFor={`dia-${dia.value}`}>{dia.label}</Label>
                       </div>
                    ))}
                  </div>
                </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(createPageUrl("Profissionais"))}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-emerald-500 to-teal-500">
                  {loading ? "Salvando..." : "Criar Profissional"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
