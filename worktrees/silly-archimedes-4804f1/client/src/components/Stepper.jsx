import { Link, useLocation } from 'react-router-dom';
import { useStylistStore } from '../store/useStylistStore.js';

const STEPS = [
  { to: '/', label: 'Profile', n: 1 },
  { to: '/outfit', label: 'Outfit', n: 2 },
  { to: '/cart', label: 'Cart', n: 3 },
];

export default function Stepper() {
  const { pathname } = useLocation();
  const profileComplete = useStylistStore((s) => s.profileComplete);
  const recommendation = useStylistStore((s) => s.recommendation);

  const activeIdx = STEPS.findIndex((s) => s.to === pathname);

  const canVisit = (idx) => {
    if (idx === 0) return true;
    if (idx === 1) return profileComplete;
    if (idx === 2) return profileComplete;
    return false;
  };

  return (
    <div className="mx-auto mt-6 flex max-w-3xl items-center justify-center px-6">
      <ol className="flex w-full items-center gap-2 sm:gap-4">
        {STEPS.map((step, idx) => {
          const isActive = idx === activeIdx;
          const isDone = idx < activeIdx || (idx === 0 && profileComplete && activeIdx > 0) || (idx === 1 && recommendation && activeIdx > 1);
          const visitable = canVisit(idx);
          const Tag = visitable ? Link : 'div';
          return (
            <li key={step.n} className="flex flex-1 items-center gap-2 sm:gap-4">
              <Tag
                {...(visitable ? { to: step.to } : {})}
                className={`flex flex-1 items-center gap-3 rounded-full border px-3 py-2 transition-all ${
                  isActive
                    ? 'border-burgundy-700 bg-burgundy-700 text-cream shadow-soft'
                    : isDone
                    ? 'border-burgundy-500 bg-burgundy-500/10 text-burgundy-700'
                    : 'border-paper bg-white/60 text-ink/40'
                } ${visitable && !isActive ? 'hover:border-burgundy-500' : ''} ${
                  !visitable ? 'cursor-not-allowed' : ''
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isActive
                      ? 'bg-cream text-burgundy-700'
                      : isDone
                      ? 'bg-burgundy-500 text-cream'
                      : 'bg-paper text-ink/40'
                  }`}
                >
                  {isDone && !isActive ? '✓' : step.n}
                </span>
                <span className="text-xs font-medium uppercase tracking-widest sm:text-sm">
                  {step.label}
                </span>
              </Tag>
              {idx < STEPS.length - 1 && (
                <div
                  className={`hidden h-px w-6 sm:block ${
                    idx < activeIdx ? 'bg-burgundy-500' : 'bg-paper'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
