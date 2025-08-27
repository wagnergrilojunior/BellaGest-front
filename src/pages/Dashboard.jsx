
import React, { useState, useEffect } from "react";
import {
  Agendamento,
  Cliente,
  Profissional,
  Venda,
  Produto
} from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Users,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Building2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getEmpresaSelecionada } from "@/components/utils/empresaContext";

import MetricCard from "../components/dashboard/MetricCard";
import AgendamentosHoje from "../components/dashboard/AgendamentosHoje";
import AlertasEstoque from "../components/dashboard/AlertasEstoque";

export default function Dashboard() {
  const [metricas, setMetricas] = useState({
    agendamentosHoje: 0,
    totalClientes: 0,
    faturamentoMes: 0,
    produtosEstoqueBaixo: 0
  });
  const [agendamentosHoje, setAgendamentosHoje] = useState([]);
  const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState([]);
  const [loading, setLoading] = useState(true);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);

  useEffect(() => {
    const carregarEmpresaEDados = async () => {
      setLoading(true); // Start loading

      // Check if it's a new registration
      const urlParams = new URLSearchParams(window.location.search);
      const novoCadastro = urlParams.get('novo_cadastro');

      if (novoCadastro) {
        // Wait a bit to ensure localStorage has been updated after a new registration
        await new Promise(resolve => setTimeout(resolve, 200));

        // Clean the URL parameter
        window.history.replaceState({}, '', window.location.pathname);
      }

      let empresa = getEmpresaSelecionada(); // Attempt to get the selected company
      setEmpresaSelecionada(empresa);

      if (empresa) {
        await carregarDados(empresa.id);
        setLoading(false); // Data loaded, stop loading
      } else {
        // If no company found initially
        if (novoCadastro) {
          // If it's a new registration, retry after a short delay
          setTimeout(async () => {
            empresa = getEmpresaSelecionada(); // Try to get the company again
            setEmpresaSelecionada(empresa);
            if (empresa) {
              await carregarDados(empresa.id);
            }
            setLoading(false); // Stop loading after retry attempt
          }, 500);
        } else {
          // If not a new registration and no company selected, stop loading immediately
          setLoading(false);
        }
      }
    };

    carregarEmpresaEDados();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  const carregarDados = async (empresaId) => {
    // The carregarDados function no longer manages the loading state,
    // as the useEffect hook now handles it.
    try {
      const hoje = format(new Date(), 'yyyy-MM-dd');
      const inicioMes = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');

      // Fetch data filtered by company
      const [agendamentos, clientes, vendas, produtos] = await Promise.all([
        Agendamento.filter({ empresa_id: empresaId }),
        Cliente.filter({ empresa_id: empresaId }),
        Venda.filter({ empresa_id: empresaId }),
        Produto.filter({ empresa_id: empresaId })
      ]);

      // Filter today's appointments
      const agendHoje = agendamentos.filter(a =>
        format(new Date(a.data_hora), 'yyyy-MM-dd') === hoje
      );

      // Calculate monthly revenue
      const vendasMes = vendas.filter(v =>
        format(new Date(v.created_date), 'yyyy-MM-dd') >= inicioMes
      );
      const faturamentoMes = vendasMes.reduce((sum, venda) => sum + (venda.valor_total || 0), 0);

      // Products with low stock
      const produtosBaixos = produtos.filter(p =>
        p.quantidade_estoque <= (p.quantidade_minima || 10)
      );

      setMetricas({
        agendamentosHoje: agendHoje.length,
        totalClientes: clientes.length,
        faturamentoMes,
        produtosEstoqueBaixo: produtosBaixos.length
      });

      setAgendamentosHoje(agendHoje.slice(0, 5));
      setProdutosBaixoEstoque(produtosBaixos.slice(0, 5));

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  // Render the initial loading state (splash screen)
  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Building2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Carregando sua empresa...</h2>
            <p className="text-gray-600 text-center max-w-md">
              Aguarde enquanto carregamos os dados da sua empresa.
            </p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render a message if no company is selected after loading is complete
  if (!empresaSelecionada) {
    return (
      <div className="p-4 md:p-8 space-y-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Building2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma empresa selecionada</h2>
            <p className="text-gray-600 text-center max-w-md">
              Selecione uma empresa no menu lateral para visualizar os dados.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-rose-500" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {empresaSelecionada.nome} - {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Agendamentos Hoje"
            value={metricas.agendamentosHoje}
            icon={Calendar}
            color="rose"
            loading={loading}
          />
          <MetricCard
            title="Total de Clientes"
            value={metricas.totalClientes}
            icon={Users}
            color="blue"
            loading={loading}
          />
          <MetricCard
            title="Faturamento do Mês"
            value={`R$ ${metricas.faturamentoMes.toFixed(2)}`}
            icon={DollarSign}
            color="green"
            loading={loading}
          />
          <MetricCard
            title="Produtos Estoque Baixo"
            value={metricas.produtosEstoqueBaixo}
            icon={AlertTriangle}
            color="amber"
            loading={loading}
          />
        </div>

        {/* Cards informativos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgendamentosHoje
            agendamentos={agendamentosHoje}
            loading={loading}
          />
          <AlertasEstoque
            produtos={produtosBaixoEstoque}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
