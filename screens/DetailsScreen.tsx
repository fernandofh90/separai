import React, { useState } from 'react';
import { UserProfile, Transaction, TransactionType } from '../types';
import { calculateTax, formatCurrency, formatDate, calculateAllocation, calculateTotalCommitments, sumTransactionsByType } from '../utils';
import { ChevronLeft, TrendingUp, TrendingDown, HelpCircle, Shield, Rocket, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

interface DetailsScreenProps {
  userProfile: UserProfile;
  onBack: () => void;
}

export const DetailsScreen: React.FC<DetailsScreenProps> = ({ userProfile, onBack }) => {
  // We use sumTransactionsByType for Actuals, but for the "Waterfall" logic we might want to mix targets and actuals.
  // However, the previous logic used static revenue. Let's adapt to dynamic actuals for consistency with Dashboard.
  
  const totalIncome = sumTransactionsByType(userProfile.transactions, 'INCOME');
  
  // Targets (What SHOULD be) - Used for waterfall logic explanation? 
  // Or should we show ACTUAL cash flow? 
  // The user wants a "Detailed Report". Usually this means Actuals.
  // But the "Surplus" calculation relies on deductions.
  
  const actualTax = sumTransactionsByType(userProfile.transactions, 'TAX');
  const actualReserve = sumTransactionsByType(userProfile.transactions, 'RESERVE');
  const actualGrowth = sumTransactionsByType(userProfile.transactions, 'GROWTH');
  const actualCosts = sumTransactionsByType(userProfile.transactions, 'COST');
  const actualSalary = sumTransactionsByType(userProfile.transactions, 'SALARY');

  const surplus = totalIncome - actualTax - actualReserve - actualGrowth - actualCosts - actualSalary;

  // Expansion State
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const TransactionList = ({ type }: { type: TransactionType }) => {
      const list = userProfile.transactions.filter(t => t.type === type);
      
      if (list.length === 0) return (
          <div className="bg-slate-50 p-3 text-center rounded-b-lg border-t border-slate-100">
             <span className="text-xs text-slate-400">Nenhum registro.</span>
          </div>
      );

      return (
          <div className="bg-slate-50 p-2 rounded-b-lg border-t border-slate-100 space-y-1">
              {list.map(t => (
                  <div key={t.id} className="flex justify-between items-center text-xs p-2 hover:bg-slate-100 rounded">
                      <div className="flex flex-col">
                          <span className="text-slate-500 font-mono">{formatDate(t.date)}</span>
                          <span className="font-medium text-slate-700">{t.description}</span>
                      </div>
                      <span className="font-bold text-slate-700">{formatCurrency(t.value)}</span>
                  </div>
              ))}
          </div>
      );
  };

  const DetailRow = ({ 
      id, 
      icon, 
      colorClass, 
      bgClass, 
      title, 
      subtitle, 
      value, 
      type,
      isNegative = true 
  }: any) => (
      <div className="bg-white rounded-lg border border-slate-100 overflow-hidden">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => toggleExpand(id)}
          >
            <div className="flex items-center gap-3">
                <div className={`${bgClass} p-2 rounded-lg ${colorClass}`}>
                    {icon}
                </div>
                <div>
                    <p className="font-bold text-slate-900">{title}</p>
                    <p className="text-xs text-slate-500">{subtitle}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className={`font-bold ${isNegative ? colorClass : 'text-slate-900'}`}>
                    {isNegative ? '-' : ''} {formatCurrency(value)}
                </span>
                {expanded[id] ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </div>
          </div>
          {expanded[id] && <TransactionList type={type} />}
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-6 py-8 bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="text-slate-800" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Extrato Detalhado</h1>
        </div>
      </div>

      <div className="p-6 max-w-lg mx-auto space-y-6">
        
        {/* Waterfall logic */}
        <div className="space-y-3">
          
          <DetailRow 
            id="income"
            type="INCOME"
            icon={<TrendingUp size={20} />}
            bgClass="bg-blue-100"
            colorClass="text-blue-600"
            title="Entrada Total"
            subtitle="Faturamento Realizado"
            value={totalIncome}
            isNegative={false}
          />

          <div className="flex justify-center">
              <div className="h-4 w-px bg-slate-300"></div>
          </div>

          <DetailRow 
            id="tax"
            type="TAX"
            icon={<TrendingDown size={20} />}
            bgClass="bg-orange-100"
            colorClass="text-orange-600"
            title="Impostos Pagos"
            subtitle="DAS / DARF / Simples"
            value={actualTax}
          />

          {/* LEVEL 2 ITEMS */}
          {userProfile.appLevel >= 2 && (
            <>
               <div className="flex justify-center"><div className="h-4 w-px bg-slate-300"></div></div>
               <DetailRow 
                    id="reserve"
                    type="RESERVE"
                    icon={<Shield size={20} />}
                    bgClass="bg-indigo-100"
                    colorClass="text-indigo-600"
                    title="Reserva Guardada"
                    subtitle="Segurança"
                    value={actualReserve}
               />

               <div className="flex justify-center"><div className="h-4 w-px bg-slate-300"></div></div>
               <DetailRow 
                    id="growth"
                    type="GROWTH"
                    icon={<Rocket size={20} />}
                    bgClass="bg-orange-50"
                    colorClass="text-orange-500"
                    title="Investimentos"
                    subtitle="Crescimento"
                    value={actualGrowth}
               />
            </>
          )}

          {/* LEVEL 3 ITEMS */}
          {userProfile.appLevel === 3 && (
            <>
               <div className="flex justify-center"><div className="h-4 w-px bg-slate-300"></div></div>
               <DetailRow 
                    id="costs"
                    type="COST"
                    icon={<Lock size={20} />}
                    bgClass="bg-slate-200"
                    colorClass="text-slate-600"
                    title="Custos Pagos"
                    subtitle="Estrutura Fixa"
                    value={actualCosts}
               />
            </>
          )}

          <div className="flex justify-center"><div className="h-4 w-px bg-slate-300"></div></div>

          <DetailRow 
                id="salary"
                type="SALARY"
                icon={<TrendingDown size={20} />}
                bgClass="bg-emerald-100"
                colorClass="text-emerald-600"
                title="Seu Saque"
                subtitle="Transferido para PF"
                value={actualSalary}
           />

          {/* Step 4: Result */}
          <Card className={`mt-6 ${surplus < 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-300'}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-sm font-medium ${surplus < 0 ? 'text-red-700' : 'text-slate-500'}`}>
                  Sobra Real no Caixa
                </p>
                <div className={`text-2xl font-bold ${surplus < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                  {formatCurrency(surplus)}
                </div>
              </div>
              {surplus < 0 && <HelpCircle className="text-red-400" />}
            </div>
            {surplus < 0 && (
              <p className="text-xs text-red-600 mt-2">
                Atenção: Você retirou mais dinheiro do que entrou (considerando as separações).
              </p>
            )}
            {surplus >= 0 && (
              <p className="text-xs text-slate-500 mt-2">
                 Valor disponível na conta bancária da empresa após todos os pagamentos e separações acima.
              </p>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
};