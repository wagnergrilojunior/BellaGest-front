import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Gem, Plus } from "lucide-react";
import TabelaPlanos from "../components/planos/TabelaPlanos";

export default function Planos() {
  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Gem className="w-8 h-8 text-violet-500" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Planos e Assinaturas
              </h1>
              <p className="text-gray-600">Gerencie os planos de assinatura do sistema.</p>
            </div>
          </div>
          <Link to={createPageUrl("NovoPlano")}>
            <Button className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Novo Plano
            </Button>
          </Link>
        </div>
        <TabelaPlanos />
      </div>
    </div>
  );
}