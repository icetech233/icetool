/**
 * useColorLabActions —— 颜色实验室的副作用聚合（收藏 / 历史 / 复制 Toast）。
 * 抽离出 IndexedDB 写入与轻量提示，供配色推荐、灵感墙、预览区共享，
 * 避免在各组件重复实现。
 */
import { useCallback, useRef, useState } from 'react';
import {
  addFavorite,
  addHistory,
  listFavorites,
  listHistory,
} from '../storage/colorDB';
import type { FavoriteItem, HistoryItem, HarmonyType } from './types';

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useColorLabActions() {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 1600);
  }, []);

  /** 复制文本并提示 */
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(`已复制 ${text}`);
      } catch {
        showToast('复制失败，请手动复制');
      }
    },
    [showToast],
  );

  /** 历史写入节流：同一色值 800ms 内不重复写入，避免滑块拖动刷屏 */
  const lastWrite = useRef<{ hex: string; ts: number }>({ hex: '', ts: 0 });

  /** 记录历史（时间窗去重：同色 800ms 内忽略） */
  const pushHistory = useCallback(
    async (hexa: string, source: HistoryItem['source']) => {
      const now = Date.now();
      const norm = hexa.toLowerCase();
      if (lastWrite.current.hex === norm && now - lastWrite.current.ts < 800) {
        return;
      }
      lastWrite.current = { hex: norm, ts: now };
      const item: HistoryItem = { id: uid(), hexa, source, time: now };
      try {
        await addHistory(item);
      } catch {
        /* 存储不可用时静默降级 */
      }
    },
    [],
  );

  /** 收藏单色 */
  const addColorFavorite = useCallback(
    async (hexa: string) => {
      const all = await listFavorites();
      if (all.some((f) => f.type === 'color' && f.hexa.toLowerCase() === hexa.toLowerCase())) {
        showToast('已在收藏中');
        return;
      }
      const item: FavoriteItem = { id: uid(), type: 'color', hexa, createdAt: Date.now() };
      await addFavorite(item);
      showToast('已收藏');
    },
    [showToast],
  );

  /** 收藏整组配色方案 */
  const addSchemeFavorite = useCallback(
    async (colors: string[], scheme: HarmonyType, name: string) => {
      const item: FavoriteItem = {
        id: uid(),
        type: 'scheme',
        hexa: colors.join(','),
        name,
        scheme,
        createdAt: Date.now(),
      };
      await addFavorite(item);
      showToast('方案已收藏');
    },
    [showToast],
  );

  /** 触发历史刷新（供页面 refreshKey 使用） */
  const refreshHistory = useCallback(async () => {
    try {
      await listHistory(1);
    } catch {
      /* noop */
    }
  }, []);

  return {
    toast,
    copy,
    pushHistory,
    addColorFavorite,
    addSchemeFavorite,
    refreshHistory,
  };
}
