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
      <span className="text-[hsl(var(--jwt-header))]">{parts[0]}</span>
      <span className="text-foreground">.</span>
      <span className="text-[hsl(var(--jwt-payload))]">{parts[1]}</span>
      <span className="text-foreground">.</span>
      <span className="text-[hsl(var(--jwt-signature))]">{parts[2]}</span>
    </>
  );
};

export function JwtInput({ value, onChange }: JwtInputProps) {
  const highlightRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      <label className="block text-sm font-medium text-foreground mb-3">
        JWT 输入
      </label>
      <div className="relative h-96">
        {/* Highlight display layer */}
        <div
          ref={highlightRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full bg-input border border-border rounded-lg p-4 text-sm font-mono leading-5 pointer-events-none overflow-hidden whitespace-pre-wrap break-all z-10"
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
