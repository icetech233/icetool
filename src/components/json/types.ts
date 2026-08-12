import type { ParseReport } from '../../utils/json';

export type ReportOrNull = ParseReport | null;

export type Mode = 'clean' | 'compress' | 'parse' | 'format';

export interface ModeMeta {
  value: Mode;
  label: string;
  description: string;
}

export const MODES: readonly ModeMeta[] = [
  {
    value: 'parse',
    label: '在线解析',
    description: '解析 JSON 并给出类型、键数量、层级深度等结构信息。',
  },
  {
    value: 'format',
    label: '格式化',
    description: '按 1 个制表符 / 2 空格 / 4 空格缩进美化输出。',
  },
    {
    value: 'compress',
    label: '压缩转义',
    description: '压缩为单行 JSON，或转义为可嵌入到字符串中的字面量。',
  },
  {
    value: 'clean',
    label: 'JSON 清理',
    description: '递归去除空字符串 / null / 空数组等无意义字段，输出更精简的 JSON。',
  }
];

/** 所有 mode runner 的统一返回值。 */
export interface ModeResult {
  output: string;
  error: string | null;
  report: ReportOrNull;
}

export const EMPTY_RESULT: ModeResult = { output: '', error: null, report: null };

export const DEFAULT_SAMPLE = `{
  "name": "icetool",
  "empty": "",
  "nothing": null,
  "tags": [],
  "nested": {
    "keep": "value",
    "drop": null
  }
}`;
