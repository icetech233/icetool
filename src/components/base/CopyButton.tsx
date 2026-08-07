import { useState, useEffect, useRef } from 'react';

function CopyButton({
  value,
  iconOnly = false,
}: {
  value: string | null;
  iconOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 剪贴板不可用时静默失败 */
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!value}
      className={[
        'inline-flex items-center justify-center text-primary disabled:opacity-40 rounded transition-colors',
        iconOnly ? 'h-5 w-5 hover:bg-muted' : 'ml-auto gap-1 px-2 py-1 text-xs hover:bg-muted',
      ].join(' ')}
      title={copied ? '已复制' : '复制'}
      aria-label={copied ? '已复制' : '复制'}
    >
      {copied ? (
        <span aria-hidden="true">✓</span>
      ) : (
        <span aria-hidden="true">⧉</span>
      )}
      {!iconOnly && <span>{copied ? '已复制' : '复制'}</span>}
    </button>
  );
}

export default CopyButton;
