import Logo from './Logo';
import MenuList from './MenuList';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed';

/**
 * 桌面端侧边栏：logo + 菜单，可折叠/展开，状态由 useSidebarCollapsed 持久化到 localStorage。
 */
export default function DesktopSidebar() {
  const { collapsed, toggle } = useSidebarCollapsed();

  return (
    <aside
      className={[
        'hidden lg:flex lg:flex-col shrink-0 border-r border-border bg-card',
        'transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-56',
      ].join(' ')}
      aria-expanded={!collapsed}
    >
      <div
        className={[
          'flex items-center border-b border-border py-5 transition-[padding] duration-300',
          collapsed ? 'justify-center px-2' : 'justify-between px-5',
        ].join(' ')}
      >
        <Logo
          textClassName={[
            'transition-[max-width,opacity] duration-200',
            collapsed ? 'max-w-0 opacity-0' : 'max-w-[8rem] opacity-100',
          ].join(' ')}
        />
        {!collapsed && (
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="折叠菜单"
            title="折叠菜单"
          >
            <ChevronLeftIcon />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center py-2 border-b border-border">
          <button
            type="button"
            onClick={toggle}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="展开菜单"
            title="展开菜单"
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}

      <div className={['flex-1 overflow-y-auto overflow-x-hidden', collapsed ? 'p-2' : 'p-3'].join(' ')}>
        <MenuList collapsed={collapsed} />
      </div>
    </aside>
  );
}
