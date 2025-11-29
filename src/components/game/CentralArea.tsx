/**
 * Central Game Area Component
 * Deck, discard pile, and drawn card display
 */

import { cn } from '@/lib/utils';
import { PublicCardView, TurnPhase, CardDefinition } from '@/game/types';
import { Button } from '@/components/ui/button';
import { Moon, Bird, Sparkles, ArrowDown } from 'lucide-react';

interface CentralAreaProps {
  deckCount: number;
  topDiscard: PublicCardView | null;
  drawnCard: PublicCardView | null;
  isMyTurn: boolean;
  turnPhase: TurnPhase;
  canDeclareWakeUp: boolean;
  onDrawFromDeck: () => void;
  onDrawFromDiscard: () => void;
  onDiscard: () => void;
  onUseEffect: () => void;
  onDeclareWakeUp: () => void;
  hasEffect: boolean;
}

export function CentralArea({
  deckCount,
  topDiscard,
  drawnCard,
  isMyTurn,
  turnPhase,
  canDeclareWakeUp,
  onDrawFromDeck,
  onDrawFromDiscard,
  onDiscard,
  onUseEffect,
  onDeclareWakeUp,
  hasEffect,
}: CentralAreaProps) {
  const showDrawOptions = isMyTurn && turnPhase === 'draw';
  const showActionOptions = isMyTurn && turnPhase === 'action' && drawnCard;
  
  return (
    <div className="flex flex-col items-center gap-6 py-6">
      {/* Turn indicator */}
      {isMyTurn && (
        <div className="text-center animate-pulse">
          <span className="text-accent font-medium">Your Turn</span>
          <p className="text-sm text-muted-foreground">
            {turnPhase === 'draw' && "Draw a card from the deck or discard pile"}
            {turnPhase === 'action' && "Replace a dream card or discard"}
            {turnPhase === 'effect' && "Complete the card effect"}
          </p>
        </div>
      )}
      
      {/* Wake up button */}
      {isMyTurn && canDeclareWakeUp && turnPhase === 'draw' && (
        <Button
          onClick={onDeclareWakeUp}
          variant="outline"
          className="border-amber-500 text-amber-600 hover:bg-amber-500/10"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Declare Pobudka!
        </Button>
      )}
      
      {/* Deck and Discard */}
      <div className="flex items-center gap-8">
        {/* Deck */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onDrawFromDeck}
            disabled={!showDrawOptions || deckCount === 0}
            className={cn(
              "relative w-20 h-28 sm:w-24 sm:h-32 rounded-lg transition-all duration-300",
              "bg-gradient-to-br from-primary to-primary/80 border-2 border-primary/60",
              "flex flex-col items-center justify-center",
              "shadow-lg",
              showDrawOptions && deckCount > 0 && "cursor-pointer hover:scale-105 hover:shadow-xl hover:border-accent",
              (!showDrawOptions || deckCount === 0) && "opacity-60 cursor-not-allowed"
            )}
          >
            <Moon className="w-10 h-10 text-primary-foreground opacity-60" />
            <span className="text-primary-foreground text-xs mt-2 opacity-60">Deck</span>
            
            {/* Card count badge */}
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center text-xs font-bold shadow">
              {deckCount}
            </div>
          </button>
          <span className="text-xs text-muted-foreground">Draw Deck</span>
        </div>
        
        {/* Discard Pile */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onDrawFromDiscard}
            disabled={!showDrawOptions || !topDiscard}
            className={cn(
              "relative w-20 h-28 sm:w-24 sm:h-32 rounded-lg transition-all duration-300",
              "border-2 shadow-lg",
              topDiscard ? "bg-card border-border" : "bg-muted/50 border-dashed border-muted-foreground/30",
              showDrawOptions && topDiscard && "cursor-pointer hover:scale-105 hover:shadow-xl hover:border-accent",
              (!showDrawOptions || !topDiscard) && "opacity-60 cursor-not-allowed"
            )}
          >
            {topDiscard?.visible ? (
              <DiscardCardFace definition={topDiscard.visible} />
            ) : (
              <span className="text-muted-foreground text-xs">Empty</span>
            )}
          </button>
          <span className="text-xs text-muted-foreground">Discard Pile</span>
        </div>
      </div>
      
      {/* Drawn card display */}
      {drawnCard && (
        <div className="flex flex-col items-center gap-3 mt-4 animate-in slide-in-from-top duration-300">
          <ArrowDown className="w-5 h-5 text-muted-foreground animate-bounce" />
          <div className="text-sm font-medium text-muted-foreground">You drew:</div>
          <div className={cn(
            "w-24 h-32 sm:w-28 sm:h-36 rounded-lg",
            "bg-card border-2 border-accent shadow-xl",
            "flex items-center justify-center"
          )}>
            {drawnCard.visible && <DrawnCardFace definition={drawnCard.visible} />}
          </div>
          
          {/* Action buttons */}
          {showActionOptions && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <Button onClick={onDiscard} variant="outline" size="sm">
                Discard
              </Button>
              {hasEffect && (
                <Button onClick={onUseEffect} variant="secondary" size="sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Use Effect
                </Button>
              )}
              <div className="w-full text-center text-xs text-muted-foreground mt-1">
                Or click a dream slot to replace it
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DiscardCardFace({ definition }: { definition: CardDefinition }) {
  const getCrowColor = (value: number) => {
    if (value <= 2) return 'text-emerald-600';
    if (value <= 5) return 'text-amber-600';
    return 'text-rose-600';
  };
  
  return (
    <div className="flex flex-col items-center text-center p-2">
      <div className={cn("text-3xl font-bold", getCrowColor(definition.crowValue))}>
        {definition.crowValue}
      </div>
      <div className="flex items-center gap-0.5 mt-1">
        {Array.from({ length: Math.min(definition.crowValue, 5) }).map((_, i) => (
          <Bird key={i} className={cn("w-3 h-3", getCrowColor(definition.crowValue))} />
        ))}
      </div>
      <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
        {definition.name}
      </div>
    </div>
  );
}

function DrawnCardFace({ definition }: { definition: CardDefinition }) {
  const getCrowColor = (value: number) => {
    if (value <= 2) return 'text-emerald-600';
    if (value <= 5) return 'text-amber-600';
    return 'text-rose-600';
  };
  
  const hasEffect = definition.effectType !== 'none';
  
  return (
    <div className="flex flex-col items-center text-center p-2">
      <div className={cn("text-4xl font-bold", getCrowColor(definition.crowValue))}>
        {definition.crowValue}
      </div>
      <div className="flex items-center gap-0.5 mt-1">
        {Array.from({ length: Math.min(definition.crowValue, 5) }).map((_, i) => (
          <Bird key={i} className={cn("w-3 h-3", getCrowColor(definition.crowValue))} />
        ))}
      </div>
      <div className={cn(
        "text-sm mt-2",
        hasEffect ? "text-accent-foreground font-medium" : "text-muted-foreground"
      )}>
        {definition.name}
      </div>
      {hasEffect && (
        <div className="text-xs text-muted-foreground mt-1 px-2">
          {definition.description}
        </div>
      )}
    </div>
  );
}
