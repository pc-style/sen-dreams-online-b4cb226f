
import React from 'react';
import { Card } from './Card';
import { PublicDreamSlotView } from '@/game/types';
import { cn } from '@/lib/utils';

interface PlayerZoneProps {
  name: string;
  slots: PublicDreamSlotView[];
  isCurrentPlayer: boolean;
  isActive: boolean; // Is it this player's turn?
  score?: number;
  onSlotClick?: (index: number) => void;
  selectedSlotIndex?: number | null;
  className?: string;
  compact?: boolean; // For opponents
}

export const PlayerZone: React.FC<PlayerZoneProps> = ({
  name,
  slots,
  isCurrentPlayer,
  isActive,
  score,
  onSlotClick,
  selectedSlotIndex,
  className,
  compact = false
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center gap-2 p-4 rounded-xl transition-colors",
      isActive ? "bg-indigo-900/30 ring-2 ring-indigo-400/50" : "bg-black/20",
      className
    )}>
      {/* Player Info */}
      <div className="flex items-center gap-3 mb-2">
        <div className={cn(
          "px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border",
          isActive
            ? "bg-indigo-500/20 border-indigo-400 text-indigo-100 shadow-[0_0_10px_rgba(129,140,248,0.5)]"
            : "bg-slate-800/40 border-slate-600 text-slate-300"
        )}>
          {name}
        </div>
        {score !== undefined && (
          <div className="text-xs text-indigo-200 font-mono bg-indigo-950/50 px-2 py-1 rounded">
            PTS: {score}
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div className="flex gap-2 md:gap-4">
        {slots.map((slot, idx) => (
          <div key={idx} className="relative">
             <Card
               card={slot.card}
               isFlipped={!slot.isRevealed && !slot.card?.visible} // If we can't see the card definition, it's flipped (back showing)
               // However, logic says `visible` is null if we can't see it.
               // My Card component logic: if !isFlipped and card.visible -> show front.
               // So if I pass isFlipped=false, it checks card.visible.
               // If card.visible is null, it acts as back? No, my Card logic: `if (!isFlipped && card && card.visible)`.
               // So if card.visible is null, it shows back.
               // So `isFlipped` prop can be just `false` always, and we rely on `visible`.
               // BUT, visually we might want to animate the flip.
               // For now, let's just pass false and let the `card.visible` nullity handle the face-down state.
               isFlipped={false}

               onClick={() => onSlotClick?.(idx)}
               selected={selectedSlotIndex === idx}
               className={compact ? "w-12 md:w-16 lg:w-20" : undefined} // Smaller for opponents
             />
             {/* Slot Number/Label if needed */}
             {isCurrentPlayer && (
               <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-indigo-300/50">
                 {idx + 1}
               </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};
