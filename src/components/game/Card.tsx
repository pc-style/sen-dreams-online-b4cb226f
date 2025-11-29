
import React from 'react';
import { cn } from '@/lib/utils';
import { PublicCardView } from '@/game/types';

interface CardProps {
  card?: PublicCardView | null;
  isFlipped?: boolean;
  onClick?: () => void;
  className?: string;
  selected?: boolean;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  card,
  isFlipped = false,
  onClick,
  className,
  selected,
  disabled
}) => {
  // Determine image source
  let imgSrc = '/cards/back.png';
  let altText = 'Card Back';

  if (!isFlipped && card && card.visible) {
    const defId = card.visible.id;
    // Map definition IDs to filenames
    if (defId.startsWith('crow_')) {
      const val = defId.replace('crow_', '');
      imgSrc = `/cards/${val}.png`;
    } else if (defId === 'take_two') {
      imgSrc = '/cards/wez2.png';
    } else if (defId === 'peek_1') {
      // Fallback if missing
      imgSrc = '/cards/7.png'; // Assuming 7 or placeholder
    } else if (defId === 'swap_2') {
      imgSrc = '/cards/zamien2.png';
    }
    altText = card.visible.name;
  }

  // Handle missing assets via onError (in a real app), here we just set the src.
  // Note: I'm relying on the browser to handle 404s for missing images by showing alt or broken image.
  // Ideally we'd have a fallback component.

  return (
    <div
      className={cn(
        "relative aspect-[2/3] rounded-lg shadow-md transition-all duration-300 select-none",
        "w-20 md:w-24 lg:w-32", // Responsive width
        onClick && !disabled ? "cursor-pointer hover:-translate-y-2 hover:shadow-lg" : "cursor-default",
        selected ? "ring-4 ring-yellow-400 -translate-y-2" : "",
        disabled ? "opacity-70 grayscale" : "",
        className
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="w-full h-full overflow-hidden rounded-lg bg-indigo-900 border border-indigo-700/50">
         <img
            src={imgSrc}
            alt={altText}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback for missing images
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('placeholder')) {
                // If it's a specific number card that is missing, maybe fallback to text?
                // For now, let's just leave it or use a generic placeholder if I had one.
                // I'll try to use a styled div with text if image fails
                target.style.display = 'none';
                target.parentElement?.classList.add('flex', 'items-center', 'justify-center', 'text-white', 'font-bold', 'text-2xl');
                if (target.parentElement) {
                   target.parentElement.innerText = card?.visible?.crowValue.toString() ?? "?";
                   if (card?.visible?.name === 'Weź 2') target.parentElement.innerText = "+2";
                   if (card?.visible?.name === 'Podejrzyj 1') target.parentElement.innerText = "👁";
                   if (card?.visible?.name === 'Zamień 2') target.parentElement.innerText = "⇄";
                   // If back is missing
                   if (isFlipped || !card?.visible) target.parentElement.innerText = "🌸";
                }
              }
            }}
         />
      </div>

      {/* Glow effect for selected/interactive cards */}
      {selected && (
        <div className="absolute inset-0 rounded-lg bg-yellow-400/20 animate-pulse pointer-events-none" />
      )}
    </div>
  );
};
