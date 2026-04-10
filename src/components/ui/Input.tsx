interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full flex flex-col gap-1.5 sm:gap-2">
      {label && <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</label>}
      <input
        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#191919] border border-[#2A2A2A] rounded-lg sm:rounded-xl text-neutral-200 placeholder:text-neutral-600 outline-none transition-all focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 text-xs sm:text-sm ${
          error ? 'border-red-500/50 focus:ring-red-500/20' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-[10px] sm:text-xs text-red-400 font-medium">{error}</span>}
    </div>
  );
}
