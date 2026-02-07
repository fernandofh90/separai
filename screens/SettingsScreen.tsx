import React from 'react';
import { UserProfile } from '../types';
import { ChevronLeft, LogOut, HelpCircle, Shield, Bell, Sparkles, ChevronRight, Building2, PenLine } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

interface SettingsScreenProps {
  userProfile: UserProfile;
  onBack: () => void;
  onReset: () => void;
  onNavigate: (view: any) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ userProfile, onBack, onReset, onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50">
       <div className="px-6 py-8 bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="text-slate-800" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Configurações</h1>
        </div>
      </div>

      <div className="p-6 max-w-lg mx-auto space-y-6">
        
        <section>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Minhas Regras</h2>
          <Card className="divide-y divide-slate-100 p-0 overflow-hidden">
             <div className="p-4 flex justify-between items-center">
                <span className="text-slate-700 font-medium">Tipo de Empresa</span>
                <span className="text-slate-500 text-sm">{userProfile.companyType}</span>
             </div>
             <div className="p-4 flex justify-between items-center">
                <span className="text-slate-700 font-medium">Modelo de Saque</span>
                <span className="text-slate-500 text-sm">
                    {userProfile.salaryMethod === 'FIXED' ? 'Fixo' : 'Lucro'}
                </span>
             </div>
             {userProfile.taxRate > 0 && (
                <div className="p-4 flex justify-between items-center">
                    <span className="text-slate-700 font-medium">Taxa de Imposto</span>
                    <span className="text-slate-500 text-sm">{userProfile.taxRate}%</span>
                </div>
             )}
             
             {/* Level Indication */}
             {userProfile.appLevel === 2 && (
                 <div className="p-4 flex justify-between items-center bg-indigo-50/50">
                    <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-indigo-500" />
                        <span className="text-indigo-900 font-medium">Organização (Nível 2)</span>
                    </div>
                    <span className="text-indigo-700 text-xs font-bold bg-indigo-100 px-2 py-1 rounded">Ativo</span>
                 </div>
             )}
             {userProfile.appLevel === 3 && (
                 <>
                    <div className="p-4 flex justify-between items-center bg-slate-100/50">
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-slate-600" />
                            <span className="text-slate-900 font-medium">Estrutura (Nível 3)</span>
                        </div>
                        <span className="text-slate-700 text-xs font-bold bg-slate-200 px-2 py-1 rounded">Ativo</span>
                    </div>
                    {/* Level 3 Edit Button */}
                    <button 
                        onClick={() => onNavigate('LEVEL_THREE_SETUP')}
                        className="w-full p-4 flex items-center gap-3 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <PenLine size={18} className="text-slate-400" />
                        <span className="font-medium text-sm">Editar Compromissos e Saldo</span>
                        <ChevronRight className="ml-auto w-4 h-4 text-slate-300" />
                    </button>
                 </>
             )}
          </Card>
        </section>

        <section>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">App</h2>
          <Card className="divide-y divide-slate-100 p-0 overflow-hidden">
             <div className="p-4 flex items-center gap-3 text-slate-700">
                <Bell size={20} className="text-slate-400" />
                <span className="font-medium">Notificações</span>
                <div className="ml-auto w-10 h-6 bg-emerald-500 rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
             </div>
             <div className="p-4 flex items-center gap-3 text-slate-700">
                <Shield size={20} className="text-slate-400" />
                <span className="font-medium">Plano</span>
                <span className="ml-auto text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-1 rounded">Gratuito</span>
             </div>
             <div className="p-4 flex items-center gap-3 text-slate-700">
                <HelpCircle size={20} className="text-slate-400" />
                <span className="font-medium">Ajuda e Suporte</span>
             </div>
          </Card>
        </section>

        <div className="pt-8">
            <Button variant="outline" fullWidth onClick={onReset} className="border-red-200 text-red-600 hover:bg-red-50">
                <LogOut className="mr-2 w-4 h-4" /> Resetar tudo e Sair
            </Button>
            <p className="text-center text-xs text-slate-400 mt-4">Versão 1.3.0 (Dynamic)</p>
        </div>

      </div>
    </div>
  );
};