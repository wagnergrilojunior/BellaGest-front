
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MovimentacaoEstoque, Produto, User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, TrendingUp, TrendingDown, RotateCcw, AlertTriangle, Trash2, Info } from "lucide-react";

export default function NovaMovimentacao() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [dados, setDados] = useState({
    produto_id: "",
    tipo: "entrada",
    quantidade: 0,
    motivo: "",
    observacoes: "",
    empresa_id: ""
  });
  const [errors, setErrors] = useState({});
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  useEffect(() => {
    carregarProdutos();
    const fetchUserEmpresa = async () => {
        try {
            const user = await User.me();
            if (user && user.empresa_id) {
                setDados(prev => ({...prev, empresa_id: user.empresa_id}));
            }
        } catch (e) {
            console.error("Não foi possível buscar os dados da empresa do usuário.", e);
            setErrors(prev => ({ ...prev, geral: "Não foi possível identificar a empresa. Faça login novamente." }));
        }
    };
    fetchUserEmpresa();
  }, []);

  const carregarProdutos = async () => {
    try {
      const produtosData = await Produto.list('-created_date');
      setProdutos(produtosData);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

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
    const newValue = type === 'number' ? parseFloat(value) || 0 : value;
    
    setDados(prev => ({
      ...prev,
      [id]: newValue
    }));

    // Se mudou o produto, atualiza o produto selecionado
    if (id === 'produto_id') {
      const produto = produtos.find(p => p.id === value);
      setProdutoSelecionado(produto);
    }
    
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'entrada':
        return <TrendingUp className="w-4 h-4" />;
      case 'saida':
        return <TrendingDown className="w-4 h-4" />;
      case 'ajuste':
        return <RotateCcw className="w-4 h-4" />;
      case 'vencimento':
        return <AlertTriangle className="w-4 h-4" />;
      case 'perda':
        return <Trash2 className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'entrada':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'saida':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'ajuste':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'vencimento':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'perda':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const calcularEstoqueResultante = () => {
    if (!produtoSelecionado || !dados.quantidade) return produtoSelecionado?.quantidade_estoque || 0;
    
    const estoqueAtual = produtoSelecionado.quantidade_estoque;
    
    switch (dados.tipo) {
      case 'entrada':
        return estoqueAtual + dados.quantidade;
      case 'saida':
        return Math.max(0, estoqueAtual - dados.quantidade);
      case 'ajuste':
        return dados.quantidade;
      case 'vencimento':
      case 'perda':
        return Math.max(0, estoqueAtual - dados.quantidade);
      default:
        return estoqueAtual;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    if (!dados.empresa_id) {
      setErrors(prev => ({ ...prev, geral: "Não foi possível identificar a empresa do usuário." }));
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
        case 'vencimento':
        case 'perda':
            quantidadeAtual = Math.max(0, quantidadeAnterior - dados.quantidade);
            break;
        default:
          quantidadeAtual = Math.max(0, quantidadeAnterior - dados.quantidade);
      }

      // Criar movimentação
      await MovimentacaoEstoque.create({
        ...dados,
        quantidade_anterior: quantidadeAnterior,
        quantidade_atual: quantidadeAtual
      });

      // Atualizar estoque do produto
      await Produto.update(dados.produto_id, {
        quantidade_estoque: quantidadeAtual
      });

      navigate(createPageUrl("Estoque"));
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Estoque"))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold">Nova Movimentação de Estoque</h1>
              <p className="text-gray-600">Registre entradas, saídas ou ajustes de estoque.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="produto" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6">
              <TabsTrigger value="produto">
                <Package className="w-4 h-4 mr-2" />1. Selecionar Produto
              </TabsTrigger>
              <TabsTrigger value="movimentacao">
                <TrendingUp className="w-4 h-4 mr-2" />2. Detalhes da Movimentação
              </TabsTrigger>
              <TabsTrigger value="detalhes">
                <Info className="w-4 h-4 mr-2" />3. Motivo e Observações
              </TabsTrigger>
            </TabsList>

            {/* Aba Produto */}
            <TabsContent value="produto">
              <Card className="glass-effect border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Produto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                          {produto.nome} - Estoque: {produto.quantidade_estoque} {produto.unidade_medida}
                        </option>
                      ))}
                    </select>
                    {errors.produto_id && <p className="text-sm text-red-600">{errors.produto_id}</p>}
                  </div>

                  {/* Informações do Produto Selecionado */}
                  {produtoSelecionado && (
                    <div className="p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-xl border border-blue-100/30">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Estoque Atual</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {produtoSelecionado.quantidade_estoque} {produtoSelecionado.unidade_medida}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Estoque Mínimo</p>
                          <p className="text-lg font-semibold text-gray-700">
                            {produtoSelecionado.quantidade_minima || 10} {produtoSelecionado.unidade_medida}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Marca</p>
                          <p className="text-lg font-semibold text-gray-700">
                            {produtoSelecionado.marca || 'Sem marca'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Movimentação */}
            <TabsContent value="movimentacao">
              <Card className="glass-effect border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Movimentação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de Movimentação</Label>
                      <select
                        id="tipo"
                        value={dados.tipo}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                      >
                        <option value="entrada">📈 Entrada</option>
                        <option value="saida">📉 Saída</option>
                        <option value="ajuste">🔄 Ajuste</option>
                        <option value="vencimento">⏰ Vencimento</option>
                        <option value="perda">🗑️ Perda</option>
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
                        placeholder={dados.tipo === 'ajuste' ? 'Quantidade final desejada' : 'Quantidade a movimentar'}
                      />
                      {errors.quantidade && <p className="text-sm text-red-600">{errors.quantidade}</p>}
                    </div>
                  </div>

                  {/* Simulação do Resultado */}
                  {produtoSelecionado && dados.quantidade > 0 && (
                    <div className={`p-4 rounded-xl border ${getTipoColor(dados.tipo)}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {getTipoIcon(dados.tipo)}
                        <h4 className="font-semibold">Resultado da Movimentação</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm opacity-75">Estoque Atual</p>
                          <p className="text-lg font-bold">{produtoSelecionado.quantidade_estoque}</p>
                        </div>
                        <div>
                          <p className="text-sm opacity-75">
                            {dados.tipo === 'entrada' ? '+' : dados.tipo === 'ajuste' ? '=' : '-'} {dados.quantidade}
                          </p>
                          <p className="text-lg font-bold">
                            {dados.tipo === 'ajuste' ? 'Ajustar para' : 'Movimentar'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm opacity-75">Estoque Final</p>
                          <p className="text-lg font-bold">{calcularEstoqueResultante()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Detalhes */}
            <TabsContent value="detalhes">
              <Card className="glass-effect border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Detalhes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="motivo">Motivo *</Label>
                    <Input
                      id="motivo"
                      value={dados.motivo}
                      onChange={handleChange}
                      placeholder="Ex: Compra de fornecedor, venda, ajuste de inventário..."
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(createPageUrl("Estoque"))}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              {loading ? "Salvando..." : "Registrar Movimentação"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
