import React from "react";
import { Sparkles } from "lucide-react";
import TabelaServicos from "../components/servicos_produtos/TabelaServicos";

export default function Servicos() {
  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-pink-500" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Serviços
              </h1>
              <p className="text-gray-600">Gerencie os serviços que sua empresa oferece.</p>
            </div>
          </div>
        </div>
        <TabelaServicos />
      </div>
    </div>
  );
}