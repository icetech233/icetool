/**
 * SchemeRecommend —— 配色方案推荐（全宽区左栏）。
 * - 基于当前主色，实时生成 5 种经典协调方案。
 * - 每套方案可「应用首色」或「收藏整组」。
 * - 复用 convert.ts 的 generateHarmony 与 HARMONY_LABEL_MAP。
 */
import { useMemo } from 'react';
import { generateHarmony, HARMONY_LABEL_MAP } from '../../utils/color/convert';
import type { HarmonyType } from '../../utils/color/types';
import ColorSwatch from './ColorSwatch';

type SchemeRecommendProps = {
  currentHex: string;
  onPick: (hex: string) => void;
  onApplyScheme: (colors: string[]) => void;
  onFavoriteScheme: (colors: string[], scheme: HarmonyType) => void;
};

const TYPES: HarmonyType[] = [
  'complementary',
  'analogous',
  'triadic',
  'splitComplementary',
  'monochromatic',
];

const gradient = (colors: string[]) => `linear-gradient(135deg, ${colors.join(', ')})`;

export default function SchemeRecommend({
  currentHex,
  onPick,
  onApplyScheme,
  onFavoriteScheme,
}: SchemeRecommendProps) {
  const schemes = useMemo(
    () => TYPES.map((t) => ({ type: t, label: HARMONY_LABEL_MAP[t], colors: generateHarmony(currentHex, t) })),
    [currentHex],
  );

  return (
    <div className="flex flex-col gap-4">
      {schemes.map((s) => (
        <div
          key={s.type}
          className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{s.label}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onApplyScheme(s.colors)}
                className="rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title="应用首色到当前主色"
              >
                应用
              </button>
              <button
                type="button"
                onClick={() => onFavoriteScheme(s.colors, s.type)}
                className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title="收藏整组方案"
              >
                ★ 收藏
              </button>
            </div>
          </div>

          <div
            className="h-10 w-full rounded-lg border border-border"
            style={{ background: gradient(s.colors) }}
            aria-hidden="true"
          />

          <div className="flex flex-wrap gap-1.5">
            {s.colors.map((c, i) => (
              <ColorSwatch key={`${c}-${i}`} hex={c} onPick={onPick} size="sm" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
