
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
      setLoading(true);

      let empresa = getEmpresaSelecionada();
      setEmpresaSelecionada(empresa);

      if (empresa) {
        await carregarDados(empresa.id);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    carregarEmpresaEDados();
  }, []);

  const carregarDados = async (empresaId) => {
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
      const faturamentoMes = vendas
        .filter(v => format(new Date(v.data), 'yyyy-MM') === format(new Date(), 'yyyy-MM'))
        .reduce((total, venda) => total + (venda.valor_total || 0), 0);

      // Filter products with low stock
      const produtosBaixo = produtos.filter(p => (p.quantidade_estoque || 0) <= (p.estoque_minimo || 0));

      setMetricas({
        agendamentosHoje: agendHoje.length,
        totalClientes: clientes.length,
        faturamentoMes: faturamentoMes,
        produtosEstoqueBaixo: produtosBaixo.length
      });

      setAgendamentosHoje(agendHoje);
      setProdutosBaixoEstoque(produtosBaixo);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="w-full h-full">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-24 h-24 bg-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Carregando sua empresa...</h2>
          <p className="text-gray-600 text-center max-w-md">
            Aguarde enquanto carregamos os dados da sua empresa.
          </p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Render a message if no company is selected after loading is complete
  if (!empresaSelecionada) {
    return (
      <div className="w-full h-full">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-24 h-24 bg-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma empresa selecionada</h2>
          <p className="text-gray-600 text-center max-w-md">
            Selecione uma empresa no menu lateral para visualizar os dados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-pink-500" />
          <h1 className="text-3xl md:text-4xl font-bold text-pink-500">
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
          color="pink"
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
          color="orange"
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
  );
}
