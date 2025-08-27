import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Agendamento, Cliente, Profissional, Servico, User } from "@/api/entities";

export default function NovoAgendamentoModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  
  const [dados, setDados] = useState({
    cliente_id: "",
    profissional_id: "",
    servico_id: "",
    data_hora: "",
    valor_total: 0,
    observacoes: "",
    empresa_id: "" // Valor padrão
  });

  useEffect(() => {
    if (open) {
      carregarDados();
      const fetchUserEmpresa = async () => {
          try {
              const user = await User.me();
              if (user && user.empresa_id) {
                  setDados(prev => ({...prev, empresa_id: user.empresa_id}));
              }
          } catch (e) {
              console.error("Não foi possível buscar os dados da empresa do usuário.", e);
          }
      };
      fetchUserEmpresa();
    }
  }, [open]);

  const carregarDados = async () => {
    try {
      const [clientesList, profissionaisList, servicosList] = await Promise.all([
        Cliente.list(),
        Profissional.list(),
        Servico.list()
      ]);
      
      setClientes(clientesList);
      setProfissionais(profissionaisList);
      setServicos(servicosList);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleServicoChange = (servicoId) => {
    const servico = servicos.find(s => s.id === servicoId);
    setDados(prev => ({
      ...prev,
      servico_id: servicoId,
      valor_total: servico?.preco || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!dados.empresa_id) {
      console.error("ID da empresa não encontrado. O usuário está logado e associado a uma empresa?");
      setLoading(false);
      return; // Previne a criação do agendamento sem empresa
    }

    try {
      await Agendamento.create(dados);
      onSuccess();
      onClose();
      setDados({
        cliente_id: "",
        profissional_id: "",
        servico_id: "",
        data_hora: "",
        valor_total: 0,
        observacoes: "",
        empresa_id: "" // Resetar para vazio após sucesso, para ser preenchido novamente
      });
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente</Label>
            <select
              id="cliente"
              required
              value={dados.cliente_id}
              onChange={(e) => setDados(prev => ({...prev, cliente_id: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            >
              <option value="">Selecione um cliente</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} - {cliente.telefone}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profissional">Profissional</Label>
            <select
              id="profissional"
              required
              value={dados.profissional_id}
              onChange={(e) => setDados(prev => ({...prev, profissional_id: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            >
              <option value="">Selecione um profissional</option>
              {profissionais.map(prof => (
                <option key={prof.id} value={prof.id}>
                  {prof.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="servico">Serviço</Label>
            <select
              id="servico"
              required
              value={dados.servico_id}
              onChange={(e) => handleServicoChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
            >
              <option value="">Selecione um serviço</option>
              {servicos.map(servico => (
                <option key={servico.id} value={servico.id}>
                  {servico.nome} - R$ {servico.preco?.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_hora">Data e Hora</Label>
            <Input
              id="data_hora"
              type="datetime-local"
              required
              value={dados.data_hora}
              onChange={(e) => setDados(prev => ({...prev, data_hora: e.target.value}))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">Valor Total</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              required
              value={dados.valor_total}
              onChange={(e) => setDados(prev => ({...prev, valor_total: parseFloat(e.target.value)}))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={dados.observacoes}
              onChange={(e) => setDados(prev => ({...prev, observacoes: e.target.value}))}
              placeholder="Observações sobre o agendamento..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {loading ? "Criando..." : "Criar Agendamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}