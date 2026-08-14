import { useState, type ReactNode } from 'react';
import Logo from './Logo';
import MenuList from './MenuList';
import { CloseIcon, MenuIcon } from './icons';

type MobileTopbarProps = {
  /** 汉堡按钮左侧的操作区（如 AppToolbar） */
  actions?: ReactNode;
};

/**
 * 移动端顶部条：左侧 Logo，右侧为 actions（工具区） + 汉堡按钮；
 * 展开时紧跟一条下拉菜单，点击菜单项后自动收起。
 */
export default function MobileTopbar({ actions }: MobileTopbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-card">
        <Logo />
        <div className="flex items-center gap-2 shrink-0">
          {actions}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="切换菜单"
            aria-expanded={open}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-b border-border bg-card px-3 py-3">
          <MenuList onNavigate={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
