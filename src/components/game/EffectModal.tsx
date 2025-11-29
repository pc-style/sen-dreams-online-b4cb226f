/**
 * Effect Indicator - Non-blocking floating banner for card effects
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
      case 'peek_any': return <Eye className="w-5 h-5 text-purple-300" />;
      case 'swap_blind': return <Shuffle className="w-5 h-5 text-purple-300" />;
      default: return null;
    }
  };
  
  // If we've peeked at a card, show a small modal with the result
  if (effect.peekedCard?.visible) {
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
          
          <Button 
            onClick={onCancel} 
            variant="outline" 
            className="w-full bg-transparent border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
          >
            Done
          </Button>
        </div>
      </div>
    );
  }
  
  // Non-blocking floating banner for selection
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto animate-in slide-in-from-top-4">
      <div className="bg-slate-900/95 border border-purple-400/50 rounded-xl px-4 py-3 shadow-xl shadow-purple-500/20 flex items-center gap-3">
        <div className="flex items-center gap-2">
          {getIcon()}
          <div>
            <div className="text-sm font-bold text-purple-100">{getTitle()}</div>
            <div className="text-xs text-purple-300/70">{getDescription()}</div>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 hover:bg-purple-500/20 rounded-full transition-colors ml-2"
        >
          <X className="w-4 h-4 text-purple-300" />
        </button>
      </div>
    </div>
  );
}
