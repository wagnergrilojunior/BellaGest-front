import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Package, AlertTriangle, ShoppingCart } from "lucide-react";

export default function GraficosEstoque({ produtos, loading }) {
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="glass-effect border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-effect border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dados para gráfico de barras - Valor do estoque por categoria
  const dadosValorPorCategoria = produtos.reduce((acc, produto) => {
    const categoria = formatCategoryLabel(produto.categoria);
    const valor = produto.quantidade_estoque * (produto.preco_custo || 0);
    
    const existing = acc.find(item => item.categoria === categoria);
    if (existing) {
      existing.valor += valor;
      existing.quantidade += produto.quantidade_estoque || 0;
    } else {
      acc.push({
        categoria: categoria.length > 15 ? categoria.substring(0, 15) + "..." : categoria,
        valor: valor,
        quantidade: produto.quantidade_estoque || 0
      });
    }
    return acc;
  }, []).sort((a, b) => b.valor - a.valor).slice(0, 8);

  // Dados para gráfico de pizza - Status do estoque
  const statusEstoque = produtos.reduce((acc, produto) => {
    const quantidade = produto.quantidade_estoque || 0;
    const minimo = produto.quantidade_minima || 10;
    
    if (quantidade === 0) {
      acc.semEstoque++;
    } else if (quantidade <= minimo) {
      acc.baixoEstoque++;
    } else {
      acc.normal++;
    }
    return acc;
  }, { normal: 0, baixoEstoque: 0, semEstoque: 0 });

  const dadosStatusPizza = [
    { name: "Estoque Normal", value: statusEstoque.normal, color: "#10b981" },
    { name: "Estoque Baixo", value: statusEstoque.baixoEstoque, color: "#f59e0b" },
    { name: "Sem Estoque", value: statusEstoque.semEstoque, color: "#ef4444" }
  ].filter(item => item.value > 0);

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Gráfico de Barras - Valor do Estoque por Categoria */}
      <Card className="glass-effect border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Valor do Estoque por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosValorPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="categoria" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                />
                <Tooltip 
                  formatter={(value) => [`R$ ${value.toFixed(2)}`, "Valor"]}
                  labelStyle={{ color: "#374151" }}
                />
                <Bar 
                  dataKey="valor" 
                  fill="url(#colorGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Status do Estoque */}
      <Card className="glass-effect border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-green-500" />
            Status do Estoque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosStatusPizza}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dadosStatusPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Produtos"]} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontSize: '12px' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}