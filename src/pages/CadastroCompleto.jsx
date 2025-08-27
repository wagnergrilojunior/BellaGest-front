
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Empresa, Plano, Cobranca, Papel } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Building2, User as UserIcon, Eye, ArrowRight, CheckCircle, MapPin, Phone, ArrowLeft, Loader2 } from "lucide-react";
import { format, addDays } from "date-fns";
import StepIndicator from "../components/cadastro/StepIndicator";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { name: 'Seus Dados', icon: UserIcon },
  { name: 'Dados da Empresa', icon: Building2 },
  { name: 'Endereço', icon: MapPin },
  { name: 'Revisão e Termos', icon: Eye },
];

export default function CadastroCompleto() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [planoAvancado, setPlanoAvancado] = useState(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [step, setStep] = useState(1);

  const [dadosUsuario, setDadosUsuario] = useState({ full_name: "" });
  const [dadosEmpresa, setDadosEmpresa] = useState({
    nome: "",
    tipo_documento: "cnpj",
    documento: "",
    whatsapp: "",
    endereco: { cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" }
  });
  const [termos, setTermos] = useState({ aceiteTermos: false, aceiteLGPD: false });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        setDadosUsuario({ full_name: user.full_name || "" });

        if (user.empresa_id) {
          navigate(createPageUrl("Dashboard"));
          return;
        }

        const planos = await Plano.list();
        const planoAvancadoEncontrado = planos.find(p => 
          p.nome.toLowerCase().includes('avançado') || p.nome.toLowerCase().includes('premium')
        );
        if (planoAvancadoEncontrado) {
          setPlanoAvancado(planoAvancadoEncontrado);
        }
      } catch (error) {
        console.error('Erro ao carregar dados iniciais ou usuário não autenticado:', error);
        navigate(createPageUrl("Dashboard")); 
      } finally {
        setPageLoading(false);
      }
    };
    carregarDadosIniciais();
  }, [navigate]);

  const formatCNPJ = (value) => value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').substring(0, 18);
  const formatCPF = (value) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').substring(0, 14);
  const formatTelefone = (value) => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3').substring(0, 15);
  const formatCEP = (value) => value.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').substring(0, 9);
  const validarCNPJ = (cnpj) => { cnpj = cnpj.replace(/[^\d]+/g, ''); if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false; let t = cnpj.length - 2, n = cnpj.substring(0, t), d = cnpj.substring(t), s = 0, p = t - 7; for (let i = t; i >= 1; i--) { s += n.charAt(t - i) * p--; if (p < 2) p = 9; } let r = s % 11 < 2 ? 0 : 11 - s % 11; if (r != d.charAt(0)) return false; t = t + 1; n = cnpj.substring(0, t); s = 0; p = t - 7; for (let i = t; i >= 1; i--) { s += n.charAt(t - i) * p--; if (p < 2) p = 9; } r = s % 11 < 2 ? 0 : 11 - s % 11; return r == d.charAt(1); };
  const validarCPF = (cpf) => { cpf = cpf.replace(/[^\d]+/g, ''); if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false; let s = 0; for (let i = 0; i < 9; i++) s += parseInt(cpf.charAt(i)) * (10 - i); let r = (s * 10) % 11; if (r === 10 || r === 11) r = 0; if (r !== parseInt(cpf.charAt(9))) return false; s = 0; for (let i = 0; i < 10; i++) s += parseInt(cpf.charAt(i)) * (11 - i); r = (s * 10) % 11; if (r === 10 || r === 11) r = 0; return r === parseInt(cpf.charAt(10)); };
  const validarTelefone = (telefone) => { const n = telefone.replace(/\D/g, ''); return n.length >= 10 && n.length <= 11; };

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!dadosUsuario.full_name.trim()) newErrors.full_name = "Seu nome completo é obrigatório";
    }
    if (currentStep === 2) {
      if (!dadosEmpresa.nome.trim()) newErrors.nome = "Nome da empresa é obrigatório";
      if (!dadosEmpresa.documento.trim()) newErrors.documento = "Documento é obrigatório";
      else if (dadosEmpresa.tipo_documento === 'cnpj' && !validarCNPJ(dadosEmpresa.documento)) newErrors.documento = "CNPJ inválido";
      else if (dadosEmpresa.tipo_documento === 'cpf' && !validarCPF(dadosEmpresa.documento)) newErrors.documento = "CPF inválido";
      if (!dadosEmpresa.whatsapp.trim()) newErrors.whatsapp = "Celular (WhatsApp) é obrigatório";
      else if (!validarTelefone(dadosEmpresa.whatsapp)) newErrors.whatsapp = "Celular inválido";
    }
    if (currentStep === 3) {
      if (!dadosEmpresa.endereco.cep.trim()) newErrors['endereco.cep'] = "CEP é obrigatório";
      else if (cepError) newErrors['endereco.cep'] = cepError;
      if (!dadosEmpresa.endereco.rua.trim()) newErrors['endereco.rua'] = "Rua é obrigatória";
      if (!dadosEmpresa.endereco.numero.trim() || dadosEmpresa.endereco.numero.length > 10) newErrors['endereco.numero'] = "Número inválido";
      if (!dadosEmpresa.endereco.bairro.trim() || dadosEmpresa.endereco.bairro.length < 3 || dadosEmpresa.endereco.bairro.length > 50) newErrors['endereco.bairro'] = "Bairro deve ter entre 3 e 50 caracteres";
      if (!dadosEmpresa.endereco.cidade.trim() || dadosEmpresa.endereco.cidade.length < 5 || dadosEmpresa.endereco.cidade.length > 60) newErrors['endereco.cidade'] = "Cidade deve ter entre 5 e 60 caracteres";
      if (!dadosEmpresa.endereco.uf.trim() || dadosEmpresa.endereco.uf.length !== 2) newErrors['endereco.uf'] = "UF inválido";
    }
    if (currentStep === 4) {
      if (!termos.aceiteTermos) newErrors.aceiteTermos = "Você deve aceitar os termos";
      if (!termos.aceiteLGPD) newErrors.aceiteLGPD = "Você deve aceitar o tratamento dos dados";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
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
      if (!response.ok) throw new Error('Falha na resposta da API');
      const data = await response.json();
      if (data.erro) {
        setCepError("CEP não encontrado. Verifique o número digitado.");
        setDadosEmpresa(prev => ({
            ...prev,
            endereco: { ...prev.endereco, rua: "", bairro: "", cidade: "", uf: "" }
        }));
      } else {
        setDadosEmpresa(prev => ({
          ...prev,
          endereco: { ...prev.endereco, rua: data.logradouro, bairro: data.bairro, cidade: data.localidade, uf: data.uf }
        }));
      }
    } catch (error) { 
        console.error("Erro ao buscar CEP:", error);
        setCepError("Erro ao buscar CEP. Tente novamente mais tarde.");
    }
    finally { setCepLoading(false); }
  };
  
  const handleChange = (setter) => (e) => {
    const { id, value } = e.target;
    setter(prev => ({ ...prev, [id]: value }));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: null }));
  };

  const handleEmpresaChange = (e) => {
    const { id, value } = e.target;
    let formattedValue = value;
    
    if (id === 'documento') {
      formattedValue = dadosEmpresa.tipo_documento === 'cnpj' ? formatCNPJ(value) : formatCPF(value);
    } else if (id === 'whatsapp') {
      formattedValue = formatTelefone(value);
    }
    
    if (id.startsWith('endereco.')) {
      const campo = id.split('.')[1];
      let newAddressValue = value;
      if (campo === 'cep') newAddressValue = formatCEP(value);
      if (campo === 'uf') newAddressValue = value.toUpperCase().substring(0, 2);
      
      setDadosEmpresa(prev => ({ ...prev, endereco: { ...prev.endereco, [campo]: newAddressValue } }));
    } else {
      setDadosEmpresa(prev => ({ ...prev, [id]: formattedValue }));
    }
    
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: null }));
  };

  const handleTipoDocumentoChange = (e) => {
    const novoTipo = e.target.value;
    setDadosEmpresa(prev => ({ ...prev, tipo_documento: novoTipo, documento: "" }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;
    setLoading(true);
    try {
        if (!currentUser) throw new Error("Usuário não autenticado.");
        await User.updateMyUserData({ full_name: dadosUsuario.full_name });
        
        const novaEmpresa = await Empresa.create({
            ...dadosEmpresa,
            telefone: dadosEmpresa.whatsapp, // Corrigido: Usando o WhatsApp como telefone principal
            email_cadastro: currentUser.email,
            user_id: currentUser.id,
            plano_id: planoAvancado?.id,
            ativo: true
        });

        let papelAdminEmpresa = null;
        try {
            const papeis = await Papel.filter({ nome: "Admin da Empresa" });
            if (papeis.length > 0) papelAdminEmpresa = papeis[0];
        } catch (error) { console.error('Erro ao buscar papel Admin da Empresa:', error); }

        const updateData = { empresa_id: novaEmpresa.id };
        if (papelAdminEmpresa) updateData.papel_id = papelAdminEmpresa.id;
        await User.updateMyUserData(updateData);
        
        if (planoAvancado) {
            const dataVencimento = addDays(new Date(), 15);
            await Cobranca.create({
                empresa_id: novaEmpresa.id,
                plano_id: planoAvancado.id,
                valor: planoAvancado.valor_mensal,
                data_vencimento: format(dataVencimento, 'yyyy-MM-dd'),
                status: 'pendente',
                observacoes: 'Primeira cobrança após período de teste gratuito de 15 dias'
            });
        }
        
        localStorage.setItem('empresa_selecionada', JSON.stringify(novaEmpresa));
        
        // Redireciona para a nova tela de Splash
        const splashUrl = createPageUrl("Splash");
        window.location.replace(splashUrl);

    } catch (error) {
        console.error('Erro ao finalizar cadastro:', error);
        setErrors(prev => ({ ...prev, geral: "Erro ao finalizar cadastro. Tente novamente." }));
    }
    setLoading(false);
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <Card className="glass-effect border-0 shadow-2xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><UserIcon className="w-5 h-5 text-blue-600" />Seus Dados</CardTitle></CardHeader>
            <CardContent className="p-8">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input id="full_name" value={dadosUsuario.full_name} onChange={handleChange(setDadosUsuario)} placeholder="Seu nome completo" className={errors.full_name ? 'border-red-500' : ''} />
                {errors.full_name && <p className="text-sm text-red-600 mt-1">{errors.full_name}</p>}
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={currentUser?.email || ""} disabled className="bg-gray-100" />
              </div>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card className="glass-effect border-0 shadow-2xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5 text-indigo-600" />Dados da Empresa</CardTitle></CardHeader>
            <CardContent className="p-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Empresa *</Label>
                <Input id="nome" value={dadosEmpresa.nome} onChange={handleEmpresaChange} placeholder="Nome fantasia" className={errors.nome ? 'border-red-500' : ''} />
                {errors.nome && <p className="text-sm text-red-600 mt-1">{errors.nome}</p>}
              </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_documento">Tipo</Label>
                    <select id="tipo_documento" value={dadosEmpresa.tipo_documento} onChange={handleTipoDocumentoChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white">
                      <option value="cnpj">CNPJ</option>
                      <option value="cpf">CPF</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="documento">{dadosEmpresa.tipo_documento === 'cnpj' ? 'CNPJ' : 'CPF'} *</Label>
                    <Input id="documento" value={dadosEmpresa.documento} onChange={handleEmpresaChange} className={errors.documento ? 'border-red-500' : ''} />
                    {errors.documento && <p className="text-sm text-red-600 mt-1">{errors.documento}</p>}
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="whatsapp">Celular (WhatsApp) *</Label>
                  <Input id="whatsapp" value={dadosEmpresa.whatsapp} onChange={handleEmpresaChange} placeholder="(11) 99999-9999" className={errors.whatsapp ? 'border-red-500' : ''} />
                  {errors.whatsapp && <p className="text-sm text-red-600 mt-1">{errors.whatsapp}</p>}
              </div>
            </CardContent>
          </Card>
        );
      case 3:
        return (
          <Card className="glass-effect border-0 shadow-2xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-green-600" />Endereço</CardTitle></CardHeader>
            <CardContent className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="endereco.cep">CEP *</Label>
                  <div className="relative">
                    <Input id="endereco.cep" name="endereco.cep" value={dadosEmpresa.endereco.cep} onChange={handleEmpresaChange} onBlur={handleCepBlur} placeholder="00000-000" className={errors['endereco.cep'] || cepError ? 'border-red-500' : ''}/>
                    {cepLoading && <Loader2 className="absolute right-3 top-2.5 h-5 w-5 animate-spin text-gray-400" />}
                  </div>
                  {errors['endereco.cep'] && <p className="text-sm text-red-600 mt-1">{errors['endereco.cep']}</p>}
                  {cepError && <p className="text-sm text-red-600 mt-1">{cepError}</p>}
                </div>
                 <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="endereco.rua">Rua *</Label>
                  <Input id="endereco.rua" name="endereco.rua" value={dadosEmpresa.endereco.rua} onChange={handleEmpresaChange} className={errors['endereco.rua'] ? 'border-red-500' : ''}/>
                  {errors['endereco.rua'] && <p className="text-sm text-red-600 mt-1">{errors['endereco.rua']}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="endereco.bairro">Bairro *</Label>
                  <Input id="endereco.bairro" name="endereco.bairro" value={dadosEmpresa.endereco.bairro} onChange={handleEmpresaChange} className={errors['endereco.bairro'] ? 'border-red-500' : ''}/>
                  {errors['endereco.bairro'] && <p className="text-sm text-red-600 mt-1">{errors['endereco.bairro']}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco.numero">Número *</Label>
                  <Input id="endereco.numero" name="endereco.numero" value={dadosEmpresa.endereco.numero} onChange={handleEmpresaChange} className={errors['endereco.numero'] ? 'border-red-500' : ''}/>
                  {errors['endereco.numero'] && <p className="text-sm text-red-600 mt-1">{errors['endereco.numero']}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="endereco.complemento">Complemento</Label>
                  <Input id="endereco.complemento" name="endereco.complemento" value={dadosEmpresa.endereco.complemento} onChange={handleEmpresaChange} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="endereco.cidade">Cidade *</Label>
                  <Input id="endereco.cidade" name="endereco.cidade" value={dadosEmpresa.endereco.cidade} onChange={handleEmpresaChange} className={errors['endereco.cidade'] ? 'border-red-500' : ''}/>
                  {errors['endereco.cidade'] && <p className="text-sm text-red-600 mt-1">{errors['endereco.cidade']}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco.uf">UF *</Label>
                  <Input id="endereco.uf" name="endereco.uf" value={dadosEmpresa.endereco.uf} onChange={handleEmpresaChange} className={errors['endereco.uf'] ? 'border-red-500' : ''}/>
                  {errors['endereco.uf'] && <p className="text-sm text-red-600 mt-1">{errors['endereco.uf']}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 4:
        return (
          <Card className="glass-effect border-0 shadow-2xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-purple-600" />Revisão e Termos</CardTitle></CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50/50 mb-6">
                 <h3 className="font-semibold text-lg">Revise seus dados</h3>
                 <p><strong>Nome:</strong> {dadosUsuario.full_name}</p>
                 <p><strong>Empresa:</strong> {dadosEmpresa.nome}</p>
                 <p><strong>Documento:</strong> {dadosEmpresa.documento}</p>
                 <p><strong>Celular:</strong> {dadosEmpresa.whatsapp}</p>
                 <p><strong>Endereço:</strong> {`${dadosEmpresa.endereco.rua}, ${dadosEmpresa.endereco.numero} - ${dadosEmpresa.endereco.bairro}, ${dadosEmpresa.endereco.cidade}/${dadosEmpresa.endereco.uf}`}</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="aceiteTermos" 
                    checked={termos.aceiteTermos} 
                    onCheckedChange={(c) => {
                      setTermos(p => ({...p, aceiteTermos: c}));
                      if (errors.aceiteTermos) setErrors(prev => ({ ...prev, aceiteTermos: null }));
                    }} 
                    className={errors.aceiteTermos ? 'border-red-500' : ''}
                  />
                  <div>
                    <Label htmlFor="aceiteTermos" className="cursor-pointer">Aceito os <a href="#" className="text-rose-500 hover:underline">Termos de Uso</a> e <a href="#" className="text-rose-500 hover:underline">Política de Privacidade</a> *</Label>
                    {errors.aceiteTermos && <p className="text-sm text-red-600 mt-1">{errors.aceiteTermos}</p>}
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="aceiteLGPD" 
                    checked={termos.aceiteLGPD} 
                    onCheckedChange={(c) => {
                      setTermos(p => ({...p, aceiteLGPD: c}));
                      if (errors.aceiteLGPD) setErrors(prev => ({ ...prev, aceiteLGPD: null }));
                    }} 
                    className={errors.aceiteLGPD ? 'border-red-500' : ''}
                  />
                  <div>
                    <Label htmlFor="aceiteLGPD" className="cursor-pointer">Autorizo o tratamento dos meus dados conforme a LGPD *</Label>
                    {errors.aceiteLGPD && <p className="text-sm text-red-600 mt-1">{errors.aceiteLGPD}</p>}
                  </div>
                </div>
              </div>
              {errors.geral && <p className="text-sm text-red-600 mt-4 text-center">{errors.geral}</p>}
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <style>
        {`
          .glass-effect {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
        `}
      </style>

      <div className="w-full max-w-4xl z-10">
        <div className="text-center mb-8">
           <div className="inline-block p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg mb-4">
              <Sparkles className="w-10 h-10 text-rose-500" />
           </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Quase lá!
          </h1>
          <p className="text-gray-600 text-lg">
            Siga os passos para configurar sua empresa.
          </p>
        </div>
        
        <StepIndicator currentStep={step} steps={steps} />

        <form onSubmit={handleSubmit} className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
          
          <div className="flex justify-between items-center pt-8">
            <div>
              {step > 1 && (
                <Button type="button" variant="outline" size="lg" onClick={handleBack} className="bg-white/80">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
                </Button>
              )}
            </div>
            <div>
              {step < steps.length && (
                <Button type="button" size="lg" onClick={handleNext} className="bg-rose-500 hover:bg-rose-600 shadow-lg">
                  Próximo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              {step === steps.length && (
                <Button type="submit" size="lg" disabled={loading} className="bg-green-500 hover:bg-green-600 shadow-lg">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Finalizando...</> : "Finalizar Cadastro"}
                  {!loading && <CheckCircle className="w-4 h-4 ml-2" />}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
