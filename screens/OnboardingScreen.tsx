import React, { useState } from 'react';
import { CompanyType, SalaryMethod, UserProfile, MeiCategory } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { formatCurrency, parseCurrencyInput, calculateTax } from '../utils';
import { Briefcase, User, Building2, CheckCircle2, ChevronLeft, Truck, Store, Wrench } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  // Steps: 1=Type, 2=MeiCategory(Optional), 3=Revenue, 4=Salary, 5=Tax
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    companyType: null,
    meiCategory: undefined,
    monthlyRevenue: 0,
    salaryMethod: null,
    salaryValue: 0,
    taxRate: 6, // Default default for Simples
    appLevel: 1,
    allocations: {
      reserve: { enabled: false, type: 'PERCENTAGE', value: 0 },
      growth: { enabled: false, type: 'PERCENTAGE', value: 0 }
    },
    currentReserveBalance: 0,
    commitments: [],
    transactions: [],
    currentMonthOpen: true
  });

  const [inputValue, setInputValue] = useState('');

  // Navigation Logic
  const goNext = () => {
    if (step === 1) {
      if (profile.companyType === CompanyType.MEI) setStep(2);
      else setStep(3);
    } 
    else if (step === 2) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4) setStep(5);
  };

  const goBack = () => {
    if (step === 3) {
      if (profile.companyType === CompanyType.MEI) setStep(2);
      else setStep(1);
    }
    else setStep(s => s - 1);
  };

  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numberValue = parseCurrencyInput(rawValue);
    setProfile(p => ({ ...p, monthlyRevenue: numberValue }));
    setInputValue(formatCurrency(numberValue));
  };

  const handleSalaryValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numberValue = parseCurrencyInput(rawValue);
    setProfile(p => ({ ...p, salaryValue: numberValue }));
    setInputValue(formatCurrency(numberValue));
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProfile(p => ({ ...p, taxRate: isNaN(val) ? 0 : val }));
  };

  // --- Step 1: Company Type ---
  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col max-w-md mx-auto">
        <div className="flex-1">
          <div className="w-full h-1 bg-slate-200 rounded-full mb-8">
            <div className="h-1 bg-emerald-500 rounded-full w-1/5"></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Que tipo de empresa você tem?</h2>
          <p className="text-slate-500 mb-8">Isso nos ajuda a aplicar regras simples pra você.</p>
          
          <div className="space-y-4">
            <Card 
              selected={profile.companyType === CompanyType.MEI}
              onClick={() => setProfile({...profile, companyType: CompanyType.MEI})}
              className="flex items-center gap-4"
            >
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">MEI</h3>
                <p className="text-sm text-slate-500">Microempreendedor Individual</p>
              </div>
              {profile.companyType === CompanyType.MEI && <CheckCircle2 className="ml-auto text-emerald-500" />}
            </Card>

            <Card 
              selected={profile.companyType === CompanyType.PJ_SIMPLES}
              onClick={() => setProfile({...profile, companyType: CompanyType.PJ_SIMPLES})}
              className="flex items-center gap-4"
            >
              <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                <Briefcase size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">PJ Simples</h3>
                <p className="text-sm text-slate-500">Serviços, Simples Nacional</p>
              </div>
              {profile.companyType === CompanyType.PJ_SIMPLES && <CheckCircle2 className="ml-auto text-emerald-500" />}
            </Card>

            <Card 
              selected={profile.companyType === CompanyType.AUTONOMO}
              onClick={() => setProfile({...profile, companyType: CompanyType.AUTONOMO})}
              className="flex items-center gap-4"
            >
              <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Autônomo</h3>
                <p className="text-sm text-slate-500">Profissional liberal</p>
              </div>
              {profile.companyType === CompanyType.AUTONOMO && <CheckCircle2 className="ml-auto text-emerald-500" />}
            </Card>
          </div>
        </div>
        <Button disabled={!profile.companyType} onClick={goNext} fullWidth>Continuar</Button>
      </div>
    );
  }

  // --- Step 2: MEI Category (Conditional) ---
  if (step === 2) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col max-w-md mx-auto">
        <div className="flex-1">
          <div className="w-full h-1 bg-slate-200 rounded-full mb-8">
            <div className="h-1 bg-emerald-500 rounded-full w-2/5"></div>
          </div>
          <button onClick={() => setStep(1)} className="text-slate-400 mb-4 flex items-center gap-1 text-sm font-medium"><ChevronLeft size={16}/> Voltar</button>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Qual seu enquadramento?</h2>
          <p className="text-slate-500 mb-8">O valor do seu imposto muda conforme sua atividade.</p>

          <div className="space-y-3">
             <Card 
              selected={profile.meiCategory === 'COMMERCE'}
              onClick={() => setProfile({...profile, meiCategory: 'COMMERCE'})}
              className="flex items-center gap-4 p-4"
            >
              <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                <Store size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Comércio ou Indústria</h3>
                <p className="text-xs text-slate-500">Venda de produtos ou fabricação</p>
              </div>
              {profile.meiCategory === 'COMMERCE' && <CheckCircle2 className="ml-auto text-emerald-500" size={20} />}
            </Card>

            <Card 
              selected={profile.meiCategory === 'SERVICE'}
              onClick={() => setProfile({...profile, meiCategory: 'SERVICE'})}
              className="flex items-center gap-4 p-4"
            >
              <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                <Wrench size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Serviços</h3>
                <p className="text-xs text-slate-500">Prestação de serviços em geral</p>
              </div>
              {profile.meiCategory === 'SERVICE' && <CheckCircle2 className="ml-auto text-emerald-500" size={20} />}
            </Card>

            <Card 
              selected={profile.meiCategory === 'MIXED'}
              onClick={() => setProfile({...profile, meiCategory: 'MIXED'})}
              className="flex items-center gap-4 p-4"
            >
              <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Comércio e Serviços</h3>
                <p className="text-xs text-slate-500">Realiza ambas as atividades</p>
              </div>
              {profile.meiCategory === 'MIXED' && <CheckCircle2 className="ml-auto text-emerald-500" size={20} />}
            </Card>

             <Card 
              selected={profile.meiCategory === 'TRUCKER'}
              onClick={() => setProfile({...profile, meiCategory: 'TRUCKER'})}
              className="flex items-center gap-4 p-4"
            >
              <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Caminhoneiro</h3>
                <p className="text-xs text-slate-500">Transporte de cargas</p>
              </div>
              {profile.meiCategory === 'TRUCKER' && <CheckCircle2 className="ml-auto text-emerald-500" size={20} />}
            </Card>
          </div>
        </div>
        <Button disabled={!profile.meiCategory} onClick={goNext} fullWidth>Continuar</Button>
      </div>
    );
  }

  // --- Step 3: Revenue ---
  if (step === 3) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col max-w-md mx-auto">
        <div className="flex-1">
          <div className="w-full h-1 bg-slate-200 rounded-full mb-8">
            <div className="h-1 bg-emerald-500 rounded-full w-3/5"></div>
          </div>
          <button onClick={goBack} className="text-slate-400 mb-4 flex items-center gap-1 text-sm font-medium"><ChevronLeft size={16}/> Voltar</button>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Quanto sua empresa fatura por mês?</h2>
          <p className="text-slate-500 mb-8">Pode ser uma estimativa média.</p>

          <Input 
            autoFocus
            type="text"
            label="Faturamento Médio (R$)"
            value={inputValue || formatCurrency(profile.monthlyRevenue)}
            onChange={handleRevenueChange}
            placeholder="R$ 0,00"
            helperText="Valor bruto, antes de impostos e gastos."
          />
        </div>
        <Button disabled={profile.monthlyRevenue <= 0} onClick={() => { setInputValue(''); goNext(); }} fullWidth>Continuar</Button>
      </div>
    );
  }

  // --- Step 4: Salary Method ---
  if (step === 4) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col max-w-md mx-auto">
        <div className="flex-1">
           <div className="w-full h-1 bg-slate-200 rounded-full mb-8">
            <div className="h-1 bg-emerald-500 rounded-full w-4/5"></div>
          </div>
          <button onClick={goBack} className="text-slate-400 mb-4 flex items-center gap-1 text-sm font-medium"><ChevronLeft size={16}/> Voltar</button>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Como você quer receber?</h2>
          <p className="text-slate-500 mb-6">Defina como o dinheiro passa para sua conta pessoal.</p>

          <div className="space-y-4 mb-6">
            <Card 
              selected={profile.salaryMethod === SalaryMethod.FIXED}
              onClick={() => {
                setProfile({...profile, salaryMethod: SalaryMethod.FIXED});
                setInputValue('');
              }}
              className="p-4"
            >
              <h3 className="font-bold text-slate-800 mb-1">Pró-labore Fixo</h3>
              <p className="text-sm text-slate-500">Defino um valor fixo mensal para transferir para mim.</p>
            </Card>

            <Card 
              selected={profile.salaryMethod === SalaryMethod.PROFIT}
              onClick={() => {
                setProfile({...profile, salaryMethod: SalaryMethod.PROFIT, salaryValue: 0});
                setInputValue('');
              }}
              className="p-4"
            >
              <h3 className="font-bold text-slate-800 mb-1">Retirada de Lucro</h3>
              <p className="text-sm text-slate-500">O que sobrar depois dos impostos é meu.</p>
            </Card>
          </div>

          {profile.salaryMethod === SalaryMethod.FIXED && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Input 
                  autoFocus
                  type="text"
                  label="Valor do Pró-labore"
                  value={inputValue || formatCurrency(profile.salaryValue)}
                  onChange={handleSalaryValueChange}
                  placeholder="R$ 0,00"
                  helperText="Esse é o seu dinheiro pessoal garantido."
                />
             </div>
          )}
        </div>
        <Button 
          disabled={!profile.salaryMethod || (profile.salaryMethod === SalaryMethod.FIXED && profile.salaryValue <= 0)} 
          onClick={goNext} 
          fullWidth
        >
          Continuar
        </Button>
      </div>
    );
  }

  // --- Step 5: Tax ---
  if (step === 5) {
    const calculatedMeiTax = calculateTax(0, 'MEI', 0, profile.meiCategory);

    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col max-w-md mx-auto">
        <div className="flex-1">
           <div className="w-full h-1 bg-slate-200 rounded-full mb-8">
            <div className="h-1 bg-emerald-500 rounded-full w-full"></div>
          </div>
          <button onClick={goBack} className="text-slate-400 mb-4 flex items-center gap-1 text-sm font-medium"><ChevronLeft size={16}/> Voltar</button>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Impostos</h2>
          
          {profile.companyType === CompanyType.MEI ? (
            <Card className="bg-emerald-50 border-emerald-100">
               <h3 className="font-bold text-emerald-800 mb-2">Conta Simples</h3>
               <p className="text-emerald-700 mb-3">
                 Sua categoria de MEI tem um recolhimento fixo estimado.
               </p>
               <div className="bg-white/60 p-3 rounded-lg border border-emerald-200">
                 <span className="block text-xs text-emerald-600 uppercase tracking-wider font-bold mb-1">Estimativa 2026</span>
                 <span className="text-2xl font-bold text-emerald-800">{formatCurrency(calculatedMeiTax)}</span>
                 <span className="text-sm text-emerald-600"> /mês</span>
               </div>
               <p className="text-xs text-emerald-600 mt-3">
                 Nós já cuidamos desse cálculo automaticamente para você no seu fluxo mensal.
               </p>
            </Card>
          ) : (
            <>
              <p className="text-slate-500 mb-6">Qual a % média de imposto que você paga sobre a nota fiscal?</p>
              <Input 
                type="number"
                label="Porcentagem Estimada (%)"
                value={profile.taxRate}
                onChange={handleTaxChange}
                placeholder="6"
                helperText="Ex: Anexo III do Simples Nacional começa em 6%."
              />
            </>
          )}
        </div>
        <Button onClick={() => onComplete(profile)} fullWidth>Ver meu resumo</Button>
      </div>
    );
  }

  return null;
};