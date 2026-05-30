import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const SEGMIND_URL = 'https://api.segmind.com/v1/idm-vton';

// Map our internal categories to Segmind's accepted categories.
const CATEGORY_MAP = {
  upper_body: 'upper_body',
  outerwear: 'upper_body',
  lower_body: 'lower_body',
  dress: 'dresses',
};

const tryOnBody = z.object({
  humanImg: z.string().min(1, 'humanImg required'),
  garmImg: z.string().url('garmImg must be a public URL'),
  category: z.enum(['upper_body', 'lower_body', 'outerwear', 'dress']),
  garmentDes: z.string().max(500).optional(),
  steps: z.number().int().min(1).max(40).optional(),
  seed: z.number().int().nonnegative().optional(),
});

router.post('/tryon', async (req, res) => {
  const apiKey = process.env.SEGMIND_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'Try-on is not configured.',
      hint: 'Set SEGMIND_API_KEY in server/.env and restart the server.',
    });
  }

  const parsed = tryOnBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid body', details: parsed.error.flatten() });
  }

  const { humanImg, garmImg, category, garmentDes, steps, seed } = parsed.data;

  // Segmind File (URL) fields accept either a public URL or a raw base64 string.
  // Strip the `data:<mime>;base64,` prefix if a full data URI was passed.
  const stripDataUri = (s) => (s.startsWith('data:') ? s.split(',', 2)[1] || s : s);

  const payload = {
    human_img: stripDataUri(humanImg),
    garm_img: stripDataUri(garmImg),
    category: CATEGORY_MAP[category],
    crop: false,
    force_dc: false,
    mask_only: false,
    steps: steps ?? 30,
    seed: seed ?? Math.floor(Math.random() * 1e9),
    ...(garmentDes ? { garment_des: garmentDes } : {}),
  };

  try {
    const upstream = await fetch(SEGMIND_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error('[tryon] segmind error', upstream.status, text.slice(0, 500));
      return res
        .status(upstream.status === 401 ? 401 : 502)
        .json({ error: 'Try-on service rejected the request.', upstream: text.slice(0, 500) });
    }

    const contentType = upstream.headers.get('content-type') || 'image/png';
    const buf = Buffer.from(await upstream.arrayBuffer());
    const dataUrl = `data:${contentType};base64,${buf.toString('base64')}`;

    res.json({
      image: dataUrl,
      seed: payload.seed,
      category: payload.category,
    });
  } catch (err) {
    console.error('[tryon] failed', err);
    res.status(500).json({ error: 'Try-on request failed.', message: err.message });
  }
});

export default router;
