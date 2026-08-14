/**
 * JSON 语法高亮 + 折叠/展开树视图。
 *
 * 用于「在线解析」模式，把 JSON.parse 后的结构渲染成可交互的树：
 *  - 键、字符串、数字、布尔、null 各自不同颜色；
 *  - 对象 / 数组默认展开，点击标题行可折叠；
 *  - 顶部提供「全部展开 / 全部折叠」快捷操作。
 *
 * 组件不解析字符串——上游负责 JSON.parse，这里只做展示。
 */
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

interface JsonTreeViewProps {
  value: unknown;
}

export default function JsonTreeView({ value }: JsonTreeViewProps) {
  const containerPaths = useMemo(() => collectContainerPaths(value), [value]);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isFullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isFullscreen]);

  const toggle = (path: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const canCollapseAll = collapsed.size < containerPaths.size;
  const canExpandAll = collapsed.size > 0;

  const content = (
    <div
      className={
        isFullscreen
          ? 'absolute inset-0 z-50 flex flex-col bg-background p-6 rounded-xl border border-border shadow-2xl'
          : 'h-full flex flex-col'
      }
    >
      <div className="mb-2 flex shrink-0 items-center gap-3 text-xs">
        <button
          type="button"
          disabled={!canCollapseAll}
          onClick={() => setCollapsed(new Set(containerPaths))}
          className="text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          全部折叠
        </button>
        <span className="text-border-strong">|</span>
        <button
          type="button"
          disabled={!canExpandAll}
          onClick={() => setCollapsed(new Set())}
          className="text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          全部展开
        </button>
        <button
          type="button"
          onClick={() => setIsFullscreen((v) => !v)}
          className="ml-auto text-muted-foreground hover:text-foreground"
          title={isFullscreen ? '退出全屏 (Esc)' : '全屏'}
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
      </div>
      <div className="flex-1 overflow-auto rounded-lg bg-muted p-4 font-mono text-sm leading-6 text-foreground">
        <JsonNode value={value} path="$" isLast collapsed={collapsed} onToggle={toggle} />
      </div>
    </div>
  );

  if (isFullscreen) {
    const target = document.getElementById('json-lab-page');
    if (target) {
      return createPortal(content, target);
    }
  }

  return content;
}

interface NodeProps {
  value: unknown;
  path: string;
  keyName?: string;
  isLast: boolean;
  collapsed: Set<string>;
  onToggle: (path: string) => void;
}

function JsonNode({ value, path, keyName, isLast, collapsed, onToggle }: NodeProps) {
  if (Array.isArray(value)) {
    return (
      <ContainerNode
        path={path}
        keyName={keyName}
        isLast={isLast}
        open="["
        close="]"
        summary={`${value.length} items`}
        empty={value.length === 0}
        collapsed={collapsed}
        onToggle={onToggle}
      >
        {value.map((item, index) => (
          <JsonNode
            key={index}
            value={item}
            path={`${path}[${index}]`}
            isLast={index === value.length - 1}
            collapsed={collapsed}
            onToggle={onToggle}
          />
        ))}
      </ContainerNode>
    );
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    return (
      <ContainerNode
        path={path}
        keyName={keyName}
        isLast={isLast}
        open="{"
        close="}"
        summary={`${entries.length} keys`}
        empty={entries.length === 0}
        collapsed={collapsed}
        onToggle={onToggle}
      >
        {entries.map(([key, item], index) => (
          <JsonNode
            key={key}
            value={item}
            keyName={key}
            path={`${path}.${key}`}
            isLast={index === entries.length - 1}
            collapsed={collapsed}
            onToggle={onToggle}
          />
        ))}
      </ContainerNode>
    );
  }

  if (typeof value === 'string') {
    return <StringNode value={value} keyName={keyName} isLast={isLast} />;
  }

  return (
    <div className="whitespace-pre-wrap break-all">
      {keyName !== undefined && <KeyLabel name={keyName} />}
      <PrimitiveValue value={value} />
      {!isLast && <Punct>,</Punct>}
    </div>
  );
}

interface StringNodeProps {
  value: string;
  keyName?: string;
  isLast: boolean;
}

function StringNode({ value, keyName, isLast }: StringNodeProps) {
  const [destructured, setDestructured] = useState<{ parsed: unknown } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const canDestructure = useMemo(() => looksLikeJsonString(value), [value]);

  const handleDestructure = () => {
    try {
      const parsed = JSON.parse(value);
      if (parsed === null || typeof parsed !== 'object') {
        setParseError('解构结果不是对象或数组');
        return;
      }
      setDestructured({ parsed });
      setParseError(null);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : String(err));
    }
  };

  if (destructured) {
    return (
      <DestructuredStringNode
        value={destructured.parsed}
        keyName={keyName}
        isLast={isLast}
        onRestore={() => setDestructured(null)}
      />
    );
  }

  return (
    <div className="group whitespace-pre-wrap break-all">
      {keyName !== undefined && <KeyLabel name={keyName} />}
      {canDestructure && (
        <button
          type="button"
          onClick={handleDestructure}
          className="mr-2 hidden items-center gap-1 rounded border border-orange-400 bg-orange-50 px-2 py-0.5 text-xs font-medium leading-none text-orange-600 align-middle shadow-sm hover:bg-orange-100 hover:border-orange-500 dark:bg-orange-500/15 dark:border-orange-500/60 dark:text-orange-300 dark:hover:bg-orange-500/25 group-hover:inline-flex"
          title="尝试将该字符串解析为 JSON 并展开"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M8 3H5a2 2 0 0 0-2 2v3" />
            <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
            <path d="M3 16v3a2 2 0 0 0 2 2h3" />
            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
          解构 JSON String
        </button>
      )}
      <span className="text-accent">&quot;{escapeString(value)}&quot;</span>
      {!isLast && <Punct>,</Punct>}
      {parseError && (
        <span className="ml-2 text-xs text-red-500 dark:text-red-400">解构失败：{parseError}</span>
      )}
    </div>
  );
}

