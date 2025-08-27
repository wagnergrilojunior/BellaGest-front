
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Cliente } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, User, Upload, Calendar as CalendarIcon, MapPin, Info, Phone, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function EditarCliente() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [dataNascimento, setDataNascimento] = useState(null);
  const [dados, setDados] = useState(null);
  const [clienteId, setClienteId] = useState(null);
  const [novaTag, setNovaTag] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      setClienteId(id);
      const fetchCliente = async () => {
        try {
          const clienteData = await Cliente.get(id);

          // Garantir que campos obrigatórios existam e inicializar valores padrão
          const dadosProcessados = {
            ...clienteData,
            endereco: clienteData.endereco || {
              rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "", cep: ""
            },
            tags: clienteData.tags || [],
            whatsapp_mesmo_numero: clienteData.whatsapp_mesmo_numero ?? true, // Default to true if undefined
            consentimento_lgpd: clienteData.consentimento_lgpd ?? false // Default to false if undefined
          };

          setDados(dadosProcessados);

          if (clienteData.data_nascimento) {
            setDataNascimento(parseISO(clienteData.data_nascimento));
          }
        } catch (error) {
          console.error("Erro ao buscar cliente:", error);
          navigate(createPageUrl("Clientes"));
        } finally {
          setFormLoading(false);
        }
      };
      fetchCliente();
    } else {
      navigate(createPageUrl("Clientes"));
    }
  }, [location.search, navigate]);

  const validate = () => {
    if (!dados) return false;
    const newErrors = {};
    if (!dados.nome || !dados.nome.trim()) newErrors.nome = "O nome completo é obrigatório.";
    if (!dados.telefone || !dados.telefone.trim()) newErrors.telefone = "O telefone é obrigatório.";
    if (!dados.endereco || !dados.endereco.cep || !dados.endereco.cep.trim()) newErrors['endereco.cep'] = "O CEP é obrigatório.";
    if (dados.email && !/\S+@\S+\.\S+/.test(dados.email)) newErrors.email = "O formato do email é inválido.";
    if (!dados.consentimento_lgpd) newErrors.consentimento_lgpd = "O consentimento LGPD é obrigatório para prosseguir.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id.startsWith('endereco.')) {
      const campo = id.split('.')[1];
      setDados(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [campo]: value
        }
      }));
    } else {
      setDados(prev => ({ ...prev, [id]: value }));
    }
    // Limpa o erro do campo ao ser alterado
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: null }));
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
            cep: data.cep,
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            uf: data.uf
          }
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setCepError("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setCepLoading(false);
    }
  };

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const { file_url } = await UploadFile({ file });
      setDados(prev => ({ ...prev, foto_perfil: file_url }));
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
    }
    setUploadingPhoto(false);
  };

  const adicionarTag = () => {
    if (novaTag.trim() && dados && !dados.tags.includes(novaTag.trim())) {
      setDados(prev => ({
        ...prev,
        tags: [...prev.tags, novaTag.trim()]
      }));
      setNovaTag("");
    }
  };

  const removerTag = (tagParaRemover) => {
    setDados(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagParaRemover)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setLoading(true);
    try {
      const dadosParaEnviar = {
        ...dados,
        // Ensure data_nascimento is formatted to YYYY-MM-DD or empty string
        data_nascimento: dataNascimento ? format(dataNascimento, 'yyyy-MM-dd') : "",
        // Set whatsapp based on whatsapp_mesmo_numero checkbox
        whatsapp: dados.whatsapp_mesmo_numero ? dados.telefone : dados.whatsapp,
        data_consentimento_lgpd: dados.consentimento_lgpd && !dados.data_consentimento_lgpd ? new Date().toISOString() : dados.data_consentimento_lgpd
      };

      await Cliente.update(clienteId, dadosParaEnviar);
      navigate(createPageUrl("Clientes"));
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
    }
    setLoading(false);
  };

  if (formLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate(createPageUrl("Clientes"))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold">Editar Cliente</h1>
              <p className="text-gray-600">Atualize os dados do cliente.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="pessoal" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 mb-6">
              <TabsTrigger value="pessoal"><User className="w-4 h-4 mr-2" />Dados Pessoais</TabsTrigger>
              <TabsTrigger value="contato"><Phone className="w-4 h-4 mr-2" />Contato</TabsTrigger>
              <TabsTrigger value="endereco"><MapPin className="w-4 h-4 mr-2" />Endereço</TabsTrigger>
              <TabsTrigger value="adicionais"><Info className="w-4 h-4 mr-2" />Informações Adicionais</TabsTrigger>
            </TabsList>

            {/* Aba Dados Pessoais */}
            <TabsContent value="pessoal">
              <Card className="glass-effect border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Foto */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {dados.foto_perfil ? (
                        <img
                          src={dados.foto_perfil}
                          alt="Foto do cliente"
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                          <User className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="foto">Foto do Cliente</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <input
                          type="file"
                          id="foto"
                          accept="image/*"
                          onChange={handleUploadFoto}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('foto').click()}
                          disabled={uploadingPhoto}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingPhoto ? 'Enviando...' : 'Alterar Foto'}
                        </Button>
                        {dados.foto_perfil && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setDados(prev => ({ ...prev, foto_perfil: "" }))}
                            className="text-red-600"
                          >
                            Remover
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={dados.nome || ''}
                      onChange={handleChange}
                      placeholder="Digite o nome completo"
                      className={errors.nome ? "border-red-500" : ""}
                    />
                    {errors.nome && <p className="text-sm text-red-600 mt-1">{errors.nome}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dataNascimento ? format(dataNascimento, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dataNascimento}
                            onSelect={setDataNascimento}
                            initialFocus
                            locale={ptBR}
                            captionLayout="dropdown-buttons"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="genero">Gênero</Label>
                      <select
                        id="genero"
                        value={dados.genero || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      >
                        <option value="">Selecione</option>
                        <option value="feminino">Feminino</option>
                        <option value="masculino">Masculino</option>
                        <option value="outro">Outro</option>
                        <option value="nao_informar">Não informar</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={dados.status || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Contato */}
            <TabsContent value="contato">
              <Card className="glass-effect border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input
                        id="telefone"
                        value={dados.telefone || ''}
                        onChange={handleChange}
                        placeholder="(11) 99999-9999"
                        className={errors.telefone ? "border-red-500" : ""}
                      />
                      {errors.telefone && <p className="text-sm text-red-600 mt-1">{errors.telefone}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="whatsapp_mesmo_numero"
                        checked={dados.whatsapp_mesmo_numero}
                        onCheckedChange={(checked) => setDados(prev => ({ ...prev, whatsapp_mesmo_numero: checked }))}
                      />
                      <Label htmlFor="whatsapp_mesmo_numero">Este número também é WhatsApp</Label>
                    </div>

                    {!dados.whatsapp_mesmo_numero && (
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <Input
                          id="whatsapp"
                          value={dados.whatsapp || ''}
                          onChange={handleChange}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={dados.email || ''}
                      onChange={handleChange}
                      placeholder="cliente@exemplo.com"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Endereço */}
            <TabsContent value="endereco">
              <Card className="glass-effect border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="endereco.cep">CEP *</Label>
                        <div className="relative">
                          <Input
                            id="endereco.cep"
                            value={dados.endereco.cep || ''}
                            onChange={handleChange}
                            onBlur={handleCepBlur}
                            placeholder="Digite o CEP"
                            maxLength={9}
                            className={errors['endereco.cep'] ? "border-red-500" : ""}
                          />
                          {cepLoading && <div className="absolute right-3 top-2.5 h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status" />}
                        </div>
                        {errors['endereco.cep'] && <p className="text-sm text-red-600 mt-1">{errors['endereco.cep']}</p>}
                        {cepError && <p className="text-sm text-red-600 mt-1">{cepError}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-3 space-y-2">
                        <Label htmlFor="endereco.rua">Rua</Label>
                        <Input id="endereco.rua" value={dados.endereco.rua || ''} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endereco.numero">Número</Label>
                        <Input id="endereco.numero" value={dados.endereco.numero || ''} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="endereco.complemento">Complemento</Label>
                        <Input id="endereco.complemento" value={dados.endereco.complemento || ''} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endereco.bairro">Bairro</Label>
                        <Input id="endereco.bairro" value={dados.endereco.bairro || ''} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <Label htmlFor="endereco.cidade">Cidade</Label>
                        <Input id="endereco.cidade" value={dados.endereco.cidade || ''} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endereco.uf">UF</Label>
                        <Input id="endereco.uf" value={dados.endereco.uf || ''} onChange={handleChange} maxLength={2} />
                      </div>
                    </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba Informações Adicionais */}
            <TabsContent value="adicionais">
              <div className="space-y-6">
                <Card className="glass-effect border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Informações Complementares</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Tags/Categorias</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Digite uma tag"
                          value={novaTag}
                          onChange={(e) => setNovaTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarTag())}
                        />
                        <Button type="button" onClick={adicionarTag} variant="outline">
                          Adicionar
                        </Button>
                      </div>
                      {dados.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {dados.tags.map(tag => (
                            <div key={tag} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                              {tag}
                              <button type="button" onClick={() => removerTag(tag)} className="text-blue-600 hover:text-blue-800">
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        value={dados.observacoes || ''}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Observações sobre o cliente, preferências, alergias, etc."
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className={`glass-effect border-0 shadow-lg ${errors.consentimento_lgpd ? 'border border-red-500' : ''}`}>
                   <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> LGPD</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-3">
                        <Checkbox
                          id="consentimento_lgpd"
                          checked={dados.consentimento_lgpd}
                          onCheckedChange={(checked) => {
                            setDados(prev => ({ ...prev, consentimento_lgpd: checked }));
                            if (errors.consentimento_lgpd) {
                                setErrors(prev => ({ ...prev, consentimento_lgpd: null }));
                            }
                          }}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="consentimento_lgpd" className="font-medium">
                            Consentimento LGPD *
                          </Label>
                          <p className="text-sm text-gray-600">
                            O cliente autoriza o tratamento de seus dados pessoais para finalidades de prestação de serviços,
                            comunicação e marketing, conforme nossa Política de Privacidade.
                          </p>
                        </div>
                      </div>
                      {dados.data_consentimento_lgpd && (
                        <p className="text-xs text-gray-500 mt-2">
                          Consentimento dado em: {format(new Date(dados.data_consentimento_lgpd), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      )}
                      {errors.consentimento_lgpd && <p className="text-sm text-red-600 mt-2 pl-8">{errors.consentimento_lgpd}</p>}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => navigate(createPageUrl("Clientes"))}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
