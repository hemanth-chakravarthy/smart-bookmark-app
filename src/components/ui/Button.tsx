interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none gap-2';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-900/10 rounded-xl',
    secondary: 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700 rounded-xl',
    outline: 'border border-[#2A2A2A] text-neutral-300 hover:bg-[#191919] hover:text-white rounded-xl',
    ghost: 'text-neutral-500 hover:text-white hover:bg-[#191919] rounded-lg',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl border border-red-500/20',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
