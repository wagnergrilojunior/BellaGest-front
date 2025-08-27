import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Receipt, Plus } from "lucide-react";
import TabelaCobrancas from "../components/cobrancas/TabelaCobrancas";

export default function Cobrancas() {
  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Receipt className="w-8 h-8 text-cyan-500" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">
                Gestão de Cobranças
              </h1>
              <p className="text-gray-600">Acompanhe e gerencie as faturas das empresas.</p>
            </div>
          </div>
          <Link to={createPageUrl("NovaCobranca")}>
            <Button className="bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Gerar Cobrança
            </Button>
          </Link>
        </div>
        <TabelaCobrancas />
      </div>
    </div>
  );
}