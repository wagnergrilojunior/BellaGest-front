
import React, { useState, useEffect } from "react";
import { Agendamento } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, Search, LayoutGrid, List } from "lucide-react";
import { getEmpresaSelecionada } from "@/components/utils/empresaContext"; // Corrected import

import AgendamentoCard from "../components/agendamentos/AgendamentoCard";
import AgendamentosTabela from "../components/agendamentos/AgendamentosTabela";
import NovoAgendamentoModal from "../components/agendamentos/NovoAgendamentoModal";

// The original placeholder for getEmpresaSelecionada is removed as it's now imported.

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [viewMode, setViewMode] = useState("cards");

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  const carregarAgendamentos = async () => {
    setLoading(true);
    try {
      const empresa = getEmpresaSelecionada();
      if (empresa) {
        // Assuming Agendamento.filter exists and correctly handles the filter object
        const dados = await Agendamento.filter({ empresa_id: empresa.id });
        // Sort by data_hora in descending order (most recent first)
        setAgendamentos(dados.sort((a, b) => new Date(b.data_hora).getTime() - new Date(a.data_hora).getTime()));
      } else {
        console.warn("Nenhuma empresa selecionada. Não foi possível carregar agendamentos filtrados.");
        setAgendamentos([]); // Clear appointments if no company is selected
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      setAgendamentos([]); // Ensure agendamentos is cleared on error
    }
    setLoading(false);
  };

  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    // NOTE: a busca por cliente/profissional/serviço exigiria buscar os nomes em outras tabelas,
    // por simplicidade, a busca pode ser desativada ou feita por ID por enquanto.
    const matchBusca = busca === "" || agendamento.id.includes(busca); 
    const matchStatus = filtroStatus === "todos" || agendamento.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-500" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Agendamentos
              </h1>
              <p className="text-gray-600">Gerencie os agendamentos da sua clínica</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>

        {/* Filtros e View Switcher */}
        <Card className="glass-effect p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por ID do agendamento..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
              >
                <option value="todos">Todos os Status</option>
                <option value="agendado">Agendado</option>
                <option value="confirmado">Confirmado</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <Tabs value={viewMode} onValueChange={setViewMode} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="cards"><LayoutGrid className="w-4 h-4 mr-2" /> Cards</TabsTrigger>
                <TabsTrigger value="tabela"><List className="w-4 h-4 mr-2" /> Tabela</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Card>

        {/* Conteúdo */}
        {viewMode === 'cards' ? (
          loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="glass-effect rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4 w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agendamentosFiltrados.map((agendamento) => (
                <AgendamentoCard 
                  key={agendamento.id} 
                  agendamento={agendamento}
                  onUpdate={carregarAgendamentos}
                />
              ))}
            </div>
          )
        ) : (
          <AgendamentosTabela
            agendamentos={agendamentosFiltrados}
            loading={loading}
            onUpdate={carregarAgendamentos}
          />
        )}

        {agendamentosFiltrados.length === 0 && !loading && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nenhum agendamento encontrado</p>
          </div>
        )}
      </div>

      <NovoAgendamentoModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={carregarAgendamentos}
      />
    </div>
  );
}
