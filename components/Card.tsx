import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, selected = false }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-2xl p-6 shadow-sm border transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
        ${selected ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10' : 'border-slate-100'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};