export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">功能开发中</h1>
      <p className="text-muted-foreground">该功能正在建设中，敬请期待。</p>
    </div>
  );
}
