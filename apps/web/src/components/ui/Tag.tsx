"use client";

interface TagProps {
  name: string;
  color?: string | null;
  size?: "sm" | "md";
  onRemove?: () => void;
}

export function Tag({ name, color, size = "sm", onRemove }: TagProps) {
  const sizeClasses = size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded bg-cream-deep border border-border-light text-ink-muted font-medium ${sizeClasses}`}
    >
      {color && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      {name}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 text-ink-faint hover:text-ink transition-colors"
        >
          ×
        </button>
      )}
    </span>
  );
}

export function TagAdd({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs text-ink-faint px-2 py-0.5 border border-dashed border-cream-dark rounded hover:border-ink-faint hover:text-ink-muted transition-colors"
    >
      + Add tag
    </button>
  );
}
