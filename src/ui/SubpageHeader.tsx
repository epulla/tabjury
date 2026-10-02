type Props = {
  title: string;
  count: number;
  onBack: () => void;
  onClear?: () => void;
  icon?: string;
};

export default function SubpageHeader({ title, count, onBack, onClear, icon }: Props) {
  return (
    <header className="flex items-center justify-between gap-2 border-b border-[color-mix(in_srgb,var(--accent)_25%,transparent)] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <button type="button" className="btn btn-ghost shrink-0" aria-label="Back" onClick={onBack}>
          ← Back
        </button>
        <h2 className="min-w-0 truncate font-semibold">
          {icon && <span aria-hidden="true">{icon}</span>}{icon && ' '}{title} <span className="font-normal text-gray-500">({count})</span>
        </h2>
      </div>
      {onClear && count > 0 && (
        <button type="button" className="btn btn-ghost shrink-0" onClick={onClear}>
          Clear
        </button>
      )}
    </header>
  );
}
