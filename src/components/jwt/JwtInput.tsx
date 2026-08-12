/**
 * A controlled component for JWT input.
 * It provides a textarea for user input and a synchronized, syntax-highlighted
 * view of the JWT token underneath. This component is responsible for the look and feel
 * of the input area, but delegates the actual decoding logic.
 */
import { useRef } from 'react';

interface JwtInputProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * A structurally valid sample JWT that decodes correctly.
 * The signature is a placeholder for demonstration only, not a real signature.
 */
const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IuW8oOS4iSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxOTg1NzEyMDAwLCJyb2xlIjpbImFkbWluIiwidXNlciJdfQ.' +
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

/**
 * Renders the JWT string with syntax highlighting.
 * @param jwtInput The raw JWT string.
 * @returns A JSX element with colored spans for each part of the JWT.
 */
const renderHighlightedJWT = (jwtInput: string) => {
  if (!jwtInput) {
    return null;
  }

  const parts = jwtInput.split('.');
  if (parts.length !== 3) {
    return <span className="text-foreground">{jwtInput}</span>;
  }

  return (
    <>
      <span className="text-jwt-header">{parts[0]}</span>
      <span className="text-foreground">.</span>
      <span className="text-jwt-payload">{parts[1]}</span>
      <span className="text-foreground">.</span>
      <span className="text-jwt-signature">{parts[2]}</span>
    </>
  );
};

export function JwtInput({ value, onChange }: JwtInputProps) {
  const highlightRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadSample = () => onChange(SAMPLE_JWT);
  const clear = () => onChange('');

  /**
   * Synchronizes the scroll position of the textarea and the highlight div.
   */
  const handleScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="flex-1 bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <label className="block text-sm font-medium text-foreground">JWT 输入</label>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={loadSample}
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/20 transition-colors hover:bg-primary/20 active:bg-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            title="填入一个可正常解码的示例 Token"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
              <path d="M9 13h6" />
              <path d="M9 17h3" />
            </svg>
            <span>加载示例</span>
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={!value}
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
      </div>
      <div className="relative h-96">
        {/* Highlight display layer */}
        <div
          ref={highlightRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full bg-input border border-border-strong rounded-lg p-4 text-sm font-mono leading-5 pointer-events-none overflow-hidden whitespace-pre-wrap break-all z-10"
        >
          {renderHighlightedJWT(value)}
        </div>
        {/* Input layer.
            `text-transparent` hides the real text in all engines (WebKit/Blink/Gecko)
            while `caret-primary` keeps the caret visible; the visible glyphs are
            painted by the highlight layer above. The transparent border matches the
            highlight layer's border box so both share identical content metrics. */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          placeholder="在此粘贴 JWT Token..."
          className="absolute inset-0 w-full h-full bg-transparent border border-transparent rounded-lg p-4 text-sm font-mono leading-5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-transparent caret-primary z-20 placeholder:text-muted-foreground whitespace-pre-wrap break-all"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
