
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cliente } from "@/api/entities";
import { createPageUrl } from "@/utils"; // Removed getEmpresaSelecionada import
import { getEmpresaSelecionada } from "@/components/utils/empresaContext"; // Added new import path for getEmpresaSelecionada
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Search, Edit, Trash2, Download, Filter, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ConfirmationModal from "../components/shared/ConfirmationModal";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clienteParaExcluir, setClienteParaExcluir] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    setLoading(true);
    try {
      const empresa = getEmpresaSelecionada(); // Get the selected company
      if (empresa) {
        // Filter clients by empresa_id and then sort by created_date
        const dados = await Cliente.filter({ empresa_id: empresa.id });
        setClientes(dados.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      } else {
        setClientes([]); // If no company is selected, display no clients
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
    setLoading(false);
  };

  const handleExcluirClick = (id) => {
    setClienteParaExcluir(id);
    setShowDeleteModal(true);
  };
  
  const confirmarExclusao = async () => {
    if (clienteParaExcluir) {
      setDeleting(true);
      try {
        await Cliente.delete(clienteParaExcluir);
        setShowDeleteModal(false);
        setClienteParaExcluir(null);
        carregarClientes();
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const exportarCSV = () => {
    const headers = ['Nome', 'Telefone', 'Email', 'Status', 'Data Cadastro', 'Última Visita'];
    const csvContent = [
      headers.join(','),
      ...clientesFiltrados.map(cliente => [
        `"${cliente.nome}"`,
        `"${cliente.telefone}"`,
        `"${cliente.email || ''}"`,
        `"${cliente.status}"`,
        `"${format(new Date(cliente.created_date), 'dd/MM/yyyy', { locale: ptBR })}"`,
        `"${cliente.ultima_visita ? format(new Date(cliente.ultima_visita), 'dd/MM/yyyy', { locale: ptBR }) : 'Nunca'}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clientes_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    link.click();
  };

  const clientesFiltrados = clientes.filter(cliente => {
    const matchBusca = busca === "" || 
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (cliente.telefone && cliente.telefone.includes(busca)) ||
      (cliente.email && cliente.email.toLowerCase().includes(busca.toLowerCase()));
    
    const matchStatus = filtroStatus === "todos" || cliente.status === filtroStatus;
    
    return matchBusca && matchStatus;
  });

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = clientesFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(clientesFiltrados.length / itemsPerPage);

  return (
    <>
      <div className="p-4 md:p-8 space-y-6 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Clientes
                </h1>
                <p className="text-gray-600">Gerencie sua base de clientes</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={exportarCSV}
                className="hover:bg-green-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
              <Link to={createPageUrl("NovoCliente")}>
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Cliente
                </Button>
              </Link>
            </div>
          </div>

          {/* Filtros */}
          <Card className="glass-effect border-0 shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, telefone ou email..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabela */}
          <Card className="glass-effect border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Cadastro</TableHead>
                      <TableHead>Última Visita</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array(5).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan="6" className="p-2">
                            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : currentItems.length > 0 ? (
                      currentItems.map((cliente) => (
                        <TableRow key={cliente.id} className="hover:bg-rose-50/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {cliente.foto_perfil ? (
                                <img 
                                  src={cliente.foto_perfil} 
                                  alt={cliente.nome}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                                  <Users className="w-5 h-5 text-white" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{cliente.nome}</p>
                                {cliente.tags && cliente.tags.length > 0 && (
                                  <div className="flex gap-1 mt-1">
                                    {cliente.tags.slice(0, 2).map(tag => (
                                      <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {cliente.tags.length > 2 && (
                                      <Badge variant="secondary" className="text-xs">+{cliente.tags.length - 2}</Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{cliente.telefone}</p>
                              {cliente.email && (
                                <p className="text-sm text-gray-500">{cliente.email}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={cliente.status === 'ativo' ? "default" : "destructive"} 
                              className={cliente.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {format(new Date(cliente.created_date), 'dd/MM/yy', { locale: ptBR })}
                            </div>
                          </TableCell>
                          <TableCell>
                            {cliente.ultima_visita ? (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {format(new Date(cliente.ultima_visita), 'dd/MM/yy', { locale: ptBR })}
                              </div>
                            ) : (
                              <span className="text-gray-400">Nunca</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => navigate(createPageUrl(`EditarCliente?id=${cliente.id}`))}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleExcluirClick(cliente.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan="6" className="text-center h-24">
                          Nenhum cliente encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, clientesFiltrados.length)} de {clientesFiltrados.length} clientes
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === totalPages || 
                          Math.abs(page - currentPage) <= 1
                        )
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 py-1 text-gray-400">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-8"
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        ))
                      }
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmarExclusao}
        title="Confirmar Exclusão"
        description="Tem certeza de que deseja excluir este cliente? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        loading={deleting}
      />
    </>
  );
}
