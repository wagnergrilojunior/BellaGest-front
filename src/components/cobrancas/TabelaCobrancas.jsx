
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Cobranca, Empresa, Plano } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Gem, Trash } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationModal from "../shared/ConfirmationModal";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  pendente: "bg-yellow-100 text-yellow-800",
  paga: "bg-green-100 text-green-800",
  atrasada: "bg-red-100 text-red-800",
  cancelada: "bg-gray-100 text-gray-800"
};

export default function TabelaCobrancas() {
  const [cobrancas, setCobrancas] = useState([]);
  const [empresas, setEmpresas] = useState({});
  const [planos, setPlanos] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cobrancaParaExcluir, setCobrancaParaExcluir] = useState(null);
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
      const [cobrancasData, empresasData, planosData] = await Promise.all([
        Cobranca.list('-data_vencimento'),
        Empresa.list(),
        Plano.list()
      ]);

      setCobrancas(cobrancasData);

      const empresasMap = empresasData.reduce((acc, emp) => ({...acc, [emp.id]: emp.nome }), {});
      setEmpresas(empresasMap);
      
      const planosMap = planosData.reduce((acc, plano) => ({...acc, [plano.id]: plano.nome }), {});
      setPlanos(planosMap);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setLoading(false);
    // Clear selections after data reloads to prevent selecting non-existent items
    setSelectedItems(new Set()); 
  };
  
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(new Set(cobrancas.map(c => c.id)));
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

  const handleBulkDelete = () => {
    setShowBulkDeleteModal(true);
  };

  const confirmarExclusaoMassa = async () => {
    setBulkDeleting(true);
    try {
      const deletePromises = Array.from(selectedItems).map(id => Cobranca.delete(id));
      await Promise.all(deletePromises);
      setSelectedItems(new Set());
      setShowBulkDeleteModal(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir cobranças:', error);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleExcluirClick = (id) => {
    setCobrancaParaExcluir(id);
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    if (cobrancaParaExcluir) {
      setDeleting(true);
      try {
        await Cobranca.delete(cobrancaParaExcluir);
        setShowDeleteModal(false);
        setCobrancaParaExcluir(null);
        carregarDados();
      } catch (error) {
        console.error('Erro ao excluir cobrança:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const allSelected = cobrancas.length > 0 && selectedItems.size === cobrancas.length;
  const someSelected = selectedItems.size > 0;

  return (
    <>
      <Card className="glass-effect border-0 shadow-lg">
        <CardContent className="p-6">
          {/* Controles de Seleção em Massa */}
          {someSelected && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedItems.size} {selectedItems.size === 1 ? 'cobrança selecionada' : 'cobranças selecionadas'}
              </span>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleBulkDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash className="w-4 h-4 mr-2" />
                Excluir Selecionadas
              </Button>
            </div>
          )}

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      disabled={cobrancas.length === 0}
                    />
                  </TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Data Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan="8" className="p-2"><div className="h-8 bg-gray-200 rounded animate-pulse"></div></TableCell></TableRow>
                  ))
                ) : cobrancas.length > 0 ? (
                  cobrancas.map((cobranca) => (
                    <TableRow key={cobranca.id} className="hover:bg-rose-50/30">
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(cobranca.id)}
                          onCheckedChange={(checked) => handleSelectItem(cobranca.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{empresas[cobranca.empresa_id] || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <Gem className="w-4 h-4 text-violet-400"/>
                           <span>{planos[cobranca.plano_id] || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>R$ {cobranca.valor?.toFixed(2)}</TableCell>
                      <TableCell>{cobranca.data_vencimento ? format(parseISO(cobranca.data_vencimento), "dd/MM/yyyy", { locale: ptBR }) : "—"}</TableCell>
                      <TableCell>
                        {cobranca.data_pagamento ? format(parseISO(cobranca.data_pagamento), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[cobranca.status]} capitalize`}>
                          {cobranca.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl(`EditarCobranca?id=${cobranca.id}`))}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleExcluirClick(cobranca.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan="8" className="text-center h-24">Nenhuma cobrança encontrada.</TableCell></TableRow>
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
        description="Tem certeza de que deseja excluir esta cobrança? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        loading={deleting}
      />

      <ConfirmationModal
        open={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={confirmarExclusaoMassa}
        title="Confirmar Exclusão em Massa"
        description={`Tem certeza de que deseja excluir ${selectedItems.size} ${selectedItems.size === 1 ? 'cobrança' : 'cobranças'}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Todas"
        loading={bulkDeleting}
      />
    </>
  );
}
