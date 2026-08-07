/**
 * StandardColors —— 快捷工具栏「标准色表」Tab。
 * - CSS 命名色：148 个，支持按名称/HEX 搜索过滤。
 * - Web 安全色：216 色网格，悬停显示色值，点击填充主转换器。
 */
import { useMemo, useState } from 'react';
import { NAMED_COLORS, WEB_SAFE_COLORS } from '../../utils/color/data';

type StandardColorsProps = {
  onPick: (hex: string) => void;
};

export default function StandardColors({ onPick }: StandardColorsProps) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'named' | 'websafe'>('named');

  const filteredNamed = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAMED_COLORS;
    return NAMED_COLORS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="flex flex-col gap-4">
      {/* 子 Tab 切换 */}
      <div className="inline-flex rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => setTab('named')}
          className={[
            'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            tab === 'named' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
          ].join(' ')}
          aria-pressed={tab === 'named'}
        >
          CSS 命名色
        </button>
        <button
          type="button"
          onClick={() => setTab('websafe')}
          className={[
            'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            tab === 'websafe' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
          ].join(' ')}
          aria-pressed={tab === 'websafe'}
        >
          Web 安全色
        </button>
      </div>

      {tab === 'named' ? (
        <div className="flex flex-col gap-3">
          {/* 搜索框 */}
          <label className="sr-only" htmlFor="named-color-search">
            搜索 CSS 命名色
          </label>
          <input
            id="named-color-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索颜色名或 HEX，如 Crimson / #dc143c"
            className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground transition-[border-color,box-shadow] duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

          {filteredNamed.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">未找到匹配的颜色</p>
          ) : (
            <ul className="grid grid-cols-1 gap-1 pr-1 sm:grid-cols-2">
              {filteredNamed.map((c) => (
                <li key={c.name}>
                  <button
                    type="button"
                    onClick={() => onPick(c.hex)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title={`${c.name} ${c.hex.toUpperCase()}`}
                  >
                    <span
                      className="h-5 w-5 shrink-0 rounded-full border border-border"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="truncate text-foreground">{c.name}</span>
                    <code className="ml-auto font-mono text-xs text-muted-foreground">
                      {c.hex.toUpperCase()}
                    </code>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">点击任意色块填充到转换器（共 216 色）</p>
          <div className="grid grid-cols-12 gap-1 rounded-lg border border-border bg-card p-2">
            {WEB_SAFE_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => onPick(c.hex)}
                className="aspect-square rounded-sm border border-border/60 transition-transform duration-150 hover:scale-125 hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ backgroundColor: c.hex }}
                title={`${c.label} (${c.hex})`}
                aria-label={c.label}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
