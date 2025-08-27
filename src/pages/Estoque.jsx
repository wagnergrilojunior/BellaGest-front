
import React, { useState, useEffect } from "react";
import { Produto, MovimentacaoEstoque } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { getEmpresaSelecionada } from "@/components/utils/empresaContext";
import { Package, TrendingUp, TrendingDown, AlertTriangle, Plus, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

import EstoqueVisaoGeral from "../components/estoque/EstoqueVisaoGeral";
import AlertasEstoque from "../components/estoque/AlertasEstoque";
import MovimentacaoEstoqueComponent from "../components/estoque/MovimentacaoEstoque";
import GraficosEstoque from "../components/estoque/GraficosEstoque";

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("visao-geral");

  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const empresa = getEmpresaSelecionada(); // Get selected company details
      if (empresa) {
        const [produtosData, movimentacoesData] = await Promise.all([
          Produto.filter({ empresa_id: empresa.id }), // Filter products by company_id
          MovimentacaoEstoque.filter({ empresa_id: empresa.id }) // Filter movements by company_id
        ]);
        
        // Sort products by created_date descending
        const sortedProdutos = produtosData.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        setProdutos(sortedProdutos);

        // Sort movements by created_date descending and then take the first 50
        const sortedAndSlicedMovimentacoes = movimentacoesData
          .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
          .slice(0, 50);
        setMovimentacoes(sortedAndSlicedMovimentacoes);
      } else {
        // If no company is selected, clear the data
        setProdutos([]);
        setMovimentacoes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setLoading(false);
  };

  const produtosBaixoEstoque = produtos.filter(produto => 
    produto.quantidade_estoque <= (produto.quantidade_minima || 10)
  );

  const estatisticas = {
    totalProdutos: produtos.length,
    produtosBaixoEstoque: produtosBaixoEstoque.length,
    valorEstoque: produtos.reduce((total, produto) => 
      total + (produto.quantidade_estoque * (produto.preco_custo || 0)), 0
    ),
    movimentacoesHoje: movimentacoes.filter(mov => {
      const hoje = new Date().toDateString();
      const dataMovimentacao = new Date(mov.created_date).toDateString();
      return hoje === dataMovimentacao;
    }).length
  };

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Controle de Estoque
              </h1>
              <p className="text-gray-600">Gerencie entradas, saídas e monitore seu estoque.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate(createPageUrl("NovaMovimentacao"))} 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Movimentação
            </Button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total de Produtos</p>
                  <p className="text-2xl font-bold text-gray-900">{estatisticas.totalProdutos}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Estoque Baixo</p>
                  <p className="text-2xl font-bold text-gray-900">{estatisticas.produtosBaixoEstoque}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Valor do Estoque</p>
                  <p className="text-2xl font-bold text-gray-900">R$ {estatisticas.valorEstoque.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Movimentações Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">{estatisticas.movimentacoesHoje}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <History className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <GraficosEstoque produtos={produtos} loading={loading} />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
            <TabsTrigger value="visao-geral">
              <Package className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="alertas">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Alertas ({produtosBaixoEstoque.length})
            </TabsTrigger>
            <TabsTrigger value="movimentacoes">
              <History className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral">
            <EstoqueVisaoGeral produtos={produtos} loading={loading} onUpdate={carregarDados} />
          </TabsContent>

          <TabsContent value="alertas">
            <AlertasEstoque produtos={produtosBaixoEstoque} loading={loading} />
          </TabsContent>

          <TabsContent value="movimentacoes">
            <MovimentacaoEstoqueComponent movimentacoes={movimentacoes} produtos={produtos} loading={loading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
