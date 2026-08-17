/**
 * Select —— 通用下拉选择组件（泛型，值类型为字符串字面量联合）。
 *
 * - 触发器为 button，下拉面板通过 Portal 渲染到 `document.body`，
 *   避免被父容器的 `overflow: hidden` 或 `transform` 裁剪。
 * - 面板超出视口下方时自动翻转到触发器上方；随页面滚动 / 缩放重新定位。
 * - 可选本地搜索：传入 `searchable` 后下拉面板顶部出现搜索框，按 label 模糊过滤。
 * - 键盘支持：↑/↓ 移动、Home/End 跳转、Enter/Space 确认、Esc 关闭。
 * - ARIA：焦点始终保留在触发器上，面板为 listbox，
 *   通过 aria-activedescendant 暴露当前高亮项。
 */
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SelectProps<T extends string = string> {
  /** 当前选中的值 */
  value: T;
  /** 选中变化回调 */
  onChange: (value: T) => void;
  /** 选项列表 */
  options: readonly SelectOption<T>[];
  /** 触发器按钮的 aria-label（建议提供，保证可访问性） */
  ariaLabel?: string;
  /** 未选中任何选项时的占位文案 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 额外类名，作用于触发器按钮 */
  className?: string;
  /** 是否启用本地搜索（按 label 模糊匹配） */
  searchable?: boolean;
  /** 搜索框占位文案 */
  searchPlaceholder?: string;
}

const VIEWPORT_MARGIN = 8;
const GAP = 4;

