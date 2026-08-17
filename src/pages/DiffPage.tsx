/**
 * 文本差异对比：左右两栏对比两段文本的行级差异。
 *
 * 视图组成：
 * - 顶部：语言选择、忽略空白/忽略大小写开关、统计信息、保存/历史/交换/清空。
 * - 中部：左右两个 Shiki 语法高亮编辑器。
 * - 下部：并排 side-by-side diff 结果，红/绿高亮删除/新增行。
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, type Variants } from 'motion/react';
import {
  createHighlighterCore,
  createJavaScriptRegexEngine,
} from 'react-shiki/core';
import Seo from '../components/Seo';
import ShikiEditor from '../components/base/ShikiEditor';
import { diffLines, toSideBySide, type DiffOptions } from '../utils/textDiff';
import { useDiffHistory } from '../hooks/useDiffHistory';
import SaveDiffHistoryPopover from '../components/diff/SaveDiffHistoryPopover';
import DiffHistoryDrawer from '../components/diff/DiffHistoryDrawer';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.02 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 18 },
  },
};

const LANGUAGES = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'go', label: 'Go' },
  { value: 'tsx', label: 'TSX' },
] as const;

type DiffLanguage = (typeof LANGUAGES)[number]['value'];

function OptionToggle({
  active,
  onClick,
  children,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={hint}
      className={
        'px-3 py-1.5 text-sm rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
        (active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted')
      }
    >
      {children}
    </button>
  );
}

const LEFT_LINE_BG: Record<'equal' | 'remove' | 'empty', string> = {
  equal: '',
  remove: 'bg-destructive/15',
  empty: 'bg-muted/40',
};

const RIGHT_LINE_BG: Record<'equal' | 'add' | 'empty', string> = {
  equal: '',
  add: 'bg-accent/20',
  empty: 'bg-muted/40',
};

export default function DiffPage() {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [language, setLanguage] = useState<DiffLanguage>('markdown');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const saveBtnRef = useRef<HTMLButtonElement | null>(null);

  const { items, save, remove, rename, clearAll } = useDiffHistory();

  // 按需加载 Shiki 高亮器：4 种语言 + github 双主题
  const [highlighter, setHighlighter] = useState<Awaited<
    ReturnType<typeof createHighlighterCore>
  > | null>(null);

  useEffect(() => {
    let disposed = false;
    createHighlighterCore({
      themes: [
        import('@shikijs/themes/github-light'),
        import('@shikijs/themes/github-dark'),
      ],
      langs: [
        import('@shikijs/langs/markdown'),
        import('@shikijs/langs/typescript'),
        import('@shikijs/langs/go'),
        import('@shikijs/langs/tsx'),
      ],
      engine: createJavaScriptRegexEngine(),
    }).then((hl) => {
      if (!disposed) setHighlighter(hl);
    });
    return () => {
      disposed = true;
    };
  }, []);

  const options: DiffOptions = { ignoreWhitespace, ignoreCase };

  const result = useMemo(
    () => diffLines(leftText, rightText, options),
    [leftText, rightText, ignoreWhitespace, ignoreCase],
  );
  const rows = useMemo(() => toSideBySide(result.ops), [result.ops]);

  const hasContent = leftText.length > 0 || rightText.length > 0;

  const swap = () => {
    setLeftText(rightText);
    setRightText(leftText);
  };

  const clear = () => {
    setLeftText('');
    setRightText('');
  };

  const canSave = leftText.trim().length > 0 || rightText.trim().length > 0;

  const handleSave = async (title: string) => {
    await save({ title, leftText, rightText });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Seo
        title="文本差异对比 - 在线 Diff 工具 - 寒冰工具箱"
        description="在线文本差异对比工具，左右并排显示两段文本的行级差异，支持语法高亮、忽略空白与忽略大小写，纯浏览器本地运算。"
        path="/diff"
      />

      <motion.div className="mb-8" variants={itemVariants}>
        <h1 className="text-3xl font-bold text-primary mb-2">文本差异对比</h1>
        <p className="text-muted-foreground">左右并排展示两段文本的行级差异，红色为删除、绿色为新增。</p>
      </motion.div>

      <motion.div className="mb-4 flex flex-wrap items-center gap-3" variants={itemVariants}>
        {/* 语言选择 */}
        <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1" role="group" aria-label="语法高亮语言">
          {LANGUAGES.map((lang) => (
            <OptionToggle
              key={lang.value}
              active={language === lang.value}
              onClick={() => setLanguage(lang.value)}
              hint={`语法高亮：${lang.label}`}
            >
              {lang.label}
            </OptionToggle>
          ))}
        </div>

        <div className="h-5 w-px bg-border" aria-hidden="true" />

        <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1" role="group" aria-label="对比选项">
          <OptionToggle
            active={ignoreWhitespace}
            onClick={() => setIgnoreWhitespace((v) => !v)}
            hint="比较前先去掉每行首尾空白"
          >
            忽略空白
          </OptionToggle>
          <OptionToggle
            active={ignoreCase}
            onClick={() => setIgnoreCase((v) => !v)}
            hint="比较时不区分大小写"
          >
            忽略大小写
          </OptionToggle>
        </div>

        {hasContent && (
          <div className="inline-flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              <span className="inline-block h-2 w-2 rounded-full bg-accent mr-1" />
              新增 {result.stats.added}
            </span>
            <span>
              <span className="inline-block h-2 w-2 rounded-full bg-destructive mr-1" />
              删除 {result.stats.removed}
            </span>
            <span>共 {result.stats.unchanged} 行相同</span>
            {result.identical && <span className="text-accent">两段文本完全一致</span>}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            ref={saveBtnRef}
            type="button"
            disabled={!canSave}
            onClick={() => setPopoverOpen((v) => !v)}
            aria-label="保存当前文本差异到历史记录"
            title="保存当前文本差异到历史记录"
            className={[
              'inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors shadow-sm border',
              savedFlash
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'bg-primary border-primary text-primary-foreground hover:bg-primary/90',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none',
            ].join(' ')}
          >
            {savedFlash ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <path d="M17 21v-8H7v8" />
                <path d="M7 3v5h8" />
              </svg>
            )}
            <span>{savedFlash ? '已保存' : '保存'}</span>
          </button>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="打开文本差异历史记录"
            title="打开文本差异历史记录"
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
              <path d="M12 7v5l3 2" />
            </svg>
            <span>历史</span>
            {items.length > 0 && (
              <span className="ml-0.5 rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold text-primary">
                {items.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={swap}
            disabled={!hasContent}
            aria-label="交换左右文本"
            className="group inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-swap-fg bg-swap border border-swap transition-colors hover:bg-swap-hover active:bg-swap-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-swap/60 disabled:opacity-40 disabled:hover:bg-swap disabled:active:bg-swap"
            title="交换左右文本"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:rotate-180">
              <path d="m17 3 4 4-4 4" />
              <path d="M21 7H9" />
              <path d="m7 21-4-4 4-4" />
              <path d="M3 17h12" />
            </svg>
            <span>交换</span>
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={!hasContent}
            aria-label="清空两侧输入"
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-clear-fg bg-clear border border-clear transition-colors hover:bg-clear-hover active:bg-clear-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clear/60 disabled:opacity-40 disabled:hover:bg-clear disabled:active:bg-clear"
            title="清空两侧输入"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
            <span>清空</span>
          </button>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch mb-6">
        <motion.div className="lg:flex-1 lg:basis-0 min-w-0" variants={itemVariants}>
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <label className="block text-sm font-medium text-foreground mb-3">原始文本</label>
            <ShikiEditor
              name="leftText"
              value={leftText}
              onChange={setLeftText}
              placeholder="在此粘贴原始文本..."
              language={language}
              highlighter={highlighter}
            />
          </div>
        </motion.div>

        <motion.div className="lg:flex-1 lg:basis-0 min-w-0" variants={itemVariants}>
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <label className="block text-sm font-medium text-foreground mb-3">对比文本</label>
            <ShikiEditor
              name="rightText"
              value={rightText}
              onChange={setRightText}
              placeholder="在此粘贴要对比的文本..."
              language={language}
              highlighter={highlighter}
            />
          </div>
        </motion.div>
      </div>

      <motion.div className="bg-card rounded-xl border border-border p-6 shadow-sm" variants={itemVariants}>
        <h2 className="text-sm font-medium text-foreground mb-3">差异视图</h2>
        {!hasContent ? (
          <div className="min-h-40 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-5xl mb-4">📄</div>
              <p>输入两段文本即可查看差异</p>
            </div>
          </div>
        ) : (
          <div className="overflow-auto rounded-lg border border-border">
            <table className="w-full text-xs font-mono">
              <colgroup>
                <col className="w-10" />
                <col className="w-6" />
                <col />
                <col className="w-10" />
                <col className="w-6" />
                <col />
              </colgroup>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className="align-top">
                    <td className={`select-none text-right pr-2 pl-2 text-muted-foreground ${LEFT_LINE_BG[row.leftType]}`}>
                      {row.leftLine ?? ''}
                    </td>
                    <td className={`select-none text-center text-muted-foreground ${LEFT_LINE_BG[row.leftType]}`}>
                      {row.leftType === 'remove' ? '-' : ''}
                    </td>
                    <td className={`pr-3 py-0.5 whitespace-pre-wrap break-all text-foreground ${LEFT_LINE_BG[row.leftType]}`}>
                      {row.leftText ?? ''}
                    </td>
                    <td className={`select-none text-right pr-2 pl-2 text-muted-foreground border-l border-border ${RIGHT_LINE_BG[row.rightType]}`}>
                      {row.rightLine ?? ''}
                    </td>
                    <td className={`select-none text-center text-muted-foreground ${RIGHT_LINE_BG[row.rightType]}`}>
                      {row.rightType === 'add' ? '+' : ''}
                    </td>
                    <td className={`pr-3 py-0.5 whitespace-pre-wrap break-all text-foreground ${RIGHT_LINE_BG[row.rightType]}`}>
                      {row.rightText ?? ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <SaveDiffHistoryPopover
        open={popoverOpen}
        anchor={saveBtnRef.current}
        canSave={canSave}
        onClose={() => setPopoverOpen(false)}
        onSave={handleSave}
      />

      <DiffHistoryDrawer
        open={drawerOpen}
        items={items}
        currentLeftText={leftText}
        currentRightText={rightText}
        onClose={() => setDrawerOpen(false)}
        onLoad={(it) => {
          setLeftText(it.leftText);
          setRightText(it.rightText);
        }}
        onRename={rename}
        onDelete={remove}
        onClearAll={clearAll}
      />
    </motion.div>
  );
}