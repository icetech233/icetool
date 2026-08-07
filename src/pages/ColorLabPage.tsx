/**
 * ColorLabPage —— 「颜色实验室」主页面。
 * 布局：
 * - 桌面端（lg+）：左列预览 + 中列转换器 + 右列快捷工具栏（两栏自适应实际为三区块）。
 * - 移动端：上下堆叠（预览 → 转换器 → 工具栏）。
 * 工具栏内部在「快速示例」与「标准色表」之间切换。
 */
import { useState } from 'react';
import { useColorConverter } from '../utils/color/useColorConverter';
import ColorPreview from '../components/color/ColorPreview';
import ColorConverter from '../components/color/ColorConverter';
import QuickExamples from '../components/color/QuickExamples';
import StandardColors from '../components/color/StandardColors';

type ToolTab = 'quick' | 'standard';

export default function ColorLabPage() {
  const converter = useColorConverter('#1D9BF0');
  const [toolTab, setToolTab] = useState<ToolTab>('quick');

  return (
    <div className="flex flex-col gap-6">
      {/* 标题区 */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">颜色实验室</h1>
        <p className="text-sm text-muted-foreground">
          HEX / HEXA ↔ RGB / RGBA ↔ HSL / HSLA 实时双向转换，纯浏览器端计算，支持对比度检测与标准色表。
        </p>
      </header>

      {/* 主体：三区块自适应布局 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 左：实时预览 */}
        <section className="lg:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-foreground">实时预览</h2>
            <ColorPreview hexa={converter.values.hexa} />
          </div>
        </section>

        {/* 中：转换器 */}
        <section className="lg:col-span-5">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-foreground">转换器</h2>
            <ColorConverter converter={converter} />
          </div>
        </section>

        {/* 右：快捷工具栏 */}
        <section className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 inline-flex w-full rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => setToolTab('quick')}
                className={[
                  'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  toolTab === 'quick' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
                ].join(' ')}
                aria-pressed={toolTab === 'quick'}
              >
                快速示例
              </button>
              <button
                type="button"
                onClick={() => setToolTab('standard')}
                className={[
                  'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  toolTab === 'standard'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground',
                ].join(' ')}
                aria-pressed={toolTab === 'standard'}
              >
                标准色表
              </button>
            </div>

            {toolTab === 'quick' ? (
              <QuickExamples onPick={converter.setHex} />
            ) : (
              <StandardColors onPick={converter.setHex} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
