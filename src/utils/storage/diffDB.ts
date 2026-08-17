/**
 * diffDB —— 文本差异历史记录本地存储（基于原生 IndexedDB，零运行时依赖）。
 *
 * - 数据库 `diff-lab`，单 store `history`（keyPath: id，按 time 索引）。
 * - 最多保留 HISTORY_MAX 条，插入时自动裁剪最旧。
 * - preview 在写入时预生成，避免每次渲染都从长字符串截取。
 * - 每次保存包含 leftText 与 rightText 两段文本。
 */

export type DiffHistoryItem = {
  id: string;
  time: number;
  title: string;
  leftText: string;
  rightText: string;
  combinedSize: number;
  preview: string;
};

const DB_NAME = 'diff-lab';
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

function makePreview(leftText: string, rightText: string): string {
  const combined = `${leftText}\n---\n${rightText}`.replace(/\s+/g, ' ').trim();
  return combined.length > PREVIEW_LEN ? `${combined.slice(0, PREVIEW_LEN)}…` : combined;
}

/** 生成默认标题：`YYYY-MM-DD HH:mm:ss`（本地时区） */
export function autoTitle(_content?: string, at: number = Date.now()): string {
  const d = new Date(at);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function trimTo(max: number): Promise<void> {
  const all = await tx<DiffHistoryItem[]>('readonly', (s) => s.getAll() as IDBRequest<DiffHistoryItem[]>);
  const list = all ?? [];
  if (list.length <= max) return;
  const sorted = list.sort((a, b) => a.time - b.time);
  const stale = sorted.slice(0, list.length - max);
  for (const item of stale) {
    await tx('readwrite', (s) => s.delete(item.id));
  }
}

export async function addDiffHistory(input: {
  title: string;
  leftText: string;
  rightText: string;
}): Promise<DiffHistoryItem> {
  const item: DiffHistoryItem = {
    id: makeId(),
    time: Date.now(),
    title: input.title.trim() || autoTitle(),
    leftText: input.leftText,
    rightText: input.rightText,
    combinedSize: input.leftText.length + input.rightText.length,
    preview: makePreview(input.leftText, input.rightText),
  };
  await tx('readwrite', (s) => s.add(item));
  await trimTo(HISTORY_MAX);
  return item;
}

export async function listDiffHistory(): Promise<DiffHistoryItem[]> {
  const all = await tx<DiffHistoryItem[]>('readonly', (s) => s.getAll() as IDBRequest<DiffHistoryItem[]>);
  return (all ?? []).sort((a, b) => b.time - a.time);
}

export async function updateDiffHistoryTitle(id: string, title: string): Promise<void> {
  const item = await tx<DiffHistoryItem | undefined>('readonly', (s) => s.get(id) as IDBRequest<DiffHistoryItem | undefined>);
  if (!item) return;
  const next: DiffHistoryItem = { ...item, title: title.trim() || autoTitle(undefined, item.time) };
  await tx('readwrite', (s) => s.put(next));
}

export function removeDiffHistory(id: string): Promise<undefined> {
  return tx('readwrite', (s) => s.delete(id));
}

export function clearDiffHistory(): Promise<undefined> {
  return tx('readwrite', (s) => s.clear());
}