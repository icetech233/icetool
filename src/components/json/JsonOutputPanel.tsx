import { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import CopyButton from '../base/CopyButton';
import { itemVariants, stateVariants } from './animations';
import JsonTreeView from './JsonTreeView';
import type { ReportOrNull } from './types';

export type OutputState = 'error' | 'empty' | 'success';

interface JsonOutputPanelProps {
  state: OutputState;
  output: string;
  error: string | null;
  inputLength: number;
  report: ReportOrNull;
}

export default function JsonOutputPanel({
  state,
  output,
  error,
  inputLength,
  report,
}: JsonOutputPanelProps) {
  // 尝试把 output 解析成树视图数据；解析不通过（如「压缩转义」模式的 escape 结果不是合法 JSON）时回退到纯文本。
  const tree = useMemo(() => {
    if (state !== 'success' || !output) return { ok: false as const };
    try {
      return { ok: true as const, value: JSON.parse(output) as unknown };
    } catch {
      return { ok: false as const };
    }
  }, [state, output]);
  return (
    <motion.div
      className="lg:flex-1 lg:basis-0 min-w-0 bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col"
      variants={itemVariants}
    >
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-medium text-foreground">处理结果</h2>
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
                <p className="text-destructive font-medium break-all">{error}</p>
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
                <div className="text-muted-foreground text-5xl mb-4">🧩</div>
                <p className="text-muted-foreground">等待输入 JSON...</p>
              </div>
            </motion.div>
          )}

          {state === 'success' && tree.ok && (
            <motion.div
              key="tree"
              variants={stateVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0"
            >
              <JsonTreeView value={tree.value} />
            </motion.div>
          )}

          {state === 'success' && !tree.ok && (
            <motion.pre
              key="text"
              variants={stateVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute inset-0 overflow-auto rounded-lg bg-muted p-4 text-sm font-mono leading-5 whitespace-pre break-all text-foreground"
            >
              {output}
            </motion.pre>
          )}
        </AnimatePresence>
      </div>

      {state === 'success' && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>{`长度：输入 ${inputLength} → 输出 ${output.length}`}</span>
          {report && (
            <>
              <span>{`类型：${report.type}`}</span>
              <span>{`键数量：${report.keys}`}</span>
              <span>{`最大深度：${report.depth}`}</span>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
