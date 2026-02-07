import React from 'react';
import { ArrowRight, Wallet } from 'lucide-react';
import { Button } from '../components/Button';

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-between p-8 relative overflow-hidden">
      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
        <div className="bg-emerald-500/10 p-4 rounded-2xl mb-8 ring-1 ring-emerald-500/30">
          <Wallet className="w-12 h-12 text-emerald-400" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
          Separe o dinheiro da empresa do <span className="text-emerald-400">seu pessoal</span>.
        </h1>
        
        <p className="text-slate-400 text-lg max-w-xs">
          Simples. Sem planilhas.<br/>Sem confusão.
        </p>
      </div>

      <div className="w-full max-w-md z-10 pb-8">
        <Button onClick={onStart} fullWidth size="lg" className="group">
          Começar
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};