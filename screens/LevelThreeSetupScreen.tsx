import React, { useState } from 'react';
import { Commitment, CommitmentType } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { formatCurrency, parseCurrencyInput, calculateTotalCommitments, calculateRunway } from '../utils';
import { Building2, Users, Wrench, ChevronLeft, Trash2, Plus, Lock, Wallet } from 'lucide-react';

interface LevelThreeSetupScreenProps {
  onComplete: (balance: number, commitments: Commitment[]) => void;
  onCancel: () => void;
}

export const LevelThreeSetupScreen: React.FC<LevelThreeSetupScreenProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [balanceInput, setBalanceInput] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  
  // Commitment Form State
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState<CommitmentType>('PEOPLE');

  const handleAddCommitment = () => {
    if (!newName || !newValue) return;
    const val = parseCurrencyInput(newValue);
    if (val <= 0) return;

    const newCommitment: Commitment = {
      id: Date.now().toString(),
      name: newName,
      value: val,
      type: newType
    };

    setCommitments([...commitments, newCommitment]);
    setNewName('');
    setNewValue('');
  };

  const removeCommitment = (id: string) => {
    setCommitments(commitments.filter(c => c.id !== id));
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numberValue = parseCurrencyInput(rawValue);
    setCurrentBalance(numberValue);
    setBalanceInput(formatCurrency(numberValue));
  };

  // --- Step 1: Invite ---
  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="bg-slate-800 p-4 rounded-full mb-6 text-white ring-4 ring-slate-200">
          <Building2 className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Sua empresa deixou de ser só você?
        </h2>
        <p className="text-slate-500 mb-8 text-lg">
          Equipe, ferramentas, custos fixos... Vamos organizar isso para você crescer sem perder o controle.
        </p>

        <div className="space-y-3 w-full">
            <Button onClick={() => setStep(2)} fullWidth size="lg">
              Organizar Estrutura
            </Button>
            <Button variant="ghost" onClick={onCancel} fullWidth>
              Agora não
            </Button>
        </div>
      </div>
    );
  }

  // --- Step 2: Reserve Balance ---
  if (step === 2) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col max-w-md mx-auto">
        <button onClick={() => setStep(1)} className="text-slate-400 mb-4 flex items-center gap-1 text-sm font-medium">
            <ChevronLeft size={16}/> Voltar
        </button>

        <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Primeiro, uma pergunta.</h2>
            <p className="text-slate-500 mb-6">
                Quanto dinheiro sua empresa tem guardado hoje (na conta PJ ou investimentos)?
            </p>

            <Input 
                autoFocus
                label="Saldo Atual (R$)"
                value={balanceInput}
                onChange={handleBalanceChange}
                placeholder="R$ 0,00"
                helperText="Isso serve para calcularmos a segurança da sua empresa."
            />
        </div>

        <Button onClick={() => setStep(3)} fullWidth>Continuar</Button>
      </div>
    );
  }

  // --- Step 3: Commitments List ---
  if (step === 3) {
    const totalCommitments = calculateTotalCommitments(commitments);
    
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col max-w-md mx-auto">
        <button onClick={() => setStep(2)} className="text-slate-400 mb-4 flex items-center gap-1 text-sm font-medium">
            <ChevronLeft size={16}/> Voltar
        </button>

        <h2 className="text-xl font-bold text-slate-900 mb-1">Compromissos Fixos</h2>
        <p className="text-slate-500 mb-6 text-sm">O que sua empresa paga todo mês para existir?</p>

        {/* List of added items */}
        <div className="space-y-3 mb-6">
            {commitments.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                            item.type === 'PEOPLE' ? 'bg-blue-50 text-blue-600' :
                            item.type === 'SERVICE' ? 'bg-orange-50 text-orange-600' :
                            'bg-slate-100 text-slate-600'
                        }`}>
                            {item.type === 'PEOPLE' && <Users size={18} />}
                            {item.type === 'SERVICE' && <Wrench size={18} />}
                            {item.type === 'OBLIGATION' && <Building2 size={18} />}
                        </div>
                        <div>
                            <p className="font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-400">
                                {item.type === 'PEOPLE' ? 'Equipe' : item.type === 'SERVICE' ? 'Serviço' : 'Obrigação'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-700">{formatCurrency(item.value)}</span>
                        <button onClick={() => removeCommitment(item.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
            
            {commitments.length === 0 && (
                <div className="text-center py-8 bg-slate-100/50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-400 text-sm">Nenhum compromisso adicionado ainda.</p>
                </div>
            )}
        </div>

        {/* Add Form */}
        <Card className="bg-slate-50 border-slate-200 mb-20">
            <div className="grid grid-cols-3 gap-2 mb-3">
                <button 
                    onClick={() => setNewType('PEOPLE')}
                    className={`p-2 rounded-lg text-xs font-bold transition-colors ${newType === 'PEOPLE' ? 'bg-blue-100 text-blue-700' : 'bg-white text-slate-500'}`}
                >
                    Pessoas
                </button>
                <button 
                    onClick={() => setNewType('SERVICE')}
                    className={`p-2 rounded-lg text-xs font-bold transition-colors ${newType === 'SERVICE' ? 'bg-orange-100 text-orange-700' : 'bg-white text-slate-500'}`}
                >
                    Serviços
                </button>
                <button 
                    onClick={() => setNewType('OBLIGATION')}
                    className={`p-2 rounded-lg text-xs font-bold transition-colors ${newType === 'OBLIGATION' ? 'bg-slate-200 text-slate-700' : 'bg-white text-slate-500'}`}
                >
                    Obrigação
                </button>
            </div>
            <div className="space-y-3">
                <input 
                    placeholder="Nome (ex: João, Contador, Internet)" 
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                />
                <div className="flex gap-2">
                    <input 
                        placeholder="R$ 0,00" 
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                        value={newValue}
                        onChange={(e) => {
                           const val = parseCurrencyInput(e.target.value);
                           setNewValue(formatCurrency(val));
                        }}
                    />
                    <Button size="sm" onClick={handleAddCommitment} disabled={!newName || !newValue}>
                        <Plus size={20} />
                    </Button>
                </div>
            </div>
        </Card>

        {/* Footer Sum */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 font-medium">Total Mensal</span>
                <span className="text-xl font-bold text-slate-900">{formatCurrency(totalCommitments)}</span>
            </div>
            <Button onClick={() => setStep(4)} fullWidth disabled={commitments.length === 0}>
                Finalizar Estrutura
            </Button>
        </div>
      </div>
    );
  }

  // --- Step 4: Summary / Runway ---
  if (step === 4) {
    const totalCommitments = calculateTotalCommitments(commitments);
    const months = calculateRunway(currentBalance, totalCommitments);
    
    let statusColor = "bg-emerald-100 text-emerald-700";
    let statusText = "Seguro";
    let message = "Sua empresa tem fôlego.";
    
    if (months < 1) {
        statusColor = "bg-red-100 text-red-700";
        statusText = "Perigo";
        message = "Sua empresa trava se o faturamento parar.";
    } else if (months < 3) {
        statusColor = "bg-yellow-100 text-yellow-700";
        statusText = "Atenção";
        message = "O ideal é ter pelo menos 3 meses de segurança.";
    }

    return (
       <div className="min-h-screen bg-slate-50 p-6 flex flex-col max-w-md mx-auto">
         <div className="flex-1 flex flex-col items-center justify-center">
            
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Raio-X da Estrutura</h2>

            <Card className="w-full mb-6 relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Saldo em Caixa</p>
                        <p className="text-2xl font-bold text-indigo-600">{formatCurrency(currentBalance)}</p>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-500">
                        <Wallet size={20} />
                    </div>
                </div>

                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Custo Fixo Mensal</p>
                        <p className="text-xl font-bold text-slate-900">{formatCurrency(totalCommitments)}</p>
                    </div>
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-500">
                        <Lock size={20} />
                    </div>
                </div>
                
                <div className="border-t border-slate-100 pt-4">
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Segurança (Runway)</p>
                     <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusColor}`}>
                            {months > 12 ? '12+' : months.toFixed(1)} Meses
                        </span>
                        <span className="text-sm text-slate-500">{statusText}</span>
                     </div>
                </div>
            </Card>

            <p className="text-center text-slate-500 max-w-xs">
                {message}
            </p>

         </div>
         <Button onClick={() => onComplete(currentBalance, commitments)} fullWidth>
            Acessar Painel
         </Button>
       </div>
    );
  }

  return null;
};