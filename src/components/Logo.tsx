/**
 * 应用 Logo：ICE 图标 + "寒冰工具箱" 文字。
 * 文字始终渲染，可通过 textClassName 控制显隐/过渡（如桌面端折叠动画）。
 */
type LogoProps = {
  /** 文字部分的额外类名，用于承载 collapsed 过渡样式等 */
  textClassName?: string;
};

export default function Logo({ textClassName }: LogoProps) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <svg viewBox="0 0 28 28" width="28" height="28" className="h-8 w-8 shrink-0">
        <rect width="28" height="28" rx="10" fill="#1d9bf0" />
        <text x="14" y="19" fontSize="13" fontWeight="700" fill="#fff" textAnchor="middle">
          ICE
        </text>
      </svg>
      <span
        className={['text-base font-semibold text-foreground truncate', textClassName]
          .filter(Boolean)
          .join(' ')}
      >
        寒冰工具箱
      </span>
    </div>
  );
}
