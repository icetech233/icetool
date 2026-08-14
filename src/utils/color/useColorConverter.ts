/**
 * useColorConverter —— 颜色实验室的核心状态容器（composable/hook）。
 *
 * 职责：
 * - 以 HEXA 字符串作为「真值来源」，派生出所有展示格式。
 * - 任一格式输入框变更时，解析为 HEXA 真值并同步所有其他格式。
 * - 容错：非法输入不崩溃，保留上次有效值并暴露 error 提示。
 * - 滑块微调：直接基于当前真值调整 H/S/L/Alpha，保证实时、流畅。
 *
 * 该 hook 与 UI 完全解耦，便于复用与单测。
 */
import { useCallback, useMemo, useState } from 'react';
import { colord } from 'colord';
import { deriveAllFormats, parseAnyColor } from './convert';
import type { ColorFormat, ColorValues } from './types';

const DEFAULT_HEX = '#1D9BF0';

export interface UseColorConverter {
  /** 当前真值（HEXA），所有格式由其派生 */
  hex: string;
  /** 所有格式展示字符串 */
  values: ColorValues;
  /** 最近一次输入的解析错误信息（null 表示无错误） */
  error: string | null;
  /** 最近一次被用户编辑的格式（用于聚焦/校验态） */
  lastEdited: ColorFormat | null;
  /** 设置某个格式的值（来自输入框） */
  setFormat: (format: ColorFormat, value: string) => void;
  /** 直接以 HEXA 设值（来自色板点击） */
  setHex: (hex: string) => void;
  /** 滑块微调：调整透明度（0-1） */
  setAlpha: (alpha: number) => void;
  /** 滑块微调：调整色相（0-360） */
  setHue: (hue: number) => void;
  /** 滑块微调：调整饱和度（0-100） */
  setSaturation: (saturation: number) => void;
  /** 滑块微调：调整亮度（0-100） */
  setLightness: (lightness: number) => void;
  /** 当前 HSL 通道值（供滑块显示） */
  hsl: { h: number; s: number; l: number; a: number };
}

export function useColorConverter(initialHex: string = DEFAULT_HEX): UseColorConverter {
  const [hex, setHexState] = useState<string>(() =>
    parseAnyColor(initialHex).ok ? initialHex : DEFAULT_HEX,
  );
  const [error, setError] = useState<string | null>(null);
  const [lastEdited, setLastEdited] = useState<ColorFormat | null>(null);

  // 由真值派生所有展示格式（纯计算，随 hex 变化）
  const values = useMemo<ColorValues>(() => {
    const d = deriveAllFormats(hex);
    return {
      hex: d.hex,
      hexa: d.hexa,
      rgb: d.rgb,
      rgba: d.rgba,
      hsl: d.hsl,
      hsla: d.hsla,
    };
  }, [hex]);

  const hsl = useMemo(() => {
    const h = colord(hex).toHsl();
    return { h: Math.round(h.h), s: Math.round(h.s), l: Math.round(h.l), a: Number(h.a.toFixed(2)) };
  }, [hex]);

  /** 写入新真值：成功清除错误，失败保留旧值并记录错误 */
  const applyHex = useCallback((nextHex: string, edited: ColorFormat | null) => {
    const result = parseAnyColor(nextHex);
    if (result.ok && result.hex) {
      setHexState(result.hex);
      setError(null);
      setLastEdited(edited);
    } else {
      // 容错：保留上次有效值；仅当之前无错误时给出提示
      setError(result.error ?? '无效的颜色值');
      if (edited) setLastEdited(edited);
    }
  }, []);

  const setFormat = useCallback(
    (format: ColorFormat, value: string) => {
      applyHex(value, format);
    },
    [applyHex],
  );

  const setHex = useCallback(
    (nextHex: string) => {
      applyHex(nextHex, null);
    },
    [applyHex],
  );

  /** 滑块微调：基于当前真值的部分通道重算 HEXA（节流交由组件 rAF 处理） */
  const adjust = useCallback(
    (patch: Partial<{ h: number; s: number; l: number; a: number }>) => {
      const current = colord(hex).toHsl();
      const next = { ...current, ...patch };
      const c = colord({ h: next.h, s: next.s, l: next.l, a: next.a });
      setHexState(c.toHex());
      setError(null);
      setLastEdited(null);
    },
    [hex],
  );

  const setAlpha = useCallback((alpha: number) => adjust({ a: alpha }), [adjust]);
  const setHue = useCallback((hue: number) => adjust({ h: hue }), [adjust]);
  const setSaturation = useCallback((saturation: number) => adjust({ s: saturation }), [adjust]);
  const setLightness = useCallback((lightness: number) => adjust({ l: lightness }), [adjust]);

  return {
    hex,
    values,
    error,
    lastEdited,
    setFormat,
    setHex,
    setAlpha,
    setHue,
    setSaturation,
    setLightness,
    hsl,
  };
}
