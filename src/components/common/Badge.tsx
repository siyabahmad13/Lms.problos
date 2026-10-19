import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'gray' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'green', size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  const variantClasses = {
    green: 'bg-[#e6f5f0] text-[#009166] border border-[#009166]/20',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200',
    red: 'bg-rose-50 text-rose-700 border border-rose-200',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    gray: 'bg-gray-100 text-gray-700 border border-gray-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1 rounded-md font-medium tracking-wide ${sizeClasses} ${variantClasses}`}>
      {children}
    </span>
  );
};
