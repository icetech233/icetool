import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { itemVariants } from './animations';
import { useJsonHistory } from '../../hooks/useJsonHistory';
import SaveHistoryPopover from './history/SaveHistoryPopover';
import JsonHistoryDrawer from './history/JsonHistoryDrawer';

interface JsonInputPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JsonInputPanel({ value, onChange }: JsonInputPanelProps) {
  const { items, save, remove, rename, clearAll } = useJsonHistory();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const saveBtnRef = useRef<HTMLButtonElement | null>(null);

  const canSave = value.trim().length > 0;

  const handleSave = async (title: string) => {
    await save({ title, content: value });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  };

  return (
    <motion.div className="lg:flex-1 lg:basis-0 min-w-0" variants={itemVariants}>
      <div className="flex-1 bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <label className="block text-sm font-medium text-foreground">JSON 输入</label>
          <div className="flex items-center gap-1.5">
            <button
              ref={saveBtnRef}
              type="button"
              disabled={!canSave}
              onClick={() => setPopoverOpen((v) => !v)}
              aria-label="保存当前 JSON 到历史记录"
              title="保存当前 JSON 到历史记录"
              className={[
                'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors shadow-sm border',
                savedFlash
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'bg-primary border-primary text-primary-foreground hover:bg-primary/90',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
              ].join(' ')}
            >
              {savedFlash ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <path d="M17 21v-8H7v8" />
                  <path d="M7 3v5h8" />
                </svg>
              )}
              <span>{savedFlash ? '已保存' : '保存'}</span>
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="打开 JSON 历史记录"
              title="打开 JSON 历史记录"
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                <path d="M3 3v5h5" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span>历史</span>
              {items.length > 0 && (
                <span className="ml-0.5 rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold text-primary">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="relative h-96">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="在此粘贴需要处理的 JSON 内容..."
            className="absolute inset-0 w-full h-full bg-input border border-border-strong rounded-lg p-4 text-sm font-mono leading-5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground whitespace-pre break-all overflow-auto"
            spellCheck={false}
          />
        </div>
      </div>

      <SaveHistoryPopover
        open={popoverOpen}
        anchor={saveBtnRef.current}
        content={value}
        onClose={() => setPopoverOpen(false)}
        onSave={handleSave}
      />

      <JsonHistoryDrawer
        open={drawerOpen}
        items={items}
        currentContent={value}
        onClose={() => setDrawerOpen(false)}
        onLoad={(it) => onChange(it.content)}
        onRename={rename}
        onDelete={remove}
        onClearAll={clearAll}
      />
    </motion.div>
  );
}
