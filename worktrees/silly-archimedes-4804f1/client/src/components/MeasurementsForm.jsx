import { useStylistStore } from '../store/useStylistStore.js';

const STYLES = ['Casual', 'Formal', 'Business', 'Sport', 'Streetwear'];
const BODY_TYPES = ['Slim', 'Athletic', 'Average', 'Plus'];

function NumberField({ label, suffix, min, max, step = 1, value, onChange }) {
  return (
    <label className="block">
      <span className="label-base">{label}</span>
      <div className="relative">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="input-base pr-12"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase tracking-widest text-ink/40">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function PillGroup({ label, options, value, onChange }) {
  return (
    <div>
      <span className="label-base">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt === value;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                active
                  ? 'bg-burgundy-700 text-cream shadow-soft'
                  : 'bg-white text-ink/70 hover:bg-burgundy-50 hover:text-burgundy-700'
              }`}
              aria-pressed={active}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MeasurementsForm() {
  const profile = useStylistStore((s) => s.profile);
  const setProfileField = useStylistStore((s) => s.setProfileField);

  return (
    <div className="card card-accent p-6 sm:p-8">
      <h2 className="font-display text-2xl text-burgundy-700">Your Measurements</h2>
      <p className="mt-1 text-sm text-ink/60">
        We use these to recommend pieces that fit you well.
      </p>

      <div className="mt-6 space-y-5">
        <PillGroup
          label="Gender"
          options={['women', 'men']}
          value={profile.gender}
          onChange={(v) => setProfileField('gender', v)}
        />

        <div className="grid grid-cols-2 gap-4">
          <NumberField
            label="Height"
            suffix="cm"
            min={100}
            max={220}
            value={profile.height}
            onChange={(v) => setProfileField('height', v)}
          />
          <NumberField
            label="Weight"
            suffix="kg"
            min={30}
            max={200}
            value={profile.weight}
            onChange={(v) => setProfileField('weight', v)}
          />
          <NumberField
            label="Shoulder"
            suffix="cm"
            min={30}
            max={70}
            value={profile.shoulder}
            onChange={(v) => setProfileField('shoulder', v)}
          />
          <NumberField
            label="Waist"
            suffix="cm"
            min={50}
            max={150}
            value={profile.waist}
            onChange={(v) => setProfileField('waist', v)}
          />
        </div>

        <PillGroup
          label="Body Type"
          options={BODY_TYPES}
          value={profile.bodyType}
          onChange={(v) => setProfileField('bodyType', v)}
        />

        <PillGroup
          label="Style"
          options={STYLES}
          value={profile.style}
          onChange={(v) => setProfileField('style', v)}
        />

        <div>
          <div className="flex items-baseline justify-between">
            <span className="label-base">Budget</span>
            <span className="font-display text-xl text-burgundy-700">
              ${profile.budget}
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={1000}
            step={10}
            value={profile.budget}
            onChange={(e) => setProfileField('budget', Number(e.target.value))}
            className="mt-1 w-full accent-burgundy-700"
          />
          <div className="mt-1 flex justify-between text-[10px] uppercase tracking-widest text-ink/40">
            <span>$50</span>
            <span>$1000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
