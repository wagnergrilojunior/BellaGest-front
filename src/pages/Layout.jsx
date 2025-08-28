

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  UserCheck, 
  Scissors, 
  Calendar, 
  Package, 
  ShoppingCart, 
  Warehouse, 
  CreditCard, 
  FileText, 
  LogOut,
  Sparkles,
  DollarSign,
  Search,
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings
} from 'lucide-react';
import { bellagestClient } from '../api/bellagestClient';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [empresas, setEmpresas] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Carregar empresas disponíveis
  useEffect(() => {
    const carregarEmpresas = async () => {
      try {
        setLoading(true);
        const response = await bellagestClient.get('/empresas/');
        setEmpresas(response);
        
        // Se o usuário tem papel de Proprietário, selecionar a primeira empresa
        if (user?.papel?.nome === 'Proprietário' && response.length > 0) {
          setEmpresaSelecionada(response[0]);
        } else if (user?.empresa) {
          // Para outros usuários, usar a empresa deles
          setEmpresaSelecionada(user.empresa);
        }
      } catch (error) {
        console.error('Erro ao carregar empresas:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      carregarEmpresas();
    }
  }, [user]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fechar dropdown ao pressionar Esc
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const handleEmpresaChange = (empresaId) => {
    const empresa = empresas.find(emp => emp.id === empresaId);
    if (empresa) {
      setEmpresaSelecionada(empresa);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const menuItems = [
    { name: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', color: '#ff4081' },
    { name: 'empresas', label: 'Empresas', icon: Building2, path: '/empresas', color: '#2979ff' },
    { name: 'agendamentos', label: 'Agendamentos', icon: Calendar, path: '/agendamentos', color: '#ff4081' },
    { name: 'clientes', label: 'Clientes', icon: Users, path: '/clientes', color: '#2979ff' },
    { name: 'profissionais', label: 'Profissionais', icon: UserCheck, path: '/profissionais', color: '#00c853' },
    { name: 'servicos', label: 'Serviços', icon: Scissors, path: '/servicos', color: '#ff9100' },
    { name: 'produtos', label: 'Produtos', icon: Package, path: '/produtos', color: '#ff9100' },
    { name: 'movimentacoes_estoque', label: 'Estoque', icon: Warehouse, path: '/movimentacoes-estoque', color: '#2979ff' },
    { name: 'vendas', label: 'Financeiro', icon: DollarSign, path: '/vendas', color: '#00c853' },
    { name: 'planos', label: 'Planos', icon: FileText, path: '/planos', color: '#ff4081' },
    { name: 'cobrancas', label: 'Cobranças', icon: CreditCard, path: '/cobrancas', color: '#2979ff' },
  ];

  return (
    <div 
      className="app-shell"
      style={{
        display: 'grid',
        gridTemplateColumns: sidebarCollapsed ? '72px 1fr' : '260px 1fr',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        '--sidebar-w': sidebarCollapsed ? '72px' : '260px',
        '--sidebar-w-collapsed': '72px'
      }}
    >
      {/* Sidebar */}
      <div 
        className="app-sidebar bg-white border-r border-gray-200 shadow-sm"
        style={{
          width: sidebarCollapsed ? '72px' : '260px',
          transition: 'width 0.2s ease',
          overflow: 'hidden'
        }}
      >
        {/* Sidebar Header - Branding */}
        <div className="border-b border-gray-200 p-6 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h2 className="font-bold text-xl text-gray-900">BellaGest</h2>
                <p className="text-sm text-gray-500 font-medium">
                  {user?.papel?.nome === 'Proprietário' ? 'Super Admin' : user?.papel?.nome || 'Usuário'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="p-4 bg-white">
          {!sidebarCollapsed && (
            <div className="mb-4">
              <h3 
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3"
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  color: '#9AA2B1'
                }}
              >
                Menu Principal
              </h3>
            </div>
          )}
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full transition-all duration-200 ${
                      isActive 
                        ? 'bg-pink-50 text-pink-600' 
                        : 'hover:bg-gray-50 text-gray-700 hover:text-pink-500'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    style={{
                      height: '44px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`} style={{ gap: '12px' }}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive 
                          ? 'bg-pink-100' 
                          : 'bg-gray-100'
                      }`}>
                        <Icon 
                          className="w-5 h-5"
                          style={{ 
                            fontSize: '22px',
                            color: isActive ? '#ff4081' : item.color
                          }}
                        />
                      </div>
                      {!sidebarCollapsed && (
                        <span 
                          className="font-medium"
                          style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            lineHeight: '20px',
                            color: isActive ? '#ff4081' : 'inherit'
                          }}
                        >
                          {item.label}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 p-4 bg-white mt-auto">
          <div className="space-y-3">
            {/* Seletor de Empresa (apenas para Proprietário) */}
            {user?.papel?.nome === 'Proprietário' && !sidebarCollapsed && (
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-600 font-medium mb-2 flex items-center">
                  <Building2 className="w-3 h-3 mr-1" />
                  Selecionar Empresa
                </p>
                {loading ? (
                  <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">Carregando...</div>
                ) : (
                  <Select 
                    value={empresaSelecionada?.id} 
                    onValueChange={handleEmpresaChange}
                  >
                    <SelectTrigger className="h-8 text-xs bg-white border-gray-200">
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id}>
                          {empresa.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Empresa atual (para todos os usuários) */}
            {empresaSelecionada && !sidebarCollapsed && (
              <div className="p-3 rounded-lg bg-white border border-gray-200">
                <p className="text-sm text-gray-900 font-medium">{empresaSelecionada.nome}</p>
                <p className="text-xs text-gray-500">Empresa Ativa</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div 
        className="app-main"
        style={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: '0',
          height: '100%'
        }}
      >
        {/* Header */}
        <header 
          className="app-header"
          style={{
            height: '60px',
            background: '#fff',
            borderBottom: '1px solid #eceff3',
            flexShrink: '0'
          }}
        >
          <div className="flex items-center justify-between h-full px-6 py-4">
            <div className="flex items-center space-x-4">
              {/* Ícone para colapsar menu */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSidebar}
                className="p-2 text-gray-600 hover:bg-gray-100"
                aria-label="Alternar menu lateral"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Campo de busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  className="pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  style={{ 
                    width: '300px',
                    height: '36px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Alertas/Notificações */}
              <Button variant="ghost" size="sm" className="relative p-2 text-gray-600 hover:bg-gray-100">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  3
                </Badge>
              </Button>

              {/* Dropdown do usuário */}
              <div className="relative" ref={dropdownRef}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Avatar className="w-8 h-8 border-2 border-gray-200">
                    <AvatarImage src={user?.foto_perfil} />
                    <AvatarFallback className="bg-pink-500 text-white font-bold text-sm">
                      {user?.nome?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user?.nome || 'Usuário'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    userDropdownOpen ? 'rotate-180' : ''
                  }`} />
                </Button>

                {/* Menu dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.nome || 'Usuário'}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      {user?.papel && (
                        <Badge className="mt-1 bg-pink-100 text-pink-800 text-xs">
                          {user.papel.nome}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('/perfil');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Meu Perfil
                      </button>
                      
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          navigate('/configuracoes');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Preferências
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sair do Sistema
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main 
          className="app-content"
          style={{
            flex: '1',
            minWidth: '0',
            overflow: 'auto',
            padding: '24px',
            background: '#f6f8fb'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

