import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStylistStore, cartTotal } from '../store/useStylistStore.js';
import { formatPrice, categoryLabel } from '../lib/format.js';

function BudgetMeter({ total, budget }) {
  const pct = Math.min(100, Math.round((total / budget) * 100));
  const over = total > budget;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs uppercase tracking-widest">
        <span className="text-ink/50">Budget</span>
        <span className={over ? 'text-red-600' : 'text-burgundy-700'}>
          {formatPrice(total)} / {formatPrice(budget)}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper">
        <div
          className={`h-full transition-all ${
            over ? 'bg-red-500' : 'bg-gradient-to-r from-burgundy-700 to-burgundy-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {over && (
        <p className="mt-2 text-xs text-red-700">
          You're {formatPrice(total - budget)} over budget.
        </p>
      )}
    </div>
  );
}

function SuccessModal({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="card card-accent relative w-full max-w-md p-8 text-center"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-cream text-3xl">
          ✓
        </div>
        <h2 className="mt-4 font-display text-3xl text-burgundy-700">Order placed!</h2>
        <p className="mt-2 text-sm text-ink/70">
          Thank you for your order. A confirmation email is on its way.
        </p>
        <button onClick={onClose} className="btn-primary mt-6 w-full">
          Start over
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const cart = useStylistStore((s) => s.cart);
  const updateQuantity = useStylistStore((s) => s.updateQuantity);
  const removeFromCart = useStylistStore((s) => s.removeFromCart);
  const reset = useStylistStore((s) => s.reset);
  const profile = useStylistStore((s) => s.profile);
  const [ordered, setOrdered] = useState(false);

  const total = cartTotal(cart);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-6xl px-6 py-10"
    >
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-burgundy-500">Step Three</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
          Your <span className="italic text-burgundy-700">cart</span>
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <aside className="card card-accent p-6 sm:p-8">
          <h2 className="font-display text-xl text-burgundy-700">Profile</h2>
          {profile.photo ? (
            <img
              src={profile.photo}
              alt="You"
              className="mt-4 aspect-[3/4] w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="mt-4 aspect-[3/4] w-full rounded-2xl bg-paper" />
          )}
          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-ink/40">Height</dt>
              <dd className="font-medium">{profile.height} cm</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-ink/40">Weight</dt>
              <dd className="font-medium">{profile.weight} kg</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-ink/40">Body type</dt>
              <dd className="font-medium">{profile.bodyType}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-ink/40">Style</dt>
              <dd className="font-medium">{profile.style}</dd>
            </div>
          </dl>
        </aside>

        <div className="card card-accent flex flex-col p-6 sm:p-8">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl text-burgundy-700">
              Items <span className="text-ink/40">({cart.length})</span>
            </h2>
            {cart.length > 0 && (
              <button
                onClick={() => cart.forEach((c) => removeFromCart(c.id))}
                className="text-xs uppercase tracking-widest text-ink/50 hover:text-burgundy-700"
              >
                Clear all
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
              <p className="text-ink/60">Your cart is empty.</p>
              <button onClick={() => navigate('/outfit')} className="btn-ghost mt-4">
                Back to outfit
              </button>
            </div>
          ) : (
            <ul className="mt-4 flex-1 divide-y divide-paper">
              <AnimatePresence initial={false}>
                {cart.map((item) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-4 py-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="h-20 w-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-ink">{item.name}</div>
                      <div className="text-[10px] uppercase tracking-widest text-ink/40">
                        {item.site} · {categoryLabel(item.category)}
                      </div>
                      <div className="mt-1 font-display text-lg text-burgundy-700">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-burgundy-700/30 text-burgundy-700 hover:bg-burgundy-700 hover:text-cream"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-burgundy-700/30 text-burgundy-700 hover:bg-burgundy-700 hover:text-cream"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-2 text-ink/40 hover:text-red-600"
                        aria-label="Remove item"
                      >
                        ✕
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          <div className="mt-6 space-y-4 border-t border-paper pt-6">
            <BudgetMeter total={total} budget={profile.budget} />
            <div className="flex items-baseline justify-between">
              <span className="font-display text-xl text-ink">Total</span>
              <span className="font-display text-3xl text-burgundy-700">
                {formatPrice(total)}
              </span>
            </div>
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button onClick={() => navigate('/outfit')} className="btn-ghost flex-1">
                ← Back
              </button>
              <button
                disabled={cart.length === 0}
                onClick={() => setOrdered(true)}
                className="btn-primary flex-1"
              >
                Place order
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {ordered && (
          <SuccessModal
            onClose={() => {
              setOrdered(false);
              reset();
              navigate('/');
            }}
          />
        )}
      </AnimatePresence>
    </motion.section>
  );
}
