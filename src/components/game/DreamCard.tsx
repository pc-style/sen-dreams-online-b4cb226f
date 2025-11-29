/**
 * Dream Card - Compact dreamy design
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
  isPeekedDuringSetup?: boolean; // Card user chose to peek during initial_peek
  compact?: boolean;
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
  compact = false,
}: DreamCardProps) {
  const card = slot.card;
  const isVisible = card?.visible !== null && card?.visible !== undefined;
  // During initial peek phase, only show card if player selected it to peek
  // Otherwise, show based on normal visibility
  const shouldShow = showInitialPeek ? isPeekedDuringSetup : isVisible;
  
  return (
    <button
      onClick={onClick}
      disabled={!isSelectable && !onClick}
      className={cn(
        "relative rounded-lg transition-all flex flex-col items-center justify-center",
        "border shadow-md",
        compact ? "w-12 h-16 sm:w-14 sm:h-20" : "w-14 h-20 sm:w-16 sm:h-24",
        !slot.hasCard && "border-dashed border-purple-400/20 bg-slate-800/30",
        slot.hasCard && !shouldShow && "bg-gradient-to-br from-purple-600 to-indigo-700 border-purple-400/30",
        slot.hasCard && shouldShow && "bg-slate-800/80 border-purple-400/40",
        isSelectable && "cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-purple-400/40 hover:border-purple-300 animate-pulse ring-1 ring-purple-400/50",
        isSelected && "ring-2 ring-purple-400 scale-105 animate-none",
        !isSelectable && !onClick && "cursor-default"
      )}
    >
      {!slot.hasCard ? (
        <Moon className="w-4 h-4 text-purple-400/30" />
      ) : shouldShow && card?.visible ? (
        <CardFace definition={card.visible} compact={compact} />
      ) : (
        <div className="flex flex-col items-center text-purple-200/60">
          <Moon className={cn(compact ? "w-5 h-5" : "w-6 h-6")} />
          <span className="text-[8px] mt-0.5 opacity-50">Dream</span>
        </div>
      )}
      
      {/* Slot number */}
      <div className={cn(
        "absolute -bottom-1.5 left-1/2 -translate-x-1/2",
        "w-4 h-4 rounded-full text-[9px] font-medium",
        "flex items-center justify-center",
        "bg-slate-800 border border-purple-400/30 text-purple-200"
      )}>
        {index + 1}
      </div>
      
      {/* Peek indicator during setup */}
      {showInitialPeek && !isPeekedDuringSetup && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500/80 flex items-center justify-center animate-pulse">
          <Eye className="w-2.5 h-2.5 text-white" />
        </div>
      )}
      
      {/* Selected for peek indicator */}
      {isPeekedDuringSetup && (
        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500/80 flex items-center justify-center">
          <Eye className="w-2.5 h-2.5 text-white" />
        </div>
      )}
    </button>
  );
}

function CardFace({ definition, compact }: { definition: CardDefinition; compact?: boolean }) {
  const getColor = (value: number) => {
    if (value <= 2) return 'text-emerald-400';
    if (value <= 5) return 'text-amber-400';
    return 'text-rose-400';
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-0.5">
      <div className={cn(
        "font-bold",
        getColor(definition.crowValue),
        compact ? "text-lg" : "text-xl"
      )}>
        {definition.crowValue}
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: Math.min(definition.crowValue, 3) }).map((_, i) => (
          <Cat key={i} className={cn("w-2 h-2", getColor(definition.crowValue))} />
        ))}
      </div>
      {!compact && (
        <div className="text-[7px] text-purple-300/60 mt-0.5 line-clamp-1">
          {definition.name}
        </div>
      )}
    </div>
  );
}
