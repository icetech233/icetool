/**
 * 应用主布局：左侧菜单 + 右上角工具区 + 路由内容出口。
 *
 * 桌面端（lg 及以上）：左侧 Sidebar，右侧顶部独立 header 承载 AppToolbar，下方为内容区。
 * 移动端（lg 以下）：Sidebar 内部渲染顶部条，AppToolbar 通过 mobileActions 插槽
 *   注入到汉堡按钮左侧，避免再叠加一条独立 header 造成布局突兀。
 */
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AppToolbar from './components/AppToolbar';
import Sidebar from './components/Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      <Sidebar mobileActions={<AppToolbar />} />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* 桌面端顶部工具条（移动端由 Sidebar 顶部条承载 AppToolbar） */}
        <header className="hidden lg:flex items-center justify-end px-6 py-4 border-b border-border bg-background/80 backdrop-blur">
          <AppToolbar />
        </header>

        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<div className="min-h-96" />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
