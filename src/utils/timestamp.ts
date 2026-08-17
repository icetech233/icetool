/**
 * 时间戳解析与格式化工具。
 *
 * - 输入形如 `1723987200` / `1723987200000` 的字符串，自动或按用户指定单位解析。
 * - 输入 ISO 8601 或 `YYYY-MM-DD HH:mm:ss` 等常见日期串，转换为对应的时间戳。
 * - 所有换算均在浏览器本地完成，UTC 与本地时区结果并列展示，避免歧义。
 */

export type TimestampUnit = 'auto' | 'seconds' | 'milliseconds';

export interface TimestampParts {
  seconds: number;
  milliseconds: number;
  iso: string;
  utc: string;
  local: string;
  localDate: string;
  localTime: string;
  weekday: string;
  relative: string;
}

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function pad3(n: number): string {
  return n.toString().padStart(3, '0');
}

/**
 * 相对时间（如 "3 分钟前"、"2 小时后"）。
 * 传入的 date 与 now 之间的差值决定输出。
 */
export function formatRelative(date: Date, now: Date = new Date()): string {
  const diffMs = date.getTime() - now.getTime();
  const absSec = Math.round(Math.abs(diffMs) / 1000);
  const suffix = diffMs >= 0 ? '后' : '前';

  if (absSec < 5) return '刚刚';
  if (absSec < 60) return `${absSec} 秒${suffix}`;
  const min = Math.round(absSec / 60);
  if (min < 60) return `${min} 分钟${suffix}`;
  const hour = Math.round(absSec / 3600);
  if (hour < 24) return `${hour} 小时${suffix}`;
  const day = Math.round(absSec / 86400);
  if (day < 30) return `${day} 天${suffix}`;
  const month = Math.round(day / 30);
  if (month < 12) return `${month} 个月${suffix}`;
  const year = Math.round(day / 365);
  return `${year} 年${suffix}`;
}

/**
 * 将 Date 拆解为常见展示字段。
 * `local*` 字段基于运行环境时区，`iso` / `utc` 基于 UTC。
 */
export function describeDate(date: Date): TimestampParts {
  const ms = date.getTime();
  const yyyy = date.getFullYear();
  const mm = pad2(date.getMonth() + 1);
  const dd = pad2(date.getDate());
  const hh = pad2(date.getHours());
  const mi = pad2(date.getMinutes());
  const ss = pad2(date.getSeconds());
  const msPart = pad3(date.getMilliseconds());

  return {
    seconds: Math.floor(ms / 1000),
    milliseconds: ms,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}.${msPart}`,
    localDate: `${yyyy}-${mm}-${dd}`,
    localTime: `${hh}:${mi}:${ss}`,
    weekday: WEEKDAYS[date.getDay()],
    relative: formatRelative(date),
  };
}

/**
 * 判断字符串是否是合法的整数时间戳（可带正负号）。
 */
function isIntegerString(value: string): boolean {
  return /^-?\d+$/.test(value);
}

/**
 * 解析用户输入的时间戳字符串。
 *
 * - unit=auto：按数值绝对值猜测——>= 1e12 视为毫秒，否则视为秒。
 * - unit=seconds/milliseconds：按用户指定处理。
 */
export function parseTimestamp(raw: string, unit: TimestampUnit = 'auto'): Date {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error('请输入时间戳');
  if (!isIntegerString(trimmed)) throw new Error('时间戳必须为整数（可带负号）');

  const n = Number(trimmed);
  if (!Number.isFinite(n)) throw new Error('时间戳超出可解析范围');

  let ms: number;
  if (unit === 'milliseconds') {
    ms = n;
  } else if (unit === 'seconds') {
    ms = n * 1000;
  } else {
    ms = Math.abs(n) >= 1e12 ? n : n * 1000;
  }

  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) throw new Error('无法解析为合法时间');
  return date;
}

/**
 * 解析用户输入的日期字符串为 Date。
 *
 * 兼容格式：
 * - ISO 8601（含时区），如 `2024-08-18T12:00:00Z`
 * - `YYYY-MM-DD HH:mm:ss[.SSS]`（按本地时区）
 * - `YYYY/MM/DD HH:mm:ss`
 * - 仅日期 `YYYY-MM-DD`（按本地时区 00:00:00）
 */
export function parseDateString(raw: string): Date {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error('请输入日期字符串');

  // 将 `YYYY-MM-DD HH:mm:ss` 或使用斜杠的形式标准化为浏览器可解析的字符串。
  const normalized = trimmed.includes('T') || /Z$|[+-]\d{2}:?\d{2}$/.test(trimmed)
    ? trimmed
    : trimmed.replace(/\//g, '-').replace(' ', 'T');

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    throw new Error('无法解析该日期字符串，请检查格式');
  }
  return date;
}
