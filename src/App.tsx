/**
 * 应用主布局：左侧菜单 + 右上角工具区 + 路由内容出口。
 */
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import HeaderRight from './components/HeaderRight';
import Sidebar from './components/Sidebar';
import './global.css';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center justify-end px-6 py-4 border-b border-border bg-background/80 backdrop-blur">
          <HeaderRight />
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

export default App;
