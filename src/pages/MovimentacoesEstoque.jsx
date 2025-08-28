import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Warehouse, Plus, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { Input } from '../components/ui/input';

export default function MovimentacoesEstoque() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setMovimentacoes([
        {
          id: 1,
          produto: "Shampoo Profissional",
          tipo: "entrada",
          quantidade: 50,
          motivo: "Compra inicial",
          data: "2025-08-28",
          observacoes: "Estoque inicial do shampoo"
        },
        {
          id: 2,
          produto: "Shampoo Profissional",
          tipo: "saida",
          quantidade: 5,
          motivo: "Venda",
          data: "2025-08-28",
          observacoes: "Venda para cliente"
        },
        {
          id: 3,
          produto: "Condicionador Profissional",
          tipo: "entrada",
          quantidade: 40,
          motivo: "Compra inicial",
          data: "2025-08-28",
          observacoes: "Estoque inicial do condicionador"
        },
        {
          id: 4,
          produto: "Protetor Solar",
          tipo: "entrada",
          quantidade: 25,
          motivo: "Compra inicial",
          data: "2025-08-28",
          observacoes: "Estoque inicial do protetor solar"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'entrada':
        return 'bg-green-100 text-green-800';
      case 'saida':
        return 'bg-red-100 text-red-800';
      case 'ajuste':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'entrada':
        return <ArrowUp className="w-4 h-4" />;
      case 'saida':
        return <ArrowDown className="w-4 h-4" />;
      case 'ajuste':
        return <RotateCcw className="w-4 h-4" />;
      default:
        return <Warehouse className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando movimentações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movimentações de Estoque</h1>
          <p className="text-gray-600">Controle de entrada, saída e ajustes de produtos</p>
        </div>
        <Button className="bg-rose-500 hover:bg-rose-600">
          <Plus className="w-4 h-4 mr-2" />
          Nova Movimentação
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Buscar por produto..." />
            </div>
            <Button variant="outline">
              <Warehouse className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Movimentações */}
      <div className="grid gap-4">
        {movimentacoes.map((movimentacao) => (
          <Card key={movimentacao.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    movimentacao.tipo === 'entrada' ? 'bg-green-100' : 
                    movimentacao.tipo === 'saida' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    {getTipoIcon(movimentacao.tipo)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{movimentacao.produto}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(movimentacao.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    movimentacao.tipo === 'entrada' ? 'text-green-600' : 
                    movimentacao.tipo === 'saida' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {movimentacao.tipo === 'entrada' ? '+' : '-'}{movimentacao.quantidade} un
                  </p>
                  <p className="text-sm text-gray-500">{movimentacao.motivo}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getTipoColor(movimentacao.tipo)}>
                    {movimentacao.tipo.charAt(0).toUpperCase() + movimentacao.tipo.slice(1)}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
              
              {movimentacao.observacoes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    <strong>Observações:</strong> {movimentacao.observacoes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{movimentacoes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {movimentacoes.filter(m => m.tipo === 'entrada').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {movimentacoes.filter(m => m.tipo === 'saida').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ajustes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {movimentacoes.filter(m => m.tipo === 'ajuste').length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
