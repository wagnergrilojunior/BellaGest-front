import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ShoppingCart, Plus, Search, Filter } from 'lucide-react';
import { Input } from '../components/ui/input';

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setVendas([
        {
          id: 1,
          cliente: "Ana Paula Costa",
          valor: 55.00,
          data: "2025-08-28",
          status: "concluida",
          forma_pagamento: "cartao_credito"
        },
        {
          id: 2,
          cliente: "Carlos Eduardo Lima",
          valor: 45.00,
          data: "2025-08-28",
          status: "concluida",
          forma_pagamento: "dinheiro"
        },
        {
          id: 3,
          cliente: "Roberto Almeida",
          valor: 140.00,
          data: "2025-08-28",
          status: "concluida",
          forma_pagamento: "pix"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'concluida':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cartao_credito':
        return 'Cartão de Crédito';
      case 'cartao_debito':
        return 'Cartão de Débito';
      case 'dinheiro':
        return 'Dinheiro';
      case 'pix':
        return 'PIX';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando vendas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-600">Gerencie as vendas de produtos e serviços</p>
        </div>
        <Button className="bg-rose-500 hover:bg-rose-600">
          <Plus className="w-4 h-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Buscar por cliente..." />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Vendas */}
      <div className="grid gap-4">
        {vendas.map((venda) => (
          <Card key={venda.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{venda.cliente}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(venda.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    R$ {venda.valor.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getPaymentMethodLabel(venda.forma_pagamento)}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(venda.status)}>
                    {venda.status.charAt(0).toUpperCase() + venda.status.slice(1)}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{vendas.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {vendas.reduce((sum, venda) => sum + venda.valor, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Média por Venda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {(vendas.reduce((sum, venda) => sum + venda.valor, 0) / vendas.length).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
