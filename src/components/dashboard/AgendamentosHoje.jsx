import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  agendado: "bg-blue-100 text-blue-800",
  confirmado: "bg-green-100 text-green-800", 
  em_andamento: "bg-yellow-100 text-yellow-800",
  concluido: "bg-emerald-100 text-emerald-800",
  cancelado: "bg-red-100 text-red-800"
};

export default function AgendamentosHoje({ agendamentos, loading }) {
  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            Agendamentos de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="pb-4 border-b border-gray-200">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Calendar className="w-5 h-5 text-pink-500" />
          Agendamentos de Hoje
          <Badge variant="secondary" className="ml-auto bg-pink-100 text-pink-700">
            {agendamentos.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {agendamentos.length > 0 ? (
          <div className="space-y-4">
            {agendamentos.map((agendamento) => (
              <div key={agendamento.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Cliente #{agendamento.cliente_id}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(agendamento.data_hora), 'HH:mm')}
                    <span className="mx-2">•</span>
                    R$ {agendamento.valor_total?.toFixed(2)}
                  </div>
                </div>
                <Badge className={statusColors[agendamento.status] || statusColors.agendado}>
                  {agendamento.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum agendamento para hoje</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}