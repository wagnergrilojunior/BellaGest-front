import React from "react";
import { ShoppingBag } from "lucide-react";
import TabelaProdutos from "../components/servicos_produtos/TabelaProdutos";

export default function Produtos() {
  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Produtos
              </h1>
              <p className="text-gray-600">Gerencie seu estoque de produtos.</p>
            </div>
          </div>
        </div>
        <TabelaProdutos />
      </div>
    </div>
  );
}