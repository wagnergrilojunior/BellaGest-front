import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Cliente, Profissional } from "@/api/entities";

const useNomes = (vendas) => {
  const [nomes, setNomes] = useState({ clientes: {}, profissionais: {} });
  useEffect(() => {
    if (vendas.length === 0) return;
    const fetchNomes = async () => {
      const clienteIds = [...new Set(vendas.map(v => v.cliente_id))].filter(id => /^[0-9a-fA-F]{24}$/.test(id));
      const profissionalIds = [...new Set(vendas.map(v => v.profissional_id))].filter(id => /^[0-9a-fA-F]{24}$/.test(id));
      
      const [clientesData, profissionaisData] = await Promise.all([
        clienteIds.length > 0 ? Cliente.filter({ id: { $in: clienteIds } }) : [],
        profissionalIds.length > 0 ? Profissional.filter({ id: { $in: profissionalIds } }) : []
      ]);

      const nomesMap = { clientes: {}, profissionais: {} };
      clientesData.forEach(c => nomesMap.clientes[c.id] = c.nome);
      profissionaisData.forEach(p => nomesMap.profissionais[p.id] = p.nome);
      setNomes(nomesMap);
    };
    fetchNomes();
  }, [vendas]);
  return nomes;
};


export default function TabelaVendas({ vendas, loading }) {
  const nomes = useNomes(vendas);

  return (
    <Card className="glass-effect border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Histórico de Vendas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan="6" className="p-2"><div className="h-8 bg-gray-200 rounded animate-pulse"></div></TableCell></TableRow>
                ))
              ) : vendas.length > 0 ? (
                vendas.map((venda) => (
                  <TableRow key={venda.id} className="hover:bg-rose-50/30">
                    <TableCell>{format(new Date(venda.created_date), "dd/MM/yy HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell>{nomes.clientes[venda.cliente_id] || 'N/A'}</TableCell>
                    <TableCell>{nomes.profissionais[venda.profissional_id] || 'N/A'}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{venda.tipo}</Badge></TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{venda.forma_pagamento.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="text-right font-semibold text-green-700">R$ {venda.valor_total?.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan="6" className="text-center h-24">Nenhuma venda encontrada para o período.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}