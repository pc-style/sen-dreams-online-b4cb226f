/**
 * Player Panel - Clean, accessible design
 */

import { cn } from '@/lib/utils';
import { PublicPlayerView, PublicDreamSlotView } from '@/game/types';
import { DreamCard } from './DreamCard';
import { User, Cat } from 'lucide-react';

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
      "relative rounded-2xl transition-all",
      "border-2 bg-slate-900/70 backdrop-blur-sm",
      player.isActivePlayer 
        ? "border-purple-400/60 shadow-xl shadow-purple-500/30" 
        : "border-purple-500/30",
      isMe && "border-purple-400/50 bg-slate-900/80",
      size === 'sm' ? "p-3" : "p-4 sm:p-5"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={cn(
            "rounded-full flex items-center justify-center",
            isMe 
              ? "bg-purple-500/40 text-purple-100" 
              : "bg-slate-700/60 text-purple-300/70",
            size === 'sm' ? "w-7 h-7" : "w-9 h-9 sm:w-10 sm:h-10"
          )}>
            <User className={size === 'sm' ? "w-4 h-4" : "w-5 h-5 sm:w-6 sm:h-6"} />
          </div>
          <span className={cn(
            "font-semibold truncate",
            isMe ? "text-purple-100" : "text-purple-200/90",
            size === 'sm' ? "text-sm max-w-[80px]" : "text-base sm:text-lg max-w-[120px] sm:max-w-[150px]"
          )}>
            {player.playerName}
            {isMe && <span className="text-purple-400/80 ml-1">(You)</span>}
          </span>
        </div>
        
        <div className={cn(
          "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full",
          "bg-slate-800/80 border border-purple-400/30"
        )}>
          <Cat className={cn(
            "text-purple-400/80",
            size === 'sm' ? "w-3.5 h-3.5" : "w-4 h-4 sm:w-5 sm:h-5"
          )} />
          <span className={cn(
            "font-bold text-purple-100",
            size === 'sm' ? "text-sm" : "text-base sm:text-lg"
          )}>
            {player.totalScore}
          </span>
        </div>
      </div>
      
      {/* Dream slots */}
      <div className={cn(
        "flex items-center justify-center flex-wrap",
        size === 'sm' ? "gap-2 sm:gap-3" : "gap-3 sm:gap-4"
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
      
      {/* Active indicator */}
      {player.isActivePlayer && (
        <div className={cn(
          "absolute -top-3 left-1/2 -translate-x-1/2",
          "px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500",
          "text-white text-xs sm:text-sm font-bold rounded-full",
          "shadow-lg shadow-purple-500/40"
        )}>
          Your Turn
        </div>
      )}
    </div>
  );
}
