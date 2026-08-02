import { useState, useEffect, useRef } from 'react';

function CopyButton({ value }: { value: string | null }) {
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
      className="ml-auto inline-flex items-center gap-1 text-xs text-primary disabled:opacity-40 rounded px-2 py-1 transition-colors"
      title="Copy"
    >
      {copied ? (
        <>
          <span>✓</span>
          <span>Copied</span>
        </>
      ) : (
        <>
          <span>⧉</span>
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

export default CopyButton;
