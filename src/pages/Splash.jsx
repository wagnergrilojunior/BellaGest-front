import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    // Este tempo de espera simula a configuração do ambiente e garante
    // que todas as informações do cadastro sejam processadas antes de ir para o dashboard.
    const timer = setTimeout(() => {
      navigate(createPageUrl('Dashboard'));
    }, 4000); // 4 segundos de espera

    return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center p-8"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 1
          }}
          className="inline-block p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl mb-8"
        >
          <Sparkles className="w-16 h-16 text-rose-500" />
        </motion.div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Preparando seu ambiente...
        </h1>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          Isso pode levar alguns segundos. Estamos configurando tudo para você ter a melhor experiência!
        </p>
        
        <div className="mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto"></div>
        </div>
      </motion.div>
    </div>
  );
}