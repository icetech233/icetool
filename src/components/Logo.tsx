/**
 * 应用 Logo：ICE 图标 + "寒冰工具箱" 文字。
 * 文字始终渲染，可通过 textClassName 控制显隐/过渡（如桌面端折叠动画）。
 */
import { useId } from 'react';

type LogoProps = {
  /** 文字部分的额外类名，用于承载 collapsed 过渡样式等 */
  textClassName?: string;
};

export default function Logo({ textClassName }: LogoProps) {
  // 每个实例拿到唯一 id，避免页面内多个 <Logo />（桌面/移动）共用同一渐变 id
  // 在 display:none 切换视口时引用失效导致方块变透明（表现为“白色看不清”）。
  const gid = "ice-logo"+useId();
  return (
    <div className="flex items-center gap-2 min-w-0">
      <svg viewBox="0 0 28 28" width="28" height="28" className="h-8 w-8 shrink-0">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4cb8ff" />
            <stop offset="1" stopColor="#1d9bf0" />
          </linearGradient>
        </defs>
        <rect width="28" height="28" rx="10" fill={`url(#${gid})`} />
        <g stroke="#fff" strokeWidth="1.4" strokeLinecap="round" >
          <circle cx="14" cy="14" r="1.8" fill="#fff" stroke="none" />
          <g>
            <line x1="14" y1="14" x2="14" y2="5.5" />
            <line x1="14" y1="14" x2="21.4" y2="18" />
            <line x1="14" y1="14" x2="6.6" y2="18" />
            <line x1="14" y1="14" x2="14" y2="22.5" />
            <line x1="14" y1="14" x2="6.6" y2="10" />
            <line x1="14" y1="14" x2="21.4" y2="10" />
          </g>
          <g strokeWidth="1">
            <line x1="14" y1="9.5" x2="12" y2="8.2" />
            <line x1="14" y1="9.5" x2="16" y2="8.2" />
            <line x1="18.4" y1="16.5" x2="19.8" y2="15.1" />
            <line x1="18.4" y1="16.5" x2="19.8" y2="17.9" />
            <line x1="9.6" y1="16.5" x2="8.2" y2="15.1" />
            <line x1="9.6" y1="16.5" x2="8.2" y2="17.9" />
            <line x1="14" y1="18.5" x2="12" y2="19.8" />
            <line x1="14" y1="18.5" x2="16" y2="19.8" />
            <line x1="9.6" y1="11.5" x2="8.2" y2="10.1" />
            <line x1="9.6" y1="11.5" x2="11" y2="10.1" />
            <line x1="18.4" y1="11.5" x2="19.8" y2="10.1" />
            <line x1="18.4" y1="11.5" x2="17" y2="10.1" />
          </g>
        </g>
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
