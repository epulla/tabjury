import type { HistoryEntry } from '@/src/bg/state';

export default function History({
  entries,
  onBack,
  onClear,
}: {
  entries: HistoryEntry[];
  onBack: () => void;
  onClear: () => Promise<void>;
}) {
  const labels: Record<HistoryEntry['kind'], string> = {
    close: 'Closed',
    discard: 'Discarded',
    'would-close': 'Would close (dry run)',
    'would-discard': 'Would discard (dry run)',
  };
  const ago = (at: number) => `${Math.max(0, Math.floor((Date.now() - at) / 60_000))}m ago`;
  return (
    <section>
      <button type="button" className="btn btn-ghost" onClick={onBack}>
        Back
      </button>
      <header className="mt-2 flex justify-between">
        <h2 className="font-semibold text-[var(--accent)]">History ({entries.length})</h2>
        {entries.length > 0 && (
          <button type="button" className="btn btn-ghost" onClick={onClear}>
            Clear
          </button>
        )}
      </header>
      {entries.length ? (
        <ul className="divide-y">
          {entries.map((entry) => (
            <li
              className="rounded-md px-1 py-2 hover:bg-black/5"
              key={`${entry.at}-${entry.url}-${entry.kind}`}
            >
              {ago(entry.at)} · {labels[entry.kind]} · {entry.title || entry.url}
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-8 text-center text-gray-500">No history.</p>
      )}
    </section>
  );
}
