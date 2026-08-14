/**
 * 颜色实验室核心类型定义
 */

/** 转换器支持的所有格式标识 */
export type ColorFormat =
  | 'hex'
  | 'hexa'
  | 'rgb'
  | 'rgba'
  | 'hsl'
  | 'hsla';

/** 各格式对应的字符串值（为空字符串表示尚未解析） */
export type ColorValues = Record<ColorFormat, string>;

/** 解析结果：成功携带 colord 实例与有效值，失败携带错误信息 */
export interface ParseResult {
  ok: boolean;
  /** 标准化后的 HEXA 字符串，作为唯一真值来源（失败时为 null） */
  hex: string | null;
  /** 失败时的友好提示，成功时为 null */
  error: string | null;
}

/** 颜色协调方案类型（用于随机生成器/配色推荐） */
export type HarmonyType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'splitComplementary'
  | 'monochromatic';

/** 收藏项类型 */
export type FavoriteType = 'color' | 'scheme';

/** 收藏夹条目：单色或整组配色方案 */
export interface FavoriteItem {
  /** 唯一 id（时间戳 + 随机串） */
  id: string;
  type: FavoriteType;
  /** 单色时为 HEXA；方案时为逗号分隔的多色 */
  hexa: string;
  /** 方案名称（type==='scheme' 时有效） */
  name?: string;
  /** 方案类型（type==='scheme' 时有效） */
  scheme?: HarmonyType;
  /** 收藏时间（ms 时间戳） */
  createdAt: number;
}

/** 历史记录条目 */
export interface HistoryItem {
  /** 唯一 id */
  id: string;
  /** 颜色 HEXA */
  hexa: string;
  /** 来源标记：'pick' 选色 / 'convert' 转换 / 'random' 随机 */
  source: 'pick' | 'convert' | 'random';
  /** 记录时间（ms 时间戳） */
  time: number;
}

/** 单个色板方案：名称 + 一组色值（HEX） */
export interface Palette {
  name: string;
  colors: string[];
}

/** 标准 CSS 命名色：名称 + HEX 值 */
export interface NamedColor {
  name: string;
  hex: string;
}

/** Web 安全色网格单元 */
export interface WebSafeColor {
  hex: string;
  /** 用于无障碍描述的标签 */
  label: string;
}

/** WCAG 对比度评级 */
export interface ContrastRating {
  /** 对黑底（白字）是否达标 */
  aaForDark: boolean;
  aaaForDark: boolean;
  /** 对白底（黑字）是否达标 */
  aaForLight: boolean;
  aaaForLight: boolean;
  /** 与白色背景的对比度比值 */
  onWhite: number;
  /** 与黑色背景的对比度比值 */
  onBlack: number;
  /** 在白底上推荐使用的文字颜色（'dark' 或 'light'） */
  recommendedOnWhite: 'dark' | 'light';
  /** 在黑底上推荐使用的文字颜色 */
  recommendedOnBlack: 'dark' | 'light';
}