export default function Select<T extends string = string>({
  value,
  onChange,
  options,
  ariaLabel,
  placeholder = '请选择',
  disabled = false,
  className,
  searchable = false,
  searchPlaceholder = '搜索…',
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
    openUpward: boolean;
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = useId();

  /** 搜索过滤后的选项列表 */
  const filteredOptions = useMemo<SelectOption<T>[]>(() => {
    if (!searchable || !searchQuery) return [...options];
    const q = searchQuery.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, searchable, searchQuery]);

  const selected = options.find((o) => o.value === value);

  /** 从 from 出发沿 dir 方向找下一个可用选项索引（基于过滤后列表），找不到返回 from */
  const moveActive = useCallback(
    (from: number, dir: 1 | -1): number => {
      let i = from + dir;
      while (i >= 0 && i < filteredOptions.length) {
        if (!filteredOptions[i].disabled) return i;
        i += dir;
      }
      return from;
    },
    [filteredOptions],
  );

  const firstEnabledIndex = useCallback((): number => {
    const idx = filteredOptions.findIndex((o) => !o.disabled);
    return idx;
  }, [filteredOptions]);

  const openList = useCallback(() => {
    if (disabled) return;
    setSearchQuery('');
    const selectedIdx = filteredOptions.findIndex((o) => o.value === value);
    setActiveIndex(selectedIdx >= 0 ? selectedIdx : firstEnabledIndex());
    setOpen(true);
  }, [disabled, filteredOptions, value, firstEnabledIndex]);

  const closeList = useCallback((refocus = false) => {
    setOpen(false);
    setSearchQuery('');
    if (refocus) triggerRef.current?.focus();
  }, []);

  const selectAt = useCallback(
    (filteredIndex: number) => {
      const entry = filteredOptions[filteredIndex];
      if (!entry || entry.disabled) return;
      onChange(entry.value);
      closeList(true);
    },
    [filteredOptions, onChange, closeList],
  );

  /** 根据触发器与面板尺寸计算定位，空间不足时向上翻转 */
  const updatePos = useCallback(() => {
    const trigger = triggerRef.current;
    const list = listRef.current;
    if (!trigger || !list) return;
    const rect = trigger.getBoundingClientRect();
    const listH = list.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const openUpward =
      rect.bottom + GAP + listH > vh - VIEWPORT_MARGIN &&
      rect.top - GAP - listH >= VIEWPORT_MARGIN;
    const top = openUpward ? rect.top - GAP - listH : rect.bottom + GAP;
    const left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(vw - rect.width - VIEWPORT_MARGIN, rect.left),
    );
    setPos({ top, left, width: rect.width, openUpward });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
  }, [open, updatePos]);

  // 打开期间：页面滚动 / 缩放时重新定位
  useEffect(() => {
    if (!open) return;
    const handler = () => updatePos();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [open, updatePos]);

  // 打开期间：点击面板与触发器之外的区域时关闭
  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      closeList();
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open, closeList]);

  // 高亮项变化时保证其滚动到可视区域
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const entry = filteredOptions[activeIndex];
    if (!entry) return;
    const item = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`,
    );
    item?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex, filteredOptions]);

  // 搜索词变化时重置高亮到第一个可用项
  useEffect(() => {
    if (!open) return;
    const idx = filteredOptions.findIndex((o) => !o.disabled);
    setActiveIndex(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, open, filteredOptions]);

  // 打开且可搜索时自动聚焦搜索框
  useEffect(() => {
    if (!open || !searchable) return;
    requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [open, searchable]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    // 搜索框内的键盘事件
    if (searchable && e.target === searchInputRef.current) {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (searchQuery) {
          setSearchQuery('');
        } else {
          closeList(true);
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => moveActive(i, 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => moveActive(i, -1));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        selectAt(activeIndex);
        return;
      }
      if (e.key === 'Tab') {
        closeList();
        return;
      }
      // 其余按键交给搜索框默认行为（输入文字）
      return;
    }

    // 触发器上的键盘事件
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => moveActive(i, 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => moveActive(i, -1));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(firstEnabledIndex());
        break;
      case 'End': {
        e.preventDefault();
        let i = filteredOptions.length - 1;
        while (i >= 0 && filteredOptions[i].disabled) i -= 1;
        setActiveIndex(i);
        break;
      }
      case 'Enter':
      case ' ':
        e.preventDefault();
        selectAt(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        closeList(true);
        break;
      case 'Tab':
        closeList();
        break;
    }
  };

  const renderList =
    typeof document !== 'undefined' &&
    createPortal(
      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            key="select-list"
            role="listbox"
            id={listboxId}
            aria-label={ariaLabel}
            initial={{ opacity: 0, scale: 0.97, y: pos?.openUpward ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: pos?.openUpward ? 4 : -4 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              width: pos?.width,
              minWidth: '8rem',
              visibility: pos ? 'visible' : 'hidden',
              zIndex: 1090,
            }}
            className="max-h-64 overflow-auto rounded-lg border border-border bg-popover p-1 shadow-2xl"
          >
            {searchable && (
              <div className="sticky top-0 z-10 mb-1 bg-popover px-1 pb-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  onKeyDown={onKeyDown}
                  className="w-full rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
                  role="searchbox"
                  aria-label="搜索选项"
                />
              </div>
            )}
            {filteredOptions.length === 0 && (
              <div className="px-2.5 py-2 text-xs text-muted-foreground text-center">
                无匹配结果
              </div>
            )}
            {filteredOptions.map((opt, index) => {
              const isSelected = opt.value === value;
              const isActive = index === activeIndex;
              return (
                <div
                  key={opt.value}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled || undefined}
                  id={`${listboxId}-option-${index}`}
                  onMouseEnter={() => {
                    if (!opt.disabled) setActiveIndex(index);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectAt(index)}
                  className={[
                    'flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-xs cursor-pointer transition-colors',
                    opt.disabled
                      ? 'text-muted-foreground/50 cursor-not-allowed'
                      : isSelected
                        ? 'bg-select-selected text-select-selected-fg'
                        : isActive
                          ? 'bg-select-hover text-select-hover-fg'
                          : 'text-popover-foreground',
                  ].join(' ')}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-select-selected-fg"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>,
      document.body,
    );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        aria-label={ariaLabel}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={onKeyDown}
        onBlur={() => {
          // 焦点移出触发器与面板之外时关闭
          if (open && !listRef.current?.contains(document.activeElement)) closeList();
        }}
        className={[
          'inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors',
          'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`shrink-0 text-muted-foreground transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {renderList}
    </>
  );
}
