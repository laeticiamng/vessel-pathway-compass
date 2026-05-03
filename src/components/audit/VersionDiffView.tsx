import { diffVersions } from "@/lib/contentVersionsStore";
import type { ContentVersion } from "@/lib/contentVersions";

interface Props {
  left: ContentVersion;
  right: ContentVersion;
  leftLabel?: string;
  rightLabel?: string;
}

/**
 * Renders a side-aware line diff between two ContentVersion entries (for
 * the Audit & Limitations and FAQ editorial overlays). Added lines are
 * highlighted in success colors, removed lines in destructive colors.
 */
export function VersionDiffView({ left, right, leftLabel, rightLabel }: Props) {
  const lines = diffVersions(left, right);
  return (
    <div className="rounded-lg border border-border overflow-hidden text-xs font-mono">
      <div className="grid grid-cols-2 bg-muted/40 text-[11px] uppercase tracking-wide">
        <div className="px-3 py-1.5 border-r border-border text-muted-foreground">
          ← {leftLabel ?? `v${left.version} (${left.updatedAt})`}
        </div>
        <div className="px-3 py-1.5 text-muted-foreground">
          → {rightLabel ?? `v${right.version} (${right.updatedAt})`}
        </div>
      </div>
      <ul className="divide-y divide-border" data-testid="version-diff-lines">
        {lines.map((line, i) => (
          <li
            key={`${i}-${line.type}-${line.text.slice(0, 20)}`}
            className={
              line.type === "added"
                ? "bg-success/10 text-success-foreground px-3 py-1"
                : line.type === "removed"
                  ? "bg-destructive/10 text-destructive px-3 py-1"
                  : "px-3 py-1 text-muted-foreground"
            }
            data-diff-type={line.type}
          >
            <span className="select-none mr-2 opacity-60">
              {line.type === "added" ? "+" : line.type === "removed" ? "−" : " "}
            </span>
            {line.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default VersionDiffView;
