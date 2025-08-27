import React from 'react';
import { User } from '@/api/entities';
import { Sparkles, KeyRound } from 'lucide-react';

export default function Entrar() {
  const handleLogin = () => {
    // A função User.login() redireciona para a autenticação do Google
    User.login();
  };

  const handlePasswordReset = () => {
    // Redireciona para a página de recuperação de conta do Google
    window.location.href = 'https://accounts.google.com/signin/recovery';
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center" 
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556760544-74068565f05c?q=80&w=1887&auto=format&fit=crop')" }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 text-white p-8 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-9 h-9 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-3">
          BellaGest
        </h1>
        <p className="text-white/80 mb-8">
          Sua plataforma completa para gestão de beleza.
        </p>
        
        <button
          onClick={handleLogin}
          className="w-full bg-white/90 hover:bg-white text-rose-600 font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Entrar com Google
        </button>
        
        <div className="mt-6 text-center">
            <button
              onClick={handlePasswordReset}
              className="text-sm text-white/70 hover:text-white hover:underline transition-colors"
            >
              Esqueci minha senha
            </button>
        </div>

        <p className="text-xs text-white/60 mt-6">
          Ao continuar, você concorda com nossos <a href="#" className="underline hover:text-white">Termos de Serviço</a> e <a href="#" className="underline hover:text-white">Política de Privacidade</a>.
        </p>
      </div>
    </div>
  );
}