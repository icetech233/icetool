/**
 * SaveHistoryPopover —— 保存 JSON 到历史记录的迷你 Popover。
 *
 * - 通过 Portal 渲染到 body，锚定触发按钮下方。
 * - 允许输入标题；留空则用 autoTitle 自动生成。
 * - 保存中/成功/失败通过内联状态反馈。
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { autoTitle } from '../../../utils/storage/jsonDB';

interface SaveHistoryPopoverProps {
  open: boolean;
  anchor: HTMLElement | null;
  content: string;
  onClose: () => void;
  onSave: (title: string) => Promise<void>;
}

export default function SaveHistoryPopover({
  open,
  anchor,
  content,
  onClose,
  onSave,
}: SaveHistoryPopoverProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [errMsg, setErrMsg] = useState('');
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(autoTitle());
      setStatus('idle');
      setErrMsg('');
    }
  }, [open]);

  const updatePos = useCallback(() => {
    if (!anchor || !boxRef.current) return;
    const rect = anchor.getBoundingClientRect();
    const box = boxRef.current;
    const bw = box.offsetWidth;
    const bh = box.offsetHeight;
    const vw = window.innerWidth;
    let left = rect.right - bw;
    let top = rect.bottom + 6;
    left = Math.max(8, Math.min(vw - bw - 8, left));
    if (top + bh > window.innerHeight - 8) top = rect.top - bh - 6;
    setPos({ top, left });
  }, [anchor]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
  }, [open, updatePos]);

  useEffect(() => {
    if (!open) return;
    const handler = () => updatePos();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [open, updatePos]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (boxRef.current?.contains(target)) return;
      if (anchor?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, anchor, onClose]);

  const canSave = content.trim().length > 0 && status !== 'saving';

  const handleSave = async () => {
    if (!canSave) return;
    setStatus('saving');
    try {
      await onSave(title);
      onClose();
    } catch (e) {
      setStatus('error');
      setErrMsg(e instanceof Error ? e.message : String(e));
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={boxRef}
          key="save-popover"
          role="dialog"
          aria-label="保存到历史记录"
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: pos?.top ?? -9999,
            left: pos?.left ?? -9999,
            visibility: pos ? 'visible' : 'hidden',
            zIndex: 1085,
          }}
          className="w-[300px] rounded-lg border border-border bg-popover shadow-2xl p-3"
        >
          <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">
            标题
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleSave();
              }}
              placeholder={content ? '标题（建议填写）' : '未输入 JSON，无法保存'}
              disabled={!content.trim()}
              className="w-full rounded-md border border-border-strong bg-input px-2 py-1.5 pr-7 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            />
            {title && (
              <button
                type="button"
                aria-label="清空标题"
                title="清空标题"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setTitle('');
                  inputRef.current?.focus();
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>
          {status === 'error' && (
            <p className="mt-1.5 text-[10px] text-destructive">{errMsg || '保存失败'}</p>
          )}
          <div className="mt-2.5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted"
            >
              取消
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={handleSave}
              className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'saving' ? '保存中…' : '保存'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
