import React, { useState, useEffect } from "react";
import { Venda } from "@/api/entities";
import { DollarSign } from "lucide-react";
import { format } from "date-fns";
import RelatorioFinanceiro from "../components/financeiro/RelatorioFinanceiro";
import TabelaVendas from "../components/financeiro/TabelaVendas";

// Helper function to retrieve the selected company from localStorage
const getEmpresaSelecionada = () => {
  if (typeof window !== 'undefined') {
    const empresaJson = localStorage.getItem('empresa_selecionada');
    return empresaJson ? JSON.parse(empresaJson) : null;
  }
  return null;
};

export default function Financeiro() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState({
    inicio: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
    fim: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    carregarVendas();
  }, [filtro]);

  const carregarVendas = async () => {
    setLoading(true);
    try {
      const empresa = getEmpresaSelecionada();
      if (empresa) {
        const todasVendas = await Venda.filter({ empresa_id: empresa.id });
        const vendasFiltradas = todasVendas.filter(venda => {
          const dataVenda = format(new Date(venda.created_date), 'yyyy-MM-dd');
          return dataVenda >= filtro.inicio && dataVenda <= filtro.fim;
        });
        setVendas(vendasFiltradas.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      } else {
        setVendas([]);
      }
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    }
    setLoading(false);
  };

  const handleFiltroChange = (e) => {
    setFiltro(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Financeiro
              </h1>
              <p className="text-gray-600">Acompanhe suas vendas e receitas.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 glass-effect rounded-xl">
            <input type="date" id="inicio" value={filtro.inicio} onChange={handleFiltroChange} className="px-3 py-2 border border-gray-200 rounded-lg"/>
            <span className="text-gray-500">até</span>
            <input type="date" id="fim" value={filtro.fim} onChange={handleFiltroChange} className="px-3 py-2 border border-gray-200 rounded-lg"/>
          </div>
        </div>

        <RelatorioFinanceiro vendas={vendas} loading={loading} />
        <TabelaVendas vendas={vendas} loading={loading} />
      </div>
    </div>
  );
}