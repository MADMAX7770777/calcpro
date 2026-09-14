// Reserved-space ad container. Fixed min-heights prevent layout shift when a
// real ad network is wired in later — nothing here injects content
// dynamically. Swap the placeholder div's children for actual ad tags then.

type Placement = 'above-calculator' | 'below-calculator' | 'sidebar' | 'between-sections';

const HEIGHTS: Record<Placement, string> = {
  'above-calculator': 'min-h-[90px]',
  'below-calculator': 'min-h-[250px]',
  sidebar: 'min-h-[600px]',
  'between-sections': 'min-h-[120px]',
};

export default function AdSlot({ placement }: { placement: Placement }) {
  return (
    <div
      className={`flex w-full items-center justify-center rounded-xl border border-dashed border-surface-border bg-slate-50/60 text-xs text-slate-300 ${HEIGHTS[placement]}`}
      aria-hidden="true"
      data-ad-placement={placement}
    >
      Ad space
    </div>
  );
}
