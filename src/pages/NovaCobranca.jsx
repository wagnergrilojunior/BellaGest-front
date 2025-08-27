
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Cobranca, Empresa, Plano } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Receipt, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NovaCobranca() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [dataVencimento, setDataVencimento] = useState(null);
  const [dados, setDados] = useState({
    empresa_id: "",
    plano_id: "",
    valor: 0,
    status: "pendente",
    observacoes: ""
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const [empresasData, planosData] = await Promise.all([
          Empresa.list(),
          Plano.list()
        ]);
        setEmpresas(empresasData);
        setPlanos(planosData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    carregarDadosIniciais();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!dados.empresa_id) newErrors.empresa_id = "Selecione uma empresa.";
    if (!dados.plano_id) newErrors.plano_id = "Selecione um plano.";
    if (dados.valor <= 0) newErrors.valor = "O valor deve ser maior que zero.";
    if (!dataVencimento) newErrors.data_vencimento = "A data de vencimento é obrigatória.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handlePlanoChange = (planoId) => {
    const planoSelecionado = planos.find(p => p.id === planoId);
    setDados(prev => ({
      ...prev,
      plano_id: planoId,
      valor: planoSelecionado ? planoSelecionado.valor_mensal : 0
    }));
     if (errors.plano_id) setErrors(prev => ({...prev, plano_id: null}));
     if (errors.valor) setErrors(prev => ({...prev, valor: null}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      await Cobranca.create({
        ...dados,
        data_vencimento: format(dataVencimento, "yyyy-MM-dd"),
      });
      navigate(createPageUrl("Cobrancas"));
    } catch (error) {
      console.error('Erro ao gerar cobrança:', error);
      setErrors(prev => ({...prev, geral: "Erro ao gerar cobrança."}));
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Cobrancas"))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-cyan-500" />
            <h1 className="text-2xl font-bold">Gerar Nova Cobrança</h1>
          </div>
        </div>
        <Card className="glass-effect">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.geral && <p className="text-sm text-red-600 text-center">{errors.geral}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="empresa_id">Empresa *</Label>
                  <select
                    id="empresa_id"
                    value={dados.empresa_id}
                    onChange={(e) => setDados(p => ({...p, empresa_id: e.target.value}))}
                    className={`w-full px-3 py-2 border rounded-lg bg-white ${errors.empresa_id ? 'border-red-500' : 'border-gray-200'}`}
                  >
                    <option value="">Selecione uma empresa</option>
                    {empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.nome}</option>)}
                  </select>
                  {errors.empresa_id && <p className="text-sm text-red-600 mt-1">{errors.empresa_id}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plano_id">Plano *</Label>
                  <select
                    id="plano_id"
                    value={dados.plano_id}
                    onChange={(e) => handlePlanoChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-white ${errors.plano_id ? 'border-red-500' : 'border-gray-200'}`}
                  >
                    <option value="">Selecione um plano</option>
                    {planos.map(plano => <option key={plano.id} value={plano.id}>{plano.nome}</option>)}
                  </select>
                  {errors.plano_id && <p className="text-sm text-red-600 mt-1">{errors.plano_id}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={dados.valor}
                    onChange={(e) => setDados(p => ({...p, valor: parseFloat(e.target.value) || 0}))}
                    className={errors.valor ? 'border-red-500' : ''}
                  />
                  {errors.valor && <p className="text-sm text-red-600 mt-1">{errors.valor}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={`w-full justify-start text-left font-normal ${errors.data_vencimento ? 'border-red-500' : ''}`}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dataVencimento ? format(dataVencimento, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dataVencimento} onSelect={setDataVencimento} initialFocus locale={ptBR} /></PopoverContent>
                  </Popover>
                  {errors.data_vencimento && <p className="text-sm text-red-600 mt-1">{errors.data_vencimento}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" value={dados.observacoes} onChange={(e) => setDados(p => ({...p, observacoes: e.target.value}))} rows={3} />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(createPageUrl("Cobrancas"))}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-cyan-500 to-sky-500">
                  {loading ? "Gerando..." : "Gerar Cobrança"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
