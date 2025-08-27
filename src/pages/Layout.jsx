

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, Empresa } from "@/api/entities";
import { getEmpresasComAcesso, isSuperAdmin } from "@/components/utils/permissoes";
import {
  LayoutDashboard, // Replaces BarChart3
  Calendar,
  Users,
  Scissors, // Replaces Briefcase
  Package, // Replaces ShoppingBag
  DollarSign,
  Warehouse, // Replaces Package for Estoque
  FileText, // Replaces Sparkles for Servicos
  Building, // Replaces Building2
  CreditCard, // Replaces Gem and Receipt
  BookText, // New icon for Documentação
  Menu,
  Sparkles,
  Crown,
  LogOut,
  UserCircle,
  ChevronDown,
  Check,
  Shield, // Still imported but not directly used in navigation
  Settings
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    color: "text-rose-500"
  },
  {
    title: "Empresas",
    url: createPageUrl("Empresas"),
    icon: Building,
    color: "text-indigo-500",
    superAdminOnly: true
  },
  {
    title: "Agendamentos",
    url: createPageUrl("Agendamentos"),
    icon: Calendar,
    color: "text-purple-500"
  },
  {
    title: "Clientes",
    url: createPageUrl("Clientes"),
    icon: Users,
    color: "text-blue-500"
  },
  {
    title: "Profissionais",
    url: createPageUrl("Profissionais"),
    icon: Scissors,
    color: "text-emerald-500"
  },
  {
    title: "Serviços",
    url: createPageUrl("Servicos"),
    icon: FileText,
    color: "text-pink-500"
  },
  {
    title: "Produtos",
    url: createPageUrl("Produtos"),
    icon: Package,
    color: "text-orange-500"
  },
  {
    title: "Estoque",
    url: createPageUrl("Estoque"),
    icon: Warehouse,
    color: "text-blue-600"
  },
  {
    title: "Financeiro",
    url: createPageUrl("Financeiro"),
    icon: DollarSign,
    color: "text-green-500"
  },
  {
    title: "Planos",
    url: createPageUrl("Planos"),
    icon: CreditCard,
    color: "text-violet-500",
    superAdminOnly: true
  },
  {
    title: "Cobranças",
    url: createPageUrl("Cobrancas"),
    icon: CreditCard,
    color: "text-cyan-500",
    superAdminOnly: true
  },
  {
    title: "Documentação",
    url: createPageUrl("Documentacao"),
    icon: BookText,
    color: "text-stone-500",
    superAdminOnly: true
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [empresas, setEmpresas] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await User.me();
        setUser(userData);

        const superAdmin = await isSuperAdmin(userData.id);
        setIsSuperAdminUser(superAdmin);

        if (!superAdmin && !userData.empresa_id && !['CadastroCompleto', 'Splash', 'Entrar'].includes(currentPageName)) {
          navigate(createPageUrl('CadastroCompleto'));
          setLoading(false);
          return;
        }

        const empresasData = await getEmpresasComAcesso(userData.id);
        setEmpresas(empresasData);

        const empresaSalva = localStorage.getItem('empresa_selecionada');
        if (empresaSalva) {
          const empresaObj = JSON.parse(empresaSalva);
          const empresaValida = empresasData.find(e => e.id === empresaObj.id);
          if (empresaValida) {
            setEmpresaSelecionada(empresaValida);
          } else if (empresasData.length > 0) {
            setEmpresaSelecionada(empresasData[0]);
            localStorage.setItem('empresa_selecionada', JSON.stringify(empresasData[0]));
          } else {
            setEmpresaSelecionada(empresaObj);
          }
        } else if (empresasData.length > 0) {
          setEmpresaSelecionada(empresasData[0]);
          localStorage.setItem('empresa_selecionada', JSON.stringify(empresasData[0]));
        } else {
          setEmpresaSelecionada(null);
        }

      } catch (error) {
        console.log("Usuário não autenticado:", error);
        // Para usuários não autenticados, deixa o controle com a plataforma
        // A plataforma deve redirecionar para a Main Page (Entrar) configurada
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [currentPageName, navigate]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('empresa_selecionada');
      await User.logout();
      // Força refresh da página para que a plataforma redirecione para Main Page
      window.location.reload();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleSelecionarEmpresa = (empresa) => {
    setEmpresaSelecionada(empresa);
    localStorage.setItem('empresa_selecionada', JSON.stringify(empresa));
    window.location.reload();
  };

  const filteredNavigationItems = navigationItems.filter(item => {
    if (item.superAdminOnly && !isSuperAdminUser) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se o usuário não estiver logado, renderiza apenas as páginas públicas permitidas
  if (!user && ['Entrar', 'CadastroCompleto', 'Splash'].includes(currentPageName)) {
    return children;
  }
  
  // Se o usuário não estiver logado e não for uma página pública, retorna null
  // deixando a plataforma gerenciar o redirecionamento
  if (!user) {
    return null; 
  }

  // Se o usuário estiver logado, mas a página for pública, renderiza sem layout
  if (['CadastroCompleto', 'Splash', 'Entrar'].includes(currentPageName)) {
    return children;
  }

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --primary: 343 89% 65%;
            --primary-foreground: 0 0% 98%;
            --secondary: 51 100% 95%;
            --secondary-foreground: 51 100% 15%;
            --accent: 343 30% 95%;
            --accent-foreground: 343 30% 15%;
            --muted: 51 100% 98%;
            --muted-foreground: 51 20% 40%;
            --background: 0 0% 100%;
            --foreground: 0 0% 3.9%;
            --card: 0 0% 100%;
            --card-foreground: 0 0% 3.9%;
            --popover: 0 0% 100%;
            --popover-foreground: 0 0% 3.9%;
            --border: 51 50% 88%;
            --input: 51 50% 88%;
            --ring: 343 89% 65%;
            --radius: 0.75rem;
          }

          .gradient-bg {
            background: linear-gradient(135deg,
              rgba(244, 63, 94, 0.05) 0%,
              rgba(251, 113, 133, 0.05) 25%,
              rgba(249, 168, 212, 0.05) 50%,
              rgba(253, 230, 138, 0.05) 75%,
              rgba(255, 255, 255, 0.05) 100%);
          }

          .glass-effect {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
        `}
      </style>
      <div className="min-h-screen flex w-full gradient-bg">
        <Sidebar className="border-r border-rose-100/50 glass-effect">
          <SidebarHeader className="border-b border-rose-100/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                {isSuperAdminUser && <Crown className="w-4 h-4 text-amber-400 absolute -top-1 -right-1" />}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">BellaGest</h2>
                <p className="text-xs text-gray-500">
                  {isSuperAdminUser ? 'Super Admin' : 'Gestão de Beleza'}
                </p>
              </div>
            </div>

            {isSuperAdminUser && empresas.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 hover:from-indigo-100 hover:to-purple-100 transition-all">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-indigo-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {empresaSelecionada ? empresaSelecionada.nome : 'Selecionar Empresa'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {empresaSelecionada ? 'Empresa Ativa' : 'Nenhuma selecionada'}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="start">
                  {empresas.map((empresa) => (
                    <DropdownMenuItem
                      key={empresa.id}
                      onClick={() => handleSelecionarEmpresa(empresa)}
                      className="flex items-center justify-between p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-indigo-500" />
                        <div>
                          <p className="font-medium">{empresa.nome}</p>
                          <p className="text-xs text-gray-500">{empresa.documento}</p>
                        </div>
                      </div>
                      {empresaSelecionada?.id === empresa.id && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  {empresas.length === 0 && (
                    <div className="p-3 text-center text-gray-500 text-sm">
                      Nenhuma empresa disponível
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {!isSuperAdminUser && empresaSelecionada && (
               <div className="w-full flex items-center p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-indigo-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{empresaSelecionada.nome}</p>
                        <p className="text-xs text-gray-500">Empresa Ativa</p>
                      </div>
                    </div>
                </div>
            )}
            
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-3">
                Menu Principal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredNavigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-rose-50 hover:text-rose-700 transition-all duration-300 rounded-xl mb-1 ${
                          location.pathname.startsWith(item.url) ? 'bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 shadow-sm border border-rose-100/50' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-rose-100/50 p-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-rose-50/50 to-pink-50/50">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center relative">
                {user.full_name ? (
                  <span className="text-white font-bold text-sm">
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <UserCircle className="w-6 h-6 text-white" />
                )}
                {isSuperAdminUser && (
                  <Crown className="w-3 h-3 text-amber-400 absolute -top-1 -right-1" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {user.full_name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {isSuperAdminUser ? 'Super Administrador' : 'Usuário'}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <button className="p-2 text-gray-500 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-200/50">
                    <Settings className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 mr-4" align="end">
                   <DropdownMenuItem asChild>
                     <Link to={createPageUrl("ConfiguracoesUsuario")} className="cursor-pointer">
                      <UserCircle className="w-4 h-4 mr-2" />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-rose-100/50 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-rose-50 p-2 rounded-lg transition-colors duration-200">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-500" />
                <h1 className="text-xl font-bold text-gray-900">BellaGest</h1>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

