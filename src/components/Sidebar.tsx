import { useState } from 'react';
import MenuList from './MenuList';

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* 移动端顶部条：汉堡按钮 */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            ICE
          </span>
          <span className="text-base font-semibold text-foreground">寒冰工具箱</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex items-center justify-center h-9 w-9 rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="切换菜单"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* 移动端下拉菜单 */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-border bg-card px-3 py-3">
          <MenuList onNavigate={() => setMobileOpen(false)} />
        </div>
      )}

      {/* 桌面端侧边栏 */}
      <aside className="hidden lg:flex lg:flex-col w-56 shrink-0 border-r border-border bg-card">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            ICE
          </span>
          <span className="text-base font-semibold text-foreground">寒冰工具箱</span>
        </div>
        <div className="p-3 flex-1 overflow-y-auto">
          <MenuList />
        </div>
      </aside>
    </>
  );
}
