"use client";

import Link from "next/link";
import { NoteCard } from "./NoteCard";

interface NoteListProps {
  notes: any[];
  total: number;
  activeNoteId: string | null;
  onNoteSelect: (id: string) => void;
  onNewNote: () => void;
  title: string;
  showClear?: boolean;
}

export function NoteList({ notes, total, activeNoteId, onNoteSelect, onNewNote, title, showClear }: NoteListProps) {
  return (
    <div className="w-[320px] min-w-[320px] border-r border-border flex flex-col bg-cream h-screen">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-lg font-semibold truncate">{title}</h2>
          {showClear && (
            <Link href="/notes" className="text-xs text-ink-faint hover:text-ink flex-shrink-0">
              × clear
            </Link>
          )}
        </div>
        <button
          onClick={onNewNote}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md text-[12px] font-medium text-ink-muted hover:bg-cream-mid hover:text-ink transition-all flex-shrink-0"
        >
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" d="M12 5v14m-7-7h14" />
          </svg>
          New
        </button>
      </div>

      {/* Note count */}
      <div className="px-5 pb-2">
        <span className="text-[12px] text-ink-faint">{total} note{total !== 1 ? "s" : ""}</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {notes.length === 0 ? (
          <div className="text-center py-12 text-ink-faint text-sm">
            <p>No notes found</p>
          </div>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isActive={note.id === activeNoteId}
              onClick={() => onNoteSelect(note.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
