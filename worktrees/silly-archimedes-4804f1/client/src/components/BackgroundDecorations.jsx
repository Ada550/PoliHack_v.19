export default function BackgroundDecorations() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-burgundy-500/10 blur-3xl" />
      <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-burgundy-300/15 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-burgundy-400/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-burgundy-700/10 blur-3xl" />

      <svg
        className="absolute left-6 top-6 h-16 w-16 text-burgundy-700/30"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M2 22 V8 a6 6 0 0 1 6 -6 H22" strokeLinecap="round" />
      </svg>
      <svg
        className="absolute right-6 top-6 h-16 w-16 text-burgundy-700/30"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M62 22 V8 a6 6 0 0 0 -6 -6 H42" strokeLinecap="round" />
      </svg>
      <svg
        className="absolute bottom-6 left-6 h-16 w-16 text-burgundy-700/30"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M2 42 V56 a6 6 0 0 0 6 6 H22" strokeLinecap="round" />
      </svg>
      <svg
        className="absolute bottom-6 right-6 h-16 w-16 text-burgundy-700/30"
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M62 42 V56 a6 6 0 0 1 -6 6 H42" strokeLinecap="round" />
      </svg>
    </div>
  );
}
