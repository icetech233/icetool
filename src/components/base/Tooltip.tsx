/**
 * 通用 Tooltip 组件。
 *
 * 基于原生 DOM 定位 + React Portal 渲染到 `document.body`，避免被父容器的
 * `overflow: hidden` 或 `transform` 裁剪。支持 12 个位置、可控延迟、箭头、
 * 自定义背景色，并在视口边界处自动翻转到相反侧。
 */
import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';

export type TooltipPlacement =
  | 'top'
  | 'left'
  | 'right'
  | 'bottom'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'leftTop'
  | 'leftBottom'
  | 'rightTop'
  | 'rightBottom';

export interface TooltipProp {
  /** 提示文字内容，支持 ReactNode 或返回 ReactNode 的函数 */
  title: ReactNode | (() => ReactNode);
  /** 气泡框位置，默认 topRight */
  placement?: TooltipPlacement;
  /** 是否显示箭头（且指向目标元素中心），默认 true */
  arrow?: boolean;
  /** 气泡框背景颜色 */
  color?: string;
  /** 鼠标移入后显示的延迟（秒），默认 0.1 */
  mouseEnterDelay?: number;
  /** 鼠标移出后隐藏的延迟（秒），默认 0.1 */
  mouseLeaveDelay?: number;
  /** 被包裹的目标元素（单个 React 元素）*/
  children: ReactElement;
  /** 额外类名，作用于气泡框根节点 */
  className?: string;
}

interface Position {
  top: number;
  left: number;
  /** 箭头相对气泡的定位样式 */
  arrowStyle: CSSProperties;
  /** 箭头指向的方向（用于动画偏移） */
  side: 'top' | 'bottom' | 'left' | 'right';
}

const ARROW_SIZE = 6;
const GAP = 8;
const VIEWPORT_MARGIN = 8;

/** 根据 placement 计算气泡位置和箭头样式，必要时在视口边界处翻转 */
function computePosition(
  placement: TooltipPlacement,
  trigger: DOMRect,
  tip: { width: number; height: number },
  arrow: boolean,
): Position {
  const gap = GAP + (arrow ? ARROW_SIZE : 0);

  const build = (p: TooltipPlacement): Position => {
    let top = 0;
    let left = 0;
    let side: Position['side'] = 'top';
    const arrowStyle: CSSProperties = {};

    switch (p) {
      case 'top':
      case 'topLeft':
      case 'topRight': {
        side = 'bottom';
        top = trigger.top - tip.height - gap;
        if (p === 'top') left = trigger.left + trigger.width / 2 - tip.width / 2;
        else if (p === 'topLeft') left = trigger.left;
        else left = trigger.right - tip.width;
        arrowStyle.bottom = -ARROW_SIZE;
        arrowStyle.left =
          Math.max(
            ARROW_SIZE * 2,
            Math.min(
              tip.width - ARROW_SIZE * 2,
              trigger.left + trigger.width / 2 - left,
            ),
          ) - ARROW_SIZE;
        break;
      }
      case 'bottom':
      case 'bottomLeft':
      case 'bottomRight': {
        side = 'top';
        top = trigger.bottom + gap;
        if (p === 'bottom') left = trigger.left + trigger.width / 2 - tip.width / 2;
        else if (p === 'bottomLeft') left = trigger.left;
        else left = trigger.right - tip.width;
        arrowStyle.top = -ARROW_SIZE;
        arrowStyle.left =
          Math.max(
            ARROW_SIZE * 2,
            Math.min(
              tip.width - ARROW_SIZE * 2,
              trigger.left + trigger.width / 2 - left,
            ),
          ) - ARROW_SIZE;
        break;
      }
      case 'left':
      case 'leftTop':
      case 'leftBottom': {
        side = 'right';
        left = trigger.left - tip.width - gap;
        if (p === 'left') top = trigger.top + trigger.height / 2 - tip.height / 2;
        else if (p === 'leftTop') top = trigger.top;
        else top = trigger.bottom - tip.height;
        arrowStyle.right = -ARROW_SIZE;
        arrowStyle.top =
          Math.max(
            ARROW_SIZE * 2,
            Math.min(
              tip.height - ARROW_SIZE * 2,
              trigger.top + trigger.height / 2 - top,
            ),
          ) - ARROW_SIZE;
        break;
      }
      case 'right':
      case 'rightTop':
      case 'rightBottom': {
        side = 'left';
        left = trigger.right + gap;
        if (p === 'right') top = trigger.top + trigger.height / 2 - tip.height / 2;
        else if (p === 'rightTop') top = trigger.top;
        else top = trigger.bottom - tip.height;
        arrowStyle.left = -ARROW_SIZE;
        arrowStyle.top =
          Math.max(
            ARROW_SIZE * 2,
            Math.min(
              tip.height - ARROW_SIZE * 2,
              trigger.top + trigger.height / 2 - top,
            ),
          ) - ARROW_SIZE;
        break;
      }
    }
    return { top, left, arrowStyle, side };
  };

  const flipMap: Record<TooltipPlacement, TooltipPlacement> = {
    top: 'bottom',
    topLeft: 'bottomLeft',
    topRight: 'bottomRight',
    bottom: 'top',
    bottomLeft: 'topLeft',
    bottomRight: 'topRight',
    left: 'right',
    leftTop: 'rightTop',
    leftBottom: 'rightBottom',
    right: 'left',
    rightTop: 'leftTop',
    rightBottom: 'leftBottom',
  };

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let result = build(placement);
  const overflow =
    result.top < VIEWPORT_MARGIN ||
    result.left < VIEWPORT_MARGIN ||
    result.top + tip.height > vh - VIEWPORT_MARGIN ||
    result.left + tip.width > vw - VIEWPORT_MARGIN;

  if (overflow) {
    const flipped = build(flipMap[placement]);
    const flippedOk =
      flipped.top >= VIEWPORT_MARGIN &&
      flipped.left >= VIEWPORT_MARGIN &&
      flipped.top + tip.height <= vh - VIEWPORT_MARGIN &&
      flipped.left + tip.width <= vw - VIEWPORT_MARGIN;
    if (flippedOk) result = flipped;
  }

  // 最后做一次夹取，避免超出视口
  result.left = Math.max(
    VIEWPORT_MARGIN,
    Math.min(vw - tip.width - VIEWPORT_MARGIN, result.left),
  );
  result.top = Math.max(
    VIEWPORT_MARGIN,
    Math.min(vh - tip.height - VIEWPORT_MARGIN, result.top),
  );

  return result;
}

