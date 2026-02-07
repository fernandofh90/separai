import React, { useState } from 'react';
import { UserProfile, AllocationConfig } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { formatCurrency, calculateAllocation } from '../utils';
import { Shield, Rocket, ChevronLeft, Info } from 'lucide-react';

interface LevelTwoSetupScreenProps {
  userProfile: UserProfile;
  onComplete: (allocations: { reserve: AllocationConfig; growth: AllocationConfig }) => void;
  onCancel: () => void;
}

export const LevelTwoSetupScreen: React.FC<LevelTwoSetupScreenProps> = ({ userProfile, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [reserveConfig, setReserveConfig] = useState<AllocationConfig>({ 
    enabled: true, 
    type: 'PERCENTAGE', 
    value: 10 
  });
  const [growthConfig, setGrowthConfig] = useState<AllocationConfig>({ 
    enabled: true, 
    type: 'PERCENTAGE', 
    value: 5 
  });

  const revenue = userProfile.monthlyRevenue;

  // --- Introduction Screen ---
  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="bg-indigo-100 p-4 rounded-full mb-6 text-indigo-600 ring-4 ring-indigo-50">
          <Shield className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Sua empresa está crescendo?
        </h2>
        <p className="text-slate-500 mb-8 text-lg">
          Vamos organizar o dinheiro para que você nunca mais fique no sufoco e tenha caixa para investir.
        </p>

        <div className="space-y-3 w-full">
            <Button onClick={() => setStep(2)} fullWidth size="lg">
            Vamos organizar
            </Button>
            <Button variant="ghost" onClick={onCancel} fullWidth>
            Agora não
            </Button>
        </div>
      </div>
    );
  }

  // --- Reserve Setup ---
  if (step === 2) {
    const currentReserve = calculateAllocation(revenue, reserveConfig);
    
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col max-w-md mx-auto">
        <button onClick={() => setStep(1)} className="text-slate-400 mb-4 flex items-center gap-1 text-sm font-medium">
            <ChevronLeft size={16}/> Voltar
        </button>

        <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
                <Shield className="text-indigo-600" size={28} />
                <h2 className="text-2xl font-bold text-slate-900">Reserva de Emergência</h2>
            </div>
            <p className="text-slate-500 mb-8">
                Esse dinheiro mantém sua empresa viva em meses ruins. É o "fôlego" do negócio.
            </p>

            <Card className="mb-8 border-indigo-100 bg-white">
                <div className="text-center py-2">
                    <span className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Você vai separar
                    </span>
                    <span className="text-3xl font-bold text-indigo-600">
                        {formatCurrency(currentReserve)}
                    </span>
                    <span className="block text-xs text-slate-400 mt-1">todo mês</span>
                </div>
            </Card>

            <div className="mb-6">
                <div className="flex justify-between mb-2">
                    <label className="font-medium text-slate-700">Porcentagem do Faturamento</label>
                    <span className="font-bold text-indigo-600">{reserveConfig.value}%</span>
                </div>
                <input 
                    type="range" 
                    min="1" 
                    max="30" 
                    step="1"
                    value={reserveConfig.value}
                    onChange={(e) => setReserveConfig({...reserveConfig, value: Number(e.target.value)})}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>1% (Mínimo)</span>
                    <span>30% (Conservador)</span>
                </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl flex gap-3 items-start">
                <Info className="text-indigo-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-indigo-800 leading-relaxed">
                    Dica: Comece com pouco (5% ou 10%). O importante é criar o hábito de não gastar tudo o que entra.
                </p>
            </div>
        </div>

        <Button onClick={() => setStep(3)} fullWidth>Próximo: Crescimento</Button>
      </div>
    );
  }

  // --- Growth Setup ---
  if (step === 3) {
    const currentGrowth = calculateAllocation(revenue, growthConfig);
    
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col max-w-md mx-auto">
        <button onClick={() => setStep(2)} className="text-slate-400 mb-4 flex items-center gap-1 text-sm font-medium">
            <ChevronLeft size={16}/> Voltar
        </button>

        <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
                <Rocket className="text-orange-500" size={28} />
                <h2 className="text-2xl font-bold text-slate-900">Caixa de Crescimento</h2>
            </div>
            <p className="text-slate-500 mb-8">
                Dinheiro para investir, comprar equipamentos ou fazer marketing sem tirar do bolso.
            </p>

            <Card className="mb-8 border-orange-100 bg-white">
                <div className="text-center py-2">
                    <span className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Você vai investir
                    </span>
                    <span className="text-3xl font-bold text-orange-500">
                        {formatCurrency(currentGrowth)}
                    </span>
                    <span className="block text-xs text-slate-400 mt-1">todo mês</span>
                </div>
            </Card>

            <div className="mb-6">
                <div className="flex justify-between mb-2">
                    <label className="font-medium text-slate-700">Porcentagem do Faturamento</label>
                    <span className="font-bold text-orange-500">{growthConfig.value}%</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    step="1"
                    value={growthConfig.value}
                    onChange={(e) => setGrowthConfig({...growthConfig, value: Number(e.target.value)})}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                 <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>0% (Agora não)</span>
                    <span>20% (Agressivo)</span>
                </div>
            </div>
             
             {growthConfig.value === 0 && (
                <div className="bg-orange-50 p-4 rounded-xl text-center text-sm text-orange-800 mb-4">
                    Sem problemas. Você pode ativar isso quando se sentir mais confortável.
                </div>
             )}

        </div>

        <Button onClick={() => onComplete({ reserve: reserveConfig, growth: growthConfig })} fullWidth>
            Concluir Organização
        </Button>
      </div>
    );
  }

  return null;
};