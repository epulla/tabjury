type Props = {
  title: string;
  count: number;
  onBack: () => void;
  onClear?: () => void;
};

export default function SubpageHeader({ title, count, onBack, onClear }: Props) {
  return (
    <header className="bench flex items-center justify-between gap-2 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <button type="button" className="btn btn-ghost shrink-0" aria-label="Back" onClick={onBack}>
          ← Back
        </button>
        <h2 className="min-w-0 truncate font-semibold">
          {title} <span className="font-normal opacity-75">({count})</span>
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
