import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { formatPrice, categoryLabel } from '../lib/format.js';

const PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="#f0f0f0"/><text x="150" y="200" font-family="Georgia" font-size="20" fill="#993355" text-anchor="middle">Image unavailable</text></svg>`
  );

function ProductCard({ product, onAdd, onTryOn, isInCart, compact = false }) {
  const [imgSrc, setImgSrc] = useState(product.image);
  const [loaded, setLoaded] = useState(false);
  const overBudget = product.reasons?.some((r) => r === 'Over budget');

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      className="card card-accent group flex flex-col"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-paper">
        {!loaded && <div className="absolute inset-0 animate-pulse bg-paper" />}
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setImgSrc(PLACEHOLDER);
            setLoaded(true);
          }}
          className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {product.score != null && (
          <div className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-burgundy-700 to-burgundy-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-cream shadow-soft">
            {product.score}% match
          </div>
        )}
        <div className="absolute right-3 top-3 rounded-full bg-cream/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-burgundy-700">
          {product.site}
        </div>
      </div>

      <div className={`flex flex-1 flex-col gap-2 p-${compact ? '4' : '5'}`}>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] uppercase tracking-widest text-ink/40">
            {categoryLabel(product.category)}
          </span>
          <span className="font-display text-lg font-semibold text-burgundy-700">
            {formatPrice(product.price)}
          </span>
        </div>

        <h3 className="line-clamp-2 text-sm font-medium text-ink">{product.name}</h3>

        {product.reasons?.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1">
            {product.reasons.slice(0, 2).map((r) => (
              <li
                key={r}
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  r === 'Over budget'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-burgundy-50 text-burgundy-700'
                }`}
              >
                {r}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex flex-col gap-2">
          {onTryOn && (
            <button
              type="button"
              onClick={() => onTryOn(product)}
              className="flex w-full items-center justify-center gap-1.5 rounded-full border border-burgundy-700/30 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-burgundy-700 transition-all hover:bg-burgundy-700 hover:text-cream"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12C4 7 8 4 12 4s8 3 9.5 8c-1.5 5-5.5 8-9.5 8s-8-3-9.5-8z" />
              </svg>
              Try on me
            </button>
          )}
          {onAdd && (
            <button
              type="button"
              onClick={() => onAdd(product)}
              disabled={isInCart}
              className={`flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all ${
                isInCart
                  ? 'bg-emerald-500 text-cream'
                  : overBudget
                  ? 'border border-burgundy-700/30 text-burgundy-700 hover:bg-burgundy-700 hover:text-cream'
                  : 'bg-burgundy-700 text-cream hover:bg-burgundy-500'
              }`}
            >
              {isInCart ? '✓ In cart' : 'Add to cart'}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default memo(ProductCard);
