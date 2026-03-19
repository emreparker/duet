"use client";

interface AuthorBadgeProps {
  type: "human" | "agent";
  name: string;
  size?: "sm" | "md";
}

export function AuthorBadge({ type, name, size = "md" }: AuthorBadgeProps) {
  const isHuman = type === "human";
  const sizeClasses = size === "sm" ? "text-[10px] px-1.5 py-0.5 gap-1" : "text-xs px-2 py-0.5 gap-1.5";

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${sizeClasses} ${
        isHuman
          ? "bg-human-bg text-human-text"
          : "bg-agent-bg text-agent-text"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          isHuman ? "bg-human" : "bg-agent"
        }`}
      />
      {type}:{name}
    </span>
  );
}

export function AuthorDot({ type, className = "" }: { type: "human" | "agent"; className?: string }) {
  return (
    <span
      className={`inline-block w-[6px] h-[6px] rounded-full flex-shrink-0 ${
        type === "human" ? "bg-human" : "bg-agent"
      } ${className}`}
    />
  );
}
