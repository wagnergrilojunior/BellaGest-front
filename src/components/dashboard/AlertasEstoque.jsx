
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, AlertTriangle } from "lucide-react";

export default function AlertasEstoque({ produtos, loading }) {
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
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Alertas de Estoque
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="pb-4 border-b border-gray-200">
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Alertas de Estoque
          <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-700">
            {produtos.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {produtos.length > 0 ? (
          <div className="space-y-4">
            {produtos.map((produto) => (
              <div key={produto.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{produto.nome}</p>
                  <p className="text-sm text-gray-600">
                    {formatCategoryLabel(produto.categoria)} • {produto.marca || 'Sem marca'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                    {produto.quantidade_estoque} {produto.unidade_medida}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    Min: {produto.quantidade_minima || 10}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Todos os produtos com estoque adequado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
