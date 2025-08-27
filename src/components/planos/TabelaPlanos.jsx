
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plano } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import ConfirmationModal from "../shared/ConfirmationModal";

export default function TabelaPlanos() {
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planoParaExcluir, setPlanoParaExcluir] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    carregarPlanos();
  }, []);

  const carregarPlanos = async () => {
    setLoading(true);
    try {
      const dados = await Plano.list('-created_date');
      setPlanos(dados);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
    setLoading(false);
  };

  const handleExcluirClick = (id) => {
    setPlanoParaExcluir(id);
    setShowDeleteModal(true);
  };

  const confirmarExclusao = async () => {
    if (planoParaExcluir) {
      setDeleting(true);
      try {
        await Plano.delete(planoParaExcluir);
        setShowDeleteModal(false);
        setPlanoParaExcluir(null);
        carregarPlanos();
      } catch (error) {
        console.error('Erro ao excluir plano:', error);
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <>
      <Card className="glass-effect border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Valor Mensal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan="4" className="p-2">
                        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : planos.length > 0 ? (
                  planos.map((plano) => (
                    <TableRow key={plano.id} className="hover:bg-rose-50/30">
                      <TableCell className="font-medium">{plano.nome}</TableCell>
                      <TableCell>R$ {plano.valor_mensal?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={plano.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {plano.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => navigate(createPageUrl(`EditarPlano?id=${plano.id}`))}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleExcluirClick(plano.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="4" className="text-center h-24">
                      Nenhum plano cadastrado.
                    </TableCell>
                  </TableRow>
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
        description="Tem certeza de que deseja excluir este plano? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        loading={deleting}
      />
    </>
  );
}
