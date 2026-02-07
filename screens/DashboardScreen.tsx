import React, { useState } from 'react';
import { UserProfile, Transaction, TransactionType, SalaryMethod } from '../types';
import { 
  formatCurrency, 
  formatPercentage,
  formatDate,
  calculateTax, 
  calculateAllocation, 
  calculateTotalCommitments, 
  calculateRunway, 
  sumTransactionsByType,
  getMonthName
} from '../utils';
import { Card } from '../components/Card';
import { ActionModal } from '../components/ActionModal';
import { Button } from '../components/Button';
import { 
  Settings, Eye, EyeOff, Plus, 
  TrendingUp, Wallet, Shield, Building2, 
  Sparkles, Lock, ArrowRight, AlertCircle, Edit2, ChevronDown, ChevronUp, CheckCircle2, Rocket, Check, TrendingDown
} from 'lucide-react';

interface DashboardScreenProps {
  userProfile: UserProfile;
  onNavigate: (view: any) => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ userProfile, onNavigate, onUpdateProfile }) => {
  const [showValues, setShowValues] = useState(true);
  
  // Expansion States
  const [expandedIncome, setExpandedIncome] = useState(false);
  const [expandedSalary, setExpandedSalary] = useState(false);
  const [expandedCosts, setExpandedCosts] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: TransactionType;
    title: string;
    subtitle?: string;
    suggestedValue?: number;
    initialDescription?: string;
  }>({ type: 'INCOME', title: 'Adicionar' });

  // --- DYNAMIC CALCULATIONS ---
  const totalIncome = sumTransactionsByType(userProfile.transactions, 'INCOME');
  const paidTax = sumTransactionsByType(userProfile.transactions, 'TAX');
  const paidSalary = sumTransactionsByType(userProfile.transactions, 'SALARY');
  const allocatedReserve = sumTransactionsByType(userProfile.transactions, 'RESERVE');
  const allocatedGrowth = sumTransactionsByType(userProfile.transactions, 'GROWTH');
  const paidCosts = sumTransactionsByType(userProfile.transactions, 'COST');

  // Targets
  const targetTax = calculateTax(totalIncome, userProfile.companyType, userProfile.taxRate, userProfile.meiCategory);
  const targetReserve = userProfile.appLevel >= 2 ? calculateAllocation(totalIncome, userProfile.allocations.reserve) : 0;
  const targetGrowth = userProfile.appLevel >= 2 ? calculateAllocation(totalIncome, userProfile.allocations.growth) : 0;
  const targetCosts = userProfile.appLevel === 3 ? calculateTotalCommitments(userProfile.commitments) : 0;

  // Safe Personal Limit
  const safePersonalLimit = Math.max(0, totalIncome - targetTax - targetReserve - targetGrowth - targetCosts);

  // Operation Result (Month Flow)
  const operationResult = totalIncome - (paidTax + paidSalary + allocatedReserve + allocatedGrowth + paidCosts);
  
  // Total Company Cash (Stock + Flow)
  // We add the Reserve Balance (Stock) + The Month's Result (Flow)
  const totalCompanyCash = userProfile.currentReserveBalance + operationResult;

  // Danger logic: If total cash is negative OR (Level 3 and Runway < 1)
  const isDanger = totalCompanyCash < 0;

  // Runway
  const runwayMonths = userProfile.appLevel === 3 
    ? calculateRunway(totalCompanyCash, targetCosts) // Use Total Cash for Runway, not just reserve
    : 0;

  // --- HANDLERS ---
  const handleOpenAction = (type: TransactionType, opts?: { suggested?: number, subtitle?: string, description?: string }) => {
    let title = "";
    let subtitle = "";
    let suggested = 0;
    let initialDesc = "";

    switch (type) {
        case 'INCOME':
            title = "Nova Entrada";
            subtitle = "Recebeu de um cliente?";
            break;
        case 'TAX':
            title = "Separar Imposto";
            subtitle = "Garanta o DAS/DARF";
            suggested = Math.max(0, targetTax - paidTax);
            break;
        case 'SALARY':
            title = "Retirada Pessoal";
            subtitle = "Transferir para sua conta PF";
            suggested = Math.max(0, safePersonalLimit - paidSalary);
            if (userProfile.salaryMethod === SalaryMethod.FIXED && paidSalary < userProfile.salaryValue) {
                suggested = userProfile.salaryValue - paidSalary;
            }
            break;
        case 'RESERVE':
            title = "Guardar Reserva";
            subtitle = "Encher o cofrinho da empresa";
            suggested = Math.max(0, targetReserve - allocatedReserve);
            break;
        case 'GROWTH':
            title = "Investimento";
            subtitle = "Marketing, Equipamentos, etc.";
            suggested = Math.max(0, targetGrowth - allocatedGrowth);
            break;
        case 'COST':
            title = "Pagar Custo Fixo";
            subtitle = "Ferramentas, equipe, etc.";
            suggested = Math.max(0, targetCosts - paidCosts);
            break;
    }

    if (opts) {
        if (opts.suggested) suggested = opts.suggested;
        if (opts.subtitle) subtitle = opts.subtitle;
        if (opts.description) initialDesc = opts.description;
    }

    setModalConfig({ type, title, subtitle, suggestedValue: suggested, initialDescription: initialDesc });
    setIsModalOpen(true);
  };

  const handleConfirmAction = (value: number, description: string) => {
    const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: modalConfig.type,
        value,
        date: new Date().toISOString(),
        description
    };
    
    let extraUpdates = {};
    if (modalConfig.type === 'RESERVE') {
        extraUpdates = { currentReserveBalance: userProfile.currentReserveBalance + value };
    }

    onUpdateProfile({ 
        transactions: [...userProfile.transactions, newTransaction],
        ...extraUpdates
    });
  };

  const displayValue = (val: number) => showValues ? formatCurrency(val) : '••••••';

  // Helper to check if a specific commitment has been paid this month (by matching name)
  const isCommitmentPaid = (name: string) => {
      return userProfile.transactions.some(t => t.type === 'COST' && t.description?.toLowerCase() === name.toLowerCase());
  };

  const ProgressBar = ({ current, max, colorClass }: { current: number, max: number, colorClass: string }) => {
      const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;
      return (
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
              <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
          </div>
      );
  };

  const TransactionList = ({ type }: { type: TransactionType }) => {
      const list = userProfile.transactions.filter(t => t.type === type);
      if (list.length === 0) return <p className="text-xs text-slate-400 py-2">Nenhum registro ainda.</p>;
      
      return (
          <div className="mt-3 bg-slate-50 rounded-xl p-2 space-y-2 border border-slate-100">
              {list.map(t => (
                  <div key={t.id} className="flex justify-between items-center text-sm border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                      <div>
                          <span className="text-xs text-slate-400 mr-2">{formatDate(t.date)}</span>
                          <span className="text-slate-700 font-medium">{t.description}</span>
                      </div>
                      <span className="font-bold text-slate-700">{formatCurrency(t.value)}</span>
                  </div>
              ))}
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* --- HEADER --- */}
      <div className="px-6 pt-12 pb-6 flex justify-between items-end bg-white sticky top-0 z-10 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider">{getMonthName()} - EM ABERTO</p>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Visão Geral</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowValues(!showValues)} className="text-slate-400 hover:text-slate-600 transition-colors">
            {showValues ? <Eye size={24} /> : <EyeOff size={24} />}
          </button>
          <button onClick={() => onNavigate('SETTINGS')} className="text-slate-400 hover:text-slate-600 transition-colors">
            <Settings size={24} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 max-w-lg mx-auto">

        {/* --- 1. INCOME --- */}
        <section>
             <Card className="bg-white border-slate-200 shadow-sm p-0 overflow-hidden">
                <div className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Entradas do Mês</p>
                        <div className="text-3xl font-bold text-slate-900">{displayValue(totalIncome)}</div>
                    </div>
                    <div className="flex gap-3">
                         <button 
                            onClick={() => setExpandedIncome(!expandedIncome)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 w-12 h-12 rounded-full flex items-center justify-center transition-all"
                        >
                            {expandedIncome ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        <button 
                            onClick={() => handleOpenAction('INCOME')}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>
                
                {/* Educational Microcopy */}
                {totalIncome > 0 && (
                    <div className="px-5 pb-5">
                         <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-emerald-800 leading-relaxed">
                                Com base nas regras, o limite seguro para retirada pessoal este mês é de <strong className="font-bold">{formatCurrency(safePersonalLimit)}</strong>.
                            </p>
                         </div>
                    </div>
                )}

                {expandedIncome && (
                    <div className="px-5 pb-5 animate-in slide-in-from-top-2 border-t border-slate-100">
                        <TransactionList type="INCOME" />
                    </div>
                )}
            </Card>
        </section>

        {/* --- 2. COMPANY CASH & TAX --- */}
        <section className="space-y-4">
            
            {/* CAIXA EMPRESA */}
            <Card className={`relative overflow-hidden transition-all ${isDanger ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 shadow-md'}`}>
                <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-2">
                        <Building2 size={16} className={isDanger ? "text-red-500" : "text-slate-700"} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDanger ? 'text-red-600' : 'text-slate-700'}`}>Caixa Empresa</span>
                     </div>
                     {/* L3 Edit Shortcut */}
                     {userProfile.appLevel >= 2 && (
                         <button onClick={() => onNavigate(userProfile.appLevel === 3 ? 'LEVEL_THREE_SETUP' : 'LEVEL_TWO_SETUP')} className="text-xs text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1">
                            <Edit2 size={12}/> Estrutura
                         </button>
                     )}
                </div>
                
                <div className="flex items-end gap-3 mb-2">
                    <div className={`text-4xl font-bold ${isDanger ? 'text-red-600' : 'text-slate-900'}`}>
                        {displayValue(totalCompanyCash)}
                    </div>
                    {/* Monthly Flow Indicator if negative */}
                    {operationResult < 0 && (
                        <div className="flex items-center text-red-500 text-xs font-bold mb-2 bg-red-50 px-2 py-1 rounded">
                            <TrendingDown size={14} className="mr-1" />
                            {formatCurrency(operationResult)} este mês
                        </div>
                    )}
                </div>
                
                <p className={`text-sm ${isDanger ? 'text-red-700' : 'text-slate-500'}`}>
                   {isDanger 
                     ? "Atenção: Seu caixa total está negativo." 
                     : "Saldo total disponível (Caixa + Reservas)."}
                </p>

                {/* L3 Runway Badge & Microcopy */}
                {userProfile.appLevel === 3 && !isDanger && (
                    <>
                     <div className="mt-4 inline-flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200">
                        <span className="text-xs text-slate-500">Fôlego:</span>
                        <span className={`text-xs font-bold ${runwayMonths < 3 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                            {runwayMonths > 12 ? '12+' : runwayMonths.toFixed(1)} Meses
                        </span>
                     </div>
                     <p className="text-xs text-slate-400 mt-3 italic border-t border-slate-100 pt-2 leading-relaxed">
                        "O caixa não é lucro livre. É a blindagem que impede sua empresa de quebrar na primeira crise."
                     </p>
                    </>
                )}
            </Card>

            {/* TAX CARD */}
            <Card className="bg-slate-50 border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Building2 size={16} className="text-orange-500" />
                        <span className="text-sm">Impostos</span>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-slate-400 uppercase block">Alvo</span>
                        <span className="font-bold text-slate-700">{formatCurrency(targetTax)}</span>
                    </div>
                </div>
                <div className="flex justify-between items-end mt-2">
                     <span className={`text-xl font-bold ${paidTax >= targetTax ? 'text-emerald-600' : 'text-slate-900'}`}>
                         {displayValue(paidTax)} <span className="text-xs font-normal text-slate-400">pagos</span>
                     </span>
                </div>
                <ProgressBar current={paidTax} max={targetTax} colorClass={paidTax >= targetTax ? 'bg-emerald-500' : 'bg-orange-500'} />
                <p className="text-xs text-slate-400 mt-3">
                    O governo é seu sócio. Pague antes de gastar para evitar multas.
                </p>
            </Card>

        </section>

        {/* --- 3. PERSONAL CASH --- */}
        <section>
            <Card className="bg-emerald-50 border-emerald-100 p-0 overflow-hidden">
                 <div className="p-5">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <Wallet size={16} className="text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Caixa Pessoal</span>
                        </div>
                        <button 
                            onClick={() => setExpandedSalary(!expandedSalary)}
                            className="text-emerald-600 hover:bg-emerald-100 p-1 rounded-full transition-colors"
                        >
                            {expandedSalary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                     </div>
                     <div className="text-2xl font-bold text-emerald-900 mb-1">
                        {displayValue(paidSalary)}
                     </div>
                     
                     {/* Dynamic Warning/Status */}
                     {paidSalary > safePersonalLimit && safePersonalLimit > 0 && (
                        <div className="mt-2 flex items-start gap-1 text-red-600 text-xs font-medium">
                            <AlertCircle size={12} className="shrink-0 mt-0.5" />
                            <span>Você retirou mais que o limite seguro ({formatCurrency(safePersonalLimit)}).</span>
                        </div>
                     )}
                     {paidSalary <= safePersonalLimit && safePersonalLimit > 0 && (
                         <p className="text-xs text-emerald-600">
                             Você retirou {formatPercentage(totalIncome > 0 ? (paidSalary/totalIncome)*100 : 0)} do faturamento. Tudo sob controle.
                         </p>
                     )}
                     {safePersonalLimit === 0 && totalIncome > 0 && (
                         <div className="mt-2 flex items-start gap-1 text-orange-600 text-xs font-medium">
                            <AlertCircle size={12} className="shrink-0 mt-0.5" />
                            <span>Ainda não há margem segura para retirada.</span>
                        </div>
                     )}
                     {totalIncome === 0 && (
                         <p className="text-xs text-emerald-600">Aguardando entradas para calcular seu limite.</p>
                     )}
                 </div>
                 {expandedSalary && (
                    <div className="px-5 pb-5 animate-in slide-in-from-top-2">
                        <TransactionList type="SALARY" />
                    </div>
                )}
            </Card>
        </section>

        {/* --- 4. GAMIFICATION (LEVEL UP) --- */}
        {userProfile.appLevel === 1 && (
            <div 
                onClick={() => onNavigate('LEVEL_TWO_SETUP')}
                className="bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all group"
            >
                <div className="flex items-start gap-4">
                    <div className="bg-white p-2.5 rounded-xl shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-indigo-900 text-sm">Nível 2: Organizar para Crescer</h3>
                        <p className="text-indigo-700 text-xs mt-1 leading-relaxed">
                            Crie sua reserva de segurança e invista no futuro.
                            <span className="underline ml-1 font-semibold">Ativar agora</span>
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* LEVEL 2 -> 3 UPGRADE */}
        {userProfile.appLevel === 2 && (
             <div 
                onClick={() => onNavigate('LEVEL_THREE_SETUP')}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all group"
             >
                <div className="flex items-start gap-4">
                    <div className="bg-slate-700 p-2.5 rounded-xl shadow-sm text-slate-200 group-hover:scale-110 transition-transform">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Nível 3: Estrutura Profissional</h3>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                            Controle custos fixos e equipe para blindar a empresa.
                            <span className="underline ml-1 font-semibold text-white">Configurar</span>
                        </p>
                    </div>
                </div>
             </div>
        )}

        {/* --- 5. ACTIONS (THE WORK) --- */}
        <section>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Ações Necessárias</h2>
            <div className="space-y-3">
                
                {/* TAX ACTION */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <Building2 size={16} className="text-orange-500" />
                           <span className="font-bold text-slate-700 text-sm">Impostos</span>
                        </div>
                        <Button size="sm" variant={paidTax >= targetTax ? "outline" : "secondary"} onClick={() => handleOpenAction('TAX')}>
                            {paidTax >= targetTax ? "Adicionar" : "Separar"}
                        </Button>
                    </div>
                    <p className="text-xs text-slate-400">Evite surpresas com a Receita. Separe assim que o dinheiro entrar.</p>
                </div>

                {/* PERSONAL ACTION */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Wallet size={16} className="text-emerald-500" />
                            <span className="font-bold text-slate-700 text-sm">Seu Saque</span>
                         </div>
                        <Button size="sm" variant="secondary" onClick={() => handleOpenAction('SALARY')}>
                            Retirar
                        </Button>
                    </div>
                    <div className="flex justify-between items-center">
                         <div className="w-2/3">
                             <ProgressBar current={paidSalary} max={safePersonalLimit} colorClass="bg-emerald-500" />
                         </div>
                         <span className="text-xs text-slate-400">{formatPercentage(safePersonalLimit > 0 ? (paidSalary/safePersonalLimit)*100 : 0)} do limite</span>
                    </div>
                    <p className="text-xs text-slate-400">Esse é o seu salário. Só retire se houver sobra segura.</p>
                </div>

                {/* LEVEL 2 ACTIONS (RESERVE & GROWTH) */}
                {userProfile.appLevel >= 2 && (
                    <>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className="text-indigo-500" />
                                    <span className="font-bold text-slate-700 text-sm">Reserva</span>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => handleOpenAction('RESERVE')}>
                                    Guardar
                                </Button>
                            </div>
                            <p className="text-xs text-slate-400">Dinheiro guardado é a paz de espírito do empreendedor.</p>
                        </div>

                         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Rocket size={16} className="text-blue-500" />
                                    <span className="font-bold text-slate-700 text-sm">Investimentos</span>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => handleOpenAction('GROWTH')}>
                                    Investir
                                </Button>
                            </div>
                            <p className="text-xs text-slate-400">Invista para sua empresa valer mais amanhã.</p>
                        </div>
                    </>
                )}

                {/* LEVEL 3 ACTIONS (FIXED COSTS BREAKDOWN) */}
                 {userProfile.appLevel === 3 && targetCosts > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                         <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setExpandedCosts(!expandedCosts)}>
                             <div className="flex items-center gap-2">
                                <Lock size={16} className="text-slate-500" />
                                <span className="font-bold text-slate-700 text-sm">Custos Fixos</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400">{formatCurrency(paidCosts)} pagos</span>
                                {expandedCosts ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                             </div>
                        </div>
                        
                        {/* Expanded Breakdown */}
                        {expandedCosts && (
                            <div className="px-4 pb-4 space-y-2 border-t border-slate-100 pt-3 bg-slate-50/50">
                                {userProfile.commitments.map(c => {
                                    const isPaid = isCommitmentPaid(c.name);
                                    return (
                                        <div key={c.id} className="flex justify-between items-center text-sm py-1">
                                            <div>
                                                <p className="font-medium text-slate-700">{c.name}</p>
                                                <p className="text-xs text-slate-400">{formatCurrency(c.value)}</p>
                                            </div>
                                            {isPaid ? (
                                                <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold px-2 py-1 bg-emerald-100 rounded">
                                                    <Check size={12} /> Pago
                                                </div>
                                            ) : (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="h-8 px-3 text-xs"
                                                    onClick={() => handleOpenAction('COST', { 
                                                        suggested: c.value, 
                                                        subtitle: c.name,
                                                        description: c.name
                                                    })}
                                                >
                                                    Pagar
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                                <div className="pt-2 mt-2 border-t border-slate-200">
                                    <Button 
                                        size="sm" 
                                        variant="secondary" 
                                        fullWidth 
                                        onClick={() => handleOpenAction('COST', { subtitle: 'Gasto Extra / Não listado' })}
                                    >
                                        Outro Custo
                                    </Button>
                                </div>
                            </div>
                        )}
                        {!expandedCosts && (
                            <div className="px-4 pb-4">
                                <p className="text-xs text-slate-400">Mantenha a estrutura funcionando. Pague ferramentas e equipe.</p>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </section>

        <div className="text-center pt-2">
             <Button variant="ghost" size="sm" onClick={() => onNavigate('DETAILS')}>
                Ver Relatório Detalhado <ArrowRight size={16} className="ml-1" />
             </Button>
        </div>

      </div>

      <ActionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAction}
        type={modalConfig.type}
        title={modalConfig.title}
        subtitle={modalConfig.subtitle}
        suggestedValue={modalConfig.suggestedValue}
        initialDescription={modalConfig.initialDescription}
      />
    </div>
  );
};