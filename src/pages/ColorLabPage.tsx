/**
 * ColorLabPage —— 「颜色实验室」主页面。
 *
 * 布局（左右固定比例 + 左栏瀑布流）：
 * - 整体左右两栏：左栏自适应（flex-1），右栏固定宽度（lg:360 / xl:420 / 2xl:480px）。
 *   移动端上下堆叠，桌面端左右并排（lg 起）。
 * - 左栏：
 *   - 头部稳定行（grid）：第一排恒定「实时预览 + 转换器」，不参与瀑布流，避免乱序。
 *   - 下方瀑布流（CSS columns）：快速示例 / 配色方案推荐 / 色彩趋势 / 随机灵感墙；
 *     中等屏（md/lg）1 列、大屏（xl+）2 列，高度自适应、无内部滚动条、无抖屏。
 * - 右栏：固定区域，仅放「工具箱（标准色表 / 收藏 / 历史 3 Tab）」。
 *   工具箱位置恒定（不随左栏瀑布流流动），右栏拥有自身独立高度，
 *   不会被左栏拖出大面积留白，切 Tab 也不位移。
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

  const handleApplyScheme = useCallback(
    (colors: string[]) => {
      handlePick(colors[0]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [handlePick],
  );

  const TABS: { key: ToolTab; label: string }[] = [
    { key: 'standard', label: '标准色表' },
    { key: 'favorites', label: '收藏' },
    { key: 'history', label: '历史' },
  ];

  // 统一卡片容器（标题 + 内容），用于瀑布流各模块
  const Card = ({
    title,
    children,
    className,
  }: {
    title: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <div
      className={[
        'mb-6 break-inside-avoid rounded-2xl border border-border bg-card p-4 shadow-sm',
        className ?? '',
      ].join(' ')}
    >
      <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );

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

      {/* 左右固定比例布局：左栏瀑布流核心内容，右栏固定放工具箱 + 灵感墙 */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* 左栏：核心内容（头部稳定两列行 + 下方瀑布流） */}
        <div className="min-w-0 flex-1">
          {/* 头部稳定行：第一排恒定 实时预览 + 转换器（不参与瀑布流，避免乱序） */}
          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card title="实时预览">
              <ColorPreview hexa={converter.values.hexa} onFavorite={handleFavoriteColor} />
            </Card>
            <Card title="转换器">
              <ColorConverter converter={converter} />
            </Card>
          </div>

          {/* 下方瀑布流：快速示例 / 配色方案推荐 / 色彩趋势 / 随机灵感墙
              中等屏（md/lg）保持 1 列避免拥挤，大屏（xl+）才 2 列 */}
          <div className="columns-1 gap-6 xl:columns-2">
            {/* 快速示例 */}
            <Card title="快速示例">
              <QuickExamples onPick={handlePick} />
            </Card>

            {/* 配色方案推荐 */}
            <Card title="配色方案推荐">
              <SchemeRecommend
                currentHex={converter.values.hexa}
                onPick={handlePick}
                onApplyScheme={handleApplyScheme}
                onFavoriteScheme={handleFavoriteScheme}
              />
            </Card>

            {/* 色彩趋势 */}
            <Card title="色彩趋势">
              <ColorTrends refreshKey={refreshKey} />
            </Card>

            {/* 随机灵感墙（左栏瀑布流末尾，内部同样用瀑布流） */}
            <Card title="随机灵感墙">
              <InspirationWall
                onApplyScheme={handleApplyScheme}
                onFavoriteScheme={handleFavoriteScheme}
              />
            </Card>
          </div>
        </div>

        {/* 右栏（固定宽度，随超宽屏微涨）：仅工具箱，位置恒定、不随左栏流动 */}
        <aside className="flex w-full flex-col gap-6 lg:w-[360px] lg:flex-none xl:w-[420px] 2xl:w-[480px]">
          {/* 工具箱（3 个 Tab，固定右上区域，切 Tab 不位移） */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-foreground">工具箱</h2>
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
        </aside>
      </div>

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
