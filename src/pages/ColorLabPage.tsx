/**
 * ColorLabPage —— 「颜色实验室」主页面。
 *
 * 布局（方案 A：三列增强 + 全宽工作区）：
 * - 桌面端（lg+）：左列预览 + 中列转换器 + 右列快捷工具栏（含 快速示例/标准色表/收藏/历史 4 个 Tab）。
 * - 全宽区：上排「配色方案推荐(左) + 色彩趋势(右)」双栏；下排瀑布流「随机灵感墙」。
 * - 移动端：上下堆叠。
 *
 * 数据持久化：收藏与历史均写入浏览器本地 IndexedDB，刷新不丢失。
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useColorConverter } from '../utils/color/useColorConverter';
import { useColorLabActions } from '../utils/color/useColorLabActions';
import ColorPreview from '../components/color/ColorPreview';
import ColorConverter from '../components/color/ColorConverter';
import QuickExamples from '../components/color/QuickExamples';
import StandardColors from '../components/color/StandardColors';
import FavoritesPanel from '../components/color/FavoritesPanel';
import HistoryPanel from '../components/color/HistoryPanel';
import SchemeRecommend from '../components/color/SchemeRecommend';
import ColorTrends from '../components/color/ColorTrends';
import InspirationWall from '../components/color/InspirationWall';
import type { HarmonyType } from '../utils/color/types';

type ToolTab = 'standard' | 'favorites' | 'history';

export default function ColorLabPage() {
  const converter = useColorConverter('#1D9BF0');
  const actions = useColorLabActions();
  const [toolTab, setToolTab] = useState<ToolTab>('standard');
  const [refreshKey, setRefreshKey] = useState(0);
  const [injectedScheme, setInjectedScheme] = useState<string[] | undefined>(undefined);
  const lastHistoryHex = useRef<string>('');

  // 主色变化时写入历史（去重由 pushHistory 处理短时重复）
  useEffect(() => {
    const hex = converter.values.hexa;
    if (hex && hex !== lastHistoryHex.current) {
      lastHistoryHex.current = hex;
      void actions.pushHistory(hex, 'convert');
    }
  }, [converter.values.hexa, actions]);

  const bumpRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const handlePick = useCallback(
    (hex: string) => {
      converter.setHex(hex);
      void actions.pushHistory(hex, 'pick');
    },
    [converter, actions],
  );

  const handleFavoriteColor = useCallback(
    async (hexa: string) => {
      await actions.addColorFavorite(hexa);
      bumpRefresh();
    },
    [actions, bumpRefresh],
  );

  const handleFavoriteScheme = useCallback(
    async (colors: string[], scheme: HarmonyType) => {
      await actions.addSchemeFavorite(colors, scheme, `自定义${scheme}`);
      bumpRefresh();
    },
    [actions, bumpRefresh],
  );

  const handleApplyScheme = useCallback((colors: string[]) => {
    setInjectedScheme(colors);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }, []);

  const TABS: { key: ToolTab; label: string }[] = [
    { key: 'standard', label: '标准色表' },
    { key: 'favorites', label: '收藏' },
    { key: 'history', label: '历史' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 标题区 */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">颜色实验室</h1>
        <p className="text-sm text-muted-foreground">
          HEX / HEXA ↔ RGB / RGBA ↔ HSL / HSLA 实时双向转换，纯浏览器端计算，支持对比度检测、
          配色推荐、收藏与历史（本地持久化）。
        </p>
      </header>

      {/* 主体：三区块自适应布局 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 左：实时预览 */}
        <section className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-foreground">实时预览</h2>
            <ColorPreview hexa={converter.values.hexa} onFavorite={handleFavoriteColor} />
          </div>
        </section>

        {/* 中：转换器 */}
        <section className="lg:col-span-5">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-foreground">转换器</h2>
            <ColorConverter converter={converter} />
          </div>
        </section>

        {/* 右：工具栏（3 个 Tab；固定高度可滚动，避免被中列等高拖出留白） */}
        <section className="lg:col-span-3">
          <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 inline-flex w-full rounded-lg bg-muted p-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setToolTab(t.key)}
                  className={[
                    'flex-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors',
                    toolTab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
                  ].join(' ')}
                  aria-pressed={toolTab === t.key}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* 固定高度 + 内部滚动，使右列始终"满"，无突兀空白 */}
            <div className="min-h-0 flex-1 overflow-y-auto pr-1" style={{ maxHeight: '520px' }}>
              {toolTab === 'standard' && <StandardColors onPick={handlePick} />}
              {toolTab === 'favorites' && (
                <FavoritesPanel
                  currentHex={converter.values.hexa}
                  onPick={handlePick}
                  refreshKey={refreshKey}
                />
              )}
              {toolTab === 'history' && <HistoryPanel onPick={handlePick} refreshKey={refreshKey} />}
            </div>
          </div>
        </section>
      </div>

      {/* 快速示例：独立全宽 section（从右侧 Tab 拆出，宽度更充裕） */}
      <section>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-foreground">快速示例</h2>
          <QuickExamples onPick={handlePick} />
        </div>
      </section>

      {/* 全宽区：配色推荐 + 色彩趋势 双栏 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-foreground">配色方案推荐</h2>
            <SchemeRecommend
              currentHex={converter.values.hexa}
              onPick={handlePick}
              onApplyScheme={handleApplyScheme}
              onFavoriteScheme={handleFavoriteScheme}
            />
          </div>
        </section>

        <section className="lg:col-span-5">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-foreground">色彩趋势</h2>
            <ColorTrends refreshKey={refreshKey} />
          </div>
        </section>
      </div>

      {/* 全宽区：瀑布流随机灵感墙（方案 B） */}
      <section>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-foreground">随机灵感墙</h2>
          <InspirationWall
            onApplyScheme={handleApplyScheme}
            onFavoriteScheme={handleFavoriteScheme}
            injected={injectedScheme}
          />
        </div>
      </section>

      {/* 全局 Toast */}
      {actions.toast && (
        <div
          role="status"
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg"
        >
          {actions.toast}
        </div>
      )}
    </div>
  );
}
