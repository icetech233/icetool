import { motion } from 'motion/react';
import { formatJson, type IndentOption } from '../../utils/json';
import ModeTab from './ModeTab';
import { itemVariants } from './animations';
import { EMPTY_RESULT, type ModeResult } from './types';

export const DEFAULT_INDENT: IndentOption = 2;

export function runFormat(input: string, indent: IndentOption): ModeResult {
  if (!input.trim()) return EMPTY_RESULT;
  try {
    return { output: formatJson(input, indent), error: null, report: null };
  } catch (e) {
    return { output: '', error: e instanceof Error ? e.message : '未知错误', report: null };
  }
}

interface FormatControlsProps {
  value: IndentOption;
  onChange: (next: IndentOption) => void;
}

export function FormatControls({ value, onChange }: FormatControlsProps) {
  return (
    <motion.div
      className="mb-4 inline-flex items-center gap-1 rounded-lg bg-muted p-1"
      variants={itemVariants}
      role="group"
      aria-label="缩进方式"
    >
      <ModeTab active={value === 'tab'} onClick={() => onChange('tab')}>
        <span title="使用一个 \t 制表符缩进">1 个制表符</span>
      </ModeTab>
      <ModeTab active={value === 2} onClick={() => onChange(2)}>
        <span title="使用 2 个空格缩进">2 空格</span>
      </ModeTab>
      <ModeTab active={value === 4} onClick={() => onChange(4)}>
        <span title="使用 4 个空格缩进">4 空格</span>
      </ModeTab>
    </motion.div>
  );
}
