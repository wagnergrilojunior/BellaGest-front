import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, History, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MovimentacaoEstoque({ movimentacoes, produtos, loading }) {
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [produtoMap, setProdutoMap] = useState({});

  useEffect(() => {
    const map = {};
    produtos.forEach(produto => {
      map[produto.id] = produto.nome;
    });
    setProdutoMap(map);
  }, [produtos]);

  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    const nomeProduto = produtoMap[mov.produto_id] || '';
    const matchBusca = busca === "" || nomeProduto.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === "todos" || mov.tipo === filtroTipo;
    return matchBusca && matchTipo;
  });

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'entrada':
        return <TrendingUp className="w-4 h-4" />;
      case 'saida':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'entrada':
        return 'bg-green-100 text-green-800';
      case 'saida':
        return 'bg-red-100 text-red-800';
      case 'ajuste':
        return 'bg-blue-100 text-blue-800';
      case 'vencimento':
        return 'bg-yellow-100 text-yellow-800';
      case 'perda':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="glass-effect border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Histórico de Movimentações
          </CardTitle>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar produto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
              <option value="ajuste">Ajuste</option>
              <option value="vencimento">Vencimento</option>
              <option value="perda">Perda</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Estoque Anterior</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimentacoesFiltradas.length > 0 ? (
                movimentacoesFiltradas.map((movimentacao) => (
                  <TableRow key={movimentacao.id} className="hover:bg-rose-50/30">
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">
                          {format(new Date(movimentacao.created_date), 'dd/MM/yy', { locale: ptBR })}
                        </p>
                        <p className="text-gray-500">
                          {format(new Date(movimentacao.created_date), 'HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {produtoMap[movimentacao.produto_id] || 'Produto não encontrado'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getTipoColor(movimentacao.tipo)} flex items-center gap-1 w-fit`}>
                        {getTipoIcon(movimentacao.tipo)}
                        {movimentacao.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${
                        movimentacao.tipo === 'entrada' ? 'text-green-600' : 
                        movimentacao.tipo === 'saida' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {movimentacao.tipo === 'entrada' ? '+' : movimentacao.tipo === 'saida' ? '-' : '±'}
                        {movimentacao.quantidade}
                      </span>
                    </TableCell>
                    <TableCell>{movimentacao.quantidade_anterior}</TableCell>
                    <TableCell>{movimentacao.quantidade_atual}</TableCell>
                    <TableCell>
                      <div className="max-w-32 truncate" title={movimentacao.motivo || movimentacao.observacoes}>
                        {movimentacao.motivo || movimentacao.observacoes || '-'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="7" className="text-center h-24">
                    Nenhuma movimentação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}