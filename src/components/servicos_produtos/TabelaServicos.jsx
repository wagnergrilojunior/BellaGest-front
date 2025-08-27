import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Servico } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { getEmpresaSelecionada } from "@/components/utils/empresaContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Trash, CheckSquare, Square } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationModal from "../shared/ConfirmationModal";

export default function TabelaServicos() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [busca, setBusca] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [servicoParaExcluir, setServicoParaExcluir] = useState(null);
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [showDeleteMassModal, setShowDeleteMassModal] = useState(false);
  const [deletingMass, setDeletingMass] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    carregarServicos();
  }, []);

  const carregarServicos = async () => {
    setLoading(true);
    try {
      const empresa = getEmpresaSelecionada();
      if (empresa) {
        const dados = await Servico.filter({ empresa_id: empresa.id });
        setServicos(dados.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      } else {
        setServicos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
    setLoading(false);
  };

  const handleExcluirClick = (id) => {
    setServicoParaExcluir(id);
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    if (servicoParaExcluir) {
      setDeleting(true);
      try {
        await Servico.delete(servicoParaExcluir);
        setShowDeleteModal(false);
        setServicoParaExcluir(null);
        carregarServicos();
      } catch (error) {
        console.error('Erro ao excluir serviço:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleSelecionarServico = (servicoId, checked) => {
    if (checked) {
      setServicosSelecionados(prev => [...prev, servicoId]);
    } else {
      setServicosSelecionados(prev => prev.filter(id => id !== servicoId));
    }
  };

  const handleSelecionarTodos = (checked) => {
    if (checked) {
      setServicosSelecionados(servicosFiltrados.map(s => s.id));
    } else {
      setServicosSelecionados([]);
    }
  };

  const handleExclusaoMassa = () => {
    if (servicosSelecionados.length > 0) {
      setShowDeleteMassModal(true);
    }
  };

  const confirmarExclusaoMassa = async () => {
    setDeletingMass(true);
    try {
      await Promise.all(servicosSelecionados.map(id => Servico.delete(id)));
      setShowDeleteMassModal(false);
      setServicosSelecionados([]);
      carregarServicos();
    } catch (error) {
      console.error('Erro ao excluir serviços:', error);
    } finally {
      setDeletingMass(false);
    }
  };

  const servicosFiltrados = servicos.filter(servico =>
    busca === "" || servico.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const todosSelecionados = servicosFiltrados.length > 0 && servicosSelecionados.length === servicosFiltrados.length;
  const algunsSelecionados = servicosSelecionados.length > 0;

  return (
    <>
      <Card className="glass-effect border-0 shadow-lg mt-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar serviço por nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {servicosSelecionados.length > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={handleExclusaoMassa}
                  className="flex items-center gap-2"
                >
                  <Trash className="w-4 h-4" />
                  Excluir Selecionados ({servicosSelecionados.length})
                </Button>
              )}
              <Link to={createPageUrl("NovoServico")}>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Serviço
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={todosSelecionados}
                      onCheckedChange={handleSelecionarTodos}
                      indeterminate={algunsSelecionados && !todosSelecionados}
                    />
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Duração (min)</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan="6" className="p-2"><div className="h-8 bg-gray-200 rounded animate-pulse"></div></TableCell></TableRow>
                  ))
                ) : servicosFiltrados.length > 0 ? (
                  servicosFiltrados.map((servico) => (
                    <TableRow key={servico.id} className="hover:bg-rose-50/30">
                      <TableCell>
                        <Checkbox
                          checked={servicosSelecionados.includes(servico.id)}
                          onCheckedChange={(checked) => handleSelecionarServico(servico.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{servico.nome}</TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize">{servico.categoria}</Badge></TableCell>
                      <TableCell>{servico.duracao_minutos}</TableCell>
                      <TableCell>R$ {servico.preco?.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl(`EditarServico?id=${servico.id}`))}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleExcluirClick(servico.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan="6" className="text-center h-24">Nenhum serviço encontrado.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmarExclusao}
        title="Confirmar Exclusão"
        description="Tem certeza de que deseja excluir este serviço? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        loading={deleting}
      />

      <ConfirmationModal
        open={showDeleteMassModal}
        onClose={() => setShowDeleteMassModal(false)}
        onConfirm={confirmarExclusaoMassa}
        title="Confirmar Exclusão em Massa"
        description={`Tem certeza de que deseja excluir ${servicosSelecionados.length} serviço(s) selecionado(s)? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Todos"
        loading={deletingMass}
      />
    </>
  );
}