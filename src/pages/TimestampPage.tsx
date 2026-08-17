/**
 * 时间戳转换：Unix 时间戳 <-> 可读日期，双向互转，多种格式输出。
 *
 * 视图组成：
 * - 顶部：模式切换（时间戳→日期、日期→时间戳）、单位切换（时间戳侧）。
 * - 左列：输入区（含"填入当前时间"按钮）与实时时钟。
 * - 右列：多字段输出面板（毫秒、秒、ISO、UTC、本地、星期、相对时间），每行独立复制。
 */
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import Seo from '../components/Seo';
import CopyButton from '../components/base/CopyButton';
import {
  describeDate,
  parseDateString,
  parseTimestamp,
  type TimestampParts,
  type TimestampUnit,
} from '../utils/timestamp';

type Direction = 'ts2date' | 'date2ts';

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

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border last:border-b-0">
      <span className="w-24 shrink-0 text-xs text-muted-foreground pt-1">{label}</span>
      <span className="flex-1 min-w-0 text-sm font-mono text-foreground break-all">{value}</span>
      <CopyButton value={value} iconOnly />
    </div>
  );
}

export default function TimestampPage() {
  const [direction, setDirection] = useState<Direction>('ts2date');
  const [unit, setUnit] = useState<TimestampUnit>('auto');
  const [tsInput, setTsInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [now, setNow] = useState(() => new Date());

  // 每秒刷新当前时间。
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const { parts, error } = useMemo<{ parts: TimestampParts | null; error: string | null }>(() => {
    const input = direction === 'ts2date' ? tsInput : dateInput;
    if (!input.trim()) return { parts: null, error: null };
    try {
      const date =
        direction === 'ts2date' ? parseTimestamp(input, unit) : parseDateString(input);
      return { parts: describeDate(date), error: null };
    } catch (e) {
      return { parts: null, error: e instanceof Error ? e.message : '未知错误' };
    }
  }, [direction, tsInput, dateInput, unit]);

  const currentParts = describeDate(now);
  const state: 'error' | 'empty' | 'success' = error ? 'error' : parts ? 'success' : 'empty';

  const fillCurrent = () => {
    if (direction === 'ts2date') {
      setTsInput(unit === 'seconds' ? String(currentParts.seconds) : String(currentParts.milliseconds));
    } else {
      setDateInput(currentParts.local);
    }
  };

  const swap = () => {
    if (parts) {
      if (direction === 'ts2date') {
        setDateInput(parts.local);
        setDirection('date2ts');
      } else {
        setTsInput(unit === 'seconds' ? String(parts.seconds) : String(parts.milliseconds));
        setDirection('ts2date');
      }
    } else {
      setDirection((d) => (d === 'ts2date' ? 'date2ts' : 'ts2date'));
    }
  };

  const clear = () => {
    if (direction === 'ts2date') setTsInput('');
    else setDateInput('');
  };

  const inputEmpty = direction === 'ts2date' ? !tsInput : !dateInput;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Seo
        title="时间戳转换 - Unix 时间戳与日期互转 - 寒冰工具箱"
        description="在线时间戳转换工具，支持 Unix 时间戳（秒/毫秒）与可读日期双向互转，输出 ISO 8601、UTC、本地时间、相对时间等多种格式，数据本地处理。"
        path="/timestamp"
      />

      <motion.div className="mb-8" variants={itemVariants}>
        <h1 className="text-3xl font-bold text-primary mb-2">时间戳转换</h1>
        <p className="text-muted-foreground">Unix 时间戳与可读日期互转，支持秒/毫秒单位与多种输出格式。</p>
      </motion.div>

      <motion.div className="mb-4 flex flex-wrap items-center gap-3" variants={itemVariants}>
        <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1" role="group" aria-label="转换方向">
          <ModeTab active={direction === 'ts2date'} onClick={() => setDirection('ts2date')}>
            时间戳 → 日期
          </ModeTab>
          <ModeTab active={direction === 'date2ts'} onClick={() => setDirection('date2ts')}>
            日期 → 时间戳
          </ModeTab>
        </div>

        {direction === 'ts2date' && (
          <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1" role="group" aria-label="时间戳单位">
            <ModeTab active={unit === 'auto'} onClick={() => setUnit('auto')}>
              <span title="按输入数值自动判断，>= 1e12 视为毫秒">自动</span>
            </ModeTab>
            <ModeTab active={unit === 'seconds'} onClick={() => setUnit('seconds')}>
              秒
            </ModeTab>
            <ModeTab active={unit === 'milliseconds'} onClick={() => setUnit('milliseconds')}>
              毫秒
            </ModeTab>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={fillCurrent}
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-primary-foreground bg-primary transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            title="填入当前时间"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>当前时间</span>
          </button>
          <button
            type="button"
            onClick={swap}
            disabled={!parts && inputEmpty}
            aria-label="交换：把当前结果灌入另一侧并切换方向"
            className="group inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-swap-fg bg-swap border border-swap transition-colors hover:bg-swap-hover active:bg-swap-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-swap/60 disabled:opacity-40 disabled:hover:bg-swap disabled:active:bg-swap"
            title="把结果灌入另一侧并切换方向"
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
            onClick={clear}
            disabled={inputEmpty}
            aria-label="清空输入"
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-clear-fg bg-clear border border-clear transition-colors hover:bg-clear-hover active:bg-clear-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clear/60 disabled:opacity-40 disabled:hover:bg-clear disabled:active:bg-clear"
            title="清空输入"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
            <span>清空</span>
          </button>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
        <motion.div className="lg:flex-1 lg:basis-0 min-w-0" variants={itemVariants}>
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <label className="block text-sm font-medium text-foreground mb-3">
              {direction === 'ts2date' ? '时间戳输入' : '日期字符串输入'}
            </label>
            {direction === 'ts2date' ? (
              <input
                type="text"
                value={tsInput}
                onChange={(e) => setTsInput(e.target.value)}
                placeholder="例如：1723987200 或 1723987200000"
                className="w-full bg-input border border-border-strong rounded-lg p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                spellCheck={false}
                inputMode="numeric"
              />
            ) : (
              <input
                type="text"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                placeholder="例如：2024-08-18 12:00:00 或 2024-08-18T12:00:00Z"
                className="w-full bg-input border border-border-strong rounded-lg p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                spellCheck={false}
              />
            )}

            <div className="mt-6 pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">当前时间（本地时区）</div>
              <div className="grid grid-cols-1 gap-1 text-sm font-mono text-foreground">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16">本地</span>
                  <span className="flex-1 min-w-0 break-all">
                    {currentParts.local} {currentParts.weekday}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16">秒</span>
                  <span className="flex-1 min-w-0 break-all">{currentParts.seconds}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16">毫秒</span>
                  <span className="flex-1 min-w-0 break-all">{currentParts.milliseconds}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="lg:flex-1 lg:basis-0 min-w-0 bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col"
          variants={itemVariants}
        >
          <h2 className="text-sm font-medium text-foreground mb-3">转换结果</h2>
          <div className="relative flex-1 min-h-96">
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
                    <div className="text-muted-foreground text-5xl mb-4">🕒</div>
                    <p className="text-muted-foreground">等待输入...</p>
                  </div>
                </motion.div>
              )}

              {state === 'success' && parts && (
                <motion.div
                  key="success"
                  variants={stateVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0 overflow-auto rounded-lg bg-muted p-4"
                >
                  <ResultRow label="秒" value={String(parts.seconds)} />
                  <ResultRow label="毫秒" value={String(parts.milliseconds)} />
                  <ResultRow label="ISO 8601" value={parts.iso} />
                  <ResultRow label="UTC" value={parts.utc} />
                  <ResultRow label="本地时间" value={parts.local} />
                  <ResultRow label="本地日期" value={parts.localDate} />
                  <ResultRow label="本地时刻" value={parts.localTime} />
                  <ResultRow label="星期" value={parts.weekday} />
                  <ResultRow label="相对时间" value={parts.relative} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
