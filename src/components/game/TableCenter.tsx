
import React from 'react';
import { Card } from './Card';
import { PublicCardView } from '@/game/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Assuming ui components exist, otherwise standard button

interface TableCenterProps {
  deckCount: number;
  topDiscard: PublicCardView | null;
  onDrawDeck?: () => void;
  onDrawDiscard?: () => void;
  onWakeUp?: () => void;
  canWakeUp?: boolean;
  canDrawDeck?: boolean;
  canDrawDiscard?: boolean;
  className?: string;
  gamePhase?: string;
}

export const TableCenter: React.FC<TableCenterProps> = ({
  deckCount,
  topDiscard,
  onDrawDeck,
  onDrawDiscard,
  onWakeUp,
  canWakeUp,
  canDrawDeck,
  canDrawDiscard,
  className,
  gamePhase
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-8", className)}>

      <div className="flex items-center gap-8 md:gap-16">
        {/* Draw Pile */}
        <div className="relative group">
          <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          <div
             className={cn(
               "relative",
               canDrawDeck ? "cursor-pointer" : "opacity-80"
             )}
             onClick={canDrawDeck ? onDrawDeck : undefined}
          >
             {deckCount > 0 ? (
               <>
                 {/* Stack effect */}
                 {deckCount > 1 && (
                   <div className="absolute top-0 left-0 w-full h-full bg-indigo-900 rounded-lg translate-x-1 translate-y-1 border border-indigo-800" />
                 )}
                 {deckCount > 2 && (
                   <div className="absolute top-0 left-0 w-full h-full bg-indigo-900 rounded-lg translate-x-2 translate-y-2 border border-indigo-800" />
                 )}
                 <Card
                   isFlipped={true} // Always back for draw pile
                   className="relative shadow-2xl"
                   disabled={!canDrawDeck}
                 />
                 <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-300 uppercase tracking-widest">
                   Draw Pile
                 </div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-200/30 text-2xl font-bold pointer-events-none">
                   {deckCount}
                 </div>
               </>
             ) : (
               <div className="w-20 md:w-24 lg:w-32 aspect-[2/3] rounded-lg border-2 border-dashed border-indigo-800/50 flex items-center justify-center">
                 <span className="text-indigo-800/50 text-xs">Empty</span>
               </div>
             )}
          </div>
        </div>

        {/* Discard Pile */}
        <div className="relative group">
           <div
             className={cn(
               "relative",
               canDrawDiscard ? "cursor-pointer" : ""
             )}
             onClick={canDrawDiscard ? onDrawDiscard : undefined}
           >
             {topDiscard ? (
               <>
                 <Card
                   card={topDiscard}
                   isFlipped={false}
                   className={cn("shadow-2xl", canDrawDiscard && "ring-4 ring-green-400/50")}
                   disabled={!canDrawDiscard && gamePhase === 'playing'}
                 />
                 <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-300 uppercase tracking-widest">
                   Discard
                 </div>
               </>
             ) : (
               <div className="w-20 md:w-24 lg:w-32 aspect-[2/3] rounded-lg border-2 border-dashed border-indigo-800/50 flex items-center justify-center">
                 <span className="text-indigo-800/50 text-xs">Discard</span>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Wake Up Button */}
      {canWakeUp && (
        <button
          onClick={onWakeUp}
          className="px-8 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200 rounded-full font-bold tracking-widest uppercase transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse"
        >
          Pobudka! (Wake Up)
        </button>
      )}

    </div>
  );
};
