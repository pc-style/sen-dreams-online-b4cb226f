/**
 * Player Panel - Clean, neutral design
 */

import { cn } from '@/lib/utils';
import { PublicPlayerView, PublicDreamSlotView } from '@/game/types';
import { DreamCard } from './DreamCard';
import { User } from 'lucide-react';

interface PlayerPanelProps {
  player: PublicPlayerView;
  isMe: boolean;
  myDreamSlots?: PublicDreamSlotView[];
  selectableSlots?: number[];
  selectedSlot?: number | null;
  onSlotClick?: (index: number) => void;
  showInitialPeek?: boolean;
  peekedSlots?: number[];
  size?: 'sm' | 'md' | 'lg';
}

export function PlayerPanel({
  player,
  isMe,
  myDreamSlots,
  selectableSlots = [],
  selectedSlot = null,
  onSlotClick,
  showInitialPeek = false,
  peekedSlots = [],
  size = 'md',
}: PlayerPanelProps) {
  const slots = isMe && myDreamSlots ? myDreamSlots : player.dreamSlots;
  
  return (
    <div className={cn(
      "relative rounded-xl transition-all",
      "border bg-card/50 backdrop-blur-sm",
      player.isActivePlayer 
        ? "border-primary/50 shadow-glow" 
        : "border-border",
      isMe && "bg-card/70",
      size === 'sm' ? "p-2 sm:p-3" : "p-3 sm:p-4 md:p-5"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={cn(
            "rounded-full flex items-center justify-center",
            isMe 
              ? "bg-primary/20 text-primary" 
              : "bg-muted text-muted-foreground",
            size === 'sm' ? "w-7 h-7" : "w-9 h-9 sm:w-10 sm:h-10"
          )}>
            <User className={size === 'sm' ? "w-4 h-4" : "w-5 h-5 sm:w-6 sm:h-6"} />
          </div>
          <span className={cn(
            "font-semibold truncate",
            isMe ? "text-foreground" : "text-foreground/90",
            size === 'sm' ? "text-sm max-w-[80px]" : "text-base sm:text-lg max-w-[120px] sm:max-w-[150px]"
          )}>
            {player.playerName}
            {isMe && <span className="text-muted-foreground ml-1">(You)</span>}
          </span>
        </div>
        
        {/* Score */}
        <div className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full",
          "bg-muted/50 border border-border"
        )}>
          <span className={cn(
            "font-bold text-foreground",
            size === 'sm' ? "text-sm" : "text-base sm:text-lg"
          )}>
            {player.totalScore}
          </span>
          <span className={cn(
            "text-muted-foreground",
            size === 'sm' ? "text-xs" : "text-sm"
          )}>
            pts
          </span>
        </div>
      </div>
      
      {/* Dream slots - horizontal layout */}
      <div className={cn(
        "flex items-center justify-center flex-wrap",
        size === 'sm' ? "gap-1.5 sm:gap-2" : "gap-2 sm:gap-3 md:gap-4"
      )}>
        {slots.map((slot, index) => (
          <DreamCard
            key={index}
            slot={slot}
            index={index}
            isOwn={isMe}
            isSelectable={selectableSlots.includes(index)}
            isSelected={selectedSlot === index}
            onClick={onSlotClick ? () => onSlotClick(index) : undefined}
            showInitialPeek={showInitialPeek}
            isPeekedDuringSetup={peekedSlots.includes(index)}
            size={size}
          />
        ))}
      </div>
      
      {/* Active turn indicator */}
      {player.isActivePlayer && (
        <div className={cn(
          "absolute -top-2.5 left-1/2 -translate-x-1/2",
          "px-3 py-1 bg-primary text-primary-foreground",
          "text-xs sm:text-sm font-bold rounded-full",
          "shadow-md"
        )}>
          {isMe ? "Your Turn" : "Playing..."}
        </div>
      )}
    </div>
  );
}
