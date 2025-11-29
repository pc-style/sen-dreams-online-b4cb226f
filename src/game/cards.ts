/**
 * Sen Card Game - Card Definitions
 * All card types with their crow values and effects
 */

import { CardDefinition, CardInstance, EffectType } from './types';

// Card definitions following Sen/Rat-a-Tat Cat style
export const CARD_DEFINITIONS: CardDefinition[] = [
  // Normal cards (0-9, multiple copies)
  { id: 'crow_0', name: 'Peaceful Sleep', crowValue: 0, effectType: 'none', description: 'A dreamless slumber. Zero crows.' },
  { id: 'crow_1', name: 'Quiet Dream', crowValue: 1, effectType: 'none', description: 'A whisper in the night. One crow.' },
  { id: 'crow_2', name: 'Soft Moonlight', crowValue: 2, effectType: 'none', description: 'Gentle silver glow. Two crows.' },
  { id: 'crow_3', name: 'Distant Stars', crowValue: 3, effectType: 'none', description: 'Twinkling far away. Three crows.' },
  { id: 'crow_4', name: 'Wandering Cloud', crowValue: 4, effectType: 'none', description: 'Drifting through dreams. Four crows.' },
  { id: 'crow_5', name: 'Restless Wind', crowValue: 5, effectType: 'none', description: 'Stirring the night. Five crows.' },
  { id: 'crow_6', name: 'Fading Echo', crowValue: 6, effectType: 'none', description: 'Sounds of memory. Six crows.' },
  { id: 'crow_7', name: 'Shadowy Figure', crowValue: 7, effectType: 'none', description: 'A presence lurking. Seven crows.' },
  { id: 'crow_8', name: 'Dark Clouds', crowValue: 8, effectType: 'none', description: 'Storm approaching. Eight crows.' },
  { id: 'crow_9', name: 'Nightmare', crowValue: 9, effectType: 'none', description: 'Terror in the night. Nine crows.' },
  
  // Special effect cards
  { id: 'peek_owl', name: 'Wise Owl', crowValue: 7, effectType: 'peek_own', description: 'Peek at one of your own dream cards.' },
  { id: 'peek_cat', name: 'Curious Cat', crowValue: 8, effectType: 'peek_other', description: 'Peek at another player\'s dream card.' },
  { id: 'swap_mouse', name: 'Sneaky Mouse', crowValue: 9, effectType: 'swap_blind', description: 'Swap any two cards without looking.' },
  { id: 'swap_fox', name: 'Clever Fox', crowValue: 9, effectType: 'swap_peek', description: 'Peek at a card, then choose to swap.' },
];

// Deck composition (how many of each card)
const DECK_COMPOSITION: { [definitionId: string]: number } = {
  'crow_0': 4,  // Rare, very valuable
  'crow_1': 4,
  'crow_2': 4,
  'crow_3': 4,
  'crow_4': 4,
  'crow_5': 4,
  'crow_6': 4,
  'crow_7': 4,
  'crow_8': 4,
  'crow_9': 4,
  'peek_owl': 4,
  'peek_cat': 4,
  'swap_mouse': 2,
  'swap_fox': 2,
};

// Get card definition by ID
export function getCardDefinition(definitionId: string): CardDefinition | undefined {
  return CARD_DEFINITIONS.find(c => c.id === definitionId);
}

// Generate a unique instance ID
let instanceCounter = 0;
export function generateInstanceId(): string {
  instanceCounter++;
  return `card_${Date.now()}_${instanceCounter}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create a full deck of card instances
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

// Shuffle an array using Fisher-Yates algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get crow value from a card instance
export function getCrowValue(card: CardInstance): number {
  const def = getCardDefinition(card.definitionId);
  return def?.crowValue ?? 0;
}

// Check if a card has an effect
export function hasEffect(card: CardInstance): boolean {
  const def = getCardDefinition(card.definitionId);
  return def?.effectType !== 'none';
}

// Get effect type from a card instance
export function getEffectType(card: CardInstance): EffectType {
  const def = getCardDefinition(card.definitionId);
  return def?.effectType ?? 'none';
}
