import { Link, useLocation } from 'react-router-dom';
import { useStylistStore } from '../store/useStylistStore.js';

export default function Header() {
  const location = useLocation();
  const cart = useStylistStore((s) => s.cart);
  const cartCount = cart.reduce((n, i) => n + i.quantity, 0);

  return (
    <header className="relative z-10 border-b border-burgundy-700/10 bg-cream/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-burgundy-700 to-burgundy-500 text-cream font-display font-bold shadow-soft">
            PS
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl tracking-[0.25em] text-burgundy-700">
              P.S.
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-ink/50">
              Personal Stylist
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {location.pathname !== '/cart' && cartCount > 0 && (
            <Link to="/cart" className="chip hover:bg-burgundy-700 hover:text-cream transition-colors">
              <span>Cart</span>
              <span className="rounded-full bg-burgundy-700 px-1.5 text-[10px] font-bold text-cream group-hover:bg-cream group-hover:text-burgundy-700">
                {cartCount}
              </span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
