import { Copy, ShieldAlert, Check } from "lucide-react";
import { useState } from "react";

interface GuardErrorInlineProps {
  /** Short human-facing error message (e.g. "Forbidden", "HTTP 500"). */
  message: string;
  /** Server-issued correlation id propagated via `x-request-id`. */
  requestId?: string;
  /** Optional action label (e.g. "guard.config.read") for context. */
  action?: string;
  className?: string;
}

/**
 * Inline error block for guard / permission failures.
 *
 * Renders the server `request-id` next to the message with a one-click
 * copy affordance so clinicians can quote it verbatim in support tickets.
 * Mirrors the toast contract from `protocolGuardToast` for visual
 * consistency.
 */
export function GuardErrorInline({
  message,
  requestId,
  action,
  className,
}: GuardErrorInlineProps) {
  const [copied, setCopied] = useState(false);
  const id = requestId ?? "n/a";

  const onCopy = async () => {
    try {
      await navigator.clipboard?.writeText(id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  return (
    <div
      role="alert"
      data-testid="guard-error-inline"
      className={`rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive ${className ?? ""}`}
    >
      <div className="flex items-start gap-2">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <div className="flex-1 space-y-1">
          <p className="font-medium leading-tight">{message}</p>
          {action && (
            <p className="text-[10px] uppercase tracking-wide opacity-70">
              Action: <span className="font-mono normal-case">{action}</span>
            </p>
          )}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="opacity-80">Request-Id:</span>
            <code
              data-testid="guard-error-request-id"
              className="select-all rounded bg-destructive/10 px-1.5 py-0.5 font-mono"
            >
              {id}
            </code>
            {requestId && (
              <button
                type="button"
                onClick={onCopy}
                aria-label="Copy request id"
                className="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:bg-destructive/10 focus:outline-none focus:ring-1 focus:ring-destructive"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" aria-hidden /> copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" aria-hidden /> copy
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-[10px] opacity-70">
            Quote this id when reporting the issue — it links to the
            server-side audit row.
          </p>
        </div>
      </div>
    </div>
  );
}
