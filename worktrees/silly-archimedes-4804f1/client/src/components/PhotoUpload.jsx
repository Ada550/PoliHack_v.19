import { useRef, useState } from 'react';
import { useStylistStore } from '../store/useStylistStore.js';

export default function PhotoUpload() {
  const photo = useStylistStore((s) => s.profile.photo);
  const setProfileField = useStylistStore((s) => s.setProfileField);
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const onFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setProfileField('photo', e.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="card card-accent p-6 sm:p-8">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-2xl text-burgundy-700">Your Photo</h2>
        <span className="text-xs uppercase tracking-widest text-ink/40">Optional</span>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`group relative flex aspect-[3/4] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
          dragOver
            ? 'border-burgundy-500 bg-burgundy-50'
            : photo
            ? 'border-transparent'
            : 'border-burgundy-700/30 bg-paper/40 hover:border-burgundy-500 hover:bg-burgundy-50'
        }`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        aria-label={photo ? 'Change photo' : 'Upload your photo'}
      >
        {photo ? (
          <>
            <img
              src={photo}
              alt="You"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="rounded-full bg-cream/90 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-burgundy-700">
                Change photo
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <svg
              className="h-12 w-12 text-burgundy-700/60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2.5M16 8l-4-4m0 0l-4 4m4-4v12"
              />
            </svg>
            <div>
              <div className="font-medium text-ink">Drop a photo here</div>
              <div className="text-xs text-ink/50">or click to browse — JPG, PNG</div>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {photo && (
        <button
          type="button"
          onClick={() => setProfileField('photo', null)}
          className="mt-3 text-xs uppercase tracking-widest text-ink/50 hover:text-burgundy-700"
        >
          Remove photo
        </button>
      )}
    </div>
  );
}
