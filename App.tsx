import React, { useState, useEffect } from 'react';
import { AppState, AppView, UserProfile } from './types';
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { DetailsScreen } from './screens/DetailsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { LevelTwoSetupScreen } from './screens/LevelTwoSetupScreen';
import { LevelThreeSetupScreen } from './screens/LevelThreeSetupScreen';

const STORAGE_KEY = 'separador_pj_state_v1';

const defaultProfile: UserProfile = {
  companyType: null,
  monthlyRevenue: 0,
  salaryMethod: null,
  salaryValue: 0,
  taxRate: 6,
  appLevel: 1,
  allocations: {
    reserve: { enabled: false, type: 'PERCENTAGE', value: 0 },
    growth: { enabled: false, type: 'PERCENTAGE', value: 0 }
  },
  currentReserveBalance: 0,
  commitments: [],
  transactions: [],
  currentMonthOpen: true
};

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'SPLASH',
    userProfile: defaultProfile,
    isSetupComplete: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load state from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration support for older saves
        if (!parsed.userProfile.allocations) {
           parsed.userProfile.appLevel = 1;
           parsed.userProfile.allocations = defaultProfile.allocations;
        }
        if (!parsed.userProfile.commitments) {
           parsed.userProfile.commitments = [];
           parsed.userProfile.currentReserveBalance = 0;
        }
        if (!parsed.userProfile.transactions) {
            parsed.userProfile.transactions = [];
            parsed.userProfile.currentMonthOpen = true;
        }
        setAppState(parsed);
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save state to local storage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    }
  }, [appState, isLoading]);

  const handleStart = () => {
    if (appState.isSetupComplete) {
      setAppState(prev => ({ ...prev, currentView: 'DASHBOARD' }));
    } else {
      setAppState(prev => ({ ...prev, currentView: 'ONBOARDING' }));
    }
  };

  // Generic updater for child components
  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setAppState(prev => ({
      ...prev,
      userProfile: { ...prev.userProfile, ...updates }
    }));
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    setAppState(prev => ({
      ...prev,
      userProfile: { ...prev.userProfile, ...profile }, // Merge to keep defaults
      isSetupComplete: true,
      currentView: 'DASHBOARD',
    }));
  };

  const handleLevelTwoComplete = (updatedAllocations: any) => {
    setAppState(prev => ({
      ...prev,
      userProfile: {
        ...prev.userProfile,
        appLevel: 2,
        allocations: updatedAllocations
      },
      currentView: 'DASHBOARD'
    }));
  };

  const handleLevelThreeComplete = (balance: number, commitments: any[]) => {
    setAppState(prev => ({
      ...prev,
      userProfile: {
        ...prev.userProfile,
        appLevel: 3,
        currentReserveBalance: balance,
        commitments: commitments
      },
      currentView: 'DASHBOARD'
    }));
  };

  const handleNavigate = (view: AppView) => {
    setAppState(prev => ({ ...prev, currentView: view }));
  };

  const handleReset = () => {
    if(window.confirm("Tem certeza que deseja apagar todos os dados e começar do zero?")) {
      const newState: AppState = {
        currentView: 'SPLASH',
        userProfile: defaultProfile,
        isSetupComplete: false
      };
      setAppState(newState);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  if (isLoading) return null;

  return (
    <div className="antialiased text-slate-800">
      {appState.currentView === 'SPLASH' && (
        <SplashScreen onStart={handleStart} />
      )}
      
      {appState.currentView === 'ONBOARDING' && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}

      {appState.currentView === 'DASHBOARD' && (
        <DashboardScreen 
          userProfile={appState.userProfile} 
          onNavigate={handleNavigate}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {appState.currentView === 'LEVEL_TWO_SETUP' && (
        <LevelTwoSetupScreen
          userProfile={appState.userProfile}
          onComplete={handleLevelTwoComplete}
          onCancel={() => handleNavigate('DASHBOARD')}
        />
      )}

      {appState.currentView === 'LEVEL_THREE_SETUP' && (
        <LevelThreeSetupScreen
          onComplete={handleLevelThreeComplete}
          onCancel={() => handleNavigate('DASHBOARD')}
        />
      )}

      {appState.currentView === 'DETAILS' && (
        <DetailsScreen 
          userProfile={appState.userProfile} 
          onBack={() => handleNavigate('DASHBOARD')}
        />
      )}

      {appState.currentView === 'SETTINGS' && (
        <SettingsScreen 
          userProfile={appState.userProfile}
          onBack={() => handleNavigate('DASHBOARD')}
          onReset={handleReset}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}

export default App;