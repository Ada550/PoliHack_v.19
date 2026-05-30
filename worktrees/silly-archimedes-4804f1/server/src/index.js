import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import productRoutes from './routes/products.js';
import tryOnRoutes from './routes/tryon.js';

const here = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 5000;
const isProd = process.env.NODE_ENV === 'production';

const app = express();
app.use(compression());
app.use(express.json({ limit: '20mb' }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
if (!isProd) app.use(morgan('dev'));

app.get('/api/health', (_req, res) =>
  res.json({
    ok: true,
    ts: Date.now(),
    tryOnEnabled: Boolean(process.env.SEGMIND_API_KEY),
  })
);
app.use('/api', productRoutes);
app.use('/api', tryOnRoutes);

if (isProd) {
  const clientDist = join(here, '..', '..', 'client', 'dist');
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist, { maxAge: '1h', etag: true }));
    app.get('*', (_req, res) => res.sendFile(join(clientDist, 'index.html')));
  }
}

app.use((err, _req, res, _next) => {
  console.error('[server] error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
