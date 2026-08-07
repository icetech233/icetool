/**
 * ColorPreview —— 实时预览区。
 * 大色块展示当前颜色，叠加针对白/黑背景的 WCAG 对比度评级，
 * 点击色块复制当前 HEXA，并显示 Toast 提示。
 * 色值变化带 0.2s 平滑过渡；支持深色/浅色下准确显色。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { getContrastRating } from '../../utils/color/convert';

type ColorPreviewProps = {
  hexa: string;
  onFavorite?: (hexa: string) => void;
};

type RatingPill = {
  label: string;
  pass: boolean;
};

/** 复制并展示 Toast 的轻量封装（避免引入额外状态库） */
function useCopyToast() {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast(`已复制 ${text}`);
    } catch {
      setToast('复制失败，请手动复制');
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 1600);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return { toast, copy };
}

export default function ColorPreview({ hexa, onFavorite }: ColorPreviewProps) {
  const rating = getContrastRating(hexa);
  const { toast, copy } = useCopyToast();

  const handleCopy = useCallback(() => {
    void copy(hexa);
  }, [copy, hexa]);

  // 白底上的文字颜色：自身够深用黑字，否则用白字
  const textOnWhite = rating.recommendedOnWhite === 'dark' ? '#000000' : '#ffffff';
  // 黑底上的文字颜色：自身够浅用白字，否则用黑字
  const textOnBlack = rating.recommendedOnBlack === 'light' ? '#ffffff' : '#000000';

  const darkPills: RatingPill[] = [
    { label: 'AA', pass: rating.aaForDark },
    { label: 'AAA', pass: rating.aaaForDark },
  ];
  const lightPills: RatingPill[] = [
    { label: 'AA', pass: rating.aaForLight },
    { label: 'AAA', pass: rating.aaaForLight },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* 大面积色块：点击复制，0.2s 平滑过渡 */}
      <button
        type="button"
        onClick={handleCopy}
        className="group relative flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border border-border shadow-sm transition-[background-color,transform] duration-200 ease-out hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-56"
        style={{ backgroundColor: hexa }}
        aria-label={`当前颜色 ${hexa}，点击复制`}
        title="点击复制 HEXA 值"
      >
        <span className="pointer-events-none rounded-md bg-black/10 px-3 py-1 text-sm font-medium text-white/90 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          点击复制
        </span>
        {onFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(hexa);
            }}
            className="absolute right-3 top-3 rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            title="收藏当前颜色"
            aria-label="收藏当前颜色"
          >
            ★ 收藏
          </button>
        )}
      </button>

      {/* 对比度检测：两张样卡（白底 / 黑底） */}
      <div className="grid grid-cols-2 gap-3">
        {/* 白底卡片：展示该颜色在白底上的可读性 */}
        <div
          className="flex flex-col gap-2 rounded-xl border border-border p-3 shadow-sm transition-colors"
          style={{ backgroundColor: '#ffffff' }}
        >
          <span className="text-xs font-medium text-neutral-500">白底对比</span>
          <span
            className="text-lg font-semibold"
            style={{ color: textOnWhite === '#000000' ? '#000000' : hexa }}
          >
            Aa 文字
          </span>
          <div className="flex items-center gap-1.5">
            {lightPills.map((p) => (
              <span
                key={p.label}
                className={[
                  'rounded px-1.5 py-0.5 text-[10px] font-bold',
                  p.pass ? 'bg-accent/15 text-accent' : 'bg-destructive/15 text-destructive',
                ].join(' ')}
                title={`${p.label} (${p.pass ? '通过' : '未通过'})`}
              >
                {p.label}
              </span>
            ))}
            <span className="ml-auto text-[10px] text-neutral-400">{rating.onWhite}:1</span>
          </div>
        </div>

        {/* 黑底卡片 */}
        <div
          className="flex flex-col gap-2 rounded-xl border border-border p-3 shadow-sm transition-colors"
          style={{ backgroundColor: '#000000' }}
        >
          <span className="text-xs font-medium text-neutral-400">黑底对比</span>
          <span
            className="text-lg font-semibold"
            style={{ color: textOnBlack === '#ffffff' ? '#ffffff' : hexa }}
          >
            Aa 文字
          </span>
          <div className="flex items-center gap-1.5">
            {darkPills.map((p) => (
              <span
                key={p.label}
                className={[
                  'rounded px-1.5 py-0.5 text-[10px] font-bold',
                  p.pass ? 'bg-accent/15 text-accent' : 'bg-destructive/15 text-destructive',
                ].join(' ')}
                title={`${p.label} (${p.pass ? '通过' : '未通过'})`}
              >
                {p.label}
              </span>
            ))}
            <span className="ml-auto text-[10px] text-neutral-500">{rating.onBlack}:1</span>
          </div>
        </div>
      </div>

      {/* 当前色值文本（无障碍替代描述） */}
      <p className="text-center text-xs text-muted-foreground" aria-live="polite">
        当前颜色：<code className="font-mono text-foreground">{hexa}</code>
      </p>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
