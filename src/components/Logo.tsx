/**
 * App Logo: ICE icon + "寒冰工具箱" text.
 * The text is always rendered and can be toggled/animated via textClassName
 * (e.g. the desktop collapse animation).
 */
import { useId } from 'react';

type LogoProps = {
  /** Extra class name for the text part, used for collapsed transition styles etc. */
  textClassName?: string;
};

export default function Logo({ textClassName }: LogoProps) {
  // Each instance gets a unique id so multiple <Logo /> on the page (desktop/mobile)
  // don't share the same gradient id, which would break the reference when toggling
  // display:none across viewports (appearing as an invisible/transparent block).
  const gid = "ice-logo" + useId();
  return (
    <div className="flex items-center gap-2 min-w-0">
      <svg viewBox="0 0 28 28" width="28" height="28" className="h-8 w-8 shrink-0">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4cb8ff" />
            <stop offset="1" stopColor="#1d9bf0" />
          </linearGradient>
        </defs>
        <rect width="28" height="28" rx="10" fill={`url(#${gid})`} />
        <g stroke="#fff" strokeWidth="1.4" strokeLinecap="round" >
          <circle cx="14" cy="14" r="1.8" fill="#fff" stroke="none" />
          <g>
            <line x1="14" y1="14" x2="14" y2="5.5" />
            <line x1="14" y1="14" x2="21.4" y2="18" />
            <line x1="14" y1="14" x2="6.6" y2="18" />
            <line x1="14" y1="14" x2="14" y2="22.5" />
            <line x1="14" y1="14" x2="6.6" y2="10" />
            <line x1="14" y1="14" x2="21.4" y2="10" />
          </g>
          <g strokeWidth="1">
            <line x1="14" y1="9.5" x2="12" y2="8.2" />
            <line x1="14" y1="9.5" x2="16" y2="8.2" />
            <line x1="18.4" y1="16.5" x2="19.8" y2="15.1" />
            <line x1="18.4" y1="16.5" x2="19.8" y2="17.9" />
            <line x1="9.6" y1="16.5" x2="8.2" y2="15.1" />
            <line x1="9.6" y1="16.5" x2="8.2" y2="17.9" />
            <line x1="14" y1="18.5" x2="12" y2="19.8" />
            <line x1="14" y1="18.5" x2="16" y2="19.8" />
            <line x1="9.6" y1="11.5" x2="8.2" y2="10.1" />
            <line x1="9.6" y1="11.5" x2="11" y2="10.1" />
            <line x1="18.4" y1="11.5" x2="19.8" y2="10.1" />
            <line x1="18.4" y1="11.5" x2="17" y2="10.1" />
          </g>
        </g>
      </svg>
      <span
        className={['text-base font-semibold text-foreground truncate', textClassName]
          .filter(Boolean)
          .join(' ')}
      >
        寒冰工具箱
      </span>
    </div>
  );
}
