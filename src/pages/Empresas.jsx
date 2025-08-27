
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Empresa, Plano } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Plus, Search, Edit, Trash2, MapPin, AtSign, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ConfirmationModal from "../components/shared/ConfirmationModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";

export default function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [planos, setPlanos] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [busca, setBusca] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [empresaParaExcluir, setEmpresaParaExcluir] = useState(null);
  
  // State for bulk delete
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [empresasData, planosData] = await Promise.all([
        Empresa.list('-created_date'),
        Plano.list()
      ]);
      
      setEmpresas(empresasData);
      
      const planosMap = planosData.reduce((acc, plano) => {
        acc[plano.id] = plano.nome;
        return acc;
      }, {});
      setPlanos(planosMap);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setLoading(false);
    setSelectedItems(new Set()); // Clear selection on data reload
  };

  const handleExcluirClick = (id) => {
    setEmpresaParaExcluir(id);
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    if (empresaParaExcluir) {
      setDeleting(true);
      try {
        await Empresa.delete(empresaParaExcluir);
        setShowDeleteModal(false);
        setEmpresaParaExcluir(null);
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir empresa:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const empresasFiltradas = empresas.filter(empresa => 
    busca === "" || 
    empresa.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (empresa.documento && empresa.documento.includes(busca)) ||
    (empresa.email_cadastro && empresa.email_cadastro.toLowerCase().includes(busca.toLowerCase()))
  );

  // Bulk action handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(new Set(empresasFiltradas.map(e => e.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id, checked) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };
  
  const handleBulkDeleteClick = () => {
    setShowBulkDeleteModal(true);
  };

  const confirmarExclusaoMassa = async () => {
    setBulkDeleting(true);
    try {
      const deletePromises = Array.from(selectedItems).map(id => Empresa.delete(id));
      await Promise.all(deletePromises);
      setShowBulkDeleteModal(false);
      carregarDados(); // Reload data after bulk delete
    } catch (error) {
      console.error('Erro ao excluir empresas em massa:', error);
    } finally {
      setBulkDeleting(false);
    }
  };
  
  const allSelected = empresasFiltradas.length > 0 && selectedItems.size === empresasFiltradas.length;
  const someSelected = selectedItems.size > 0;

  return (
    <>
      <div className="p-4 md:p-8 space-y-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-indigo-500" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Empresas
                </h1>
                <p className="text-gray-600">Gerencie as empresas cadastradas no sistema</p>
              </div>
            </div>
            <Link to={createPageUrl("NovaEmpresa")}>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Nova Empresa
              </Button>
            </Link>
          </div>

          {/* Filtros */}
          <Card className="glass-effect border-0 shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, documento ou email..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Bulk Actions Bar */}
          {someSelected && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between transition-all duration-300">
              <span className="text-sm text-blue-700 font-medium">
                {selectedItems.size} {selectedItems.size === 1 ? 'empresa selecionada' : 'empresas selecionadas'}
              </span>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleBulkDeleteClick}
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash className="w-4 h-4 mr-2" />
                Excluir Selecionadas
              </Button>
            </div>
          )}

          {/* Tabela */}
          <Card className="glass-effect border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                         <Checkbox
                          checked={allSelected}
                          onCheckedChange={handleSelectAll}
                          disabled={empresasFiltradas.length === 0}
                          aria-label="Selecionar todas as empresas"
                        />
                      </TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Plano</TableHead>
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
                    ) : empresasFiltradas.length > 0 ? (
                      empresasFiltradas.map((empresa) => (
                        <TableRow key={empresa.id} className="hover:bg-rose-50/30">
                           <TableCell>
                            <Checkbox
                              checked={selectedItems.has(empresa.id)}
                              onCheckedChange={(checked) => handleSelectItem(empresa.id, checked)}
                              aria-label={`Selecionar empresa ${empresa.nome}`}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium">{empresa.nome}</p>
                                {empresa.endereco && empresa.endereco.cidade && (
                                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{empresa.endereco.cidade} - {empresa.endereco.uf}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">{empresa.documento || '—'}</span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{empresa.telefone}</p>
                              {empresa.email_cadastro && (
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <AtSign className="w-3 h-3"/>
                                    {empresa.email_cadastro}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                              {planos[empresa.plano_id] || 'Sem plano'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={empresa.ativo ? "default" : "destructive"} 
                              className={empresa.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {empresa.ativo ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => navigate(createPageUrl(`EditarEmpresa?id=${empresa.id}`))}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleExcluirClick(empresa.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="7" className="text-center h-24">
                          Nenhuma empresa encontrada.
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
        description="Tem certeza de que deseja excluir esta empresa? Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos."
        confirmText="Excluir"
        loading={deleting}
      />
      
      <ConfirmationModal
        open={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={confirmarExclusaoMassa}
        title="Confirmar Exclusão em Massa"
        description={`Tem certeza de que deseja excluir as ${selectedItems.size} empresas selecionadas? Esta ação é irreversível.`}
        confirmText={`Excluir ${selectedItems.size} Empresas`}
        loading={bulkDeleting}
      />
    </>
  );
}
