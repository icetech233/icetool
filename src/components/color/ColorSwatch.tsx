/**
 * ColorSwatch —— 可复用的单色块。
 * - 展示圆形/方形色样 + HEX 文本。
 * - 点击回填主转换器（onPick）。
 * - 提供复制（Toast 复用页面级提示由父级传入 copy 回调）。
 */
import { useCallback } from 'react';

type ColorSwatchProps = {
  hex: string;
  onPick?: (hex: string) => void;
  onCopy?: (hex: string) => void;
  size?: 'sm' | 'md';
};

export default function ColorSwatch({ hex, onPick, onCopy, size = 'md' }: ColorSwatchProps) {
  const handlePick = useCallback(() => onPick?.(hex), [onPick, hex]);
  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onCopy?.(hex);
    },
    [onCopy, hex],
  );

  const dot = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <button
      type="button"
      onClick={handlePick}
      onDoubleClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title={`点击使用 ${hex}${onCopy ? '，双击复制' : ''}`}
      aria-label={`颜色 ${hex}`}
    >
      <span className={`${dot} rounded-full border border-border`} style={{ backgroundColor: hex }} />
      <code className="font-mono text-muted-foreground">{hex.toUpperCase()}</code>
    </button>
  );
}
