import { analyzeJson, parseJson } from '../../utils/json';
import { EMPTY_RESULT, type ModeResult } from './types';

export function runParse(input: string): ModeResult {
  if (!input.trim()) return EMPTY_RESULT;
  try {
    const parsed = parseJson(input);
    return {
      output: JSON.stringify(parsed, null, 2),
      error: null,
      report: analyzeJson(parsed),
    };
  } catch (e) {
    return { output: '', error: e instanceof Error ? e.message : '未知错误', report: null };
  }
}
