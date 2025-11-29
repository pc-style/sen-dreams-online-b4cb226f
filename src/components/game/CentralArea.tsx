/**
 * Central Game Area - Fixed layout without DOM-shifting animations
 */

import { cn } from '@/lib/utils';
import { PublicCardView, TurnPhase, CardDefinition } from '@/game/types';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

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
    <div className="h-full flex flex-col items-center justify-center gap-3">
      {/* Turn indicator - always reserve space */}
      <div className="h-12 flex flex-col items-center justify-center shrink-0">
        {isMyTurn && turnPhase === 'draw' && (
          <>
            <h2 className="text-foreground font-bold text-base">Your Turn</h2>
            <p className="text-xs text-muted-foreground">Draw a card or declare Pobudka!</p>
          </>
        )}
        {showActionOptions && (
          <p className="text-xs text-muted-foreground text-center">
            {canDiscard ? 'Discard, use effect, or tap a slot to swap' : 'Tap a dream slot to swap'}
          </p>
        )}
      </div>
      
      {/* Main card area - deck/discard OR drawn card */}
      <div className="flex items-center justify-center gap-4 shrink-0">
        {/* Show deck/discard when in draw phase or no drawn card */}
        {(!drawnCard || showTakeTwoOptions) && (
          <>
            {/* Deck */}
            <button
              onClick={onDrawFromDeck}
              disabled={!showDrawOptions || deckCount === 0}
              aria-label={`Draw from deck, ${deckCount} cards remaining`}
              className={cn(
                "relative w-[72px] h-[108px] sm:w-[88px] sm:h-[132px]",
                "rounded-lg transition-all duration-150",
                "border-2 shadow-card overflow-hidden",
                showDrawOptions && deckCount > 0 && [
                  "cursor-pointer hover:scale-[1.02] hover:shadow-card-hover",
                  "border-primary/50 hover:border-primary"
                ],
                (!showDrawOptions || deckCount === 0) && "opacity-50 cursor-not-allowed border-border"
              )}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(/cards/back.png)' }}
              />
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold text-foreground shadow z-10">
                {deckCount}
              </div>
            </button>
            
            {/* Discard pile */}
            <button
              onClick={onDrawFromDiscard}
              disabled={!showDrawOptions || !topDiscard}
              aria-label={`Draw from discard pile${topDiscard?.visible ? `, top card is ${topDiscard.visible.crowValue}` : ''}`}
              className={cn(
                "relative w-[72px] h-[108px] sm:w-[88px] sm:h-[132px]",
                "rounded-lg transition-all duration-150",
                "border-2 shadow-card",
                topDiscard 
                  ? "bg-card border-border" 
                  : "bg-muted/30 border-dashed border-muted-foreground/30",
                showDrawOptions && topDiscard && [
                  "cursor-pointer hover:scale-[1.02] hover:shadow-card-hover",
                  "hover:border-primary"
                ],
                (!showDrawOptions || !topDiscard) && "opacity-50 cursor-not-allowed"
              )}
            >
              {topDiscard?.visible ? (
                <PileCardFace definition={topDiscard.visible} />
              ) : (
                <span className="text-muted-foreground/50 text-xs">Discard</span>
              )}
            </button>
          </>
        )}
        
        {/* Drawn card - replaces deck/discard view */}
        {drawnCard && !showTakeTwoOptions && (
          <div className={cn(
            "w-[88px] h-[132px] sm:w-[104px] sm:h-[156px]",
            "rounded-lg bg-card border-2 border-primary/50",
            "shadow-lg flex items-center justify-center"
          )}>
            {drawnCard.visible && <DrawnCardFace definition={drawnCard.visible} />}
          </div>
        )}
        
        {/* Take Two cards */}
        {showTakeTwoOptions && takeTwoCards && (
          <div className="flex gap-3">
            {takeTwoCards.map((card, idx) => (
              <button
                key={idx}
                onClick={() => onChooseTakeTwo(idx)}
                className={cn(
                  "w-[72px] h-[108px] sm:w-[88px] sm:h-[132px] rounded-lg",
                  "bg-card border-2 border-border",
                  "hover:border-primary hover:scale-[1.02] hover:shadow-card-hover",
                  "transition-all duration-150"
                )}
              >
                {card.visible && <PileCardFace definition={card.visible} />}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Action buttons - always reserve space */}
      <div className="h-20 flex flex-col items-center justify-center gap-2 shrink-0">
        {/* Pobudka button */}
        {isMyTurn && turnPhase === 'draw' && (
          <Button
            onClick={onDeclareWakeUp}
            variant="outline"
            size="sm"
            className="border-primary/60 text-primary hover:bg-primary/10 font-bold"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Pobudka!
          </Button>
        )}
        
        {/* Action buttons for drawn card */}
        {showActionOptions && (
          <div className="flex items-center gap-2">
            {canDiscard && (
              <Button 
                onClick={onDiscard} 
                variant="outline" 
                size="sm"
                className="border-border text-foreground hover:bg-muted font-medium"
              >
                Discard
              </Button>
            )}
            {canUseEffect && (
              <Button 
                onClick={onUseEffect} 
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Use Effect
              </Button>
            )}
          </div>
        )}
        
        {showTakeTwoOptions && (
          <p className="text-xs text-muted-foreground">Choose one card to keep</p>
        )}
      </div>
    </div>
  );
}

function PileCardFace({ definition }: { definition: CardDefinition }) {
  const getValueColor = (value: number) => {
    if (value <= 2) return 'text-game-success';
    if (value <= 5) return 'text-game-warning';
    return 'text-game-danger';
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-2">
      <div className={cn("text-2xl sm:text-3xl font-bold leading-none", getValueColor(definition.crowValue))}>
        {definition.crowValue}
      </div>
      <div className="flex gap-0.5 mt-1">
        {Array.from({ length: Math.min(definition.crowValue, 5) }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full",
              definition.crowValue <= 2 ? "bg-game-success" :
              definition.crowValue <= 5 ? "bg-game-warning" : "bg-game-danger"
            )} 
          />
        ))}
      </div>
      <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-1 text-center">
        {definition.name}
      </div>
    </div>
  );
}

function DrawnCardFace({ definition }: { definition: CardDefinition }) {
  const getValueColor = (value: number) => {
    if (value <= 2) return 'text-game-success';
    if (value <= 5) return 'text-game-warning';
    return 'text-game-danger';
  };
  
  const hasEffect = definition.effectType !== 'none';
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-2">
      <div className={cn("text-3xl sm:text-4xl font-bold leading-none", getValueColor(definition.crowValue))}>
        {definition.crowValue}
      </div>
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
      <div className={cn(
        "mt-1.5 text-center px-1",
        hasEffect ? "text-accent font-bold" : "text-foreground/80",
        "text-xs sm:text-sm"
      )}>
        {definition.name}
      </div>
      {hasEffect && (
        <div className="text-[9px] sm:text-[10px] text-muted-foreground text-center px-1 mt-0.5 line-clamp-2">
          {definition.description}
        </div>
      )}
    </div>
  );
}
