
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Empresa, Plano } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building2, User, Home, Link as LinkIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NovaEmpresa() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [planos, setPlanos] = useState([]);
  const [dados, setDados] = useState({
    nome: "",
    tipo_documento: "cnpj",
    documento: "",
    email_cadastro: "",
    senha: "", // Added senha field
    telefone: "",
    whatsapp: "",
    site: "",
    instagram: "",
    facebook: "",
    endereco: {
      cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: ""
    },
    plano_id: "",
    ativo: true
  });
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    carregarPlanos();
  }, []);

  const carregarPlanos = async () => {
    try {
      const planosData = await Plano.list();
      setPlanos(planosData);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  // Máscaras de formatação
  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  };

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .substring(0, 14);
  };

  const formatTelefone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
      .substring(0, 15);
  };

  const formatCEP = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .substring(0, 9);
  };

  // Validações
  const validarCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj.length !== 14) return false;
    
    // Validação básica de CNPJ
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;
    
    return true;
  };

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  };

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarURL = (url) => {
    if (!url) return true; // Campo opcional
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!dados.nome.trim()) {
      newErrors.nome = "O nome é obrigatório.";
    }
    
    if (!dados.documento.trim()) {
      newErrors.documento = "O documento é obrigatório.";
    } else {
      const documentoLimpo = dados.documento.replace(/[^\d]/g, '');
      if (dados.tipo_documento === 'cnpj') {
        if (documentoLimpo.length !== 14 || !validarCNPJ(dados.documento)) {
          newErrors.documento = "CNPJ inválido.";
        }
      } else {
        if (documentoLimpo.length !== 11 || !validarCPF(dados.documento)) {
          newErrors.documento = "CPF inválido.";
        }
      }
    }
    
    if (!dados.email_cadastro.trim()) {
      newErrors.email_cadastro = "O email de cadastro é obrigatório.";
    } else if (!validarEmail(dados.email_cadastro)) {
      newErrors.email_cadastro = "Email inválido.";
    }
    
    if (!dados.telefone.trim()) {
      newErrors.telefone = "O telefone é obrigatório.";
    } else {
      const telefoneLimpo = dados.telefone.replace(/[^\d]/g, '');
      if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
        newErrors.telefone = "Telefone deve ter 10 ou 11 dígitos.";
      }
    }
    
    if (dados.whatsapp) {
      const whatsappLimpo = dados.whatsapp.replace(/[^\d]/g, '');
      if (whatsappLimpo.length < 10 || whatsappLimpo.length > 11) {
        newErrors.whatsapp = "WhatsApp deve ter 10 ou 11 dígitos.";
      }
    }
    
    if (dados.site && !validarURL(dados.site)) {
      newErrors.site = "URL do site inválida.";
    }
    
    if (dados.endereco.cep) {
      const cepLimpo = dados.endereco.cep.replace(/[^\d]/g, '');
      if (cepLimpo.length !== 8) {
        newErrors['endereco.cep'] = "CEP deve ter 8 dígitos.";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    let formattedValue = value;
    
    // Aplicar máscaras
    if (id === 'documento') {
      formattedValue = dados.tipo_documento === 'cnpj' ? formatCNPJ(value) : formatCPF(value);
    } else if (id === 'telefone' || id === 'whatsapp') {
      formattedValue = formatTelefone(value);
    } else if (id === 'endereco.cep') {
      formattedValue = formatCEP(value);
    } else if (id === 'endereco.uf') {
      formattedValue = value.toUpperCase().substring(0, 2);
    }
    
    if (id.startsWith('endereco.')) {
      const campo = id.split('.')[1];
      setDados(prev => ({
        ...prev,
        endereco: { ...prev.endereco, [campo]: formattedValue }
      }));
    } else {
      setDados(prev => ({ ...prev, [id]: formattedValue }));
    }
    
    // Limpar erro do campo quando ele for alterado
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  // Quando o tipo de documento muda, reformata o documento existente
  const handleTipoDocumentoChange = (e) => {
    const novoTipo = e.target.value;
    setDados(prev => ({
      ...prev,
      tipo_documento: novoTipo,
      documento: "" // Limpa o documento para evitar conflitos
    }));
    
    if (errors.documento) {
      setErrors(prev => ({ ...prev, documento: null }));
    }
  };

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) {
      setCepError("");
      return;
    }

    setCepLoading(true);
    setCepError("");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepError("CEP não encontrado.");
        setDados(prev => ({
          ...prev,
          endereco: { ...prev.endereco, rua: "", bairro: "", cidade: "", uf: "" }
        }));
      } else {
        setDados(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            cep: formatCEP(data.cep),
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            uf: data.uf
          }
        }));
        
        // Limpar erro de CEP se existir
        if (errors['endereco.cep']) {
          setErrors(prev => ({ ...prev, 'endereco.cep': null }));
        }
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setCepError("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Gerar senha padrão se não fornecida
      const senhaFinal = dados.senha || Math.random().toString(36).slice(-8);
      
      await Empresa.create({
        ...dados,
        senha: senhaFinal // Ensure the final password is sent
      });
      navigate(createPageUrl("Empresas"));
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      setErrors(prev => ({ ...prev, geral: "Erro ao criar empresa. Tente novamente." }));
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Empresas"))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-indigo-500" />
            <div>
              <h1 className="text-2xl font-bold">Nova Empresa</h1>
              <p className="text-gray-600">Cadastre uma nova empresa no sistema</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 mb-6">
              <TabsTrigger value="dados"><User className="w-4 h-4 mr-2" />Dados Principais</TabsTrigger>
              <TabsTrigger value="endereco"><Home className="w-4 h-4 mr-2" />Endereço e Contato</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dados">
              <Card className="glass-effect border-0 shadow-lg">
                <CardHeader><CardTitle>Informações de Cadastro</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo / Razão Social *</Label>
                      <Input 
                        id="nome" 
                        value={dados.nome} 
                        onChange={handleChange} 
                        className={errors.nome ? 'border-red-500' : ''}
                        placeholder="Digite o nome da empresa"
                      />
                      {errors.nome && <p className="text-sm text-red-600">{errors.nome}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email_cadastro">Email de Cadastro *</Label>
                      <Input 
                        id="email_cadastro" 
                        type="email" 
                        value={dados.email_cadastro} 
                        onChange={handleChange} 
                        className={errors.email_cadastro ? 'border-red-500' : ''}
                        placeholder="email@exemplo.com"
                      />
                      {errors.email_cadastro && <p className="text-sm text-red-600">{errors.email_cadastro}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tipo_documento">Tipo de Documento</Label>
                      <select 
                        id="tipo_documento" 
                        value={dados.tipo_documento} 
                        onChange={handleTipoDocumentoChange} 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                      >
                        <option value="cnpj">CNPJ</option>
                        <option value="cpf">CPF</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="documento">
                        {dados.tipo_documento === 'cnpj' ? 'CNPJ' : 'CPF'} *
                      </Label>
                      <Input 
                        id="documento" 
                        value={dados.documento} 
                        onChange={handleChange} 
                        className={errors.documento ? 'border-red-500' : ''}
                        placeholder={dados.tipo_documento === 'cnpj' ? '00.000.000/0000-00' : '000.000.000-00'}
                      />
                      {errors.documento && <p className="text-sm text-red-600">{errors.documento}</p>}
                    </div>
                  </div>

                  {/* New password field */}
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha de Acesso</Label>
                    <Input 
                      id="senha" 
                      type="password"
                      value={dados.senha} 
                      onChange={handleChange} 
                      placeholder="Deixe em branco para gerar automaticamente"
                    />
                    <p className="text-xs text-gray-500">Se não informada, será gerada uma senha aleatória</p>
                  </div>
                  {/* End new password field */}
                  
                  <div className="space-y-2">
                    <Label htmlFor="plano_id">Plano de Assinatura</Label>
                    <select 
                      id="plano_id" 
                      value={dados.plano_id} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                    >
                      <option value="">Selecione um plano</option>
                      {planos.map(plano => (
                        <option key={plano.id} value={plano.id}>
                          {plano.nome} - R$ {plano.valor_mensal?.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-4">
                    <Switch 
                      id="ativo" 
                      checked={dados.ativo} 
                      onCheckedChange={(checked) => setDados(prev => ({...prev, ativo: checked}))}
                    />
                    <Label htmlFor="ativo">Empresa ativa</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="endereco">
              <Card className="glass-effect border-0 shadow-lg">
                <CardHeader><CardTitle>Endereço e Contatos</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input 
                        id="telefone" 
                        value={dados.telefone} 
                        onChange={handleChange} 
                        className={errors.telefone ? 'border-red-500' : ''}
                        placeholder="(00) 00000-0000"
                      />
                      {errors.telefone && <p className="text-sm text-red-600">{errors.telefone}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input 
                        id="whatsapp" 
                        value={dados.whatsapp} 
                        onChange={handleChange}
                        className={errors.whatsapp ? 'border-red-500' : ''}
                        placeholder="(00) 00000-0000"
                      />
                      {errors.whatsapp && <p className="text-sm text-red-600">{errors.whatsapp}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="endereco.cep">CEP</Label>
                      <div className="relative">
                        <Input 
                          id="endereco.cep" 
                          value={dados.endereco.cep} 
                          onChange={handleChange} 
                          onBlur={handleCepBlur}
                          className={errors['endereco.cep'] ? 'border-red-500' : ''}
                          placeholder="00000-000"
                        />
                        {cepLoading && (
                          <div className="absolute right-3 top-2.5 h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" role="status" />
                        )}
                      </div>
                      {errors['endereco.cep'] && <p className="text-sm text-red-600">{errors['endereco.cep']}</p>}
                      {cepError && <p className="text-sm text-red-600 mt-1">{cepError}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 space-y-2">
                      <Label htmlFor="endereco.rua">Rua</Label>
                      <Input id="endereco.rua" value={dados.endereco.rua} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endereco.numero">Número</Label>
                      <Input id="endereco.numero" value={dados.endereco.numero} onChange={handleChange} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="endereco.complemento">Complemento</Label>
                      <Input id="endereco.complemento" value={dados.endereco.complemento} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endereco.bairro">Bairro</Label>
                      <Input id="endereco.bairro" value={dados.endereco.bairro} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endereco.cidade">Cidade</Label>
                      <Input id="endereco.cidade" value={dados.endereco.cidade} onChange={handleChange} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="site">Site</Label>
                      <Input 
                        id="site" 
                        value={dados.site} 
                        onChange={handleChange} 
                        placeholder="https://exemplo.com"
                        className={errors.site ? 'border-red-500' : ''}
                      />
                      {errors.site && <p className="text-sm text-red-600">{errors.site}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input 
                        id="instagram" 
                        value={dados.instagram} 
                        onChange={handleChange} 
                        placeholder="@seu-usuario"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input 
                        id="facebook" 
                        value={dados.facebook} 
                        onChange={handleChange} 
                        placeholder="facebook.com/sua-pagina"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 pt-6">
            {errors.geral && <p className="text-sm text-red-600 mr-auto">{errors.geral}</p>}
            <Button type="button" variant="outline" onClick={() => navigate(createPageUrl("Empresas"))}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-gradient-to-r from-indigo-500 to-purple-500"
            >
              {loading ? "Salvando..." : "Criar Empresa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
