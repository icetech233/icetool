/**
 * HistoryPanel —— 历史记录面板（右侧 Tab）。
 * - 倒序展示本地取色历史（IndexedDB）。
 * - 点击任意记录回填主转换器。
 * - 支持一键清空。
 */
import { useCallback, useEffect, useState } from 'react';
import { listHistory, clearHistory } from '../../utils/storage/colorDB';
import type { HistoryItem } from '../../utils/color/types';
import ColorSwatch from './ColorSwatch';

type HistoryPanelProps = {
  onPick: (hex: string) => void;
  refreshKey: number;
};

const SOURCE_LABEL: Record<HistoryItem['source'], string> = {
  pick: '选色',
  convert: '转换',
  random: '随机',
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  return `${Math.floor(h / 24)} 天前`;
}

export default function HistoryPanel({ onPick, refreshKey }: HistoryPanelProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);

  const load = useCallback(() => {
    listHistory().then(setItems);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleClear = useCallback(async () => {
    await clearHistory();
    load();
  }, [load]);

  if (items.length === 0) {
    return (
      <p className="rounded-lg bg-muted/40 px-3 py-6 text-center text-xs text-muted-foreground">
        暂无记录。每次取色 / 转换 / 随机都会自动留痕，方便回溯。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">共 {items.length} 条</span>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          清空
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex flex-col gap-1 rounded-lg border border-border bg-card p-2 shadow-sm"
          >
            <ColorSwatch hex={it.hexa} onPick={onPick} size="sm" />
            <div className="flex items-center justify-between px-1 text-[10px] text-muted-foreground">
              <span>{SOURCE_LABEL[it.source]}</span>
              <span>{timeAgo(it.time)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
