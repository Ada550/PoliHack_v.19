import { Suspense, lazy } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BackgroundDecorations from './components/BackgroundDecorations.jsx';
import Header from './components/Header.jsx';
import Stepper from './components/Stepper.jsx';
import Profile from './routes/Profile.jsx';

const Recommendations = lazy(() => import('./routes/Recommendations.jsx'));
const Cart = lazy(() => import('./routes/Cart.jsx'));

function PageFallback() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20 text-center">
      <div className="inline-flex items-center gap-3 text-burgundy-700">
        <span className="h-2 w-2 animate-ping rounded-full bg-burgundy-700" />
        <span className="font-display text-2xl">Loading…</span>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  return (
    <div className="relative z-10 min-h-screen">
      <BackgroundDecorations />
      <Header />
      <Stepper />
      <main>
        <Suspense fallback={<PageFallback />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Profile />} />
              <Route path="/outfit" element={<Recommendations />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="*" element={<Profile />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      <footer className="relative z-10 border-t border-burgundy-700/10 bg-cream/60 py-6 text-center text-xs uppercase tracking-[0.3em] text-ink/40">
        P.S. — Curated by you · Powered by your taste
      </footer>
    </div>
  );
}
