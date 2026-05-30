import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStylistStore } from '../store/useStylistStore.js';
import { api } from '../lib/api.js';
import { categoryLabel } from '../lib/format.js';

// Apply outerwear last so it sits on top of the layered look.
const ORDER = { lower_body: 0, upper_body: 1, dress: 1, outerwear: 2 };

function sortByLayer(items) {
  return [...items].sort((a, b) => (ORDER[a.category] ?? 5) - (ORDER[b.category] ?? 5));
}

export default function TryOnModal({ open, onClose, items }) {
  const profilePhoto = useStylistStore((s) => s.profile.photo);
  const tryOn = useStylistStore((s) => s.tryOn);
  const setTryOnImage = useStylistStore((s) => s.setTryOnImage);
  const resetTryOn = useStylistStore((s) => s.resetTryOn);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ done: 0, total: 0, label: '' });

  const queue = sortByLayer(items || []);
  const baseImage = tryOn.currentImage || profilePhoto;

  useEffect(() => {
    if (!open) {
      setError(null);
      setProgress({ done: 0, total: 0, label: '' });
    }
  }, [open]);

  const runTryOn = async () => {
    if (!profilePhoto) {
      setError('Upload a photo on the profile page first.');
      return;
    }
    if (!queue.length) return;

    setBusy(true);
    setError(null);

    try {
      let working = baseImage;
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        setProgress({ done: i, total: queue.length, label: item.name });
        const result = await api.tryOn({
          humanImg: working,
          garmImg: item.image,
          category: item.category,
          garmentDes: item.name,
        });
        working = result.image;
        setTryOnImage(working, {
          productId: item.id,
          name: item.name,
          category: item.category,
          resultImage: working,
          ts: Date.now(),
        });
      }
      setProgress({ done: queue.length, total: queue.length, label: 'Done' });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Virtual try-on"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 16, opacity: 0 }}
            className="card card-accent relative grid w-full max-w-4xl max-h-[92vh] grid-rows-[minmax(0,1fr)_auto] gap-0 overflow-hidden lg:max-h-[88vh] lg:grid-cols-[1fr_1fr] lg:grid-rows-1"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-burgundy-700 shadow hover:bg-burgundy-700 hover:text-cream"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="relative min-h-0 overflow-hidden bg-paper">
              {!profilePhoto ? (
                <div className="flex h-full items-center justify-center p-8 text-center text-ink/60">
                  Upload your photo on the profile page to enable try-on.
                </div>
              ) : (
                <>
                  <img
                    src={baseImage}
                    alt="You"
                    className={`h-full w-full object-contain transition-opacity duration-300 ${
                      busy ? 'opacity-60' : 'opacity-100'
                    }`}
                  />
                  {busy && (
                    <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6">
                      <div className="w-full max-w-sm rounded-2xl bg-cream/95 p-4 text-center shadow-soft">
                        <div className="font-display text-burgundy-700">
                          Applying {progress.label}…
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper">
                          <div
                            className="h-full bg-gradient-to-r from-burgundy-700 to-burgundy-500 transition-all"
                            style={{
                              width: `${
                                progress.total ? (progress.done / progress.total) * 100 : 10
                              }%`,
                            }}
                          />
                        </div>
                        <div className="mt-1 text-[10px] uppercase tracking-widest text-ink/50">
                          Step {progress.done + 1} of {progress.total} · ~30s each
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex min-h-0 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-5 sm:px-7 sm:pt-7">
                <p className="text-xs uppercase tracking-[0.3em] text-burgundy-500">
                  Virtual Try-On
                </p>
                <h2 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
                  See it on you
                </h2>
                <p className="mt-1 text-xs text-ink/60 sm:text-sm">
                  Powered by IDM-VTON. Each item takes ~30s to render.
                </p>

                <div className="mt-4">
                  <h3 className="text-xs uppercase tracking-widest text-ink/50">Garments</h3>
                  <ul className="mt-2 space-y-2">
                    {queue.map((item, idx) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 rounded-2xl border border-paper bg-white/60 p-2"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-ink">
                            {item.name}
                          </div>
                          <div className="text-[10px] uppercase tracking-widest text-ink/40">
                            {idx + 1}. {categoryLabel(item.category)}
                          </div>
                        </div>
                        {progress.done > idx && (
                          <span className="text-lg text-emerald-500">✓</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {error && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    {error}
                  </div>
                )}

                {tryOn.history.length > 0 && (
                  <div className="mt-4 text-xs text-ink/50">
                    <span className="font-medium">Stacked layers:</span>{' '}
                    {tryOn.history.map((h) => h.name).join(' → ')}
                  </div>
                )}
              </div>

              <div className="border-t border-paper bg-cream/60 p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={resetTryOn}
                    disabled={busy || !tryOn.history.length}
                    className="btn-ghost flex-1"
                  >
                    ↺ Reset
                  </button>
                  <button
                    onClick={runTryOn}
                    disabled={busy || !profilePhoto || !queue.length}
                    className="btn-primary flex-1"
                  >
                    {busy ? 'Generating…' : `Try ${queue.length > 1 ? 'on look' : 'it on'}`}
                  </button>
                </div>

                {baseImage && tryOn.history.length > 0 && (
                  <a
                    href={baseImage}
                    download="tryon.png"
                    className="mt-2 block text-center text-xs uppercase tracking-widest text-burgundy-700 hover:underline"
                  >
                    Download image
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
