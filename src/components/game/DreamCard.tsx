/**
 * Dream Card - Accessible, responsive design
 */

import { cn } from '@/lib/utils';
import { PublicDreamSlotView, CardDefinition } from '@/game/types';
import { Moon, Eye, Cat } from 'lucide-react';

interface DreamCardProps {
  slot: PublicDreamSlotView;
  index: number;
  isOwn: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  showInitialPeek?: boolean;
  isPeekedDuringSetup?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function DreamCard({ 
  slot, 
  index, 
  isOwn,
  isSelectable = false, 
  isSelected = false,
  onClick,
  showInitialPeek = false,
  isPeekedDuringSetup = false,
  size = 'md',
}: DreamCardProps) {
  const card = slot.card;
  const isVisible = card?.visible !== null && card?.visible !== undefined;
  const shouldShow = showInitialPeek ? isPeekedDuringSetup : isVisible;
  
  const sizeClasses = {
    sm: 'w-16 h-22 sm:w-18 sm:h-26 md:w-20 md:h-28',
    md: 'w-18 h-26 sm:w-22 sm:h-32 md:w-24 md:h-34',
    lg: 'w-22 h-32 sm:w-28 sm:h-40 md:w-32 md:h-44',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={!isSelectable && !onClick}
      className={cn(
        "relative rounded-xl transition-all duration-200 flex flex-col items-center justify-center",
        "border-2 shadow-lg",
        // Size
        sizeClasses[size],
        // Empty slot
        !slot.hasCard && "border-dashed border-purple-400/30 bg-slate-800/40",
        // Face down
        slot.hasCard && !shouldShow && "bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 border-purple-400/40 shadow-purple-500/20",
        // Face up
        slot.hasCard && shouldShow && "bg-slate-800/90 border-purple-400/50 shadow-purple-400/10",
        // Selectable
        isSelectable && "cursor-pointer hover:scale-110 hover:shadow-xl hover:shadow-purple-400/30 hover:border-purple-300 ring-2 ring-purple-400/60 ring-offset-2 ring-offset-slate-900",
        isSelected && "ring-2 ring-purple-300 scale-110 shadow-xl shadow-purple-400/40",
        !isSelectable && !onClick && "cursor-default"
      )}
      aria-label={`Dream slot ${index + 1}${shouldShow && card?.visible ? `, value ${card.visible.crowValue}` : ', face down'}`}
    >
      {!slot.hasCard ? (
        <Moon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400/40" />
      ) : shouldShow && card?.visible ? (
        <CardFace definition={card.visible} size={size} />
      ) : (
        <div className="flex flex-col items-center text-purple-200/70">
          <Moon className="w-8 h-8 sm:w-10 sm:h-10" />
          <span className="text-xs sm:text-sm mt-1 font-medium opacity-60">Dream</span>
        </div>
      )}
      
      {/* Slot number badge */}
      <div className={cn(
        "absolute -bottom-2 left-1/2 -translate-x-1/2",
        "w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs sm:text-sm font-bold",
        "flex items-center justify-center",
        "bg-slate-800 border-2 border-purple-400/40 text-purple-200",
        "shadow-md"
      )}>
        {index + 1}
      </div>
      
      {/* Peek indicator during setup */}
      {showInitialPeek && !isPeekedDuringSetup && (
        <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-500 flex items-center justify-center animate-pulse shadow-lg shadow-amber-500/50">
          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
      )}
      
      {/* Selected for peek indicator */}
      {isPeekedDuringSetup && (
        <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/50">
          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
      )}
    </button>
  );
}

function CardFace({ definition, size }: { definition: CardDefinition; size: 'sm' | 'md' | 'lg' }) {
  const getColor = (value: number) => {
    if (value <= 2) return 'text-emerald-400';
    if (value <= 5) return 'text-amber-400';
    return 'text-rose-400';
  };
  
  const valueSize = {
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-4xl',
    lg: 'text-4xl sm:text-5xl',
  };
  
  const catSize = {
    sm: 'w-2.5 h-2.5 sm:w-3 sm:h-3',
    md: 'w-3 h-3 sm:w-4 sm:h-4',
    lg: 'w-4 h-4 sm:w-5 sm:h-5',
  };
  
  const hasEffect = definition.effectType !== 'none';
  
  return (
    <div className="flex flex-col items-center justify-center p-1 sm:p-2">
      <div className={cn(
        "font-bold leading-none",
        getColor(definition.crowValue),
        valueSize[size]
      )}>
        {definition.crowValue}
      </div>
      <div className="flex gap-0.5 sm:gap-1 mt-1">
        {Array.from({ length: Math.min(definition.crowValue, 4) }).map((_, i) => (
          <Cat key={i} className={cn(catSize[size], getColor(definition.crowValue))} />
        ))}
      </div>
      <div className={cn(
        "mt-1 sm:mt-2 text-center line-clamp-1 px-1",
        hasEffect ? "text-purple-300 font-semibold" : "text-purple-300/70",
        size === 'sm' ? 'text-[9px] sm:text-[10px]' : 'text-[10px] sm:text-xs'
      )}>
        {definition.name}
      </div>
    </div>
  );
}
