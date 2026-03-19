"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AuthorBadge } from "@/components/ui/AuthorBadge";
import { Tag, TagAdd } from "@/components/ui/Tag";
import { RichEditor } from "./RichEditor";
import * as api from "@/lib/api";

interface NoteEditorProps {
  note: {
    id: string;
    title: string;
    content: string;
    authorType: string;
    authorName: string;
    tags: { id: string; name: string; color?: string | null }[];
    createdAt: string;
    updatedAt: string;
    isPinned: boolean;
    isArchived: boolean;
  };
  onNoteUpdated: () => void;
  onShowVersions?: () => void;
}

function formatAuthor(type: string, name: string): string {
  if (type === "human") return "You";
  return `agent:${name}`;
}

export function NoteEditor({ note, onNoteUpdated, onShowVersions }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [saving, setSaving] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setTitle(note.title);
  }, [note.id, note.title]);

  const save = useCallback(
    async (updates: { title?: string; content?: string }) => {
      setSaving(true);
      try {
        await api.notes.update(note.id, updates);
        onNoteUpdated();
      } catch (err) {
        console.error("Failed to save:", err);
      } finally {
        setSaving(false);
      }
    },
    [note.id, onNoteUpdated]
  );

  const debouncedSave = useCallback(
    (updates: { title?: string; content?: string }) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => save(updates), 800);
    },
    [save]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    debouncedSave({ title: e.target.value });
  };

  const handleContentChange = (content: string) => {
    debouncedSave({ content });
  };

  const handleArchive = async () => {
    await api.notes.archive(note.id);
    onNoteUpdated();
  };

  const handlePin = async () => {
    await api.notes.update(note.id, { isPinned: !note.isPinned });
    onNoteUpdated();
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    const existingTagNames = note.tags.map((t) => t.name);
    const allTags = [...existingTagNames, newTagName.trim().toLowerCase()];
    await api.notes.update(note.id, { tags: allTags });
    setNewTagName("");
    setAddingTag(false);
    onNoteUpdated();
  };

  const handleRemoveTag = async (tagName: string) => {
    const remainingTags = note.tags.filter((t) => t.name !== tagName).map((t) => t.name);
    await api.notes.update(note.id, { tags: remainingTags });
    onNoteUpdated();
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex-1 flex flex-col bg-cream min-w-0 h-screen">
      {/* Header bar */}
      <div className="px-6 py-3.5 border-b border-border-light flex items-center justify-between flex-shrink-0">
        <div className="text-[13px] text-ink-faint flex items-center gap-1.5">
          All Notes
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-ink-muted truncate max-w-[300px]">{note.title}</span>
        </div>
        <div className="flex items-center gap-1">
          {saving && (
            <span className="text-[11px] text-ink-faint mr-2">Saving...</span>
          )}
          {onShowVersions && (
            <button
              onClick={onShowVersions}
              className="w-8 h-8 flex items-center justify-center rounded-md text-ink-faint hover:bg-cream-mid hover:text-ink transition-all"
              title="Version history"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
          <button
            onClick={handlePin}
            className={`w-8 h-8 flex items-center justify-center rounded-md transition-all ${
              note.isPinned ? "text-amber bg-amber-bg" : "text-ink-faint hover:bg-cream-mid hover:text-ink"
            }`}
            title={note.isPinned ? "Unpin" : "Pin"}
          >
            <svg className="w-4 h-4" fill={note.isPinned ? "currentColor" : "none"} viewBox="0 0 20 20" stroke={note.isPinned ? "none" : "currentColor"} strokeWidth={1.5}>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
          <button
            onClick={handleArchive}
            className="w-8 h-8 flex items-center justify-center rounded-md text-ink-faint hover:bg-cream-mid hover:text-ink transition-all"
            title="Archive"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-[800px]">
        {/* Title */}
        <input
          value={title}
          onChange={handleTitleChange}
          className="w-full text-[28px] font-bold leading-tight bg-transparent outline-none placeholder:text-cream-dark mb-5"
          placeholder="Untitled"
        />

        {/* Metadata */}
        <div className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-3 mb-5 text-[13px]">
          <span className="text-ink-faint">Created by</span>
          <span>
            {note.authorType === "human" ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded bg-human-bg text-human-text">
                <span className="w-1.5 h-1.5 rounded-full bg-human" />
                You
              </span>
            ) : (
              <AuthorBadge type="agent" name={note.authorName} />
            )}
          </span>

          <span className="text-ink-faint">Created</span>
          <span className="text-ink">{formatDate(note.createdAt)}</span>

          <span className="text-ink-faint">Last modified</span>
          <span className="text-ink">{formatDate(note.updatedAt)}</span>

          <span className="text-ink-faint">Tags</span>
          <div className="flex gap-1.5 flex-wrap items-center">
            {note.tags.map((tag) => (
              <Tag key={tag.id} name={tag.name} color={tag.color} size="md" onRemove={() => handleRemoveTag(tag.name)} />
            ))}
            {addingTag ? (
              <form onSubmit={handleAddTag} className="inline-flex">
                <input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-24 text-xs px-2 py-0.5 border border-amber rounded bg-cream-mid outline-none"
                  placeholder="tag name"
                  autoFocus
                  onBlur={() => { if (!newTagName) setAddingTag(false); }}
                />
              </form>
            ) : (
              <TagAdd onClick={() => setAddingTag(true)} />
            )}
          </div>
        </div>

        <div className="h-px bg-border-light my-5" />

        {/* Rich text editor */}
        <RichEditor
          content={note.content}
          onChange={handleContentChange}
          placeholder="Start writing..."
        />
      </div>
    </div>
  );
}

export function NoteEditorEmpty() {
  return (
    <div className="flex-1 flex items-center justify-center bg-cream h-screen">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cream-deep flex items-center justify-center">
          <svg className="w-8 h-8 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <p className="text-ink-muted text-sm font-medium">Select a note to view</p>
        <p className="text-ink-faint text-xs mt-1">or create a new one</p>
      </div>
    </div>
  );
}
