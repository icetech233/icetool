/**
 * ColorConverter —— 转换器面板。
 * 所有格式输入框垂直排列；任一输入变更自动同步其他；滑块微调通道值。
 * 滑块拖动使用 requestAnimationFrame 节流，保证 60fps。
 * 非法输入保留上次有效值并给出温和错误态提示。
 */
import { useCallback, useRef } from 'react';
import type { ColorFormat } from '../../utils/color/types';
import type { UseColorConverter } from '../../utils/color/useColorConverter';
import CopyButton from '../base/CopyButton';

type ColorConverterProps = {
  converter: UseColorConverter;
};

/** 格式字段定义：标签 + placeholder */
const FIELDS: { key: ColorFormat; label: string; placeholder: string }[] = [
  { key: 'hex', label: 'HEX', placeholder: '#FF5733' },
  { key: 'hexa', label: 'HEXA', placeholder: '#FF573380' },
  { key: 'rgb', label: 'RGB', placeholder: 'rgb(255, 87, 51)' },
  { key: 'rgba', label: 'RGBA', placeholder: 'rgba(255, 87, 51, 0.5)' },
  { key: 'hsl', label: 'HSL', placeholder: 'hsl(14, 100%, 60%)' },
  { key: 'hsla', label: 'HSLA', placeholder: 'hsla(14, 100%, 60%, 0.5)' },
];

/** 单个格式输入框：带 label（无障碍关联）与错误态提示 */
function FormatField({
  field,
  value,
  isError,
  onChange,
}: {
  field: { key: ColorFormat; label: string; placeholder: string };
  value: string;
  isError: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={`color-input-${field.key}`}
        className="text-xs font-medium text-muted-foreground"
      >
        {field.label}
      </label>
      <div className="relative">
        <input
          id={`color-input-${field.key}`}
          type="text"
          inputMode="text"
          spellCheck={false}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={isError}
          aria-describedby={isError ? `color-error-${field.key}` : undefined}
          className={[
            'w-full rounded-lg border bg-input pl-3 pr-9 py-2 font-mono text-sm text-foreground',
            'transition-[border-color,box-shadow,background-color] duration-200',
            'focus:outline-none focus:ring-2',
            isError
              ? 'border-destructive focus:ring-destructive/40'
              : 'border-border focus:border-primary focus:ring-primary/30',
          ].join(' ')}
        />
        <div className="absolute inset-y-0 right-1 flex items-center">
          <CopyButton value={value} iconOnly />
        </div>
      </div>
    </div>
  );
}

/** 滑块行：标签 + 数值显示 + range 输入（rAF 节流回调） */
function SliderRow({
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (v: number) => void;
}) {
  const frame = useRef<number | null>(null);
  const pending = useRef<number>(value);

  const handle = useCallback(
    (next: number) => {
      pending.current = next;
      if (frame.current !== null) return; // 已有排队的帧，跳过
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        onChange(pending.current);
      });
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="font-mono text-xs text-foreground">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => handle(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={label}
      />
    </div>
  );
}

export default function ColorConverter({ converter }: ColorConverterProps) {
  const { values, error, lastEdited, setFormat, hsl, setAlpha, setHue, setSaturation, setLightness } =
    converter;

  return (
    <div className="flex flex-col gap-5">
      {/* 格式输入区 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <FormatField
            key={f.key}
            field={f}
            value={values[f.key]}
            isError={error !== null && lastEdited === f.key}
            onChange={(v) => setFormat(f.key, v)}
          />
        ))}
      </div>

      {/* 错误提示（温和） */}
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {error}，已保留上次有效值。
        </p>
      )}

      {/* 滑块微调区 */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-4">
        <span className="text-xs font-semibold text-muted-foreground">滑块微调</span>
        <SliderRow
          label="透明度"
          min={0}
          max={1}
          step={0.01}
          value={hsl.a}
          display={`${Math.round(hsl.a * 100)}%`}
          onChange={setAlpha}
        />
        <SliderRow
          label="色相 H"
          min={0}
          max={360}
          step={1}
          value={hsl.h}
          display={`${hsl.h}°`}
          onChange={setHue}
        />
        <SliderRow
          label="饱和度 S"
          min={0}
          max={100}
          step={1}
          value={hsl.s}
          display={`${hsl.s}%`}
          onChange={setSaturation}
        />
        <SliderRow
          label="亮度 L"
          min={0}
          max={100}
          step={1}
          value={hsl.l}
          display={`${hsl.l}%`}
          onChange={setLightness}
        />
      </div>
    </div>
  );
}
