import { motion } from 'motion/react';
import { escapeJson, minifyJson } from '../../utils/json';
import ModeTab from './ModeTab';
import { itemVariants } from './animations';
import { EMPTY_RESULT, type ModeResult } from './types';

export type CompressStyle = 'minify' | 'escape';

export const DEFAULT_COMPRESS_STATE: CompressStyle = 'minify';

export function runCompress(input: string, style: CompressStyle): ModeResult {
  if (!input.trim()) return EMPTY_RESULT;
  try {
    const output = style === 'minify' ? minifyJson(input) : escapeJson(input);
    return { output, error: null, report: null };
  } catch (e) {
    return { output: '', error: e instanceof Error ? e.message : '未知错误', report: null };
  }
}

interface CompressControlsProps {
  value: CompressStyle;
  onChange: (next: CompressStyle) => void;
}

export function CompressControls({ value, onChange }: CompressControlsProps) {
  return (
    <motion.div
      className="mb-4 inline-flex items-center gap-1 rounded-lg bg-muted p-1"
      variants={itemVariants}
      role="group"
      aria-label="压缩模式"
    >
      <ModeTab active={value === 'minify'} onClick={() => onChange('minify')}>
        <span title="移除所有空白字符，输出单行 JSON">压缩</span>
      </ModeTab>
      <ModeTab active={value === 'escape'} onClick={() => onChange('escape')}>
        <span title="转义引号与反斜杠，可直接粘贴到其他 JSON 字符串中">转义</span>
      </ModeTab>
    </motion.div>
  );
}
