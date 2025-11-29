/**
 * Central Game Area - Accessible, animated design
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
    <div className="flex-1 flex flex-col items-center justify-center gap-4 sm:gap-6 py-4 sm:py-6">
      {/* Turn indicator */}
      {isMyTurn && turnPhase === 'draw' && (
        <div className="text-center animate-fade-in">
          <h2 className="text-purple-200 font-bold text-lg sm:text-xl mb-1">Your Turn</h2>
          <p className="text-sm sm:text-base text-purple-300/70">Draw a card or declare Pobudka!</p>
        </div>
      )}
      
      {/* Wake up button */}
      {isMyTurn && turnPhase === 'draw' && (
        <Button
          onClick={onDeclareWakeUp}
          variant="outline"
          size="lg"
          className="border-2 border-amber-500/60 text-amber-400 hover:bg-amber-500/20 bg-transparent font-bold text-base sm:text-lg px-6 py-3"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Pobudka!
        </Button>
      )}
      
      {/* Deck and Discard */}
      <div className="flex items-center gap-6 sm:gap-8">
        {/* Deck */}
        <button
          onClick={onDrawFromDeck}
          disabled={!showDrawOptions || deckCount === 0}
          aria-label={`Draw from deck, ${deckCount} cards remaining`}
          className={cn(
            "relative w-20 h-28 sm:w-24 sm:h-34 md:w-28 md:h-40 rounded-xl transition-all duration-200",
            "bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800",
            "border-2 border-purple-400/50",
            "flex flex-col items-center justify-center",
            "shadow-xl shadow-purple-900/50",
            showDrawOptions && deckCount > 0 && "cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40 hover:border-purple-300",
            (!showDrawOptions || deckCount === 0) && "opacity-60 cursor-not-allowed"
          )}
        >
          <Moon className="w-8 h-8 sm:w-10 sm:h-10 text-purple-200/70" />
          <span className="text-purple-200/60 text-sm sm:text-base font-medium mt-1">Deck</span>
          <div className={cn(
            "absolute -top-2 -right-2 w-8 h-8 sm:w-9 sm:h-9 rounded-full",
            "bg-slate-800 border-2 border-purple-400/50",
            "flex items-center justify-center text-sm sm:text-base font-bold text-purple-200",
            "shadow-lg"
          )}>
            {deckCount}
          </div>
        </button>
        
        {/* Discard */}
        <button
          onClick={onDrawFromDiscard}
          disabled={!showDrawOptions || !topDiscard}
          aria-label={`Draw from discard pile${topDiscard?.visible ? `, top card is ${topDiscard.visible.crowValue}` : ''}`}
          className={cn(
            "relative w-20 h-28 sm:w-24 sm:h-34 md:w-28 md:h-40 rounded-xl transition-all duration-200",
            "border-2 shadow-xl",
            topDiscard 
              ? "bg-slate-800/90 border-purple-400/50" 
              : "bg-slate-800/50 border-dashed border-purple-400/30",
            showDrawOptions && topDiscard && "cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-purple-400/30 hover:border-purple-300",
            (!showDrawOptions || !topDiscard) && "opacity-60 cursor-not-allowed"
          )}
        >
          {topDiscard?.visible ? (
            <PileCardFace definition={topDiscard.visible} />
          ) : (
            <span className="text-purple-300/40 text-sm sm:text-base font-medium">Empty</span>
          )}
        </button>
      </div>
      
      {/* Take Two choice */}
      {showTakeTwoOptions && takeTwoCards && (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <h3 className="text-base sm:text-lg font-bold text-purple-200">Choose one card to keep:</h3>
          <div className="flex gap-4 sm:gap-6">
            {takeTwoCards.map((card, idx) => (
              <button
                key={idx}
                onClick={() => onChooseTakeTwo(idx)}
                className={cn(
                  "w-22 h-32 sm:w-28 sm:h-40 rounded-xl",
                  "bg-slate-800/90 border-2 border-purple-400/60",
                  "hover:border-purple-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-400/30",
                  "transition-all duration-200"
                )}
              >
                {card.visible && <PileCardFace definition={card.visible} />}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Drawn card */}
      {drawnCard && !showTakeTwoOptions && (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <h3 className="text-base sm:text-lg font-semibold text-purple-200/90">You drew:</h3>
          <div className={cn(
            "w-24 h-34 sm:w-32 sm:h-44 md:w-36 md:h-50 rounded-xl",
            "bg-slate-800/90 border-2 border-purple-400/60",
            "shadow-2xl shadow-purple-500/30",
            "flex items-center justify-center",
            "animate-scale-in"
          )}>
            {drawnCard.visible && <DrawnCardFace definition={drawnCard.visible} />}
          </div>
          
          {showActionOptions && (
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {canDiscard && (
                <Button 
                  onClick={onDiscard} 
                  variant="outline" 
                  size="lg"
                  className="bg-transparent border-2 border-purple-400/50 text-purple-200 hover:bg-purple-500/20 font-semibold text-sm sm:text-base px-5 py-2.5"
                >
                  Discard
                </Button>
              )}
              {canUseEffect && (
                <Button 
                  onClick={onUseEffect} 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm sm:text-base px-5 py-2.5"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Use Effect
                </Button>
              )}
            </div>
          )}
          {showActionOptions && (
            <p className="text-sm sm:text-base text-purple-300/70 text-center max-w-xs">
              {canDiscard 
                ? 'Or tap a dream slot to swap this card' 
                : 'Tap a dream slot to swap (must keep this card)'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PileCardFace({ definition }: { definition: CardDefinition }) {
  const getColor = (value: number) => {
    if (value <= 2) return 'text-emerald-400';
    if (value <= 5) return 'text-amber-400';
    return 'text-rose-400';
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-2 sm:p-3">
      <div className={cn("text-3xl sm:text-4xl md:text-5xl font-bold leading-none", getColor(definition.crowValue))}>
        {definition.crowValue}
      </div>
      <div className="flex gap-1 mt-1 sm:mt-2">
        {Array.from({ length: Math.min(definition.crowValue, 4) }).map((_, i) => (
          <Cat key={i} className={cn("w-3 h-3 sm:w-4 sm:h-4", getColor(definition.crowValue))} />
        ))}
      </div>
      <div className="text-xs sm:text-sm text-purple-300/70 mt-1 sm:mt-2 line-clamp-1 px-1 text-center">
        {definition.name}
      </div>
    </div>
  );
}

function DrawnCardFace({ definition }: { definition: CardDefinition }) {
  const getColor = (value: number) => {
    if (value <= 2) return 'text-emerald-400';
    if (value <= 5) return 'text-amber-400';
    return 'text-rose-400';
  };
  
  const hasEffect = definition.effectType !== 'none';
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-3 sm:p-4">
      <div className={cn("text-4xl sm:text-5xl md:text-6xl font-bold leading-none", getColor(definition.crowValue))}>
        {definition.crowValue}
      </div>
      <div className="flex gap-1 sm:gap-1.5 mt-2 sm:mt-3">
        {Array.from({ length: Math.min(definition.crowValue, 5) }).map((_, i) => (
          <Cat key={i} className={cn("w-4 h-4 sm:w-5 sm:h-5", getColor(definition.crowValue))} />
        ))}
      </div>
      <div className={cn(
        "mt-2 sm:mt-3 text-center px-2",
        hasEffect ? "text-purple-200 font-bold" : "text-purple-300/80",
        "text-sm sm:text-base"
      )}>
        {definition.name}
      </div>
      {hasEffect && (
        <div className="text-xs sm:text-sm text-purple-400/70 text-center px-2 mt-1">
          {definition.description}
        </div>
      )}
    </div>
  );
}
