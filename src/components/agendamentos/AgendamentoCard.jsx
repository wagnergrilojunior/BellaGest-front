import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, DollarSign, Phone } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  agendado: "bg-blue-100 text-blue-800 border-blue-200",
  confirmado: "bg-green-100 text-green-800 border-green-200",
  em_andamento: "bg-yellow-100 text-yellow-800 border-yellow-200",
  concluido: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelado: "bg-red-100 text-red-800 border-red-200"
};

export default function AgendamentoCard({ agendamento, onUpdate }) {
  const dataFormatada = format(new Date(agendamento.data_hora), "dd/MM/yyyy", { locale: ptBR });
  const horaFormatada = format(new Date(agendamento.data_hora), "HH:mm");

  return (
    <Card className="glass-effect border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Badge className={statusColors[agendamento.status] || statusColors.agendado}>
            {agendamento.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <div className="text-right">
            <p className="text-sm text-gray-600">{dataFormatada}</p>
            <p className="font-semibold text-purple-600">{horaFormatada}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Cliente ID: {agendamento.cliente_id}</span>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Profissional ID: {agendamento.profissional_id}</span>
          </div>

          <div className="flex items-center gap-3">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-green-600">
              R$ {agendamento.valor_total?.toFixed(2)}
            </span>
          </div>

          {agendamento.observacoes && (
            <div className="bg-gray-50 rounded-lg p-3 mt-4">
              <p className="text-sm text-gray-600">{agendamento.observacoes}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <Button variant="outline" size="sm" className="flex-1">
            Editar
          </Button>
          {agendamento.status === 'agendado' && (
            <Button size="sm" className="bg-green-500 hover:bg-green-600">
              Confirmar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}