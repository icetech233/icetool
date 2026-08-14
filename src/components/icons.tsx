/**
 * Sidebar 用到的内联 SVG 图标：汉堡、关闭、左右箭头。
 * 抽出以避免在 MobileTopbar 与 DesktopSidebar 中重复。
 */
const baseProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function MenuIcon() {
  return (
    <svg {...baseProps}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg {...baseProps}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function ChevronLeftIcon({ size = 16 }: { size?: number }) {
  return (
    <svg {...baseProps} width={size} height={size}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg {...baseProps} width={size} height={size}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
