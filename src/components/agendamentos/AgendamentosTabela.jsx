
import React, { useState, useEffect } from "react";
import { Agendamento, Cliente, Profissional, Servico } from "@/api/entities";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  agendado: "bg-blue-100 text-blue-800 border-blue-200",
  confirmado: "bg-green-100 text-green-800 border-green-200",
  em_andamento: "bg-yellow-100 text-yellow-800 border-yellow-200",
  concluido: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelado: "bg-red-100 text-red-800 border-red-200"
};

const isObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

const useNomes = (agendamentos) => {
  const [nomes, setNomes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNomes = async () => {
      if (agendamentos.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const clienteIds = [...new Set(agendamentos.map(a => a.cliente_id))].filter(isObjectId);
      const profissionalIds = [...new Set(agendamentos.map(a => a.profissional_id))].filter(isObjectId);
      const servicoIds = [...new Set(agendamentos.map(a => a.servico_id))].filter(isObjectId);

      try {
        const [clientes, profissionais, servicos] = await Promise.all([
          Cliente.filter({ id: { $in: clienteIds } }),
          Profissional.filter({ id: { $in: profissionalIds } }),
          Servico.filter({ id: { $in: servicoIds } })
        ]);

        const nomesMap = { clientes: {}, profissionais: {}, servicos: {} };
        clientes.forEach(c => nomesMap.clientes[c.id] = c.nome);
        profissionais.forEach(p => nomesMap.profissionais[p.id] = p.nome);
        servicos.forEach(s => nomesMap.servicos[s.id] = s.nome);

        setNomes(nomesMap);
      } catch (error) {
        console.error("Erro ao buscar nomes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNomes();
  }, [agendamentos]);

  return { nomes, loading: loading };
};

export default function AgendamentosTabela({ agendamentos, loading: agendamentosLoading, onUpdate }) {
  const { nomes, loading: nomesLoading } = useNomes(agendamentos);
  const loading = agendamentosLoading || nomesLoading;

  return (
    <Card className="glass-effect border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan="7" className="p-2">
                      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : agendamentos.length > 0 ? (
                agendamentos.map((agendamento) => (
                  <TableRow key={agendamento.id} className="hover:bg-rose-50/30">
                    <TableCell>
                      {format(new Date(agendamento.data_hora), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">{nomes.clientes?.[agendamento.cliente_id] || `ID: ${agendamento.cliente_id}`}</TableCell>
                    <TableCell>{nomes.profissionais?.[agendamento.profissional_id] || `ID: ${agendamento.profissional_id}`}</TableCell>
                    <TableCell>{nomes.servicos?.[agendamento.servico_id] || `ID: ${agendamento.servico_id}`}</TableCell>
                    <TableCell>R$ {agendamento.valor_total?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[agendamento.status] || statusColors.agendado} capitalize`}>
                        {agendamento.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="7" className="text-center h-24">
                    Nenhum agendamento encontrado.
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
