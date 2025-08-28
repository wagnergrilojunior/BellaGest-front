import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { User, Plus, Search, Filter, Mail, Building } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setUsuarios([
        {
          id: 1,
          nome: "Administrador Bellagest",
          email: "admin@bellagest.com",
          empresa: "Bellagest",
          papel: "Administrador",
          ativo: true,
          data_criacao: "2025-08-28"
        },
        {
          id: 2,
          nome: "Maria Silva",
          email: "gerente@salaobeleza.com",
          empresa: "Salão Beleza & Estilo",
          papel: "Gerente",
          ativo: true,
          data_criacao: "2025-08-28"
        },
        {
          id: 3,
          nome: "João Santos",
          email: "funcionario@clinicaestetica.com",
          empresa: "Clínica Estética Premium",
          papel: "Funcionário",
          ativo: true,
          data_criacao: "2025-08-28"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (ativo) => {
    return ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getPapelColor = (papel) => {
    switch (papel) {
      case 'Administrador':
        return 'bg-purple-100 text-purple-800';
      case 'Gerente':
        return 'bg-blue-100 text-blue-800';
      case 'Funcionário':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerencie os usuários do sistema</p>
        </div>
        <Button className="bg-rose-500 hover:bg-rose-600">
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Buscar por nome ou email..." />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <div className="grid gap-4">
        {usuarios.map((usuario) => (
          <Card key={usuario.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={usuario.foto_perfil} />
                    <AvatarFallback className="bg-rose-500 text-white">
                      {usuario.nome.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{usuario.nome}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Mail className="w-3 h-3" />
                      <span>{usuario.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                      <Building className="w-3 h-3" />
                      <span>{usuario.empresa}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Criado em {new Date(usuario.data_criacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getPapelColor(usuario.papel)}>
                    {usuario.papel}
                  </Badge>
                  <Badge className={getStatusColor(usuario.ativo)}>
                    {usuario.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{usuarios.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Usuários Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {usuarios.filter(u => u.ativo).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {usuarios.filter(u => u.papel === 'Administrador').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Gerentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {usuarios.filter(u => u.papel === 'Gerente').length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
