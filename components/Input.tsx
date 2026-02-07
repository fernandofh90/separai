import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  prefix?: string;
}

export const Input: React.FC<InputProps> = ({ label, helperText, prefix, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-slate-700 font-medium mb-2">{label}</label>}
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
            {prefix}
          </span>
        )}
        <input
          className={`
            w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-lg
            focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500
            placeholder:text-slate-300 transition-all
            ${prefix ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {helperText && <p className="mt-2 text-sm text-slate-500">{helperText}</p>}
    </div>
  );
};