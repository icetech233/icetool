/**
 * InspirationWall —— 随机灵感墙（方案 B：瀑布流）。
 * - 一键生成多张随机配色卡片（masonry 瀑布流布局）。
 * - 每张卡片可「应用首色」或「收藏整组」。
 * - 桌面 3 列、平板 2 列、移动 1 列自适应。
 * 复用 convert.ts 的 generateHarmony / randomHex / HARMONY_LABEL_MAP。
 */
import { useCallback, useState } from 'react';
import { generateHarmony, randomHex, HARMONY_LABEL_MAP } from '../../utils/color/convert';
import type { HarmonyType } from '../../utils/color/types';

type WallCard = {
  id: string;
  type: HarmonyType;
  colors: string[];
};

type InspirationWallProps = {
  onApplyScheme: (colors: string[]) => void;
  onFavoriteScheme: (colors: string[], scheme: HarmonyType) => void;
  /** 外部注入的预设方案（来自配色推荐「应用」按钮） */
  injected?: string[];
};

const TYPES: HarmonyType[] = [
  'complementary',
  'analogous',
  'triadic',
  'splitComplementary',
  'monochromatic',
];

const gradient = (colors: string[]) => `linear-gradient(135deg, ${colors.join(', ')})`;

export default function InspirationWall({
  onApplyScheme,
  onFavoriteScheme,
  injected,
}: InspirationWallProps) {
  const [cards, setCards] = useState<WallCard[]>([]);

  const generate = useCallback(
    (count = 6) => {
      const next: WallCard[] = [];
      for (let i = 0; i < count; i++) {
        const type = TYPES[Math.floor(Math.random() * TYPES.length)];
        const base = randomHex();
        next.push({ id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`, type, colors: generateHarmony(base, type) });
      }
      setCards((prev) => [...next, ...prev].slice(0, 30));
    },
    [],
  );

  // 外部注入预设方案（从配色推荐「应用」而来）
  const handleApplyInjected = useCallback(() => {
    if (!injected || injected.length === 0) return;
    setCards((prev) => [
      { id: `${Date.now()}-inj`, type: 'complementary' as HarmonyType, colors: injected },
      ...prev,
    ].slice(0, 30));
  }, [injected]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => generate(6)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          🎲 生成灵感墙
        </button>
        {injected && injected.length > 0 && (
          <button
            type="button"
            onClick={handleApplyInjected}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            + 应用推荐方案
          </button>
        )}
      </div>

      {cards.length === 0 ? (
        <p className="rounded-lg bg-muted/40 px-3 py-6 text-center text-xs text-muted-foreground">
          点击「生成灵感墙」自动创建一组随机配色卡片。
        </p>
      ) : (
        /* 瀑布流：CSS columns 实现 */
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm"
            >
              <div
                className="w-full rounded-lg border border-border"
                style={{ background: gradient(card.colors), height: `${90 + (card.colors.length - 2) * 24}px` }}
                aria-hidden="true"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{HARMONY_LABEL_MAP[card.type]}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onApplyScheme(card.colors)}
                    className="rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    应用
                  </button>
                  <button
                    type="button"
                    onClick={() => onFavoriteScheme(card.colors, card.type)}
                    className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    ★ 收藏
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {card.colors.map((c, i) => (
                  <span
                    key={`${c}-${i}`}
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
