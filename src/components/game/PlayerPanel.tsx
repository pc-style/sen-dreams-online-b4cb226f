/**
 * Player Panel Component
 * Shows a player's dream row and status
 */

import { cn } from '@/lib/utils';
import { PublicPlayerView, PublicDreamSlotView } from '@/game/types';
import { DreamCard } from './DreamCard';
import { User, Wifi, WifiOff, Crown, Bird } from 'lucide-react';

interface PlayerPanelProps {
  player: PublicPlayerView;
  isMe: boolean;
  myDreamSlots?: PublicDreamSlotView[];
  isHost?: boolean;
  selectableSlots?: number[];
  selectedSlot?: number | null;
  onSlotClick?: (index: number) => void;
  showInitialPeek?: boolean;
}

export function PlayerPanel({
  player,
  isMe,
  myDreamSlots,
  isHost = false,
  selectableSlots = [],
  selectedSlot = null,
  onSlotClick,
  showInitialPeek = false,
}: PlayerPanelProps) {
  const slots = isMe && myDreamSlots ? myDreamSlots : player.dreamSlots;
  
  return (
    <div className={cn(
      "relative rounded-xl p-4 transition-all duration-300",
      "border-2",
      player.isActivePlayer && "border-accent shadow-lg shadow-accent/20",
      !player.isActivePlayer && "border-border bg-card/50",
      isMe && "bg-card"
    )}>
      {/* Player header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            isMe ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "font-medium text-sm",
                isMe && "text-primary"
              )}>
                {player.playerName}
                {isMe && " (You)"}
              </span>
              {isHost && <Crown className="w-3.5 h-3.5 text-amber-500" />}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {player.isConnected ? (
                <Wifi className="w-3 h-3 text-emerald-500" />
              ) : (
                <WifiOff className="w-3 h-3 text-rose-500" />
              )}
              <span>Seat {player.seatIndex + 1}</span>
            </div>
          </div>
        </div>
        
        {/* Score display */}
        <div className="text-right">
          <div className="flex items-center gap-1 text-lg font-bold">
            <Bird className="w-4 h-4 text-muted-foreground" />
            <span>{player.totalScore}</span>
          </div>
          {player.roundScore > 0 && (
            <div className="text-xs text-muted-foreground">
              +{player.roundScore} this round
            </div>
          )}
        </div>
      </div>
      
      {/* Dream slots */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
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
          />
        ))}
      </div>
      
      {/* Active player indicator */}
      {player.isActivePlayer && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
          Active Turn
        </div>
      )}
    </div>
  );
}
