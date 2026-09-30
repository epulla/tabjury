import type { BinEntry } from '@/src/bg/bin';
import { restore } from '@/src/bg/bin';

export default function BinView({
  entries,
  onClear,
  onBack,
}: {
  entries: BinEntry[];
  onClear: () => Promise<void>;
  onBack: () => void;
}) {
  const ago = (at: number) => {
    const minutes = Math.floor((Date.now() - at) / 60_000);
    return minutes < 60 ? `${minutes}m ago` : `${Math.floor(minutes / 60)}h ago`;
  };
  return (
    <section>
      <button type="button" className="btn btn-ghost" onClick={onBack}>
        Back
      </button>
      <header className="mt-2 flex items-center justify-between">
        <h2 className="font-semibold">Recently closed ({entries.length})</h2>
        {entries.length > 0 && (
          <button type="button" className="btn btn-ghost" onClick={onClear}>
            Clear
          </button>
        )}
      </header>
      {entries.length ? (
        <ul className="divide-y">
          {entries.map((entry) => (
            <li className="flex items-center gap-2 py-2" key={entry.id}>
              <img
                className="h-4 w-4"
                src={entry.favIconUrl || `/_favicon/?pageUrl=${encodeURIComponent(entry.url)}&size=16`}
                alt=""
              />
              <span className="min-w-0 flex-1 truncate">
                {entry.title}
                <br />
                <span className="text-xs text-gray-500">
                  {ago(entry.closedAt)} · {entry.reason}
                </span>
              </span>
              <button type="button" className="btn" onClick={() => restore(entry.id)}>
                Restore
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-8 text-center text-gray-500">No appeals pending.</p>
      )}
    </section>
  );
}
