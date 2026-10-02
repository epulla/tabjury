import type { BinEntry } from '@/src/bg/bin';
import { restore } from '@/src/bg/bin';
import SubpageHeader from '@/src/ui/SubpageHeader';
import { timeAgo } from '@/src/ui/time';

const reasonLabels: Record<BinEntry['reason'], string> = {
  dedupe: 'reused open tab',
  duplicate: 'duplicate',
  inactive: 'idle',
  manual: 'closed by you',
};

export default function BinView({
  entries,
  onClear,
  onBack,
}: {
  entries: BinEntry[];
  onClear: () => Promise<void>;
  onBack: () => void;
}) {
  return (
    <section>
      <SubpageHeader title="Recently closed" count={entries.length} onBack={onBack} onClear={onClear} icon="📁" />
      {entries.length ? (
        <ul className="divide-y px-4">
          {entries.map((entry) => (
            <li className="flex items-center gap-3 py-2.5" key={entry.id}>
              <img
                className="h-4 w-4 shrink-0"
                src={entry.favIconUrl || `/_favicon/?pageUrl=${encodeURIComponent(entry.url)}&size=16`}
                alt=""
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate" title={entry.url}>{entry.title}</span>
                <span className="block text-xs text-gray-500">
                  {timeAgo(entry.closedAt)} · {reasonLabels[entry.reason]}
                </span>
              </span>
              <button type="button" className="btn shrink-0" onClick={() => restore(entry.id)}>
                Restore
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-8 text-center text-gray-500"><span aria-hidden="true">🕊️</span>{' '}No appeals pending.</p>
      )}
    </section>
  );
}
