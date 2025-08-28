import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from "./Layout";
import Dashboard from "./Dashboard";
import Empresas from "./Empresas";
import Clientes from "./Clientes";
import Profissionais from "./Profissionais";
import Servicos from "./Servicos";
import Agendamentos from "./Agendamentos";
import Produtos from "./Produtos";
import Vendas from "./Vendas";
import MovimentacoesEstoque from "./MovimentacoesEstoque";
import Cobrancas from "./Cobrancas";
import Planos from "./Planos";
import Usuarios from "./Usuarios";
import Configuracoes from "./Configuracoes";
import Documentacao from "./Documentacao";
import Login from "./Login";

const PAGES = {
  dashboard: Dashboard,
  empresas: Empresas,
  clientes: Clientes,
  profissionais: Profissionais,
  servicos: Servicos,
  agendamentos: Agendamentos,
  produtos: Produtos,
  vendas: Vendas,
  movimentacoes_estoque: MovimentacoesEstoque,
  cobrancas: Cobrancas,
  planos: Planos,
  usuarios: Usuarios,
  configuracoes: Configuracoes,
  documentacao: Documentacao,
};

// Get current page name from URL
function getCurrentPageName() {
  const pathname = window.location.pathname;
  const pageName = pathname.split('/')[1];
  return pageName || Object.keys(PAGES)[0];
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Create a wrapper component that uses useLocation inside the Router context
function AppRoutes() {
  const location = useLocation();
  const currentPage = getCurrentPageName();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout currentPageName={currentPage}>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout currentPageName={currentPage}>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/empresas" element={
        <ProtectedRoute>
          <Layout currentPageName={currentPage}>
            <Empresas />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/clientes" element={
        <ProtectedRoute>
          <Layout currentPageName={currentPage}>
            <Clientes />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/profissionais" element={
        <ProtectedRoute>
          <Layout currentPageName={currentPage}>
            <Profissionais />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/servicos" element={
        <ProtectedRoute>
          <Layout currentPageName={currentPage}>
            <Servicos />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/agendamentos" element={
        <ProtectedRoute>
          <Layout currentPageName={currentPage}>
            <Agendamentos />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/produtos" element={
        <ProtectedRoute>
          <Layout currentPageName={currentPage}>
            <Produtos />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/vendas" element={
        <ProtectedRoute>
          <Layout currentPageName={currentPage}>
            <Vendas />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/movimentacoes-estoque" element={
        <ProtectedRoute>
          <Layout currentPageName={currentPage}>
            <MovimentacoesEstoque />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/cobrancas" element={
        <ProtectedRoute>
          <Layout currentPageName={currentPage}>
            <Cobrancas />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/planos" element={
        <ProtectedRoute>
          <Layout currentPageName={currentPage}>
            <Planos />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/usuarios" element={
        <ProtectedRoute>
          <Layout currentPageName={currentPage}>
            <Usuarios />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/configuracoes" element={
        <ProtectedRoute>
          <Layout currentPageName={currentPage}>
            <Configuracoes />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/documentacao" element={
        <ProtectedRoute>
          <Layout currentPageName={currentPage}>
            <Documentacao />
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function Pages() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}