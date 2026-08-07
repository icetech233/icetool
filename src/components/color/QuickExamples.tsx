/**
 * QuickExamples —— 快捷工具栏「快速示例」Tab。
 * - 6 组精选调色板，每组展示双色渐变预览 + 单色块。
 * - 🎲 随机灵感按钮：一键生成 互补/类似/三角 和谐配色。
 * - 点击任意颜色填充到主转换器。
 */
import { useCallback, useState } from 'react';
import { PALETTES } from '../../utils/color/data';
import { generateHarmony, randomHex } from '../../utils/color/convert';
import type { HarmonyType } from '../../utils/color/types';

type QuickExamplesProps = {
  onPick: (hex: string) => void;
};

const HARMONY_LABELS: { type: HarmonyType; label: string }[] = [
  { type: 'complementary', label: '互补色' },
  { type: 'analogous', label: '类似色' },
  { type: 'triadic', label: '三角色' },
];

export default function QuickExamples({ onPick }: QuickExamplesProps) {
  const [randomColors, setRandomColors] = useState<string[]>([]);
  const [randomType, setRandomType] = useState<HarmonyType>('complementary');

  const roll = useCallback(() => {
    const base = randomHex();
    const scheme = generateHarmony(base, randomType);
    setRandomColors(scheme);
  }, [randomType]);

  // 渐变背景样式
  const gradient = (colors: string[]) =>
    `linear-gradient(135deg, ${colors.join(', ')})`;

  return (
    <div className="flex flex-col gap-5">
      {/* 随机灵感生成器 */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">🎲 随机灵感</span>
          <div className="ml-auto flex gap-1.5">
            {HARMONY_LABELS.map((h) => (
              <button
                key={h.type}
                type="button"
                onClick={() => setRandomType(h.type)}
                className={[
                  'rounded-md px-2 py-1 text-xs transition-colors',
                  randomType === h.type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-muted-foreground hover:bg-muted',
                ].join(' ')}
                aria-pressed={randomType === h.type}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={roll}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          🎲 生成和谐配色
        </button>

        {randomColors.length > 0 && (
          <button
            type="button"
            onClick={() => onPick(randomColors[0])}
            className="group h-14 w-full rounded-lg border border-border shadow-sm transition-transform duration-200 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ background: gradient(randomColors) }}
            title="点击使用首色"
            aria-label={`随机配色 ${randomColors.join(' ')}，点击使用首色`}
          />
        )}
        {randomColors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {randomColors.map((c, i) => (
              <button
                key={`${c}-${i}`}
                type="button"
                onClick={() => onPick(c)}
                className="inline-flex items-center gap-1.5 rounded-md bg-card px-2 py-1 text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title={`点击使用 ${c}`}
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-border"
                  style={{ backgroundColor: c }}
                />
                <code className="font-mono text-muted-foreground">{c.toUpperCase()}</code>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 精选调色板 */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold text-muted-foreground">精选调色板</span>
        <div className="flex flex-col gap-3">
          {PALETTES.map((p) => (
            <div
              key={p.name}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm"
            >
              <span className="text-sm font-medium text-foreground">{p.name}</span>
              {/* 双色（多色）渐变预览 */}
              <div
                className="h-9 w-full rounded-lg border border-border"
                style={{ background: gradient(p.colors) }}
                aria-hidden="true"
              />
              {/* 单色块，可点击填充 */}
              <div className="flex flex-wrap gap-2">
                {p.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onPick(c)}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    title={`点击使用 ${c}`}
                    aria-label={`${p.name} ${c}`}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-border"
                      style={{ backgroundColor: c }}
                    />
                    <code className="font-mono text-muted-foreground">{c.toUpperCase()}</code>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
