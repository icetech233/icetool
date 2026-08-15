/**
 * useJsonHistory —— 封装 JSON 历史记录的读写与内存态。
 *
 * - 挂载时拉取一次，之后所有 CRUD 走本地数组增量更新，避免重复访问 DB。
 * - 通过模块级 EventTarget 广播变更，同页多处订阅可保持同步。
 */
import { useCallback, useEffect, useState } from 'react';
import {
  addJsonHistory,
  clearJsonHistory,
  listJsonHistory,
  removeJsonHistory,
  updateJsonHistoryTitle,
  type JsonHistoryItem,
} from '../utils/storage/jsonDB';

const bus = new EventTarget();
const EVT = 'json-history-changed';

function broadcast() {
  bus.dispatchEvent(new Event(EVT));
}

export function useJsonHistory() {
  const [items, setItems] = useState<JsonHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const list = await listJsonHistory();
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

  const save = useCallback(async (input: { title: string; content: string }) => {
    const item = await addJsonHistory(input);
    broadcast();
    return item;
  }, []);

  const remove = useCallback(async (id: string) => {
    await removeJsonHistory(id);
    broadcast();
  }, []);

  const rename = useCallback(async (id: string, title: string) => {
    await updateJsonHistoryTitle(id, title);
    broadcast();
  }, []);

  const clearAll = useCallback(async () => {
    await clearJsonHistory();
    broadcast();
  }, []);

  return { items, loading, error, save, remove, rename, clearAll, refresh };
}
