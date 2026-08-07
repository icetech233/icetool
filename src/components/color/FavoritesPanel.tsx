/**
 * FavoritesPanel —— 收藏夹面板（右侧 Tab）。
 * - 列出本地收藏（IndexedDB）的单色与配色方案。
 * - 单色点击回填；方案点击应用首色，并提供整组色块展示。
 * - 支持取消收藏。
 */
import { useCallback, useEffect, useState } from 'react';
import { listFavorites, removeFavorite } from '../../utils/storage/colorDB';
import type { FavoriteItem } from '../../utils/color/types';
import ColorSwatch from './ColorSwatch';

type FavoritesPanelProps = {
  currentHex: string;
  onPick: (hex: string) => void;
  /** 外部触发刷新（如刚收藏后） */
  refreshKey: number;
};

const gradient = (colors: string[]) => `linear-gradient(135deg, ${colors.join(', ')})`;

export default function FavoritesPanel({ currentHex, onPick, refreshKey }: FavoritesPanelProps) {
  const [items, setItems] = useState<FavoriteItem[]>([]);

  const load = useCallback(() => {
    listFavorites().then(setItems);
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const handleRemove = useCallback(
    async (id: string) => {
      await removeFavorite(id);
      load();
    },
    [load],
  );

  if (items.length === 0) {
    return (
      <p className="rounded-lg bg-muted/40 px-3 py-6 text-center text-xs text-muted-foreground">
        还没有收藏。点击预览区的 ★ 收藏当前颜色，或收藏推荐的配色方案。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 当前色提示 */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
        <span
          className="h-4 w-4 rounded-full border border-border"
          style={{ backgroundColor: currentHex }}
        />
        当前：{currentHex.toUpperCase()}
      </div>

      {items.map((it) => {
        const colors = it.type === 'scheme' && it.hexa ? it.hexa.split(',') : [it.hexa];
        return (
          <div
            key={it.id}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">
                {it.type === 'scheme' ? it.name ?? '配色方案' : '单色'}
                {it.type === 'scheme' && it.scheme && (
                  <span className="ml-1 text-[10px] text-muted-foreground">· {it.scheme}</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(it.id)}
                className="rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title="移除收藏"
                aria-label="移除收藏"
              >
                移除
              </button>
            </div>

            {it.type === 'scheme' ? (
              <>
                <div
                  className="h-9 w-full rounded-lg border border-border"
                  style={{ background: gradient(colors) }}
                  aria-hidden="true"
                />
                <div className="flex flex-wrap gap-1.5">
                  {colors.map((c, i) => (
                    <ColorSwatch key={`${c}-${i}`} hex={c} onPick={onPick} size="sm" />
                  ))}
                </div>
              </>
            ) : (
              <ColorSwatch hex={it.hexa} onPick={onPick} />
            )}
          </div>
        );
      })}
    </div>
  );
}
