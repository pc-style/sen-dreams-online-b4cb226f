
import React from 'react';
import { cn } from '@/lib/utils';

interface GameLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const GameLayout: React.FC<GameLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "min-h-screen w-full bg-[#0a0b1e] text-indigo-100 overflow-hidden",
      "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0a0b1e] to-[#0a0b1e]",
      className
    )}>
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-[0.03]" />
        {/* Cherry blossom particles could go here */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-pink-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
        {children}
      </div>
    </div>
  );
};
