
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
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function EditarCobranca() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [cobrancaId, setCobrancaId] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [dataVencimento, setDataVencimento] = useState(null);
  const [dataPagamento, setDataPagamento] = useState(null);
  const [dados, setDados] = useState({
    empresa_id: "",
    plano_id: "",
    valor: 0,
    status: "pendente",
    observacoes: ""
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setCobrancaId(id);
      carregarDadosIniciais(id);
    } else {
      setCarregando(false);
      navigate(createPageUrl("Cobrancas"));
    }
  }, []);

  const carregarDadosIniciais = async (id) => {
    try {
      const [cobrancaData, empresasData, planosData] = await Promise.all([
        Cobranca.get(id),
        Empresa.list(),
        Plano.list()
      ]);
      setDados(cobrancaData);
      setEmpresas(empresasData);
      setPlanos(planosData);
      if (cobrancaData.data_vencimento) setDataVencimento(parseISO(cobrancaData.data_vencimento));
      if (cobrancaData.data_pagamento) setDataPagamento(parseISO(cobrancaData.data_pagamento));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setCarregando(false);
  };
  
  const handleStatusChange = (status) => {
    setDados(prev => ({ ...prev, status }));
    if (status === 'paga' && !dataPagamento) {
      setDataPagamento(new Date());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await Cobranca.update(cobrancaId, {
        ...dados,
        data_vencimento: dataVencimento ? format(dataVencimento, "yyyy-MM-dd") : null,
        data_pagamento: dataPagamento ? format(dataPagamento, "yyyy-MM-dd") : null,
      });
      navigate(createPageUrl("Cobrancas"));
    } catch (error) {
      console.error('Erro ao atualizar cobrança:', error);
      setErrors({ geral: "Erro ao atualizar cobrança." });
    }
    setLoading(false);
  };

  if (carregando) return <div className="p-8">Carregando...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Cobrancas"))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-cyan-500" />
            <h1 className="text-2xl font-bold">Editar Cobrança</h1>
          </div>
        </div>
        <Card className="glass-effect">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Empresa</Label>
                <p className="p-2 bg-gray-100 rounded-md">{empresas.find(e => e.id === dados.empresa_id)?.nome || 'Não encontrada'}</p>
              </div>
              <div className="space-y-2">
                <Label>Plano</Label>
                <p className="p-2 bg-gray-100 rounded-md">{planos.find(p => p.id === dados.plano_id)?.nome || 'Não encontrado'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$)</Label>
                  <Input id="valor" type="number" step="0.01" value={dados.valor} onChange={(e) => setDados(p => ({...p, valor: parseFloat(e.target.value) || 0}))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={dados.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white border-gray-200"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="paga">Paga</option>
                    <option value="atrasada">Atrasada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="data_vencimento">Data de Vencimento</Label>
                  <Popover>
                    <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{dataVencimento ? format(dataVencimento, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}</Button></PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dataVencimento} onSelect={setDataVencimento} locale={ptBR} /></PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_pagamento">Data de Pagamento</Label>
                  <Popover>
                    <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{dataPagamento ? format(dataPagamento, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}</Button></PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dataPagamento} onSelect={setDataPagamento} locale={ptBR} /></PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" value={dados.observacoes} onChange={(e) => setDados(p => ({...p, observacoes: e.target.value}))} rows={3} />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(createPageUrl("Cobrancas"))}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-cyan-500 to-sky-500">
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
