/**
 * Effect Modal - Dreamy themed
 */

import { PublicCardView, EffectType } from '@/game/types';
import { Button } from '@/components/ui/button';
import { Cat, Eye, Shuffle, X } from 'lucide-react';
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
    if (effect.peekedCard) return 'You peeked at this card:';
    switch (effect.awaitingSelection) {
      case 'any_slot': 
        return effect.type === 'peek_any' 
          ? 'Select any card to peek at' 
          : 'Select first card to swap';
      case 'second_slot':
        return 'Select second card to swap';
      default:
        return '';
    }
  };
  
  const getIcon = () => {
    switch (effect.type) {
      case 'peek_any': return <Eye className="w-6 h-6 text-purple-300" />;
      case 'swap_blind': return <Shuffle className="w-6 h-6 text-purple-300" />;
      default: return null;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900/90 border border-purple-500/30 rounded-xl p-4 max-w-xs w-full shadow-xl animate-in zoom-in-95">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            <h2 className="text-lg font-bold text-purple-100">{getTitle()}</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-purple-500/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-purple-300" />
          </button>
        </div>
        
        <p className="text-purple-300/70 text-sm mb-4">{getDescription()}</p>
        
        {effect.peekedCard?.visible && (
          <div className="flex justify-center mb-4">
            <div className="w-16 h-24 bg-slate-800/80 border-2 border-purple-400/50 rounded-lg flex flex-col items-center justify-center shadow-lg">
              <div className={cn(
                "text-2xl font-bold",
                effect.peekedCard.visible.crowValue <= 2 ? "text-emerald-400" :
                effect.peekedCard.visible.crowValue <= 5 ? "text-amber-400" : "text-rose-400"
              )}>
                {effect.peekedCard.visible.crowValue}
              </div>
              <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: Math.min(effect.peekedCard.visible.crowValue, 3) }).map((_, i) => (
                  <Cat key={i} className="w-2 h-2 text-purple-300" />
                ))}
              </div>
              <div className="text-[8px] text-purple-300/60 mt-1">
                {effect.peekedCard.visible.name}
              </div>
            </div>
          </div>
        )}
        
        <Button 
          onClick={onCancel} 
          variant="outline" 
          className="w-full bg-transparent border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
        >
          {effect.peekedCard ? 'Done' : 'Cancel'}
        </Button>
      </div>
    </div>
  );
}
