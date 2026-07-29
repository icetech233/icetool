/**
 * Displays the decoded JWT data, including header, payload, and signature.
 * It also handles the presentation of error messages or the initial "waiting for input" state.
 * This component is purely presentational, receiving all its data via props.
 */

interface JwtOutputProps {
  decoded: {
    header: string | null;
    payload: string | null;
    signature: string | null;
    error: string | null;
  };
}

export function JwtOutput({ decoded }: JwtOutputProps) {
  if (decoded.error) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive text-5xl mb-4">⚠️</div>
          <p className="text-destructive font-medium">{decoded.error}</p>
        </div>
      </div>
    );
  }

  if (!decoded.header && !decoded.payload) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground text-5xl mb-4">🔐</div>
          <p className="text-muted-foreground">等待输入...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-96 overflow-y-auto pr-2">
      {/* Header */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded">
            HEADER
          </span>
          <span className="text-xs text-muted-foreground">算法 & 类型</span>
        </div>
        <pre className="text-xs font-mono text-foreground overflow-x-auto">
          {decoded.header}
        </pre>
      </div>

      {/* Payload */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-secondary/20 text-secondary-foreground text-xs font-semibold rounded">
            PAYLOAD
          </span>
          <span className="text-xs text-muted-foreground">数据</span>
        </div>
        <pre className="text-xs font-mono text-foreground overflow-x-auto">
          {decoded.payload}
        </pre>
      </div>

      {/* Signature */}
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-accent/20 text-accent-foreground text-xs font-semibold rounded">
            SIGNATURE
          </span>
          <span className="text-xs text-muted-foreground">签名</span>
        </div>
        <p className="text-xs font-mono text-muted-foreground break-all">
          {decoded.signature}
        </p>
      </div>
    </div>
  );
}
