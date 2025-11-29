/**
 * Player Panel - Compact dreamy design
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
  peekedSlots?: number[]; // Slots the player chose to peek during initial_peek
  compact?: boolean;
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
  compact = false,
}: PlayerPanelProps) {
  const slots = isMe && myDreamSlots ? myDreamSlots : player.dreamSlots;
  
  return (
    <div className={cn(
      "relative rounded-xl transition-all",
      "border bg-slate-900/60 backdrop-blur-sm",
      player.isActivePlayer ? "border-purple-400/50 shadow-lg shadow-purple-500/20" : "border-purple-500/20",
      isMe && "border-purple-400/40",
      compact ? "p-2 sm:p-3" : "p-3 sm:p-4"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center",
            isMe ? "bg-purple-500/30 text-purple-200" : "bg-slate-700/50 text-purple-300/60"
          )}>
            <User className="w-3 h-3" />
          </div>
          <span className={cn(
            "text-xs sm:text-sm font-medium truncate max-w-[100px]",
            isMe ? "text-purple-200" : "text-purple-300/80"
          )}>
            {player.playerName}
            {isMe && " (You)"}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-purple-200">
          <Cat className="w-3 h-3 text-purple-400/60" />
          <span className="text-sm font-bold">{player.totalScore}</span>
        </div>
      </div>
      
      {/* Dream slots */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
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
            compact={compact}
          />
        ))}
      </div>
      
      {/* Active indicator */}
      {player.isActivePlayer && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-purple-500/80 text-purple-100 text-[10px] font-medium rounded-full">
          Turn
        </div>
      )}
    </div>
  );
}
