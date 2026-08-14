/**
 * JSON 工具集：清理、压缩转义、解析、格式化。
 *
 * 所有函数纯函数化，无副作用；异常统一抛出 Error，便于上层捕获展示。
 */

export type IndentOption = 'tab' | 2 | 4;

/** 缩进字符串工具：tab -> "\t"，数值 -> 对应空格数。 */
function indentToString(indent: IndentOption): string {
  return indent === 'tab' ? '\t' : ' '.repeat(indent);
}

/** 判定是否为空数组。 */
function isEmptyArray(value: unknown): boolean {
  return Array.isArray(value) && value.length === 0;
}

/** 判定是否为空对象（普通对象、非 null、无自有可枚举 key）。 */
function isEmptyObject(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value as Record<string, unknown>).length === 0
  );
}

export interface CleanOptions {
  /** 删除 null 字段 */
  removeNull: boolean;
  /** 删除空字符串 "" 字段 */
  removeEmptyString: boolean;
  /** 删除空数组 [] 字段 */
  removeEmptyArray: boolean;
  /** 删除空对象 {} 字段（递归清理后可能出现） */
  removeEmptyObject: boolean;
  /** 删除 false 字段 */
  removeFalse: boolean;
}

export const DEFAULT_CLEAN_OPTIONS: CleanOptions = {
  removeNull: true,
  removeEmptyString: true,
  removeEmptyArray: true,
  removeEmptyObject: false,
  removeFalse: false,
};

/**
 * 递归清理 JSON 值。返回处理后的值；数组里的元素若命中删除规则也会被剔除。
 */
function cleanValue(value: unknown, options: CleanOptions): unknown {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => cleanValue(item, options))
      .filter((item) => !shouldRemove(item, options));
    return cleaned;
  }
  if (typeof value === 'object' && value !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      const next = cleanValue(raw, options);
      if (shouldRemove(next, options)) continue;
      result[key] = next;
    }
    return result;
  }
  return value;
}

function shouldRemove(value: unknown, options: CleanOptions): boolean {
  if (options.removeNull && value === null) return true;
  if (options.removeEmptyString && value === '') return true;
  if (options.removeEmptyArray && isEmptyArray(value)) return true;
  if (options.removeEmptyObject && isEmptyObject(value)) return true;
  if (options.removeFalse && value === false) return true;
  return false;
}

/** 尝试解析 JSON，失败时抛出包含行列信息的 Error。 */
export function parseJson(input: string): unknown {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('输入为空');
  }
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    const message = e instanceof Error ? e.message : '未知错误';
    throw new Error(locateError(input, message));
  }
}

/** 将原生 JSON.parse 的错误信息附加行列定位。 */
function locateError(input: string, message: string): string {
  const match = /position\s+(\d+)/i.exec(message);
  if (!match) return message;
  const pos = Number(match[1]);
  if (!Number.isFinite(pos)) return message;
  let line = 1;
  let col = 1;
  for (let i = 0; i < pos && i < input.length; i++) {
    if (input.charCodeAt(i) === 10) {
      line += 1;
      col = 1;
    } else {
      col += 1;
    }
  }
  return `${message}（行 ${line}，列 ${col}）`;
}

/** 清理并按 2 空格缩进输出。 */
export function cleanJson(input: string, options: CleanOptions): string {
  const parsed = parseJson(input);
  const cleaned = cleanValue(parsed, options);
  return JSON.stringify(cleaned, null, 2);
}

/** 压缩为一行 JSON。 */
export function minifyJson(input: string): string {
  const parsed = parseJson(input);
  return JSON.stringify(parsed);
}

/**
 * 压缩并转义为可嵌入到其他字符串中的 JSON 文本
 * （引号、反斜杠等被转义，两端不带引号）。
 */
export function escapeJson(input: string): string {
  const minified = minifyJson(input);
  const wrapped = JSON.stringify(minified);
  return wrapped.slice(1, -1);
}

/** 按指定缩进格式化。 */
export function formatJson(input: string, indent: IndentOption): string {
  const parsed = parseJson(input);
  return JSON.stringify(parsed, null, indentToString(indent));
}

export interface ParseReport {
  type: string;
  keys: number;
  depth: number;
  size: number;
}

/** 分析 JSON 结构，生成简要报告。 */
export function analyzeJson(value: unknown): ParseReport {
  return {
    type: describeType(value),
    keys: countKeys(value),
    depth: measureDepth(value),
    size: JSON.stringify(value).length,
  };
}

function describeType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `array(${value.length})`;
  const t = typeof value;
  if (t === 'object') return `object(${Object.keys(value as object).length})`;
  return t;
}

function countKeys(value: unknown): number {
  if (Array.isArray(value)) {
    return value.reduce<number>((sum, item) => sum + countKeys(item), 0);
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>);
    return entries.reduce<number>((sum, [, v]) => sum + 1 + countKeys(v), 0);
  }
  return 0;
}

function measureDepth(value: unknown): number {
  if (Array.isArray(value)) {
    return 1 + value.reduce<number>((max, item) => Math.max(max, measureDepth(item)), 0);
  }
  if (typeof value === 'object' && value !== null) {
    const values = Object.values(value as Record<string, unknown>);
    return 1 + values.reduce<number>((max, item) => Math.max(max, measureDepth(item)), 0);
  }
  return 0;
}
