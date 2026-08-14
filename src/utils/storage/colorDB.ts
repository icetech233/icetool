/**
 * colorDB —— 颜色实验室本地数据库封装（基于原生 IndexedDB，零运行时依赖）。
 *
 * 设计要点：
 * - 单一数据库 `color-lab`，含两个 object store：
 *   - `favorites`：用户收藏的颜色 / 配色方案（keyPath: id）。
 *   - `history`：自动记录的取色历史（keyPath: id，按 time 倒序索引）。
 * - 所有 API 均为 Promise，封装打开/异常，调用方用 async/await 即可。
 * - 首次打开时建库建索引；后续调用复用同一连接。
 */
import type { FavoriteItem, HistoryItem } from '../color/types';

const DB_NAME = 'color-lab';
const DB_VERSION = 1;
const STORE_FAVORITES = 'favorites';
const STORE_HISTORY = 'history';

let dbPromise: Promise<IDBDatabase> | null = null;

/** 打开（或惰性创建）数据库，全程仅建一次连接 */
function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('当前环境不支持 IndexedDB'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_FAVORITES)) {
        db.createObjectStore(STORE_FAVORITES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_HISTORY)) {
        const store = db.createObjectStore(STORE_HISTORY, { keyPath: 'id' });
        store.createIndex('time', 'time', { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('打开数据库失败'));
  });

  return dbPromise;
}

/** 通用事务封装：在指定 store 上执行一个操作回调 */
function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  run: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(store, mode);
        const request = run(transaction.objectStore(store));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

/* ----------------------------- 收藏夹 ----------------------------- */

export function addFavorite(item: FavoriteItem): Promise<IDBValidKey> {
  return tx(STORE_FAVORITES, 'readwrite', (s) => s.add(item));
}

export function removeFavorite(id: string): Promise<undefined> {
  return tx(STORE_FAVORITES, 'readwrite', (s) => s.delete(id));
}

export async function listFavorites(): Promise<FavoriteItem[]> {
  const all = await tx<FavoriteItem[]>(STORE_FAVORITES, 'readonly', (s) =>
    s.getAll() as IDBRequest<FavoriteItem[]>,
  );
  return all ?? [];
}

export async function isFavoriteColor(hexa: string): Promise<boolean> {
  const all = await listFavorites();
  return all.some((f) => f.type === 'color' && f.hexa.toLowerCase() === hexa.toLowerCase());
}

/* ----------------------------- 历史记录 ----------------------------- */

/** 历史记录最大保留条数，超出后裁剪最旧的，避免 IndexedDB 无限膨胀 */
const HISTORY_MAX = 200;

export function addHistory(item: HistoryItem): Promise<IDBValidKey> {
  return tx(STORE_HISTORY, 'readwrite', (s) => s.add(item)).then((key) => {
    // 异步裁剪：超过上限后删除最旧记录（按 time 升序的前 N 条）
    void trimHistory(HISTORY_MAX);
    return key;
  });
}

/** 裁剪历史到 max 条以内，保留最新的 */
async function trimHistory(max: number): Promise<void> {
  const all = await tx<HistoryItem[]>(STORE_HISTORY, 'readonly', (s) =>
    s.getAll() as IDBRequest<HistoryItem[]>,
  );
  const list = all ?? [];
  if (list.length <= max) return;
  const sorted = list.sort((a, b) => a.time - b.time); // 升序：最旧在前
  const stale = sorted.slice(0, list.length - max);
  await tx(STORE_HISTORY, 'readwrite', (s) => s.delete(stale[0].id));
  // 若多于 1 条需删，分事务逐条删除
  for (let i = 1; i < stale.length; i++) {
    await tx(STORE_HISTORY, 'readwrite', (s) => s.delete(stale[i].id));
  }
}

export function clearHistory(): Promise<undefined> {
  return tx(STORE_HISTORY, 'readwrite', (s) => s.clear());
}

export async function listHistory(limit = 60): Promise<HistoryItem[]> {
  const all = await tx<HistoryItem[]>(STORE_HISTORY, 'readonly', (s) =>
    s.getAll() as IDBRequest<HistoryItem[]>,
  );
  const sorted = (all ?? []).sort((a, b) => b.time - a.time);
  return sorted.slice(0, limit);
}
