import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCircle, Settings, Camera, Shield, KeyRound, Save, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ConfiguracoesUsuario() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (e) {
        console.error("Erro ao carregar dados do usuário:", e);
        setError("Não foi possível carregar os dados do usuário.");
      } finally {
        setLoading(false);
      }
    };
    carregarUsuario();
  }, []);

  const handleFieldChange = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const { file_url } = await UploadFile({ file });
      await User.updateMyUserData({ foto_perfil: file_url });
      setUser(prev => ({ ...prev, foto_perfil: file_url }));
      setSuccess("Foto de perfil atualizada!");
    } catch (err) {
      console.error("Erro ao fazer upload da foto:", err);
      setError("Falha no upload da foto. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await User.updateMyUserData({
        full_name: user.full_name
      });
      setSuccess("Dados salvos com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar dados:", err);
      setError("Não foi possível salvar os dados. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <Card>
            <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="space-y-2"><Skeleton className="h-6 w-32" /><Skeleton className="h-4 w-24" /></div>
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 md:p-8 text-center">
        <AlertCircle className="mx-auto w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold">Erro</h2>
        <p className="text-gray-600">{error || "Usuário não encontrado."}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50/50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-gray-700" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Configurações da Conta</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais e de segurança.</p>
          </div>
        </div>

        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert"><p>{error}</p></div>}
        {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert"><p>{success}</p></div>}

        <form onSubmit={handleSaveChanges}>
          <Card className="mb-8 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCircle className="w-5 h-5 text-gray-700" /> Meu Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={user.foto_perfil || `https://ui-avatars.com/api/?name=${user.full_name}&background=random`}
                    alt="Foto de perfil"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  <label htmlFor="photo-upload" className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full cursor-pointer shadow-md border hover:bg-gray-100">
                    <Camera className="w-4 h-4 text-gray-600" />
                    <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
                  </label>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{user.full_name}</h3>
                  <p className="text-gray-500">{user.email}</p>
                   {uploading && <p className="text-sm text-blue-600 mt-1">Enviando foto...</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={user.full_name}
                  onChange={(e) => handleFieldChange('full_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
                <p className="text-xs text-gray-500">O email não pode ser alterado.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="user_id">ID do Usuário</Label>
                <Input id="user_id" value={user.id} disabled />
                <p className="text-xs text-gray-500">Este é o seu identificador único no sistema.</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>

        <Card className="mt-8 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-gray-700" /> Segurança</CardTitle>
            <CardDescription>
              Para alterar sua senha, utilize o fluxo de "Esqueci minha senha" na tela de login.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <KeyRound className="w-6 h-6"/>
                  <div>
                    <p className="font-semibold">Alteração de Senha</p>
                    <p className="text-sm">Por razões de segurança, a alteração de senha é gerenciada diretamente pela nossa plataforma de autenticação. Se precisar redefinir sua senha, por favor, saia da sua conta e clique em "Esqueci minha senha" na página de login.</p>
                  </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}