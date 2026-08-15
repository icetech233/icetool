/**
 * jsonDB —— JSON 实验室本地历史封装（基于原生 IndexedDB，零运行时依赖）。
 *
 * - 数据库 `json-lab`，单 store `history`（keyPath: id，按 time 索引）。
 * - 最多保留 HISTORY_MAX 条，插入时自动裁剪最旧。
 * - preview 在写入时预生成，避免每次渲染都从长字符串截取。
 */

export type JsonHistoryItem = {
  id: string;
  time: number;
  title: string;
  content: string;
  size: number;
  preview: string;
};

const DB_NAME = 'json-lab';
const DB_VERSION = 1;
const STORE_HISTORY = 'history';
export const HISTORY_MAX = 10;
export const PREVIEW_LEN = 120;

let dbPromise: Promise<IDBDatabase> | null = null;

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

function tx<T>(
  mode: IDBTransactionMode,
  run: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE_HISTORY, mode);
        const request = run(transaction.objectStore(STORE_HISTORY));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function makePreview(content: string): string {
  const collapsed = content.replace(/\s+/g, ' ').trim();
  return collapsed.length > PREVIEW_LEN ? `${collapsed.slice(0, PREVIEW_LEN)}…` : collapsed;
}

/** 生成默认标题：`YYYY-MM-DD HH:mm:ss`（本地时区） */
export function autoTitle(_content?: string, at: number = Date.now()): string {
  const d = new Date(at);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function trimTo(max: number): Promise<void> {
  const all = await tx<JsonHistoryItem[]>('readonly', (s) => s.getAll() as IDBRequest<JsonHistoryItem[]>);
  const list = all ?? [];
  if (list.length <= max) return;
  const sorted = list.sort((a, b) => a.time - b.time);
  const stale = sorted.slice(0, list.length - max);
  for (const item of stale) {
    await tx('readwrite', (s) => s.delete(item.id));
  }
}

export async function addJsonHistory(input: { title: string; content: string }): Promise<JsonHistoryItem> {
  const item: JsonHistoryItem = {
    id: makeId(),
    time: Date.now(),
    title: input.title.trim() || autoTitle(input.content),
    content: input.content,
    size: input.content.length,
    preview: makePreview(input.content),
  };
  await tx('readwrite', (s) => s.add(item));
  await trimTo(HISTORY_MAX);
  return item;
}

export async function listJsonHistory(): Promise<JsonHistoryItem[]> {
  const all = await tx<JsonHistoryItem[]>('readonly', (s) => s.getAll() as IDBRequest<JsonHistoryItem[]>);
  return (all ?? []).sort((a, b) => b.time - a.time);
}

export async function updateJsonHistoryTitle(id: string, title: string): Promise<void> {
  const item = await tx<JsonHistoryItem | undefined>('readonly', (s) => s.get(id) as IDBRequest<JsonHistoryItem | undefined>);
  if (!item) return;
  const next: JsonHistoryItem = { ...item, title: title.trim() || autoTitle(item.content, item.time) };
  await tx('readwrite', (s) => s.put(next));
}

export function removeJsonHistory(id: string): Promise<undefined> {
  return tx('readwrite', (s) => s.delete(id));
}

export function clearJsonHistory(): Promise<undefined> {
  return tx('readwrite', (s) => s.clear());
}
