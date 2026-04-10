import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#191919] border border-[#282828] rounded-2xl shadow-sm transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}
