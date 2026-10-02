import type { HistoryEntry } from '@/src/bg/state';
import SubpageHeader from '@/src/ui/SubpageHeader';
import { timeAgo } from '@/src/ui/time';

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
  };
  return (
    <section>
      <SubpageHeader title="History" count={entries.length} onBack={onBack} onClear={onClear} icon="📜" />
      {entries.length ? (
        <ul className="divide-y px-4">
          {entries.map((entry) => (
            <li className="flex items-center gap-3 py-2.5" key={`${entry.at}-${entry.url}-${entry.kind}`}>
              <span className="min-w-0 flex-1">
                <span className="block truncate">{entry.title || entry.url}</span>
                <span className="block text-xs text-gray-500">
                  <span aria-hidden="true">{entry.kind === 'close' ? '🔨' : '💤'}</span>{' '}{labels[entry.kind]} · {entry.reason === 'duplicate' ? 'duplicate' : 'idle'}
                </span>
              </span>
              <span className="shrink-0 text-xs text-gray-500">{timeAgo(entry.at)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-8 text-center text-gray-500">No history.</p>
      )}
    </section>
  );
}
