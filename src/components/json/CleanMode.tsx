import { motion } from 'motion/react';
import { cleanJson, type CleanOptions } from '../../utils/json';
import { itemVariants } from './animations';
import { EMPTY_RESULT, type ModeResult } from './types';

export const DEFAULT_CLEAN_STATE: CleanOptions = {
  removeNull: true,
  removeEmptyString: true,
  removeEmptyArray: true,
  removeEmptyObject: false,
  removeFalse: false,
};

export function runClean(input: string, options: CleanOptions): ModeResult {
  if (!input.trim()) return EMPTY_RESULT;
  try {
    return { output: cleanJson(input, options), error: null, report: null };
  } catch (e) {
    return { output: '', error: e instanceof Error ? e.message : '未知错误', report: null };
  }
}

interface CleanControlsProps {
  value: CleanOptions;
  onChange: (next: CleanOptions) => void;
}

export function CleanControls({ value, onChange }: CleanControlsProps) {
  const patch = (partial: Partial<CleanOptions>) => onChange({ ...value, ...partial });
  return (
    <motion.div
      className="mb-4 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 text-xs"
      variants={itemVariants}
    >
      <span className="font-medium text-foreground">清理规则：</span>
      <Toggle
        label="删除空字符串"
        checked={value.removeEmptyString}
        onChange={(v) => patch({ removeEmptyString: v })}
      />
      <Toggle
        label="删除 null"
        checked={value.removeNull}
        onChange={(v) => patch({ removeNull: v })}
      />
      <Toggle
        label="删除空数组"
        checked={value.removeEmptyArray}
        onChange={(v) => patch({ removeEmptyArray: v })}
      />
      <Toggle
        label="删除空对象"
        checked={value.removeEmptyObject}
        onChange={(v) => patch({ removeEmptyObject: v })}
      />
      <Toggle
        label="删除 false"
        checked={value.removeFalse}
        onChange={(v) => patch({ removeFalse: v })}
      />
    </motion.div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-1.5 text-muted-foreground hover:text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}
