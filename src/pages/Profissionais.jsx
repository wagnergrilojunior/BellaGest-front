
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Profissional } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { getEmpresaSelecionada } from "@/components/utils/empresaContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Briefcase, Plus, Search, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ConfirmationModal from "../components/shared/ConfirmationModal";

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [busca, setBusca] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profissionalParaExcluir, setProfissionalParaExcluir] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    carregarProfissionais();
  }, []);

  const carregarProfissionais = async () => {
    setLoading(true);
    try {
      const empresa = getEmpresaSelecionada();
      if (empresa) {
        const dados = await Profissional.filter({ empresa_id: empresa.id });
        setProfissionais(dados.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()));
      } else {
        setProfissionais([]);
      }
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
    setLoading(false);
  };
  
  const handleExcluirClick = (id) => {
    setProfissionalParaExcluir(id);
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    if (profissionalParaExcluir) {
      setDeleting(true);
      try {
        await Profissional.delete(profissionalParaExcluir);
        setShowDeleteModal(false);
        setProfissionalParaExcluir(null);
        carregarProfissionais();
      } catch (error) {
        console.error('Erro ao excluir profissional:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const profissionaisFiltrados = profissionais.filter(prof => 
    busca === "" || 
    prof.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (prof.telefone && prof.telefone.includes(busca))
  );

  return (
    <>
      <div className="p-4 md:p-8 space-y-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-emerald-500" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Profissionais
                </h1>
                <p className="text-gray-600">Gerencie sua equipe</p>
              </div>
            </div>
            <Link to={createPageUrl("NovoProfissional")}>
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Novo Profissional
              </Button>
            </Link>
          </div>

          {/* Tabela de Profissionais */}
          <Card className="glass-effect border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou telefone..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Especialidades</TableHead>
                      <TableHead>Comissão</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan="5" className="p-2">
                            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : profissionaisFiltrados.length > 0 ? (
                      profissionaisFiltrados.map((profissional) => (
                        <TableRow key={profissional.id} className="hover:bg-rose-50/30">
                          <TableCell className="font-medium">{profissional.nome}</TableCell>
                          <TableCell>{profissional.telefone}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {profissional.especialidades?.slice(0, 2).map(esp => (
                                <Badge key={esp} variant="secondary">{esp}</Badge>
                              ))}
                              {profissional.especialidades?.length > 2 && <Badge variant="secondary">...</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>{profissional.comissao_percentual}%</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => navigate(createPageUrl(`EditarProfissional?id=${profissional.id}`))}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleExcluirClick(profissional.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="5" className="text-center h-24">
                          Nenhum profissional encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmarExclusao}
        title="Confirmar Exclusão"
        description="Tem certeza de que deseja excluir este profissional? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        loading={deleting}
      />
    </>
  );
}
