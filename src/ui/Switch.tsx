export default function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="flex items-center gap-2 text-left"
      onClick={() => onChange(!checked)}
    >
      <span
        className={`flex h-5 w-9 items-center rounded-full p-0.5 ${checked ? 'shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_25%,transparent)]' : ''} motion-safe:transition-[background-color,box-shadow] ${
          checked ? 'bg-[var(--accent)]' : 'bg-gray-300'
        }`}
      >
        <span className={`h-4 w-4 rounded-full bg-white motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(.34,1.56,.64,1)] ${checked ? 'translate-x-4' : ''}`} />
      </span>
      <span>{label}</span>
    </button>
  );
}
