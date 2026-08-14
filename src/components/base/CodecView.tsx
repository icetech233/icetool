/**
 * 通用「编解码」双栏视图。
 *
 * 供 Base64、URL 等文本级编解码工具复用：调用方注入 `encode` / `decode` 两个纯函数，
 * 以及可选的变体开关（例如 Base64 的 URL-safe、URL 的 Component / URI 粒度）。
 *
 * 视图组成：
 * - 顶部：模式切换（编码 / 解码）、变体切换（可选）、清空、方向互换。
 * - 左列：输入区，`<textarea>` 受控。
 * - 右列：输出区，展示编解码结果或错误提示，附复制按钮。
 *
 * 结果是输入的纯派生量，使用 `useMemo` 单次渲染同步得到，与 `useJwt` 一致，
 * 不引入 `useEffect` 的冗余二次渲染。
 */
import { useMemo, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import CopyButton from './CopyButton';

export type CodecDirection = 'encode' | 'decode';

export interface CodecVariant<V extends string> {
  value: V;
  label: string;
  hint?: string;
}

export interface CodecViewProps<V extends string = string> {
  title: string;
  description: string;
  encode: (input: string, variant: V) => string;
  decode: (input: string, variant: V) => string;
  variants?: readonly CodecVariant<V>[];
  defaultVariant?: V;
  encodePlaceholder?: string;
  decodePlaceholder?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.02 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 18 },
  },
};

const stateVariants: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'px-3 py-1.5 text-sm rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
        (active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted')
      }
    >
      {children}
    </button>
  );
}

export default function CodecView<V extends string = string>({
  title,
  description,
  encode,
  decode,
  variants,
  defaultVariant,
  encodePlaceholder = '在此输入需要编码的文本...',
  decodePlaceholder = '在此粘贴需要解码的内容...',
}: CodecViewProps<V>) {
  const [direction, setDirection] = useState<CodecDirection>('encode');
  const [input, setInput] = useState('');
  const initialVariant =
    defaultVariant ?? (variants && variants.length > 0 ? variants[0].value : (undefined as unknown as V));
  const [variant, setVariant] = useState<V>(initialVariant);

  const { output, error } = useMemo<{ output: string; error: string | null }>(() => {
    if (!input) {
      return { output: '', error: null };
    }
    try {
      const fn = direction === 'encode' ? encode : decode;
      return { output: fn(input, variant), error: null };
    } catch (e) {
      return { output: '', error: e instanceof Error ? e.message : '未知错误' };
    }
  }, [direction, encode, decode, input, variant]);

  const swap = () => {
    // 把当前输出灌回输入，并反转方向；空输出时仅切方向。
    setDirection((d) => (d === 'encode' ? 'decode' : 'encode'));
    if (output) setInput(output);
  };

  const state: 'error' | 'empty' | 'success' = error ? 'error' : !output ? 'empty' : 'success';

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="mb-8" variants={itemVariants}>
        <h1 className="text-3xl font-bold text-primary mb-2">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </motion.div>

      <motion.div
        className="mb-4 flex flex-wrap items-center gap-3"
        variants={itemVariants}
      >
        <div
          className="inline-flex items-center gap-1 rounded-lg bg-muted p-1"
          role="group"
          aria-label="编解码方向"
        >
          <ModeTab active={direction === 'encode'} onClick={() => setDirection('encode')}>
            编码
          </ModeTab>
          <ModeTab active={direction === 'decode'} onClick={() => setDirection('decode')}>
            解码
          </ModeTab>
        </div>

        {variants && variants.length > 1 && (
          <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1" role="group" aria-label="变体">
            {variants.map((v) => (
              <ModeTab
                key={v.value}
                active={variant === v.value}
                onClick={() => setVariant(v.value)}
              >
                <span title={v.hint}>{v.label}</span>
              </ModeTab>
            ))}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={swap}
            disabled={!output}
            aria-label="交换：把输出灌回输入并切换方向"
            className="group inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-swap-fg bg-swap border border-swap transition-colors hover:bg-swap-hover active:bg-swap-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-swap/60 disabled:opacity-40 disabled:hover:bg-swap disabled:active:bg-swap"
            title="把输出灌回输入并切换方向"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:rotate-180">
              <path d="m17 3 4 4-4 4" />
              <path d="M21 7H9" />
              <path d="m7 21-4-4 4-4" />
              <path d="M3 17h12" />
            </svg>
            <span>交换</span>
          </button>
          <button
            type="button"
            onClick={() => setInput('')}
            disabled={!input}
            aria-label="清空输入"
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-clear-fg bg-clear border border-clear transition-colors hover:bg-clear-hover active:bg-clear-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clear/60 disabled:opacity-40 disabled:hover:bg-clear disabled:active:bg-clear"
            title="清空输入"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
            <span>清空</span>
          </button>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
        <motion.div className="lg:flex-1 lg:basis-0 min-w-0" variants={itemVariants}>
          <div className="flex-1 bg-card rounded-xl border border-border p-6 shadow-sm">
            <label className="block text-sm font-medium text-foreground mb-3">
              {direction === 'encode' ? '原文输入' : '密文输入'}
            </label>
            <div className="relative h-96">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={direction === 'encode' ? encodePlaceholder : decodePlaceholder}
                className="absolute inset-0 w-full h-full bg-input border border-border-strong rounded-lg p-4 text-sm font-mono leading-5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground whitespace-pre-wrap break-all"
                spellCheck={false}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="lg:flex-1 lg:basis-0 min-w-0 bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-medium text-foreground">
              {direction === 'encode' ? '编码结果' : '解码结果'}
            </h2>
            <CopyButton value={output || null} />
          </div>

          <div className="relative h-96">
            <AnimatePresence mode="wait">
              {state === 'error' && (
                <motion.div
                  key="error"
                  className="absolute inset-0 flex items-center justify-center"
                  variants={stateVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <motion.div
                    className="text-center px-4"
                    animate={{ x: [0, -8, 8, -6, 6, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="text-destructive text-5xl mb-4">⚠️</div>
                    <p className="text-destructive font-medium">{error}</p>
                  </motion.div>
                </motion.div>
              )}

              {state === 'empty' && (
                <motion.div
                  key="empty"
                  className="absolute inset-0 flex items-center justify-center"
                  variants={stateVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <div className="text-center">
                    <div className="text-muted-foreground text-5xl mb-4">
                      {direction === 'encode' ? '📝' : '🔍'}
                    </div>
                    <p className="text-muted-foreground">等待输入...</p>
                  </div>
                </motion.div>
              )}

              {state === 'success' && (
                <motion.pre
                  key="success"
                  variants={stateVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0 overflow-auto rounded-lg bg-muted p-4 text-sm font-mono leading-5 whitespace-pre-wrap break-all text-foreground"
                >
                  {output}
                </motion.pre>
              )}
            </AnimatePresence>
          </div>

          {state === 'success' && (
            <p className="mt-3 text-xs text-muted-foreground">
              {`长度：输入 ${input.length} → 输出 ${output.length}`}
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
