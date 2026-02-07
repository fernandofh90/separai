import React, { useState, useEffect } from 'react';
import { TransactionType } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { formatCurrency, parseCurrencyInput } from '../utils';
import { X, TrendingUp, TrendingDown, Shield, Wallet, Building2, Rocket, Lock } from 'lucide-react';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: number, description: string) => void;
  type: TransactionType;
  title: string;
  subtitle?: string;
  suggestedValue?: number;
  initialDescription?: string;
}

export const ActionModal: React.FC<ActionModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type, 
  title, 
  subtitle,
  suggestedValue = 0,
  initialDescription = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [description, setDescription] = useState('');

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setInputValue(suggestedValue > 0 ? formatCurrency(suggestedValue) : '');
      setDescription(initialDescription);
    }
  }, [isOpen, suggestedValue, initialDescription]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const value = parseCurrencyInput(inputValue);
    if (value <= 0 || !description.trim()) return;
    onConfirm(value, description);
    onClose();
  };

  const getIcon = () => {
    switch (type) {
        case 'INCOME': return <TrendingUp className="text-emerald-500" size={32} />;
        case 'TAX': return <Building2 className="text-orange-500" size={32} />;
        case 'SALARY': return <Wallet className="text-emerald-500" size={32} />;
        case 'RESERVE': return <Shield className="text-indigo-500" size={32} />;
        case 'GROWTH': return <Rocket className="text-blue-500" size={32} />;
        case 'COST': return <Lock className="text-slate-500" size={32} />;
        default: return <TrendingDown className="text-slate-500" size={32} />;
    }
  };

  const isValid = parseCurrencyInput(inputValue) > 0 && description.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
           <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full">
             <X size={20} />
           </button>
           <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{new Date().toLocaleDateString()}</span>
        </div>

        <div className="p-6">
            <div className="flex flex-col items-center text-center mb-6">
                <div className="bg-slate-50 p-4 rounded-full mb-3 ring-4 ring-slate-50">
                    {getIcon()}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
            </div>

            <div className="space-y-4">
                <Input 
                    autoFocus
                    label="Valor (R$)"
                    value={inputValue}
                    onChange={(e) => {
                        const val = parseCurrencyInput(e.target.value);
                        setInputValue(formatCurrency(val));
                    }}
                    placeholder="R$ 0,00"
                    className="text-center font-bold text-2xl"
                />

                <Input 
                    label="Descrição (Obrigatório)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={type === 'INCOME' ? "Ex: Cliente X" : "Ex: Mensalidade"}
                />
            </div>

            <div className="mt-8">
                <Button fullWidth onClick={handleConfirm} disabled={!isValid}>
                    Confirmar
                </Button>
            </div>
        </div>

      </div>
    </div>
  );
};