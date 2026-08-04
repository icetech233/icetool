import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, type Variants } from 'motion/react';

type MenuItem = {
  path: string;
  label: string;
  icon: ReactNode;
};

const menuItems: MenuItem[] = [
  {
    path: '/jwt',
    label: 'JWT 解码',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    path: '/base64',
    label: 'Base64 编解码',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 7V4h16v3" />
        <path d="M9 20h6" />
        <path d="M12 4v16" />
      </svg>
    ),
  },
  {
    path: '/url',
    label: 'URL 编解码',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 1 0-7.07-7.07l-1.5 1.5" />
        <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 1 0 7.07 7.07l1.5-1.5" />
      </svg>
    ),
  },
];

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 22 } },
};

function MenuList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <motion.nav
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-1"
    >
      {menuItems.map((item) => (
        <motion.div key={item.path} variants={itemVariants}>
          <NavLink
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              ].join(' ')
            }
          >
            <span className="inline-flex h-5 w-5 items-center justify-center">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        </motion.div>
      ))}
    </motion.nav>
  );
}

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
