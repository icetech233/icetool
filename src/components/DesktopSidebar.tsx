import Logo from './Logo';
import MenuList from './MenuList';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { useSidebarCollapsed } from '../hooks/useSidebarCollapsed';
import { useCollapseButtonVisibility } from '../utils/useCollapseButtonVisibility';

/**
 * 桌面端侧边栏：logo + 菜单，可折叠/展开，状态由 useSidebarCollapsed 持久化到 localStorage。
 * 折叠按钮跨越侧边栏右边缘，左半部分嵌入菜单内，右半部分露出在菜单外。
 * 折叠后按钮1秒自动隐藏，鼠标悬浮菜单区域时按钮再次显示，带0.4秒过渡动画。
 */
export default function DesktopSidebar() {
  const { collapsed, toggle } = useSidebarCollapsed();
  const { buttonVisible, handleMouseEnter, handleMouseLeave } =
    useCollapseButtonVisibility(collapsed);

  return (
    <aside
      className={[
        'hidden lg:flex lg:flex-col shrink-0 border-r border-border bg-card relative',
        'transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-56',
      ].join(' ')}
      aria-expanded={!collapsed}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={[
          'flex items-center border-b border-border py-5 transition-[padding] duration-300',
          collapsed ? 'justify-center px-2' : 'justify-start px-5',
        ].join(' ')}
      >
        <Logo
          textClassName={[
            'transition-[max-width,opacity] duration-200',
            collapsed ? 'max-w-0 opacity-0' : 'max-w-[8rem] opacity-100',
          ].join(' ')}
        />
      </div>

      {/* 跨越边界的折叠/展开按钮：50% 在侧边栏内，50% 在侧边栏外 */}
      <button
        type="button"
        onClick={toggle}
        className={[
          'absolute z-20 inline-flex items-center justify-center',
          'h-8 w-8 rounded-full',
          /* 配色：青蓝主色，柔和且醒目，明/暗主题由 CSS 变量自动切换 */
          'bg-collapse border border-collapse-border text-collapse-fg',
          'shadow-[0_1px_3px_hsl(var(--collapse-shadow)/0.35)]',
          /* 悬浮：背景渐变加深、整体放大 1.2 倍、外发光，0.3 秒平滑过渡 */
          'hover:bg-collapse-hover hover:scale-[1.2]',
          'hover:shadow-[0_4px_12px_hsl(var(--collapse-shadow)/0.5)]',
          /* 按下回弹，避免突兀 */
          'active:scale-110',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-collapse',
          /* 右边缘对齐：right: -16px，将按钮宽度的一半移出侧边栏 */
          'right-[-16px]',
          /* 垂直位置：放在顶部 Logo 区域的下方，与分隔线大致对齐 */
          'top-[68px]',
          /* 显示/隐藏 + 配色过渡：0.3 秒平滑，避免突兀 */
          'transition-[opacity,transform,background-color,border-color,box-shadow] duration-300 ease-in-out',
          /* 可见性控制：展开时始终可见，折叠时根据 buttonVisible 状态淡入淡出 */
          !collapsed || buttonVisible
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 translate-x-2 pointer-events-none',
        ].join(' ')}
        aria-label={collapsed ? '展开菜单' : '折叠菜单'}
        title={collapsed ? '展开菜单' : '折叠菜单'}
      >
        {collapsed ? <ChevronRightIcon size={16} /> : <ChevronLeftIcon size={16} />}
      </button>

      <div className={['flex-1 overflow-y-auto overflow-x-hidden', collapsed ? 'p-2' : 'p-3'].join(' ')}>
        <MenuList collapsed={collapsed} />
      </div>
    </aside>
  );
}
