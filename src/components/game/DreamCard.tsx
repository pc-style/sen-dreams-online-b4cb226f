/**
 * Dream Card - Clean, neutral design with 2:3 aspect ratio
 * Ready for custom card artwork
 */

import { cn } from '@/lib/utils';
import { PublicDreamSlotView, CardDefinition } from '@/game/types';
import { Eye } from 'lucide-react';

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
  
  // 2:3 aspect ratio card sizes - optimized for mobile
  const sizeClasses = {
    sm: 'w-[60px] h-[90px] sm:w-[70px] sm:h-[105px] md:w-[80px] md:h-[120px]',
    md: 'w-[70px] h-[105px] sm:w-[84px] sm:h-[126px] md:w-[96px] md:h-[144px]',
    lg: 'w-[90px] h-[135px] sm:w-[110px] sm:h-[165px] md:w-[128px] md:h-[192px]',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={!isSelectable && !onClick}
      className={cn(
        "relative aspect-card rounded-lg transition-all duration-200",
        "flex flex-col items-center justify-center overflow-hidden",
        "border-2 shadow-card",
        // Size
        sizeClasses[size],
        // Empty slot
        !slot.hasCard && "border-dashed border-muted-foreground/30 bg-muted/20",
        // Face down - uses card back image
        slot.hasCard && !shouldShow && "bg-card border-border",
        // Face up
        slot.hasCard && shouldShow && "bg-card border-border",
        // Selectable state - subtle highlight
        isSelectable && [
          "cursor-pointer",
          "hover:scale-105 hover:shadow-card-hover hover:-translate-y-1",
          "ring-2 ring-primary/60 ring-offset-2 ring-offset-background"
        ],
        // Selected state
        isSelected && "ring-2 ring-primary scale-105 shadow-card-active",
        // Default
        !isSelectable && !onClick && "cursor-default"
      )}
      aria-label={`Dream slot ${index + 1}${shouldShow && card?.visible ? `, value ${card.visible.crowValue}` : ', face down'}`}
    >
      {!slot.hasCard ? (
        // Empty slot
        <div className="flex flex-col items-center justify-center text-muted-foreground/40">
          <span className="text-xs font-medium">Empty</span>
        </div>
      ) : shouldShow && card?.visible ? (
        // Card face - show card content
        <CardFace definition={card.visible} size={size} />
      ) : (
        // Card back
        <div 
          className="absolute inset-0 bg-cover bg-center rounded-md"
          style={{ backgroundImage: 'url(/cards/back.png)' }}
        />
      )}
      
      {/* Slot number - small indicator */}
      <div className={cn(
        "absolute bottom-1 right-1",
        "w-5 h-5 rounded-full text-[10px] font-bold",
        "flex items-center justify-center",
        "bg-background/80 text-foreground/70 backdrop-blur-sm",
        "border border-border/50"
      )}>
        {index + 1}
      </div>
      
      {/* Peek indicator during setup - tap to peek */}
      {showInitialPeek && !isPeekedDuringSetup && (
        <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Eye className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      )}
      
      {/* Already peeked indicator */}
      {isPeekedDuringSetup && (
        <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-game-success flex items-center justify-center">
          <Eye className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      )}
    </button>
  );
}

function CardFace({ definition, size }: { definition: CardDefinition; size: 'sm' | 'md' | 'lg' }) {
  const getValueColor = (value: number) => {
    if (value <= 2) return 'text-game-success';
    if (value <= 5) return 'text-game-warning';
    return 'text-game-danger';
  };
  
  const valueSize = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };
  
  const nameSize = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };
  
  const hasEffect = definition.effectType !== 'none';
  
  return (
    <div className="flex flex-col items-center justify-center p-2 h-full w-full">
      {/* Value */}
      <div className={cn(
        "font-bold leading-none",
        getValueColor(definition.crowValue),
        valueSize[size]
      )}>
        {definition.crowValue}
      </div>
      
      {/* Cats indicator dots */}
      <div className="flex gap-0.5 mt-1.5">
        {Array.from({ length: Math.min(definition.crowValue, 5) }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              definition.crowValue <= 2 ? "bg-game-success" :
              definition.crowValue <= 5 ? "bg-game-warning" : "bg-game-danger"
            )} 
          />
        ))}
      </div>
      
      {/* Card name */}
      <div className={cn(
        "mt-2 text-center line-clamp-2 px-1 leading-tight",
        hasEffect ? "text-accent font-semibold" : "text-muted-foreground",
        nameSize[size]
      )}>
        {definition.name}
      </div>
    </div>
  );
}
