/**
 * Central Game Area - Compact dreamy design
 */

import { cn } from '@/lib/utils';
import { PublicCardView, TurnPhase, CardDefinition } from '@/game/types';
import { Button } from '@/components/ui/button';
import { Moon, Cat, Sparkles } from 'lucide-react';

interface CentralAreaProps {
  deckCount: number;
  topDiscard: PublicCardView | null;
  drawnCard: PublicCardView | null;
  takeTwoCards: PublicCardView[] | null;
  isMyTurn: boolean;
  turnPhase: TurnPhase;
  onDrawFromDeck: () => void;
  onDrawFromDiscard: () => void;
  onDiscard: () => void;
  onUseEffect: () => void;
  onDeclareWakeUp: () => void;
  onChooseTakeTwo: (index: number) => void;
  canDiscard: boolean;
  canUseEffect: boolean;
}

export function CentralArea({
  deckCount,
  topDiscard,
  drawnCard,
  takeTwoCards,
  isMyTurn,
  turnPhase,
  onDrawFromDeck,
  onDrawFromDiscard,
  onDiscard,
  onUseEffect,
  onDeclareWakeUp,
  onChooseTakeTwo,
  canDiscard,
  canUseEffect,
}: CentralAreaProps) {
  const showDrawOptions = isMyTurn && turnPhase === 'draw';
  const showActionOptions = isMyTurn && turnPhase === 'action' && drawnCard;
  const showTakeTwoOptions = isMyTurn && turnPhase === 'take_two_choose' && takeTwoCards;
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-2">
      {/* Turn indicator */}
      {isMyTurn && turnPhase === 'draw' && (
        <div className="text-center">
          <span className="text-purple-300 font-medium text-sm">Your Turn</span>
          <p className="text-xs text-purple-400/60">Draw a card or call Pobudka!</p>
        </div>
      )}
      
      {/* Wake up button */}
      {isMyTurn && turnPhase === 'draw' && (
        <Button
          onClick={onDeclareWakeUp}
          variant="outline"
          size="sm"
          className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 bg-transparent"
        >
          <Sparkles className="w-3 h-3 mr-1.5" />
          Pobudka!
        </Button>
      )}
      
      {/* Deck and Discard */}
      <div className="flex items-center gap-4">
        {/* Deck */}
        <button
          onClick={onDrawFromDeck}
          disabled={!showDrawOptions || deckCount === 0}
          className={cn(
            "relative w-14 h-20 sm:w-16 sm:h-24 rounded-lg transition-all",
            "bg-gradient-to-br from-purple-600 to-indigo-700 border border-purple-400/30",
            "flex flex-col items-center justify-center",
            "shadow-lg shadow-purple-900/50",
            showDrawOptions && deckCount > 0 && "cursor-pointer hover:scale-105 hover:shadow-purple-500/30",
            (!showDrawOptions || deckCount === 0) && "opacity-50 cursor-not-allowed"
          )}
        >
          <Moon className="w-6 h-6 text-purple-200/60" />
          <span className="text-purple-200/50 text-[10px] mt-1">Deck</span>
          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-800 border border-purple-400/30 flex items-center justify-center text-[10px] font-bold text-purple-200">
            {deckCount}
          </div>
        </button>
        
        {/* Discard */}
        <button
          onClick={onDrawFromDiscard}
          disabled={!showDrawOptions || !topDiscard}
          className={cn(
            "relative w-14 h-20 sm:w-16 sm:h-24 rounded-lg transition-all",
            "border shadow-lg",
            topDiscard ? "bg-slate-800/80 border-purple-400/30" : "bg-slate-800/40 border-dashed border-purple-400/20",
            showDrawOptions && topDiscard && "cursor-pointer hover:scale-105",
            (!showDrawOptions || !topDiscard) && "opacity-50 cursor-not-allowed"
          )}
        >
          {topDiscard?.visible ? (
            <MiniCardFace definition={topDiscard.visible} />
          ) : (
            <span className="text-purple-300/30 text-[10px]">Empty</span>
          )}
        </button>
      </div>
      
      {/* Take Two choice */}
      {showTakeTwoOptions && takeTwoCards && (
        <div className="flex flex-col items-center gap-2 animate-in fade-in">
          <span className="text-xs text-purple-300">Choose one to keep:</span>
          <div className="flex gap-3">
            {takeTwoCards.map((card, idx) => (
              <button
                key={idx}
                onClick={() => onChooseTakeTwo(idx)}
                className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg bg-slate-800/80 border-2 border-purple-400/50 hover:border-purple-300 hover:scale-105 transition-all"
              >
                {card.visible && <MiniCardFace definition={card.visible} />}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Drawn card */}
      {drawnCard && !showTakeTwoOptions && (
        <div className="flex flex-col items-center gap-2 animate-in slide-in-from-top-4">
          <span className="text-xs text-purple-300/70">You drew:</span>
          <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg bg-slate-800/80 border-2 border-purple-400/50 shadow-lg shadow-purple-500/20 flex items-center justify-center">
            {drawnCard.visible && <CardFace definition={drawnCard.visible} />}
          </div>
          
          {showActionOptions && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {canDiscard && (
                <Button 
                  onClick={onDiscard} 
                  variant="outline" 
                  size="sm"
                  className="bg-transparent border-purple-400/30 text-purple-200 hover:bg-purple-500/10 text-xs h-7"
                >
                  Discard
                </Button>
              )}
              {canUseEffect && (
                <Button 
                  onClick={onUseEffect} 
                  size="sm"
                  className="bg-purple-600/80 hover:bg-purple-500 text-white text-xs h-7"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Use Effect
                </Button>
              )}
            </div>
          )}
          {showActionOptions && (
            <p className="text-[10px] text-purple-400/50 text-center">
              {canDiscard ? 'Or tap a dream slot to replace' : 'Tap a dream slot to replace (must swap)'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function MiniCardFace({ definition }: { definition: CardDefinition }) {
  const getColor = (value: number) => {
    if (value <= 2) return 'text-emerald-400';
    if (value <= 5) return 'text-amber-400';
    return 'text-rose-400';
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-1">
      <div className={cn("text-xl sm:text-2xl font-bold", getColor(definition.crowValue))}>
        {definition.crowValue}
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: Math.min(definition.crowValue, 3) }).map((_, i) => (
          <Cat key={i} className={cn("w-2 h-2", getColor(definition.crowValue))} />
        ))}
      </div>
      <div className="text-[8px] text-purple-300/60 mt-0.5 line-clamp-1">
        {definition.name}
      </div>
    </div>
  );
}

function CardFace({ definition }: { definition: CardDefinition }) {
  const getColor = (value: number) => {
    if (value <= 2) return 'text-emerald-400';
    if (value <= 5) return 'text-amber-400';
    return 'text-rose-400';
  };
  
  const hasEffect = definition.effectType !== 'none';
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-1.5">
      <div className={cn("text-2xl sm:text-3xl font-bold", getColor(definition.crowValue))}>
        {definition.crowValue}
      </div>
      <div className="flex gap-0.5 mt-0.5">
        {Array.from({ length: Math.min(definition.crowValue, 4) }).map((_, i) => (
          <Cat key={i} className={cn("w-2.5 h-2.5", getColor(definition.crowValue))} />
        ))}
      </div>
      <div className={cn(
        "text-[9px] mt-1 text-center",
        hasEffect ? "text-purple-300 font-medium" : "text-purple-300/60"
      )}>
        {definition.name}
      </div>
      {hasEffect && (
        <div className="text-[8px] text-purple-400/50 text-center px-1">
          {definition.description}
        </div>
      )}
    </div>
  );
}
