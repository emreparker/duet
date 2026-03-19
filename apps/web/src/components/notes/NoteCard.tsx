"use client";

import { AuthorDot } from "@/components/ui/AuthorBadge";
import { Tag } from "@/components/ui/Tag";

interface NoteCardProps {
  note: {
    id: string;
    title: string;
    content: string;
    authorType: string;
    authorName: string;
    tags: { id: string; name: string; color?: string | null }[];
    updatedAt: string;
    isPinned: boolean;
  };
  isActive: boolean;
  onClick: () => void;
}

export function NoteCard({ note, isActive, onClick }: NoteCardProps) {
  const date = new Date(note.updatedAt);
  const dateStr = date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  // Strip HTML tags and markdown symbols for preview
  const preview = note.content
    .replace(/<[^>]*>/g, " ")     // strip HTML tags
    .replace(/&[a-z]+;/gi, " ")   // strip HTML entities
    .replace(/[#*`\[\]]/g, "")    // strip markdown symbols
    .replace(/\s+/g, " ")         // collapse whitespace
    .trim()
    .substring(0, 120);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 rounded-lg transition-all mb-0.5 group ${
        isActive ? "bg-cream-deep" : "hover:bg-cream-mid"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <AuthorDot type={note.authorType as "human" | "agent"} />
        <span className="text-[11px] text-ink-faint uppercase tracking-wide">
          {dateStr} - {note.authorType === "human" ? "You" : `agent:${note.authorName}`}
        </span>
        {note.isPinned && (
          <svg className="w-3 h-3 text-amber ml-auto" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
      </div>
      <div className="text-[14px] font-semibold leading-snug mb-1 text-ink">
        {note.title}
      </div>
      {preview && (
        <div className="text-[12px] text-ink-muted leading-relaxed line-clamp-2 mb-2">
          {preview}
        </div>
      )}
      {note.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {note.tags.slice(0, 3).map((tag) => (
            <Tag key={tag.id} name={tag.name} color={tag.color} />
          ))}
          {note.tags.length > 3 && (
            <span className="text-[11px] text-ink-faint px-1">+{note.tags.length - 3}</span>
          )}
        </div>
      )}
    </button>
  );
}
