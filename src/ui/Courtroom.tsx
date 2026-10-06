export default function Courtroom({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-0 h-full w-full text-[var(--accent)] opacity-10 ${className ?? ''}`}
      viewBox="0 0 384 600"
      preserveAspectRatio="xMidYMin slice"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M28 130 192 32l164 98H28Z" fill="currentColor" opacity=".35" />
      <path d="M44 130h296" />
      <path d="M70 130v118m52-118v118m52-118v118m52-118v118m52-118v118" />
      <path d="M48 248h288" />
      <path d="m260 466 48-48m-48 48 48 48M284 442c-31 0-57 9-76 18 19 9 45 18 76 18s57-9 76-18c-19-9-45-18-76-18Z" />
      <path d="M284 442v-35m-18 0h36M284 497v20" />
    </svg>
  );
}
