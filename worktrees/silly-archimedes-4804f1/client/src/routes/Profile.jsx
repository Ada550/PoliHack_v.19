import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PhotoUpload from '../components/PhotoUpload.jsx';
import MeasurementsForm from '../components/MeasurementsForm.jsx';
import { useStylistStore } from '../store/useStylistStore.js';
import { api } from '../lib/api.js';

export default function Profile() {
  const navigate = useNavigate();
  const profile = useStylistStore((s) => s.profile);
  const markProfileComplete = useStylistStore((s) => s.markProfileComplete);
  const setRecommendation = useStylistStore((s) => s.setRecommendation);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onContinue = async () => {
    setLoading(true);
    setError(null);
    try {
      const { photo: _ignored, ...payload } = profile;
      const result = await api.recommend(payload);
      setRecommendation(result);
      markProfileComplete();
      navigate('/outfit');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-6xl px-6 py-10"
    >
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-burgundy-500">Step One</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
          Tell us about <span className="italic text-burgundy-700">you</span>
        </h1>
        <p className="mt-3 text-ink/60">
          A few details so we can curate looks tailored to your style and shape.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PhotoUpload />
        <MeasurementsForm />
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Couldn’t reach the stylist service: {error}
        </div>
      )}

      <div className="mt-10 flex justify-end">
        <button
          type="button"
          onClick={onContinue}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Curating…' : 'See my outfit →'}
        </button>
      </div>
    </motion.section>
  );
}
