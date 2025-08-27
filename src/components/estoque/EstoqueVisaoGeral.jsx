import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Package, TrendingUp, TrendingDown, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EstoqueVisaoGeral({ produtos, loading, onUpdate }) {
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const formatCategoryLabel = (category) => {
    const categoryMap = {
      "creme_facial": "Creme Facial",
      "creme_corporal": "Creme Corporal",
      "oleo_essencial": "Óleo Essencial",
      "oleo_corporal": "Óleo Corporal",
      "serum_facial": "Sérum Facial",
      "serum_capilar": "Sérum Capilar",
      "mascara_facial": "Máscara Facial",
      "mascara_capilar": "Máscara Capilar",
      "shampoo": "Shampoo",
      "condicionador": "Condicionador",
      "hidratante": "Hidratante",
      "protetor_solar": "Protetor Solar",
      "esmalte": "Esmalte",
      "removedor": "Removedor",
      "base_unha": "Base para Unha",
      "agulha_acupuntura": "Agulha Acupuntura",
      "agulha_microagulhamento": "Agulha Microagulhamento",
      "equipamento_estetico": "Equipamento Estético",
      "equipamento_limpeza": "Equipamento de Limpeza",
      "descartavel_hospitalar": "Descartável Hospitalar",
      "descartavel_estetico": "Descartável Estético",
      "toalha_descartavel": "Toalha Descartável",
      "luva_procedimento": "Luva de Procedimento",
      "algodao": "Algodão",
      "gaze": "Gaze",
      "bandagem": "Bandagem",
      "antiseptico": "Antisséptico",
      "anestesico_topico": "Anestésico Tópico",
      "vitamina_ampola": "Vitamina em Ampola",
      "acido_hialuronico": "Ácido Hialurônico",
      "colageno": "Colágeno",
      "outros": "Outros"
    };
    return categoryMap[category] || category;
  };

  const produtosFiltrados = produtos.filter(produto => {
    const matchBusca = busca === "" || produto.nome.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = filtroCategoria === "todos" || produto.categoria === filtroCategoria;
    
    let matchStatus = true;
    if (filtroStatus === "baixo_estoque") {
      matchStatus = produto.quantidade_estoque <= (produto.quantidade_minima || 10);
    } else if (filtroStatus === "sem_estoque") {
      matchStatus = produto.quantidade_estoque === 0;
    } else if (filtroStatus === "normal") {
      matchStatus = produto.quantidade_estoque > (produto.quantidade_minima || 10);
    }
    
    return matchBusca && matchCategoria && matchStatus;
  });

  const categorias = [...new Set(produtos.map(p => p.categoria))];

  if (loading) {
    return (
      <Card className="glass-effect border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Produtos em Estoque ({produtosFiltrados.length})
          </CardTitle>
          
          {/* Filtros Avançados */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar produto..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas Categorias</SelectItem>
                {categorias.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>
                    {formatCategoryLabel(categoria)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="normal">Estoque Normal</SelectItem>
                <SelectItem value="baixo_estoque">Estoque Baixo</SelectItem>
                <SelectItem value="sem_estoque">Sem Estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Estoque Mínimo</TableHead>
                <TableHead>Valor Unitário</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosFiltrados.length > 0 ? (
                produtosFiltrados.map((produto) => {
                  const valorTotal = produto.quantidade_estoque * produto.preco_custo;
                  const isLowStock = produto.quantidade_estoque <= (produto.quantidade_minima || 10);
                  const isOutOfStock = produto.quantidade_estoque === 0;
                  
                  return (
                    <TableRow key={produto.id} className="hover:bg-rose-50/30">
                      <TableCell>
                        <div>
                          <p className="font-medium">{produto.nome}</p>
                          {produto.marca && <p className="text-sm text-gray-500">{produto.marca}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {formatCategoryLabel(produto.categoria)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={isOutOfStock ? "text-red-600 font-semibold" : isLowStock ? "text-yellow-600 font-semibold" : ""}>
                            {produto.quantidade_estoque}
                          </span>
                          <span className="text-gray-500">{produto.unidade_medida}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-600">
                          {produto.quantidade_minima || 10} {produto.unidade_medida}
                        </span>
                      </TableCell>
                      <TableCell>R$ {produto.preco_custo?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>R$ {valorTotal.toFixed(2)}</TableCell>
                      <TableCell>
                        {isOutOfStock ? (
                          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                            <TrendingDown className="w-3 h-3" />
                            Sem Estoque
                          </Badge>
                        ) : isLowStock ? (
                          <Badge variant="outline" className="flex items-center gap-1 w-fit bg-yellow-100 text-yellow-800 border-yellow-200">
                            <TrendingDown className="w-3 h-3" />
                            Estoque Baixo
                          </Badge>
                        ) : (
                          <Badge variant="default" className="flex items-center gap-1 w-fit bg-green-100 text-green-800">
                            <TrendingUp className="w-3 h-3" />
                            Normal
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan="7" className="text-center h-24">
                    Nenhum produto encontrado com os filtros aplicados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}