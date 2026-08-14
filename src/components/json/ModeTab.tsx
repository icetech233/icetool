import type { ReactNode } from 'react';

type ModeTabProps = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
};

export default function ModeTab({ active, onClick, children }: ModeTabProps) {
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
