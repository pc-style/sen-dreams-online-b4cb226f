/**
 * Sen Card Game - Card Definitions
 * All card types with their crow values and effects
 * Following official rules: 54 cards total
 */

import { CardDefinition, CardInstance, EffectType } from './types';

// Card definitions following Sen rules
export const CARD_DEFINITIONS: CardDefinition[] = [
  // Normal cards (0-8, 4 copies each = 36 cards)
  { id: 'crow_0', name: 'Peaceful Sleep', crowValue: 0, effectType: 'none', description: 'A dreamless slumber. Zero cats.' },
  { id: 'crow_1', name: 'Quiet Dream', crowValue: 1, effectType: 'none', description: 'A whisper in the night.' },
  { id: 'crow_2', name: 'Soft Moonlight', crowValue: 2, effectType: 'none', description: 'Gentle silver glow.' },
  { id: 'crow_3', name: 'Distant Stars', crowValue: 3, effectType: 'none', description: 'Twinkling far away.' },
  { id: 'crow_4', name: 'Wandering Cloud', crowValue: 4, effectType: 'none', description: 'Drifting through dreams.' },
  { id: 'crow_5', name: 'Restless Wind', crowValue: 5, effectType: 'none', description: 'Stirring the night.' },
  { id: 'crow_6', name: 'Fading Echo', crowValue: 6, effectType: 'none', description: 'Sounds of memory.' },
  { id: 'crow_7', name: 'Shadowy Figure', crowValue: 7, effectType: 'none', description: 'A presence lurking.' },
  { id: 'crow_8', name: 'Dark Clouds', crowValue: 8, effectType: 'none', description: 'Storm approaching.' },
  
  // 9s - Nightmare cats (9 copies)
  { id: 'crow_9', name: 'Nightmare', crowValue: 9, effectType: 'none', description: 'Terror in the night. Nine cats!' },
  
  // Special effect cards (3 copies each = 9 cards)
  { id: 'take_2', name: 'Weź 2', crowValue: 7, effectType: 'take_two', description: 'Draw 2 cards, keep 1.' },
  { id: 'peek_1', name: 'Podejrzyj 1', crowValue: 7, effectType: 'peek_any', description: 'Peek at any dream card.' },
  { id: 'swap_2', name: 'Zamień 2', crowValue: 8, effectType: 'swap_blind', description: 'Swap any 2 cards blindly.' },
];

// Deck composition per rules: 54 cards total
const DECK_COMPOSITION: { [definitionId: string]: number } = {
  'crow_0': 4,
  'crow_1': 4,
  'crow_2': 4,
  'crow_3': 4,
  'crow_4': 4,
  'crow_5': 4,
  'crow_6': 4,
  'crow_7': 4,
  'crow_8': 4,
  'crow_9': 9,  // 9 copies of the nightmare cat
  'take_2': 3,  // Weź 2
  'peek_1': 3,  // Podejrzyj 1
  'swap_2': 3,  // Zamień 2
};

export function getCardDefinition(definitionId: string): CardDefinition | undefined {
  return CARD_DEFINITIONS.find(c => c.id === definitionId);
}

let instanceCounter = 0;
export function generateInstanceId(): string {
  instanceCounter++;
  return `card_${Date.now()}_${instanceCounter}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createDeck(): CardInstance[] {
  const deck: CardInstance[] = [];
  
  for (const [definitionId, count] of Object.entries(DECK_COMPOSITION)) {
    for (let i = 0; i < count; i++) {
      deck.push({
        instanceId: generateInstanceId(),
        definitionId,
      });
    }
  }
  
  return deck;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getCrowValue(card: CardInstance): number {
  const def = getCardDefinition(card.definitionId);
  return def?.crowValue ?? 0;
}

export function hasEffect(card: CardInstance): boolean {
  const def = getCardDefinition(card.definitionId);
  return def?.effectType !== 'none';
}

export function getEffectType(card: CardInstance): EffectType {
  const def = getCardDefinition(card.definitionId);
  return def?.effectType ?? 'none';
}
