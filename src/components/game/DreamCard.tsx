/**
 * Dream Card Component
 * Displays a card in a dream slot with proper visibility
 */

import { cn } from '@/lib/utils';
import { PublicDreamSlotView, CardDefinition } from '@/game/types';
import { Moon, Eye, Bird } from 'lucide-react';

interface DreamCardProps {
  slot: PublicDreamSlotView;
  index: number;
  isOwn: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  showInitialPeek?: boolean;  // For initial peek phase
}

export function DreamCard({ 
  slot, 
  index, 
  isOwn,
  isSelectable = false, 
  isSelected = false,
  onClick,
  showInitialPeek = false,
}: DreamCardProps) {
  const card = slot.card;
  const isVisible = card?.visible !== null;
  const canPeek = showInitialPeek && isOwn && (index === 0 || index === 3);
  const shouldShow = isVisible || canPeek;
  
  return (
    <button
      onClick={onClick}
      disabled={!isSelectable && !onClick}
      className={cn(
        "relative w-16 h-24 sm:w-20 sm:h-28 rounded-lg transition-all duration-300",
        "flex flex-col items-center justify-center gap-1",
        "border-2 shadow-md",
        !slot.hasCard && "border-dashed border-muted-foreground/30 bg-muted/20",
        slot.hasCard && !shouldShow && "bg-gradient-to-br from-primary/80 to-primary border-primary/60",
        slot.hasCard && shouldShow && "bg-card border-border",
        isSelectable && "cursor-pointer hover:scale-105 hover:shadow-lg hover:border-accent",
        isSelected && "ring-2 ring-accent ring-offset-2 ring-offset-background scale-105",
        !isSelectable && !onClick && "cursor-default"
      )}
    >
      {!slot.hasCard ? (
        <Moon className="w-6 h-6 text-muted-foreground/40" />
      ) : shouldShow && card?.visible ? (
        <CardFace definition={card.visible} />
      ) : (
        <div className="flex flex-col items-center text-primary-foreground">
          <Moon className="w-8 h-8 opacity-60" />
          <span className="text-xs mt-1 opacity-40">Dream</span>
        </div>
      )}
      
      {/* Slot indicator */}
      <div className={cn(
        "absolute -bottom-2 left-1/2 -translate-x-1/2",
        "w-5 h-5 rounded-full text-xs font-medium",
        "flex items-center justify-center",
        "bg-background border border-border shadow-sm"
      )}>
        {index + 1}
      </div>
      
      {/* Peek indicator for initial phase */}
      {canPeek && !slot.isRevealed && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center animate-pulse">
          <Eye className="w-3 h-3 text-accent-foreground" />
        </div>
      )}
    </button>
  );
}

// Card face when visible
function CardFace({ definition }: { definition: CardDefinition }) {
  const getCrowColor = (value: number) => {
    if (value <= 2) return 'text-emerald-600';
    if (value <= 5) return 'text-amber-600';
    return 'text-rose-600';
  };
  
  const hasEffect = definition.effectType !== 'none';
  
  return (
    <div className="flex flex-col items-center text-center p-1">
      <div className={cn(
        "text-2xl font-bold",
        getCrowColor(definition.crowValue)
      )}>
        {definition.crowValue}
      </div>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: Math.min(definition.crowValue, 5) }).map((_, i) => (
          <Bird key={i} className={cn("w-2.5 h-2.5", getCrowColor(definition.crowValue))} />
        ))}
      </div>
      <div className={cn(
        "text-[8px] leading-tight mt-1 line-clamp-2",
        hasEffect ? "text-accent-foreground font-medium" : "text-muted-foreground"
      )}>
        {definition.name}
      </div>
    </div>
  );
}
