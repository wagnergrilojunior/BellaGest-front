import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Settings, User, Bell, Shield, Palette, Database } from 'lucide-react';

export default function Configuracoes() {
  const [notificacoes, setNotificacoes] = useState({
    email: true,
    push: false,
    sms: false
  });

  const [tema, setTema] = useState('light');
  const [formData, setFormData] = useState({
    nome: 'Administrador Bellagest',
    email: 'admin@bellagest.com',
    telefone: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [errors, setErrors] = useState({});

  // Máscara para telefone
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return numbers.slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  // Validação de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validação de senha
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Validação de telefone
  const validatePhone = (phone) => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 11;
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'telefone') {
      formattedValue = formatPhone(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'O nome é obrigatório';
    }

    if (!formData.email) {
      newErrors.email = 'O email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Digite um email válido';
    }

    if (formData.telefone && !validatePhone(formData.telefone)) {
      newErrors.telefone = 'Digite um telefone válido';
    }

    if (formData.novaSenha && !validatePassword(formData.novaSenha)) {
      newErrors.novaSenha = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (formData.novaSenha && formData.novaSenha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = () => {
    if (validateForm()) {
      // Aqui você implementaria a lógica para salvar
      console.log('Dados salvos:', formData);
    }
  };

  const handleChangePassword = () => {
    if (validateForm()) {
      // Aqui você implementaria a lógica para alterar senha
      console.log('Senha alterada');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid gap-6">
        {/* Configurações do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Perfil do Usuário</span>
            </CardTitle>
            <CardDescription>
              Gerencie suas informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input 
                  id="nome" 
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  className={errors.nome ? 'border-red-500' : ''}
                />
                {errors.nome && <p className="text-sm text-red-500 mt-1">{errors.nome}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input 
                  id="telefone" 
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  className={errors.telefone ? 'border-red-500' : ''}
                />
                {errors.telefone && <p className="text-sm text-red-500 mt-1">{errors.telefone}</p>}
              </div>
              <div>
                <Label htmlFor="empresa">Empresa</Label>
                <Input id="empresa" defaultValue="Bellagest" disabled />
              </div>
            </div>
            <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
          </CardContent>
        </Card>

        {/* Configurações de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notificações</span>
            </CardTitle>
            <CardDescription>
              Configure como você recebe notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notif">Notificações por Email</Label>
                <p className="text-sm text-gray-500">Receba notificações importantes por email</p>
              </div>
              <Switch
                id="email-notif"
                checked={notificacoes.email}
                onCheckedChange={(checked) => setNotificacoes({...notificacoes, email: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notif">Notificações Push</Label>
                <p className="text-sm text-gray-500">Receba notificações em tempo real</p>
              </div>
              <Switch
                id="push-notif"
                checked={notificacoes.push}
                onCheckedChange={(checked) => setNotificacoes({...notificacoes, push: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-notif">Notificações SMS</Label>
                <p className="text-sm text-gray-500">Receba notificações por SMS</p>
              </div>
              <Switch
                id="sms-notif"
                checked={notificacoes.sms}
                onCheckedChange={(checked) => setNotificacoes({...notificacoes, sms: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Segurança</span>
            </CardTitle>
            <CardDescription>
              Gerencie a segurança da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="senha-atual">Senha Atual</Label>
                <Input 
                  id="senha-atual" 
                  type="password"
                  value={formData.senhaAtual}
                  onChange={(e) => handleInputChange('senhaAtual', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nova-senha">Nova Senha</Label>
                <Input 
                  id="nova-senha" 
                  type="password"
                  value={formData.novaSenha}
                  onChange={(e) => handleInputChange('novaSenha', e.target.value)}
                  className={errors.novaSenha ? 'border-red-500' : ''}
                />
                {errors.novaSenha && <p className="text-sm text-red-500 mt-1">{errors.novaSenha}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="confirmar-senha">Confirmar Nova Senha</Label>
              <Input 
                id="confirmar-senha" 
                type="password"
                value={formData.confirmarSenha}
                onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                className={errors.confirmarSenha ? 'border-red-500' : ''}
              />
              {errors.confirmarSenha && <p className="text-sm text-red-500 mt-1">{errors.confirmarSenha}</p>}
            </div>
            <Button onClick={handleChangePassword}>Alterar Senha</Button>
          </CardContent>
        </Card>

        {/* Configurações de Aparência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>Aparência</span>
            </CardTitle>
            <CardDescription>
              Personalize a aparência do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tema">Tema</Label>
              <select
                id="tema"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="compact-mode">Modo Compacto</Label>
                <p className="text-sm text-gray-500">Interface mais compacta</p>
              </div>
              <Switch id="compact-mode" />
            </div>
          </CardContent>
        </Card>

        {/* Configurações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Configurações do Sistema</span>
            </CardTitle>
            <CardDescription>
              Configurações gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timezone">Fuso Horário</Label>
                <select
                  id="timezone"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  defaultValue="America/Sao_Paulo"
                >
                  <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                  <option value="America/Manaus">Manaus (GMT-4)</option>
                  <option value="America/Belem">Belém (GMT-3)</option>
                </select>
              </div>
              <div>
                <Label htmlFor="idioma">Idioma</Label>
                <select
                  id="idioma"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  defaultValue="pt-BR"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="backup-auto">Backup Automático</Label>
                <p className="text-sm text-gray-500">Fazer backup automático dos dados</p>
              </div>
              <Switch id="backup-auto" defaultChecked />
            </div>
            <Button>Salvar Configurações</Button>
          </CardContent>
        </Card>

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Informações do Sistema</span>
            </CardTitle>
            <CardDescription>
              Informações sobre a versão e status do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Versão:</strong> 1.0.0</p>
                <p><strong>Última Atualização:</strong> 28/08/2025</p>
              </div>
              <div>
                <p><strong>Status:</strong> <span className="text-green-600">Online</span></p>
                <p><strong>Banco de Dados:</strong> PostgreSQL</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">Verificar Atualizações</Button>
              <Button variant="outline">Logs do Sistema</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
