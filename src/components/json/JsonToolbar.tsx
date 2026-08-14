import { motion } from 'motion/react';
import ModeTab from './ModeTab';
import { itemVariants } from './animations';
import { MODES, type Mode } from './types';

interface JsonToolbarProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  canSwap: boolean;
  onSwap: () => void;
  canClear: boolean;
  onClear: () => void;
}

export default function JsonToolbar({
  mode,
  onModeChange,
  canSwap,
  onSwap,
  canClear,
  onClear,
}: JsonToolbarProps) {
  return (
    <motion.div className="mb-4 flex flex-wrap items-center gap-3" variants={itemVariants}>
      <div
        className="inline-flex items-center gap-1 rounded-lg bg-muted p-1"
        role="group"
        aria-label="JSON 功能"
      >
        {MODES.map((m) => (
          <ModeTab key={m.value} active={mode === m.value} onClick={() => onModeChange(m.value)}>
            {m.label}
          </ModeTab>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onSwap}
          disabled={!canSwap}
          aria-label="把输出灌回输入"
          title="把输出灌回输入"
          className="group inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-swap-fg bg-swap border border-swap transition-colors hover:bg-swap-hover active:bg-swap-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-swap/60 disabled:opacity-40 disabled:hover:bg-swap disabled:active:bg-swap"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200 group-hover:rotate-180"
          >
            <path d="m17 3 4 4-4 4" />
            <path d="M21 7H9" />
            <path d="m7 21-4-4 4-4" />
            <path d="M3 17h12" />
          </svg>
          <span>灌回</span>
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={!canClear}
          aria-label="清空输入"
          title="清空输入"
          className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-clear-fg bg-clear border border-clear transition-colors hover:bg-clear-hover active:bg-clear-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clear/60 disabled:opacity-40 disabled:hover:bg-clear disabled:active:bg-clear"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
  );
}
