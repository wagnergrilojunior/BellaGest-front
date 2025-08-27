import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Agendamentos from "./Agendamentos";

import Clientes from "./Clientes";

import Profissionais from "./Profissionais";

import NovoCliente from "./NovoCliente";

import EditarCliente from "./EditarCliente";

import NovoProfissional from "./NovoProfissional";

import EditarProfissional from "./EditarProfissional";

import NovoServico from "./NovoServico";

import EditarServico from "./EditarServico";

import NovoProduto from "./NovoProduto";

import EditarProduto from "./EditarProduto";

import Financeiro from "./Financeiro";

import Servicos from "./Servicos";

import Produtos from "./Produtos";

import Estoque from "./Estoque";

import NovaMovimentacao from "./NovaMovimentacao";

import Planos from "./Planos";

import NovoPlano from "./NovoPlano";

import Cobrancas from "./Cobrancas";

import Empresas from "./Empresas";

import NovaEmpresa from "./NovaEmpresa";

import EditarEmpresa from "./EditarEmpresa";

import EditarPlano from "./EditarPlano";

import NovaCobranca from "./NovaCobranca";

import EditarCobranca from "./EditarCobranca";

import ConfiguracoesUsuario from "./ConfiguracoesUsuario";

import CadastroCompleto from "./CadastroCompleto";

import Splash from "./Splash";

import Entrar from "./Entrar";

import Documentacao from "./Documentacao";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Agendamentos: Agendamentos,
    
    Clientes: Clientes,
    
    Profissionais: Profissionais,
    
    NovoCliente: NovoCliente,
    
    EditarCliente: EditarCliente,
    
    NovoProfissional: NovoProfissional,
    
    EditarProfissional: EditarProfissional,
    
    NovoServico: NovoServico,
    
    EditarServico: EditarServico,
    
    NovoProduto: NovoProduto,
    
    EditarProduto: EditarProduto,
    
    Financeiro: Financeiro,
    
    Servicos: Servicos,
    
    Produtos: Produtos,
    
    Estoque: Estoque,
    
    NovaMovimentacao: NovaMovimentacao,
    
    Planos: Planos,
    
    NovoPlano: NovoPlano,
    
    Cobrancas: Cobrancas,
    
    Empresas: Empresas,
    
    NovaEmpresa: NovaEmpresa,
    
    EditarEmpresa: EditarEmpresa,
    
    EditarPlano: EditarPlano,
    
    NovaCobranca: NovaCobranca,
    
    EditarCobranca: EditarCobranca,
    
    ConfiguracoesUsuario: ConfiguracoesUsuario,
    
    CadastroCompleto: CadastroCompleto,
    
    Splash: Splash,
    
    Entrar: Entrar,
    
    Documentacao: Documentacao,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Agendamentos" element={<Agendamentos />} />
                
                <Route path="/Clientes" element={<Clientes />} />
                
                <Route path="/Profissionais" element={<Profissionais />} />
                
                <Route path="/NovoCliente" element={<NovoCliente />} />
                
                <Route path="/EditarCliente" element={<EditarCliente />} />
                
                <Route path="/NovoProfissional" element={<NovoProfissional />} />
                
                <Route path="/EditarProfissional" element={<EditarProfissional />} />
                
                <Route path="/NovoServico" element={<NovoServico />} />
                
                <Route path="/EditarServico" element={<EditarServico />} />
                
                <Route path="/NovoProduto" element={<NovoProduto />} />
                
                <Route path="/EditarProduto" element={<EditarProduto />} />
                
                <Route path="/Financeiro" element={<Financeiro />} />
                
                <Route path="/Servicos" element={<Servicos />} />
                
                <Route path="/Produtos" element={<Produtos />} />
                
                <Route path="/Estoque" element={<Estoque />} />
                
                <Route path="/NovaMovimentacao" element={<NovaMovimentacao />} />
                
                <Route path="/Planos" element={<Planos />} />
                
                <Route path="/NovoPlano" element={<NovoPlano />} />
                
                <Route path="/Cobrancas" element={<Cobrancas />} />
                
                <Route path="/Empresas" element={<Empresas />} />
                
                <Route path="/NovaEmpresa" element={<NovaEmpresa />} />
                
                <Route path="/EditarEmpresa" element={<EditarEmpresa />} />
                
                <Route path="/EditarPlano" element={<EditarPlano />} />
                
                <Route path="/NovaCobranca" element={<NovaCobranca />} />
                
                <Route path="/EditarCobranca" element={<EditarCobranca />} />
                
                <Route path="/ConfiguracoesUsuario" element={<ConfiguracoesUsuario />} />
                
                <Route path="/CadastroCompleto" element={<CadastroCompleto />} />
                
                <Route path="/Splash" element={<Splash />} />
                
                <Route path="/Entrar" element={<Entrar />} />
                
                <Route path="/Documentacao" element={<Documentacao />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}