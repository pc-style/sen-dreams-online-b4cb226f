/**
 * Effect Modal - Clean, neutral design
 */

import { PublicCardView, EffectType } from '@/game/types';
import { Button } from '@/components/ui/button';
import { Eye, Shuffle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EffectModalProps {
  effect: {
    type: EffectType;
    awaitingSelection: 'any_slot' | 'second_slot' | null;
    peekedCard: PublicCardView | null;
  };
  onCancel: () => void;
}

export function EffectModal({ effect, onCancel }: EffectModalProps) {
  const getTitle = () => {
    switch (effect.type) {
      case 'peek_any': return 'Podejrzyj 1';
      case 'swap_blind': return 'Zamień 2';
      default: return 'Card Effect';
    }
  };
  
  const getDescription = () => {
    if (effect.peekedCard?.visible) return 'You peeked at this card:';
    switch (effect.awaitingSelection) {
      case 'any_slot': 
        return effect.type === 'peek_any' 
          ? 'Tap any card to peek at it' 
          : 'Tap first card to swap';
      case 'second_slot':
        return 'Tap second card to swap';
      default:
        return '';
    }
  };
  
  const getIcon = () => {
    switch (effect.type) {
      case 'peek_any': return <Eye className="w-5 h-5" />;
      case 'swap_blind': return <Shuffle className="w-5 h-5" />;
      default: return null;
    }
  };
  
  const getValueColor = (value: number) => {
    if (value <= 2) return 'text-game-success';
    if (value <= 5) return 'text-game-warning';
    return 'text-game-danger';
  };
  
  // If we've peeked at a card, show the result modal
  if (effect.peekedCard?.visible) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-card border border-border rounded-xl p-5 max-w-xs w-full shadow-xl animate-scale-in">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-foreground">
              {getIcon()}
              <h2 className="text-lg font-bold">{getTitle()}</h2>
            </div>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4">{getDescription()}</p>
          
          {/* Peeked card display */}
          <div className="flex justify-center mb-5">
            <div className={cn(
              "w-20 h-30 bg-card border-2 border-primary/50 rounded-lg",
              "flex flex-col items-center justify-center shadow-glow"
            )}>
              <div className={cn(
                "text-3xl font-bold",
                getValueColor(effect.peekedCard.visible.crowValue)
              )}>
                {effect.peekedCard.visible.crowValue}
              </div>
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: Math.min(effect.peekedCard.visible.crowValue, 4) }).map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      effect.peekedCard!.visible!.crowValue <= 2 ? "bg-game-success" :
                      effect.peekedCard!.visible!.crowValue <= 5 ? "bg-game-warning" : "bg-game-danger"
                    )} 
                  />
                ))}
              </div>
              <div className="text-[9px] text-muted-foreground mt-1.5 text-center px-1">
                {effect.peekedCard.visible.name}
              </div>
            </div>
          </div>
          
          <Button 
            onClick={onCancel} 
            variant="outline" 
            className="w-full"
          >
            Done
          </Button>
        </div>
      </div>
    );
  }
  
  // Non-blocking floating banner for selection
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto animate-fade-in">
      <div className={cn(
        "bg-card border border-border rounded-xl px-4 py-3 shadow-lg",
        "flex items-center gap-3"
      )}>
        <div className="flex items-center gap-2 text-foreground">
          {getIcon()}
          <div>
            <div className="text-sm font-bold">{getTitle()}</div>
            <div className="text-xs text-muted-foreground">{getDescription()}</div>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 hover:bg-muted rounded-full transition-colors ml-2"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
