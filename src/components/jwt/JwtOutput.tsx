/**
 * Displays the decoded JWT data, including header, payload, and signature.
 * It also handles the presentation of error messages or the initial "waiting for input" state.
 * This component is purely presentational, receiving all its data via props.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import {
  ShikiHighlighter,
  createHighlighterCore,
  createJavaScriptRegexEngine,
} from 'react-shiki/core';
import CopyButton from '../base/CopyButton';

interface JwtOutputProps {
  decoded: {
    header: string | null;
    payload: string | null;
    signature: string | null;
    error: string | null;
  };
}

const stateVariants: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 140, damping: 18 },
  },
};

export function JwtOutput({ decoded }: JwtOutputProps) {
  // 仅按需加载 json 语言与 github 主题，使用 JS 正则引擎（体积小、启动快），
  // 避免引入全量 Shiki bundle（含所有语言/主题，体积 >9MB）。
  const [highlighter, setHighlighter] = useState<Awaited<
    ReturnType<typeof createHighlighterCore>
  > | null>(null);

  useEffect(() => {
    let disposed = false;
    createHighlighterCore({
      themes: [
        import('@shikijs/themes/github-light'),
        import('@shikijs/themes/github-dark'),
      ],
      langs: [import('@shikijs/langs/json')],
      engine: createJavaScriptRegexEngine(),
    }).then((hl) => {
      if (!disposed) setHighlighter(hl);
    });
    return () => {
      disposed = true;
    };
  }, []);

  const state: 'error' | 'empty' | 'success' =
    decoded.error
      ? 'error'
      : !decoded.header && !decoded.payload
        ? 'empty'
        : 'success';

  return (
    <div className="min-h-96 min-w-0">
      <AnimatePresence mode="wait">
        {state === 'error' && (
          <motion.div
            key="error"
            className="min-h-96 flex items-center justify-center"
            variants={stateVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.div
              className="text-center"
              animate={{ x: [0, -8, 8, -6, 6, 0] }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-destructive text-5xl mb-4">⚠️</div>
              <p className="text-destructive font-medium">{decoded.error}</p>
            </motion.div>
          </motion.div>
        )}

        {state === 'empty' && (
          <motion.div
            key="empty"
            className="min-h-96 flex items-center justify-center"
            variants={stateVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="text-center">
              <div className="text-muted-foreground text-5xl mb-4">🔐</div>
              <p className="text-muted-foreground">等待输入...</p>
            </div>
          </motion.div>
        )}

        {state === 'success' && (
          <motion.div
            key="success"
            className="space-y-4 pr-2"
            variants={listVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <motion.div className="bg-muted rounded-lg p-4" variants={cardVariants}>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded">
                  HEADER
                </span>
                <span className="text-xs text-muted-foreground">算法 & 类型</span>
                <CopyButton value={decoded.header} />
              </div>
              {highlighter && (
                <ShikiHighlighter
                  highlighter={highlighter}
                  language="json"
                  theme={{ light: 'github-light', dark: 'github-dark' }}
                  defaultColor={false}
                  addDefaultStyles={false}
                  className="text-xs font-mono overflow-x-auto rounded-md"
                >
                  {decoded.header ?? ''}
                </ShikiHighlighter>
              )}
            </motion.div>

            {/* Payload */}
            <motion.div className="bg-muted rounded-lg p-4" variants={cardVariants}>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-secondary-foreground/20 text-secondary-foreground text-xs font-semibold rounded">
                  PAYLOAD
                </span>
                <span className="text-xs text-muted-foreground">数据</span>
                <CopyButton value={decoded.payload} />
              </div>
              {highlighter && (
                <ShikiHighlighter
                  highlighter={highlighter}
                  language="json"
                  theme={{ light: 'github-light', dark: 'github-dark' }}
                  defaultColor={false}
                  addDefaultStyles={false}
                  className="text-xs font-mono overflow-x-auto rounded-md"
                >
                  {decoded.payload ?? ''}
                </ShikiHighlighter>
              )}
            </motion.div>

            {/* Signature */}
            <motion.div className="bg-muted rounded-lg p-4" variants={cardVariants}>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-accent-foreground/20 text-accent-foreground text-xs font-semibold rounded">
                  SIGNATURE
                </span>
                <span className="text-xs text-muted-foreground">签名</span>
                <CopyButton value={decoded.signature} />
              </div>
              <p className="text-xs font-mono text-muted-foreground break-all">
                {decoded.signature}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