interface DestructuredStringNodeProps {
  value: unknown;
  keyName?: string;
  isLast: boolean;
  onRestore: () => void;
}

function DestructuredStringNode({ value, keyName, isLast, onRestore }: DestructuredStringNodeProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const toggle = (path: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  return (
    <div className="group">
      <div className="relative rounded border border-dashed border-border/70 bg-background/40 pl-2 pr-2 py-1 my-0.5">
        <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="italic">↳ 已解构的 JSON String</span>
          <button
            type="button"
            onClick={onRestore}
            className="underline decoration-dotted hover:text-primary"
            title="还原为原始字符串"
          >
            还原
          </button>
        </div>
        <JsonNode
          value={value}
          keyName={keyName}
          path="$destructured"
          isLast
          collapsed={collapsed}
          onToggle={toggle}
        />
      </div>
      {!isLast && <Punct>,</Punct>}
    </div>
  );
}

function looksLikeJsonString(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length < 2) return false;
  return trimmed.startsWith('{"') || trimmed.startsWith('[');
}

interface ContainerNodeProps {
  path: string;
  keyName?: string;
  isLast: boolean;
  open: string;
  close: string;
  summary: string;
  empty: boolean;
  collapsed: Set<string>;
  onToggle: (path: string) => void;
  children: React.ReactNode;
}

function ContainerNode({
  path,
  keyName,
  isLast,
  open,
  close,
  summary,
  empty,
  collapsed,
  onToggle,
  children,
}: ContainerNodeProps) {
  const isCollapsed = collapsed.has(path);

  const header = (
    <>
      {!empty && <Caret open={!isCollapsed} />}
      {empty && <span className="inline-block w-3" aria-hidden />}
      {keyName !== undefined && <KeyLabel name={keyName} />}
      <Punct>{open}</Punct>
    </>
  );

  if (empty) {
    return (
      <div>
        {header}
        <Punct>{close}</Punct>
        {!isLast && <Punct>,</Punct>}
      </div>
    );
  }

  if (isCollapsed) {
    return (
      <div>
        <button
          type="button"
          onClick={() => onToggle(path)}
          className="inline items-baseline text-left hover:text-primary"
        >
          {header}
          <span className="text-muted-foreground italic"> {summary} </span>
          <Punct>{close}</Punct>
        </button>
        {!isLast && <Punct>,</Punct>}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(path)}
        className="inline items-baseline text-left hover:text-primary"
      >
        {header}
      </button>
      <div className="ml-[6px] border-l border-border pl-4">{children}</div>
      <Punct>{close}</Punct>
      {!isLast && <Punct>,</Punct>}
    </div>
  );
}

function Caret({ open }: { open: boolean }) {
  return (
    <span
      className={`mr-1 inline-block w-2 text-[10px] text-muted-foreground transition-transform ${
        open ? 'rotate-90' : ''
      }`}
      aria-hidden
    >
      ▶
    </span>
  );
}

function KeyLabel({ name }: { name: string }) {
  return (
    <>
      <span className="text-primary">&quot;{name}&quot;</span>
      <Punct>: </Punct>
    </>
  );
}

function Punct({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground">{children}</span>;
}

function PrimitiveValue({ value }: { value: unknown }) {
  if (value === null) {
    return <span className="italic text-muted-foreground">null</span>;
  }
  if (typeof value === 'string') {
    return (
      <span className="text-accent">
        &quot;{escapeString(value)}&quot;
      </span>
    );
  }
  if (typeof value === 'number') {
    return <span className="text-orange-500 dark:text-orange-400">{String(value)}</span>;
  }
  if (typeof value === 'boolean') {
    return <span className="text-purple-500 dark:text-purple-400">{String(value)}</span>;
  }
  if (typeof value === 'undefined') {
    return <span className="italic text-muted-foreground">undefined</span>;
  }
  return <span>{String(value)}</span>;
}

function escapeString(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function collectContainerPaths(root: unknown): Set<string> {
  const paths = new Set<string>();
  const walk = (value: unknown, path: string) => {
    if (Array.isArray(value)) {
      if (value.length === 0) return;
      paths.add(path);
      value.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }
    if (isPlainObject(value)) {
      const entries = Object.entries(value);
      if (entries.length === 0) return;
      paths.add(path);
      for (const [key, next] of entries) {
        walk(next, `${path}.${key}`);
      }
    }
  };
  walk(root, '$');
  return paths;
}
