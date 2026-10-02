export function timeAgo(at: number, now = Date.now()): string {
  const minutes = Math.max(0, Math.floor((now - at) / 60_000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatMinutes(min: number): string {
  const minutes = Math.max(0, Math.floor(min));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const remainder = minutes % 60;
  if (days > 0) return `${days} d${hours > 0 ? ` ${hours} h` : ''}`;
  if (hours > 0) return `${hours} h${remainder > 0 ? ` ${remainder} min` : ''}`;
  return `${remainder} min`;
}
