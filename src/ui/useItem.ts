import { useEffect, useState } from 'react';
import type { WxtStorageItem } from 'wxt/utils/storage';

export function useItem<T, M extends Record<string, unknown> = {}>(
  item: WxtStorageItem<T, M>,
): [T, (v: T) => Promise<void>] {
  const [value, setValue] = useState(item.fallback);
  useEffect(() => {
    item.getValue().then(setValue);
    return item.watch(setValue);
  }, [item]);
  return [value, item.setValue];
}
