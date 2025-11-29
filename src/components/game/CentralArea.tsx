/**
 * Central Game Area - Clean, neutral design with large 2:3 cards
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
    <div className="flex-1 flex flex-col items-center justify-center gap-4 sm:gap-6 py-4 sm:py-6">
      {/* Turn indicator */}
      {isMyTurn && turnPhase === 'draw' && (
        <div className="text-center animate-fade-in">
          <h2 className="text-foreground font-bold text-lg sm:text-xl mb-1">Your Turn</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Draw a card or declare Pobudka!</p>
        </div>
      )}
      
      {/* Pobudka button */}
      {isMyTurn && turnPhase === 'draw' && (
        <Button
          onClick={onDeclareWakeUp}
          variant="outline"
          size="lg"
          className="border-2 border-primary/60 text-primary hover:bg-primary/10 font-bold text-base sm:text-lg px-6 py-3"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Pobudka!
        </Button>
      )}
      
      {/* Deck and Discard - large 2:3 cards */}
      <div className="flex items-center gap-6 sm:gap-10">
        {/* Deck */}
        <button
          onClick={onDrawFromDeck}
          disabled={!showDrawOptions || deckCount === 0}
          aria-label={`Draw from deck, ${deckCount} cards remaining`}
          className={cn(
            "relative w-[90px] h-[135px] sm:w-[104px] sm:h-[156px] md:w-[120px] md:h-[180px]",
            "rounded-lg transition-all duration-200",
            "border-2 shadow-card overflow-hidden",
            "flex flex-col items-center justify-center",
            showDrawOptions && deckCount > 0 && [
              "cursor-pointer hover:scale-105 hover:shadow-card-hover hover:-translate-y-1",
              "border-primary/50 hover:border-primary"
            ],
            (!showDrawOptions || deckCount === 0) && "opacity-50 cursor-not-allowed border-border"
          )}
        >
          {/* Card back image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/cards/back.png)' }}
          />
          
          {/* Deck count badge */}
          <div className={cn(
            "absolute -top-2 -right-2 w-8 h-8 rounded-full",
            "bg-card border-2 border-border",
            "flex items-center justify-center text-sm font-bold text-foreground",
            "shadow-md z-10"
          )}>
            {deckCount}
          </div>
        </button>
        
        {/* Discard pile */}
        <button
          onClick={onDrawFromDiscard}
          disabled={!showDrawOptions || !topDiscard}
          aria-label={`Draw from discard pile${topDiscard?.visible ? `, top card is ${topDiscard.visible.crowValue}` : ''}`}
          className={cn(
            "relative w-[90px] h-[135px] sm:w-[104px] sm:h-[156px] md:w-[120px] md:h-[180px]",
            "rounded-lg transition-all duration-200",
            "border-2 shadow-card",
            topDiscard 
              ? "bg-card border-border" 
              : "bg-muted/30 border-dashed border-muted-foreground/30",
            showDrawOptions && topDiscard && [
              "cursor-pointer hover:scale-105 hover:shadow-card-hover hover:-translate-y-1",
              "hover:border-primary"
            ],
            (!showDrawOptions || !topDiscard) && "opacity-50 cursor-not-allowed"
          )}
        >
          {topDiscard?.visible ? (
            <PileCardFace definition={topDiscard.visible} />
          ) : (
            <span className="text-muted-foreground/50 text-sm font-medium">Discard</span>
          )}
        </button>
      </div>
      
      {/* Take Two choice */}
      {showTakeTwoOptions && takeTwoCards && (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <h3 className="text-base sm:text-lg font-bold text-foreground">Choose one card to keep:</h3>
          <div className="flex gap-4 sm:gap-6">
            {takeTwoCards.map((card, idx) => (
              <button
                key={idx}
                onClick={() => onChooseTakeTwo(idx)}
                className={cn(
                  "w-[90px] h-[135px] sm:w-[104px] sm:h-[156px] rounded-lg",
                  "bg-card border-2 border-border",
                  "hover:border-primary hover:scale-105 hover:shadow-card-hover hover:-translate-y-1",
                  "transition-all duration-200"
                )}
              >
                {card.visible && <PileCardFace definition={card.visible} />}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Drawn card display */}
      {drawnCard && !showTakeTwoOptions && (
        <div className="flex flex-col items-center gap-4 animate-card-enter">
          <h3 className="text-base sm:text-lg font-semibold text-foreground/90">You drew:</h3>
          <div className={cn(
            "w-[110px] h-[165px] sm:w-[128px] sm:h-[192px] md:w-[140px] md:h-[210px]",
            "rounded-lg bg-card border-2 border-primary/50",
            "shadow-glow flex items-center justify-center"
          )}>
            {drawnCard.visible && <DrawnCardFace definition={drawnCard.visible} />}
          </div>
          
          {/* Action buttons */}
          {showActionOptions && (
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {canDiscard && (
                <Button 
                  onClick={onDiscard} 
                  variant="outline" 
                  size="lg"
                  className="border-border text-foreground hover:bg-muted font-semibold text-sm sm:text-base px-5 py-2.5"
                >
                  Discard
                </Button>
              )}
              {canUseEffect && (
                <Button 
                  onClick={onUseEffect} 
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm sm:text-base px-5 py-2.5"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Use Effect
                </Button>
              )}
            </div>
          )}
          
          {showActionOptions && (
            <p className="text-sm sm:text-base text-muted-foreground text-center max-w-xs">
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
  const getValueColor = (value: number) => {
    if (value <= 2) return 'text-game-success';
    if (value <= 5) return 'text-game-warning';
    return 'text-game-danger';
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-2 sm:p-3">
      <div className={cn("text-3xl sm:text-4xl md:text-5xl font-bold leading-none", getValueColor(definition.crowValue))}>
        {definition.crowValue}
      </div>
      <div className="flex gap-0.5 mt-2">
        {Array.from({ length: Math.min(definition.crowValue, 5) }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
              definition.crowValue <= 2 ? "bg-game-success" :
              definition.crowValue <= 5 ? "bg-game-warning" : "bg-game-danger"
            )} 
          />
        ))}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-1 px-1 text-center">
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
    <div className="flex flex-col items-center justify-center h-full p-3 sm:p-4">
      <div className={cn("text-4xl sm:text-5xl md:text-6xl font-bold leading-none", getValueColor(definition.crowValue))}>
        {definition.crowValue}
      </div>
      <div className="flex gap-1 mt-2 sm:mt-3">
        {Array.from({ length: Math.min(definition.crowValue, 5) }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full",
              definition.crowValue <= 2 ? "bg-game-success" :
              definition.crowValue <= 5 ? "bg-game-warning" : "bg-game-danger"
            )} 
          />
        ))}
      </div>
      <div className={cn(
        "mt-2 sm:mt-3 text-center px-2",
        hasEffect ? "text-accent font-bold" : "text-foreground/80",
        "text-sm sm:text-base"
      )}>
        {definition.name}
      </div>
      {hasEffect && (
        <div className="text-xs sm:text-sm text-muted-foreground text-center px-2 mt-1">
          {definition.description}
        </div>
      )}
    </div>
  );
}
