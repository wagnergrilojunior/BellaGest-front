import React, { useState } from "react";
import { MovimentacaoEstoque, Produto } from "@/api/entities";
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
import { Plus } from "lucide-react";

export default function NovaMovimentacaoModal({ open, onClose, produtos, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    produto_id: "",
    tipo: "entrada",
    quantidade: 0,
    motivo: "",
    observacoes: ""
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!dados.produto_id) newErrors.produto_id = "Selecione um produto.";
    if (!dados.quantidade || dados.quantidade <= 0) newErrors.quantidade = "A quantidade deve ser maior que zero.";
    if (!dados.motivo.trim()) newErrors.motivo = "O motivo é obrigatório.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value, type } = e.target;
    setDados(prev => ({
      ...prev,
      [id]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const produtoAtual = produtos.find(p => p.id === dados.produto_id);
      if (!produtoAtual) {
        throw new Error('Produto não encontrado');
      }

      const quantidadeAnterior = produtoAtual.quantidade_estoque;
      let quantidadeAtual;

      switch (dados.tipo) {
        case 'entrada':
          quantidadeAtual = quantidadeAnterior + dados.quantidade;
          break;
        case 'saida':
          quantidadeAtual = Math.max(0, quantidadeAnterior - dados.quantidade);
          break;
        case 'ajuste':
          quantidadeAtual = dados.quantidade;
          break;
        default:
          quantidadeAtual = Math.max(0, quantidadeAnterior - dados.quantidade);
      }

      // Criar movimentação
      await MovimentacaoEstoque.create({
        ...dados,
        quantidade_anterior: quantidadeAnterior,
        quantidade_atual: quantidadeAtual,
        empresa_id: "1"
      });

      // Atualizar estoque do produto
      await Produto.update(dados.produto_id, {
        quantidade_estoque: quantidadeAtual
      });

      // Reset form
      setDados({
        produto_id: "",
        tipo: "entrada",
        quantidade: 0,
        motivo: "",
        observacoes: ""
      });
      setErrors({});
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nova Movimentação de Estoque
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="produto_id">Produto *</Label>
            <select
              id="produto_id"
              value={dados.produto_id}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white ${
                errors.produto_id ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <option value="">Selecione um produto</option>
              {produtos.map(produto => (
                <option key={produto.id} value={produto.id}>
                  {produto.nome} (Estoque: {produto.quantidade_estoque})
                </option>
              ))}
            </select>
            {errors.produto_id && <p className="text-sm text-red-600">{errors.produto_id}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Movimentação</Label>
            <select
              id="tipo"
              value={dados.tipo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
              <option value="ajuste">Ajuste</option>
              <option value="vencimento">Vencimento</option>
              <option value="perda">Perda</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantidade">
              {dados.tipo === 'ajuste' ? 'Quantidade Final *' : 'Quantidade *'}
            </Label>
            <Input
              id="quantidade"
              type="number"
              min="0"
              step="0.1"
              value={dados.quantidade}
              onChange={handleChange}
              className={errors.quantidade ? 'border-red-500' : ''}
            />
            {errors.quantidade && <p className="text-sm text-red-600">{errors.quantidade}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo *</Label>
            <Input
              id="motivo"
              value={dados.motivo}
              onChange={handleChange}
              placeholder="Ex: Compra de fornecedor, venda, etc."
              className={errors.motivo ? 'border-red-500' : ''}
            />
            {errors.motivo && <p className="text-sm text-red-600">{errors.motivo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={dados.observacoes}
              onChange={handleChange}
              rows={3}
              placeholder="Observações adicionais (opcional)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              {loading ? "Salvando..." : "Criar Movimentação"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}