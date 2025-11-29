/**
 * Effect Modal Component
 * Shows when a special card effect is being resolved
 */

import { PublicCardView, EffectType } from '@/game/types';
import { Button } from '@/components/ui/button';
import { Bird, Eye, Shuffle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EffectModalProps {
  effect: {
    type: EffectType;
    awaitingSelection: 'own_slot' | 'other_slot' | 'confirm_swap' | null;
    peekedCard: PublicCardView | null;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

export function EffectModal({ effect, onConfirm, onCancel }: EffectModalProps) {
  const getEffectTitle = () => {
    switch (effect.type) {
      case 'peek_own': return 'Wise Owl';
      case 'peek_other': return 'Curious Cat';
      case 'swap_blind': return 'Sneaky Mouse';
      case 'swap_peek': return 'Clever Fox';
      default: return 'Card Effect';
    }
  };
  
  const getEffectDescription = () => {
    switch (effect.awaitingSelection) {
      case 'own_slot':
        if (effect.type === 'peek_own') {
          return 'Select one of your dream cards to peek at';
        }
        return 'Select one of your dream cards';
      case 'other_slot':
        return 'Select a card from another player\'s dream';
      case 'confirm_swap':
        return 'Do you want to swap this card?';
      default:
        if (effect.peekedCard) {
          return 'You peeked at this card';
        }
        return 'Effect resolving...';
    }
  };
  
  const getIcon = () => {
    switch (effect.type) {
      case 'peek_own':
      case 'peek_other':
        return <Eye className="w-8 h-8 text-accent" />;
      case 'swap_blind':
      case 'swap_peek':
        return <Shuffle className="w-8 h-8 text-accent" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-xl font-bold">{getEffectTitle()}</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        <p className="text-muted-foreground mb-6">
          {getEffectDescription()}
        </p>
        
        {/* Show peeked card */}
        {effect.peekedCard?.visible && (
          <div className="flex justify-center mb-6">
            <div className="w-24 h-32 bg-card border-2 border-accent rounded-lg flex flex-col items-center justify-center shadow-lg">
              <div className={cn(
                "text-3xl font-bold",
                effect.peekedCard.visible.crowValue <= 2 && "text-emerald-600",
                effect.peekedCard.visible.crowValue > 2 && effect.peekedCard.visible.crowValue <= 5 && "text-amber-600",
                effect.peekedCard.visible.crowValue > 5 && "text-rose-600"
              )}>
                {effect.peekedCard.visible.crowValue}
              </div>
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: Math.min(effect.peekedCard.visible.crowValue, 5) }).map((_, i) => (
                  <Bird key={i} className="w-3 h-3 text-muted-foreground" />
                ))}
              </div>
              <div className="text-xs text-muted-foreground mt-2 text-center px-1">
                {effect.peekedCard.visible.name}
              </div>
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
          {effect.awaitingSelection === 'confirm_swap' && (
            <Button onClick={onConfirm} className="flex-1">
              Swap Cards
            </Button>
          )}
          {effect.awaitingSelection === null && effect.peekedCard && (
            <Button onClick={onCancel} className="flex-1">
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
