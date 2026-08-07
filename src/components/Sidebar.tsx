import type { ReactNode } from 'react';
import DesktopSidebar from './DesktopSidebar';
import MobileTopbar from './MobileTopbar';

type SidebarProps = {
  /** 移动端顶部条上、汉堡按钮左侧的操作区（如 AppToolbar）。桌面端不渲染。 */
  mobileActions?: ReactNode;
};

/**
 * 响应式侧边栏分发器：
 * - lg 及以上：渲染桌面侧边栏 DesktopSidebar
 * - lg 以下：渲染移动端顶部条 MobileTopbar
 * 各自内部持有各自的状态（collapsed / open），互不干扰。
 */
export default function Sidebar({ mobileActions }: SidebarProps) {
  return (
    <>
      <MobileTopbar actions={mobileActions} />
      <DesktopSidebar />
    </>
  );
}
