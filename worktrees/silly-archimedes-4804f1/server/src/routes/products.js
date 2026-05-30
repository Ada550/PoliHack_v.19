import { Router } from 'express';
import { z } from 'zod';
import { filterProducts, getAllProducts } from '../lib/products.js';
import { buildOutfit } from '../lib/recommend.js';

const router = Router();

const listQuery = z.object({
  gender: z.enum(['men', 'women']).optional(),
  category: z.enum(['upper_body', 'lower_body', 'outerwear', 'dress']).optional(),
  site: z.string().optional(),
  maxPrice: z.coerce.number().positive().optional(),
});

router.get('/products', (req, res) => {
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query', details: parsed.error.flatten() });
  }
  const items = filterProducts(parsed.data);
  res.set('Cache-Control', 'public, max-age=300');
  res.json({ count: items.length, items });
});

router.get('/products/all', (_req, res) => {
  const items = getAllProducts();
  res.set('Cache-Control', 'public, max-age=300');
  res.json({ count: items.length, items });
});

const recommendBody = z.object({
  gender: z.enum(['men', 'women']),
  style: z.enum(['Casual', 'Formal', 'Business', 'Sport', 'Streetwear']).default('Casual'),
  bodyType: z.enum(['Slim', 'Athletic', 'Average', 'Plus']).default('Average'),
  budget: z.number().positive().default(300),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  shoulder: z.number().positive().optional(),
  hip: z.number().positive().optional(),
  waist: z.number().positive().optional(),
  seed: z.number().int().nonnegative().optional(),
});

router.post('/recommend', (req, res) => {
  const parsed = recommendBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', details: parsed.error.flatten() });
  }
  const result = buildOutfit(parsed.data);
  res.json(result);
});

export default router;
