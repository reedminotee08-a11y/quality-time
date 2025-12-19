import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'icon' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '', 
  loading = false,
  fullWidth = false,
  disabled,
  ...props 
}) => {
  // الكلاسات الأساسية المشتركة
  const baseClasses = 'font-bold uppercase tracking-wider transition-all duration-300 rounded-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050b18] disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-to-br from-[#8e6d2d] via-[#c5a059] to-[#e2c58a] text-[#050b18] shadow-lg hover:shadow-xl enabled:hover:scale-[1.02] focus:ring-[#c5a059]',
    secondary: 'bg-white/5 border border-white/10 text-white hover:bg-[#c5a059] hover:text-black hover:border-[#c5a059] focus:ring-[#c5a059]',
    outline: 'border border-[#c5a059] text-[#c5a059] hover:bg-[#c5a059] hover:text-[#050b18] focus:ring-[#c5a059]',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5 focus:ring-white',
    icon: 'text-gray-400 hover:text-[#c5a059] hover:bg-[#c5a059]/10 focus:ring-[#c5a059]',
    danger: 'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white focus:ring-red-500',
    success: 'bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white focus:ring-green-500'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
    icon: 'p-2'
  };
  
  // دمج الكلاسات مع التأكد من عدم وجود تعارضات
  const classes = twMerge(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className
  );
  
  return (
    <button 
      className={classes} 
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      <span className={loading ? 'opacity-80' : ''}>
        {children}
      </span>
    </button>
  );
};

export default Button;