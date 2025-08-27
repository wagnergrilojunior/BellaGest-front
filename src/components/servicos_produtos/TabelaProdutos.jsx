import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Produto } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { getEmpresaSelecionada } from "@/components/utils/empresaContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationModal from "../shared/ConfirmationModal";

export default function TabelaProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [busca, setBusca] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [showDeleteMassModal, setShowDeleteMassModal] = useState(false);
  const [deletingMass, setDeletingMass] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    setLoading(true);
    try {
      const empresa = getEmpresaSelecionada();
      if (empresa) {
        const dados = await Produto.filter({ empresa_id: empresa.id });
        setProdutos(dados.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      } else {
        setProdutos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
    setLoading(false);
  };

  const handleExcluirClick = (id) => {
    setProdutoParaExcluir(id);
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    if (produtoParaExcluir) {
      setDeleting(true);
      try {
        await Produto.delete(produtoParaExcluir);
        setShowDeleteModal(false);
        setProdutoParaExcluir(null);
        carregarProdutos();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleSelecionarProduto = (produtoId, checked) => {
    if (checked) {
      setProdutosSelecionados(prev => [...prev, produtoId]);
    } else {
      setProdutosSelecionados(prev => prev.filter(id => id !== produtoId));
    }
  };

  const handleSelecionarTodos = (checked) => {
    if (checked) {
      setProdutosSelecionados(produtosFiltrados.map(p => p.id));
    } else {
      setProdutosSelecionados([]);
    }
  };

  const handleExclusaoMassa = () => {
    if (produtosSelecionados.length > 0) {
      setShowDeleteMassModal(true);
    }
  };

  const confirmarExclusaoMassa = async () => {
    setDeletingMass(true);
    try {
      await Promise.all(produtosSelecionados.map(id => Produto.delete(id)));
      setShowDeleteMassModal(false);
      setProdutosSelecionados([]);
      carregarProdutos();
    } catch (error) {
      console.error('Erro ao excluir produtos:', error);
    } finally {
      setDeletingMass(false);
    }
  };

  const produtosFiltrados = produtos.filter(produto =>
    busca === "" || produto.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const todosSelecionados = produtosFiltrados.length > 0 && produtosSelecionados.length === produtosFiltrados.length;
  const algunsSelecionados = produtosSelecionados.length > 0;

  return (
    <>
      <Card className="glass-effect border-0 shadow-lg mt-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar produto por nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {produtosSelecionados.length > 0 && (
                <Button 
                  variant="destructive" 
                  onClick={handleExclusaoMassa}
                  className="flex items-center gap-2"
                >
                  <Trash className="w-4 h-4" />
                  Excluir Selecionados ({produtosSelecionados.length})
                </Button>
              )}
              <Link to={createPageUrl("NovoProduto")}>
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Produto
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
                  <TableHead>Estoque</TableHead>
                  <TableHead>Preço Custo</TableHead>
                  <TableHead>Preço Venda</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan="6" className="p-2"><div className="h-8 bg-gray-200 rounded animate-pulse"></div></TableCell></TableRow>
                  ))
                ) : produtosFiltrados.length > 0 ? (
                  produtosFiltrados.map((produto) => (
                    <TableRow key={produto.id} className="hover:bg-rose-50/30">
                      <TableCell>
                        <Checkbox
                          checked={produtosSelecionados.includes(produto.id)}
                          onCheckedChange={(checked) => handleSelecionarProduto(produto.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>
                        <Badge variant={produto.quantidade_estoque <= produto.quantidade_minima ? "destructive" : "secondary"}>
                          {produto.quantidade_estoque} {produto.unidade_medida}
                        </Badge>
                      </TableCell>
                      <TableCell>R$ {produto.preco_custo?.toFixed(2)}</TableCell>
                      <TableCell>R$ {produto.preco_venda?.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl(`EditarProduto?id=${produto.id}`))}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleExcluirClick(produto.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan="6" className="text-center h-24">Nenhum produto encontrado.</TableCell></TableRow>
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
        description="Tem certeza de que deseja excluir este produto? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        loading={deleting}
      />

      <ConfirmationModal
        open={showDeleteMassModal}
        onClose={() => setShowDeleteMassModal(false)}
        onConfirm={confirmarExclusaoMassa}
        title="Confirmar Exclusão em Massa"
        description={`Tem certeza de que deseja excluir ${produtosSelecionados.length} produto(s) selecionado(s)? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Todos"
        loading={deletingMass}
      />
    </>
  );
}