import { motion } from 'motion/react';
import { itemVariants } from './animations';

interface JsonInputPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JsonInputPanel({ value, onChange }: JsonInputPanelProps) {
  return (
    <motion.div className="lg:flex-1 lg:basis-0 min-w-0" variants={itemVariants}>
      <div className="flex-1 bg-card rounded-xl border border-border p-6 shadow-sm">
        <label className="block text-sm font-medium text-foreground mb-3">JSON 输入</label>
        <div className="relative h-96">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="在此粘贴需要处理的 JSON 内容..."
            className="absolute inset-0 w-full h-full bg-input border border-border-strong rounded-lg p-4 text-sm font-mono leading-5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground whitespace-pre break-all overflow-auto"
            spellCheck={false}
          />
        </div>
      </div>
    </motion.div>
  );
}
