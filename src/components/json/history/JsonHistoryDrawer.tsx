/**
 * JsonHistoryDrawer —— JSON 历史记录抽屉（右侧滑入，移动端底部滑起）。
 *
 * - 使用 Portal 挂载到 body，配 motion/react 做入场出场动画。
 * - 单条支持：加载（带覆盖确认）、内联编辑标题、删除（软确认）。
 * - 达到 HISTORY_MAX 后新增会自动淘汰最旧，此处仅负责展示。
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { HISTORY_MAX, type JsonHistoryItem } from '../../../utils/storage/jsonDB';

interface JsonHistoryDrawerProps {
  open: boolean;
  items: JsonHistoryItem[];
  currentContent: string;
  onClose: () => void;
  onLoad: (item: JsonHistoryItem) => void;
  onRename: (id: string, title: string) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  onClearAll: () => Promise<void> | void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  return `${Math.floor(h / 24)} 天前`;
}

function formatSize(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export default function JsonHistoryDrawer({
  open,
  items,
  currentContent,
  onClose,
  onLoad,
  onRename,
  onDelete,
  onClearAll,
}: JsonHistoryDrawerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingLoadId, setPendingLoadId] = useState<string | null>(null);
  const [pendingClearAll, setPendingClearAll] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // 关闭时重置所有临时态
  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setPendingDeleteId(null);
      setPendingLoadId(null);
      setPendingClearAll(false);
    }
  }, [open]);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const armReset = (fn: () => void, ms = 2500) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(fn, ms);
  };

  const startEdit = (item: JsonHistoryItem) => {
    setEditingId(item.id);
    setEditingTitle(item.title);
  };

  const commitEdit = async () => {
    if (!editingId) return;
    const id = editingId;
    const title = editingTitle;
    setEditingId(null);
    await onRename(id, title);
  };

  const askDelete = (id: string) => {
    if (pendingDeleteId === id) {
      setPendingDeleteId(null);
      void onDelete(id);
      return;
    }
    setPendingDeleteId(id);
    armReset(() => setPendingDeleteId(null));
  };

  const askLoad = (item: JsonHistoryItem) => {
    // 当前无内容或与目标相同，直接加载无需确认
    if (!currentContent.trim() || currentContent === item.content) {
      onLoad(item);
      onClose();
      return;
    }
    if (pendingLoadId === item.id) {
      setPendingLoadId(null);
      onLoad(item);
      onClose();
      return;
    }
    setPendingLoadId(item.id);
    armReset(() => setPendingLoadId(null));
  };

  const askClearAll = () => {
    if (pendingClearAll) {
      setPendingClearAll(false);
      void onClearAll();
      return;
    }
    setPendingClearAll(true);
    armReset(() => setPendingClearAll(false));
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[1080] bg-black/40 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="JSON 历史记录"
            className="fixed z-[1090] bg-card border border-border shadow-2xl flex flex-col
              inset-x-0 bottom-0 h-[80vh] rounded-t-2xl
              md:inset-y-0 md:right-0 md:left-auto md:bottom-auto md:h-full md:w-[400px] md:rounded-none md:border-l"
            initial={{ x: '100%', y: 0, opacity: 0.6 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ x: '100%', y: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          >
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">JSON 历史记录</h3>
                <span className="text-[10px] rounded-md px-1.5 py-0.5 bg-muted text-muted-foreground">
                  {items.length}/{HISTORY_MAX}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={askClearAll}
                    className={[
                      'rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                      pendingClearAll
                        ? 'bg-destructive text-destructive-foreground'
                        : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
                    ].join(' ')}
                  >
                    {pendingClearAll ? '再次点击确认清空' : '清空全部'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="关闭"
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/60">
                    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  <p className="text-xs text-muted-foreground">
                    还没有历史记录
                  </p>
                  <p className="text-[11px] text-muted-foreground/70">
                    点击输入区上方的「保存」按钮开始积累，最多保留 {HISTORY_MAX} 条
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {items.map((it) => {
                    const isEditing = editingId === it.id;
                    const isDeleteArmed = pendingDeleteId === it.id;
                    const isLoadArmed = pendingLoadId === it.id;
                    return (
                      <li key={it.id} className="group flex flex-col gap-2 px-4 py-3 hover:bg-muted/40">
                        <div className="flex items-start justify-between gap-2">
                          {isEditing ? (
                            <input
                              autoFocus
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') commitEdit();
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              className="flex-1 min-w-0 rounded-md border border-primary/40 bg-input px-2 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEdit(it)}
                              title="点击编辑标题"
                              className="flex-1 min-w-0 truncate text-left text-xs font-medium text-foreground hover:text-primary"
                            >
                              {it.title}
                            </button>
                          )}
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            {timeAgo(it.time)}
                          </span>
                        </div>

                        <p className="line-clamp-2 rounded-md bg-muted/60 px-2 py-1.5 text-[11px] font-mono leading-4 text-muted-foreground break-all">
                          {it.preview || '(空内容)'}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground/80">
                            {formatSize(it.size)}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => askLoad(it)}
                              className={[
                                'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                                isLoadArmed
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-primary/10 text-primary hover:bg-primary/20',
                              ].join(' ')}
                              title="加载到输入区"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 3v12" />
                                <path d="m7 10 5 5 5-5" />
                                <path d="M5 21h14" />
                              </svg>
                              {isLoadArmed ? '确认覆盖' : '加载'}
                            </button>
                            <button
                              type="button"
                              onClick={() => startEdit(it)}
                              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="编辑标题"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" />
                              </svg>
                              编辑
                            </button>
                            <button
                              type="button"
                              onClick={() => askDelete(it.id)}
                              className={[
                                'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
                                isDeleteArmed
                                  ? 'bg-destructive text-destructive-foreground'
                                  : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
                              ].join(' ')}
                              title="删除该条记录"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              </svg>
                              {isDeleteArmed ? '再次确认' : '删除'}
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <footer className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground/80">
              超过 {HISTORY_MAX} 条会自动淘汰最早的记录
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
