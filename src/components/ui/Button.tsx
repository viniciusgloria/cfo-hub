import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  children: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  children,
  fullWidth = false,
  className = '',
  loading = false,
  ...props
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#10B981] text-white hover:bg-[#059669] focus-visible:ring-[#10B981]',
    secondary: 'bg-[#1F2937] text-white hover:bg-[#374151] focus-visible:ring-[#1F2937]',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-400',
    ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${className}`}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" strokeWidth="3" />
            <path d="M22 12a10 10 0 00-10-10" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Carregando</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
