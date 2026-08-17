/**
 * ShikiEditor —— 语法高亮编辑器组件。
 *
 * 双层结构：
 * - 下层：ShikiHighlighter 渲染的静态语法高亮（不可交互）。
 * - 上层：透明 textarea 承载编辑、光标、IME、选择、复制等原生行为。
 *
 * 为什么 textarea 必须存在且可被选中：
 * - Shiki 输出的是静态 HTML，没有光标 / IME / 选区能力。
 * - 上层 textarea 承接所有原生编辑行为，「可被选中」是刻意保留的（否则鼠标/键盘无法复制）。
 * - 通过 `::selection` 让选中背景与 caret 可见，避免透明文字被选中时的视觉空缺。
 *
 * 为什么必须显式对齐字体、行高、tab-size：
 * - 浏览器 UA 样式表存在 `pre { font-family: monospace; }`，
 *   它会覆盖父元素继承下来的 tailwind `font-mono`，导致 pre 与 textarea 使用
 *   不同的等宽字体（字符宽度差 0.5~1px），光标就会与高亮字符错位。
 * - 因此这里用内联 `style` 强制把 pre 和 textarea 的字体族/字号/行高/tab-size 打平。
 */
import { useCallback, useLayoutEffect, useRef, type CSSProperties, type ComponentProps } from 'react';
import { ShikiHighlighter } from 'react-shiki/core';

interface ShikiEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  language: string;
  highlighter: ComponentProps<typeof ShikiHighlighter>['highlighter'] | null;
  /** textarea 的 name，用于表单等场景 */
  name?: string;
  /** textarea 的 id，可与外部 label 的 htmlFor 关联 */
  id?: string;
}

const MONO_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

const SHARED_TEXT_STYLE: CSSProperties = {
  fontFamily: MONO_STACK,
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
  letterSpacing: 0,
  tabSize: 2,
};

export default function ShikiEditor({
  value,
  onChange,
  placeholder = '',
  language,
  highlighter,
  name,
  id,
}: ShikiEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);

  const syncScroll = useCallback(() => {
    const ta = textareaRef.current;
    const hl = highlightRef.current;
    if (!ta || !hl) return;
    hl.scrollTop = ta.scrollTop;
    hl.scrollLeft = ta.scrollLeft;
  }, []);

  useLayoutEffect(() => {
    syncScroll();
    // highlighter 异步加载完成后高亮层内容会重新渲染，也需要重新对齐滚动位置
  }, [value, language, highlighter, syncScroll]);

  return (
    <div
      className="relative h-64 rounded-lg border border-border-strong bg-input overflow-hidden focus-within:ring-2 focus-within:ring-primary/50"
      style={SHARED_TEXT_STYLE}
    >
      {/* 语法高亮显示层（不可交互，滚动跟随 textarea） */}
      <div
        ref={highlightRef}
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden p-4 pointer-events-none [&_pre]:!m-0 [&_pre]:!p-0 [&_pre]:!bg-transparent [&_pre]:whitespace-pre [&_code]:whitespace-pre"
        style={SHARED_TEXT_STYLE}
      >
        {highlighter && value ? (
          <ShikiHighlighter
            highlighter={highlighter}
            language={language}
            theme={{ light: 'github-light', dark: 'github-dark' }}
            defaultColor={false}
            addDefaultStyles={false}
            style={SHARED_TEXT_STYLE}
            className="!bg-transparent !p-0 !m-0"
          >
            {value}
          </ShikiHighlighter>
        ) : (
          <pre
            className="m-0 p-0 whitespace-pre text-transparent"
            style={SHARED_TEXT_STYLE}
          >
            {value || ' '}
          </pre>
        )}
      </div>

      {/* 透明输入层：承载真实编辑行为；文字透明但保留 caret 与选中背景（selection）。 */}
      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        placeholder={placeholder}
        wrap="off"
        style={SHARED_TEXT_STYLE}
        className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-foreground p-4 resize-none focus:outline-none placeholder:text-muted-foreground overflow-auto selection:bg-primary/30 selection:text-transparent"
        spellCheck={false}
      />
    </div>
  );
}