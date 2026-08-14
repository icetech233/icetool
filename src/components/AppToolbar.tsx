import { useEffect, useState } from 'react';
import { useFullscreen } from '../hooks/useFullscreen';

/**
 * 应用顶部工具区
 * 从左到右：全屏、通知、用户信息、主题切换、设置。
 * 桌面端渲染在页面顶部右侧；移动端渲染在顶部条的汉堡按钮左侧。
 */
function AppToolbar() {
  const THEME_KEY = 'ice:theme';
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const [isDark, setIsDark] = useState(false);

  // 初始化主题：class 已由 index.html 的内联脚本在首绘前写入，
  // 这里只需把 React state 同步到既有的 DOM 状态，避免二次闪烁。
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  // 跟随系统主题实时切换：仅在用户未手动指定过主题
  // （localStorage 无 THEME_KEY 记录）时生效，手动选择优先级更高。
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onSystemChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(THEME_KEY) !== null) return;
      setIsDark(e.matches);
      document.documentElement.classList.toggle('dark', e.matches);
    };
    media.addEventListener('change', onSystemChange);
    return () => media.removeEventListener('change', onSystemChange);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
  };

  // 统一的圆形图标按钮样式
  const iconBtn =
    'inline-flex items-center justify-center h-9 w-9 rounded-full text-muted-foreground ' +
    'transition-colors hover:bg-muted hover:text-foreground ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div className="flex items-center gap-3">
      {/* 全屏按钮 */}
      <button
        type="button"
        onClick={toggleFullscreen}
        className={iconBtn}
        title={isFullscreen ? '退出全屏' : '全屏'}
        aria-label="全屏"
      >
        {isFullscreen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3" />
            <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
            <path d="M3 16h3a2 2 0 0 1 2 2v3" />
            <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3" />
            <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
            <path d="M3 16v3a2 2 0 0 0 2 2h3" />
            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        )}
      </button>

      {/* 通知按钮（铃铛） */}
      <button type="button" className={iconBtn} title="通知" aria-label="通知">
        <span className="relative inline-flex">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
        </span>
      </button>

      {/* 用户信息按钮 */}
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full pl-1 pr-3 py-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        title="用户信息"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          明
        </span>
        <span className="hidden sm:inline text-sm font-medium text-foreground">小明</span>
      </button>

      {/* 主题切换按钮 */}
      <button
        type="button"
        onClick={toggleTheme}
        className={iconBtn}
        title={isDark ? '切换到亮色' : '切换到暗色'}
        aria-label="切换主题"
      >
        {isDark ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      {/* 设置按钮 */}
      <button type="button" className={iconBtn} title="设置" aria-label="设置">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  );
}

export default AppToolbar;
