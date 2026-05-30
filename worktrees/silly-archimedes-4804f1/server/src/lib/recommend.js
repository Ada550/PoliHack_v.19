import { filterProducts } from './products.js';

const STYLE_KEYWORDS = {
  Casual: ['cotton', 'casual', 'polo', 'chino', 'denim', 'jeans', 'sweatshirt', 'hoodie', 'knit'],
  Formal: ['blazer', 'tailored', 'shirt', 'pleated', 'peplum'],
  Business: ['blazer', 'tailored', 'twill', 'shirt', 'collar'],
  Sport: ['hoodie', 'sweatshirt', 'cargo'],
  Streetwear: ['oversized', 'cargo', 'hoodie', 'printed', 'balloon'],
};

const FIT_KEYWORDS = ['slim', 'fit', 'tailored', 'straight', 'regular'];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function scoreProduct(product, profile) {
  const reasons = [];
  let score = 70;

  const name = product.name.toLowerCase();
  const style = profile.style;
  const styleHits = (STYLE_KEYWORDS[style] || []).filter((k) => name.includes(k));
  if (styleHits.length > 0) {
    score += 12;
    reasons.push(`Matches your ${style.toLowerCase()} style`);
  }

  const fitHits = FIT_KEYWORDS.filter((k) => name.includes(k));
  if (fitHits.length > 0) {
    if (profile.bodyType === 'Athletic' || profile.bodyType === 'Slim') {
      score += 12;
      reasons.push(`Tailored cut suits ${profile.bodyType.toLowerCase()} build`);
    } else {
      score += 4;
    }
  } else if (profile.bodyType === 'Plus' && (name.includes('oversized') || name.includes('balloon'))) {
    score += 10;
    reasons.push('Relaxed fit flatters your shape');
  }

  if (profile.budget != null) {
    if (product.price <= profile.budget * 0.4) {
      score += 8;
      reasons.push('Great value within budget');
    } else if (product.price <= profile.budget) {
      score += 4;
      reasons.push('Within budget');
    } else {
      score -= 25;
      reasons.push('Over budget');
    }
  }

  // Small jitter so scores aren't all integers and ties shuffle gracefully
  if (profile._rand) score += profile._rand() * 4;

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { score, reasons };
}

function pickBest(products, profile) {
  return products
    .map((p) => ({ ...p, ...scoreProduct(p, profile) }))
    .sort((a, b) => b.score - a.score);
}

export function buildOutfit(profile) {
  const seed = profile.seed ?? Math.floor(Math.random() * 1e9);
  const rand = mulberry32(seed);
  const profileWithRand = { ...profile, _rand: rand };

  const all = filterProducts({ gender: profile.gender });

  const byCat = (cat) => pickBest(all.filter((p) => p.category === cat), profileWithRand);

  const upper = byCat('upper_body');
  const lower = byCat('lower_body');
  const outer = byCat('outerwear');
  const dresses = byCat('dress');

  const looks = [];

  // Strategy A: dress (women) + optional outerwear
  if (profile.gender === 'women' && dresses.length > 0) {
    const top = dresses[0];
    const items = [top];
    if (outer[0] && top.price + outer[0].price <= profile.budget * 1.05) {
      items.push(outer[0]);
    }
    looks.push({ items, label: 'Dress Look' });
  }

  // Strategy B: top + bottom (+ optional outerwear)
  if (upper[0] && lower[0]) {
    const items = [upper[0], lower[0]];
    if (outer[0] && upper[0].price + lower[0].price + outer[0].price <= profile.budget * 1.1) {
      items.push(outer[0]);
    }
    looks.push({ items, label: 'Layered Look' });
  }

  // Pick the highest-total-score look that respects budget if any does
  const scoreLook = (look) => look.items.reduce((s, i) => s + i.score, 0) / look.items.length;
  const inBudget = looks.filter((l) => l.items.reduce((s, i) => s + i.price, 0) <= profile.budget);
  const chosen = (inBudget.length > 0 ? inBudget : looks).sort((a, b) => scoreLook(b) - scoreLook(a))[0]
    || { items: [upper[0] || lower[0] || dresses[0]].filter(Boolean), label: 'Pick' };

  const chosenIds = new Set(chosen.items.map((i) => i.id));
  const alternatives = pickBest(all, profileWithRand)
    .filter((p) => !chosenIds.has(p.id))
    .slice(0, 8);

  const total = chosen.items.reduce((s, i) => s + i.price, 0);

  return {
    seed,
    outfit: {
      label: chosen.label,
      items: chosen.items,
      total: Math.round(total * 100) / 100,
      withinBudget: total <= profile.budget,
    },
    alternatives,
  };
}
