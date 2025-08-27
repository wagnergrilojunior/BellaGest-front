
import React, { useState, useEffect } from "react";
import { Empresa, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, KeyRound, Mail, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function SegurancaTab({ empresaId, email }) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingSalvar, setLoadingSalvar] = useState(false);
  const [loadingGerar, setLoadingGerar] = useState(false); // Renamed from loadingEnviar
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    const carregarEmpresa = async () => {
      if (!empresaId) return;
      try {
        const empresas = await Empresa.filter({ id: empresaId });
        if (empresas.length > 0) {
          setEmpresa(empresas[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar empresa:', error);
        setError("Não foi possível carregar os dados da empresa para esta aba.");
      }
    };
    carregarEmpresa();
  }, [empresaId]);

  const handleSalvarSenha = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!novaSenha || !confirmarSenha) {
      setError("Preencha ambos os campos de senha.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setError("As senhas não coincidem.");
      return;
    }
    if (novaSenha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoadingSalvar(true);
    try {
      await Empresa.update(empresaId, { senha: novaSenha });
      setSuccess("Senha atualizada com sucesso!");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err) {
      setError("Erro ao atualizar a senha. Tente novamente.");
      console.error(err);
    } finally {
      setLoadingSalvar(false);
    }
  };

  const handleGerarSenha = async () => {
    setError("");
    setSuccess("");
    setLoadingGerar(true);

    try {
      const generatedPassword = Math.random().toString(36).slice(-8);
      await Empresa.update(empresaId, { senha: generatedPassword });

      // Display the password for the admin to copy
      setSuccess(`Nova senha gerada com sucesso! Senha: ${generatedPassword}`);
    } catch (err) {
      setError("Erro ao gerar a nova senha. Tente novamente.");
      console.error(err);
    } finally {
      setLoadingGerar(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <Card className="glass-effect border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Alterar Senha Manualmente
          </CardTitle>
          <CardDescription>Defina uma nova senha de acesso para esta empresa.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSalvarSenha} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="novaSenha">Nova Senha</Label>
              <div className="relative">
                <Input 
                  id="novaSenha" 
                  type={showPassword ? "text" : "password"} 
                  value={novaSenha} 
                  onChange={(e) => setNovaSenha(e.target.value)} 
                  placeholder="Mínimo 6 caracteres"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
              <Input 
                id="confirmarSenha" 
                type={showPassword ? "text" : "password"}
                value={confirmarSenha} 
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={loadingSalvar} className="bg-gradient-to-r from-indigo-500 to-purple-500">
                {loadingSalvar ? "Salvando..." : "Salvar Nova Senha"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-effect border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Gerar Nova Senha
          </CardTitle>
          <CardDescription>
            Gere uma senha aleatória para a empresa. Você deverá copiar a senha e enviá-la manualmente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={handleGerarSenha} 
            disabled={loadingGerar}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <KeyRound className="w-4 h-4 mr-2" />
            {loadingGerar ? "Gerando..." : "Gerar Senha Aleatória"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">
              {success.split('Senha:')[0]}
            </p>
            {success.includes('Senha:') && (
              <p className="font-mono bg-green-100 p-1 rounded select-all mt-1">
                {success.split('Senha:')[1].trim()}
              </p>
            )}
            <p className="text-xs text-green-600 mt-2">Copie a senha e envie para a empresa.</p>
          </div>
        </div>
      )}
    </div>
  );
}
