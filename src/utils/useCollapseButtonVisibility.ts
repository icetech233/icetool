import { useCallback, useEffect, useRef, useState } from 'react';

const HIDE_DELAY_MS = 1000;

/**
 * 管理折叠按钮的显隐状态。
 *
 * - 展开时按钮始终可见，并清除任何待执行的隐藏定时器。
 * - 折叠时按钮立即可见，1 秒后自动隐藏；鼠标进入区域时重新显示，
 *   离开区域时再次启动 1 秒隐藏定时器。
 *
 * @param collapsed 当前侧边栏是否处于折叠状态
 * @returns 按钮是否可见，以及用于绑定到侧边栏区域的鼠标进入/离开事件处理函数
 */
export function useCollapseButtonVisibility(collapsed: boolean) {
  const [buttonVisible, setButtonVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * 清除隐藏定时器
   */
  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  /**
   * 启动 1 秒后隐藏按钮的定时器（仅在折叠状态下才有意义）
   */
  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      setButtonVisible(false);
    }, HIDE_DELAY_MS);
  }, [clearHideTimer]);

  /**
   * 折叠状态变化时：
   * - 展开：按钮始终可见，清除定时器
   * - 折叠：立即显示按钮，1 秒后自动隐藏
   */
  useEffect(() => {
    if (collapsed) {
      setButtonVisible(true);
      scheduleHide();
    } else {
      clearHideTimer();
      setButtonVisible(true);
    }
    return clearHideTimer;
  }, [collapsed, scheduleHide, clearHideTimer]);

  /**
   * 鼠标进入侧边栏区域：折叠状态下显示按钮
   */
  const handleMouseEnter = useCallback(() => {
    if (collapsed) {
      clearHideTimer();
      setButtonVisible(true);
    }
  }, [collapsed, clearHideTimer]);

  /**
   * 鼠标离开侧边栏区域：折叠状态下重新启动 1 秒隐藏定时器
   */
  const handleMouseLeave = useCallback(() => {
    if (collapsed) {
      scheduleHide();
    }
  }, [collapsed, scheduleHide]);

  return { buttonVisible, handleMouseEnter, handleMouseLeave };
}
