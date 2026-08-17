/**
 * useDiffHistory —— 封装文本差异历史记录的读写与内存态。
 *
 * - 挂载时拉取一次，之后所有 CRUD 走本地数组增量更新，避免重复访问 DB。
 * - 通过模块级 EventTarget 广播变更，同页多处订阅可保持同步。
 */
import { useCallback, useEffect, useState } from 'react';
import {
  addDiffHistory,
  clearDiffHistory,
  listDiffHistory,
  removeDiffHistory,
  updateDiffHistoryTitle,
  type DiffHistoryItem,
} from '../utils/storage/diffDB';

const bus = new EventTarget();
const EVT = 'diff-history-changed';

function broadcast() {
  bus.dispatchEvent(new Event(EVT));
}

export function useDiffHistory() {
  const [items, setItems] = useState<DiffHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const list = await listDiffHistory();
      setItems(list);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    bus.addEventListener(EVT, onChange);
    return () => bus.removeEventListener(EVT, onChange);
  }, [refresh]);

  const save = useCallback(async (input: { title: string; leftText: string; rightText: string }) => {
    const item = await addDiffHistory(input);
    broadcast();
    return item;
  }, []);

  const remove = useCallback(async (id: string) => {
    await removeDiffHistory(id);
    broadcast();
  }, []);

  const rename = useCallback(async (id: string, title: string) => {
    await updateDiffHistoryTitle(id, title);
    broadcast();
  }, []);

  const clearAll = useCallback(async () => {
    await clearDiffHistory();
    broadcast();
  }, []);

  return { items, loading, error, save, remove, rename, clearAll, refresh };
}