export default function Tooltip({
  title,
  placement = 'topRight',
  arrow = true,
  color,
  mouseEnterDelay = 0.1,
  mouseLeaveDelay = 0.1,
  children,
  className,
}: TooltipProp) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const id = useId();

  const clearTimers = useCallback(() => {
    if (enterTimer.current) {
      clearTimeout(enterTimer.current);
      enterTimer.current = null;
    }
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const show = useCallback(() => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    if (enterTimer.current) return;
    enterTimer.current = setTimeout(() => {
      enterTimer.current = null;
      setOpen(true);
    }, mouseEnterDelay * 1000);
  }, [mouseEnterDelay]);

  const hide = useCallback(() => {
    if (enterTimer.current) {
      clearTimeout(enterTimer.current);
      enterTimer.current = null;
    }
    if (leaveTimer.current) return;
    leaveTimer.current = setTimeout(() => {
      leaveTimer.current = null;
      setOpen(false);
    }, mouseLeaveDelay * 1000);
  }, [mouseLeaveDelay]);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const tip = tipRef.current;
    if (!trigger || !tip) return;
    const rect = trigger.getBoundingClientRect();
    setPos(
      computePosition(
        placement,
        rect,
        { width: tip.offsetWidth, height: tip.offsetHeight },
        arrow,
      ),
    );
  }, [placement, arrow]);

  // 打开时同步定位；随内容 / 滚动 / 尺寸变化更新
  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, title, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open, updatePosition]);

  const setTriggerRef = useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
  }, []);

  // 合并事件到 children，保留其原有事件
  const trigger = useMemo(() => {
    if (!isValidElement(children)) return children;
    // React 19：ref 作为常规 prop 存在于 props 上
    const el = children as ReactElement<
      Record<string, unknown> & { ref?: React.Ref<HTMLElement> }
    >;
    const originalProps = el.props;
    const originalRef = originalProps.ref;

    const merge = <E extends React.SyntheticEvent>(
      ours: (e: E) => void,
      theirs?: unknown,
    ) => (e: E) => {
      if (typeof theirs === 'function') (theirs as (e: E) => void)(e);
      ours(e);
    };

    const composedRef = (node: HTMLElement | null) => {
      setTriggerRef(node);
      if (typeof originalRef === 'function') originalRef(node);
      else if (originalRef && typeof originalRef === 'object')
        (originalRef as React.MutableRefObject<HTMLElement | null>).current = node;
    };

    return cloneElement(el, {
      ref: composedRef,
      onMouseEnter: merge(show, originalProps.onMouseEnter),
      onMouseLeave: merge(hide, originalProps.onMouseLeave),
      onFocus: merge(show, originalProps.onFocus),
      onBlur: merge(hide, originalProps.onBlur),
      'aria-describedby': open ? id : (originalProps['aria-describedby'] as string | undefined),
    });
  }, [children, show, hide, setTriggerRef, open, id]);

  const renderTitle: ReactNode = typeof title === 'function' ? (title as () => ReactNode)() : title;

  const bg = color ?? 'rgba(0, 0, 0, 0.85)';
  const initialOffset =
    pos?.side === 'top'
      ? { y: -4 }
      : pos?.side === 'bottom'
        ? { y: 4 }
        : pos?.side === 'left'
          ? { x: -4 }
          : { x: 4 };

  return (
    <>
      {trigger}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && renderTitle != null && renderTitle !== false && renderTitle !== '' && (
              <motion.div
                key="tooltip"
                ref={tipRef}
                role="tooltip"
                id={id}
                initial={{ opacity: 0, scale: 0.96, ...initialOffset }}
                animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, ...initialOffset }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                onMouseEnter={show}
                onMouseLeave={hide}
                style={{
                  position: 'fixed',
                  top: pos?.top ?? -9999,
                  left: pos?.left ?? -9999,
                  background: bg,
                  color: '#fff',
                  visibility: pos ? 'visible' : 'hidden',
                  pointerEvents: 'auto',
                  zIndex: 1070,
                }}
                className={[
                  'max-w-xs rounded-md px-2.5 py-1.5 text-xs leading-5 shadow-lg break-words',
                  className ?? '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {renderTitle}
                {arrow && pos && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      width: ARROW_SIZE * 2,
                      height: ARROW_SIZE * 2,
                      background: bg,
                      transform: 'rotate(45deg)',
                      ...pos.arrowStyle,
                    }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
