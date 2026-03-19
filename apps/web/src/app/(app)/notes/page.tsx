"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { NoteList } from "@/components/notes/NoteList";
import { NoteEditor, NoteEditorEmpty } from "@/components/notes/NoteEditor";
import { VersionHistory } from "@/components/notes/VersionHistory";
import { useWebSocket } from "@/hooks/useWebSocket";
import * as api from "@/lib/api";

function NotesContent() {
  const searchParams = useSearchParams();
  const tagFilter = searchParams.get("tag");
  const searchQuery = searchParams.get("q");
  const showArchived = searchParams.get("archived") === "true";
  const authorFilter = searchParams.get("author"); // e.g. "agent:claude"

  const [notes, setNotes] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<any>(null);
  const [showVersions, setShowVersions] = useState(false);

  const loadNotes = useCallback(async () => {
    try {
      if (searchQuery) {
        const result = await api.notes.search({ q: searchQuery, limit: 50 });
        setNotes(result.notes);
        setTotal(result.total);
      } else {
        const params: Record<string, string | boolean> = {
          sortBy: "updated_at",
          sortOrder: "desc",
        };
        if (tagFilter) params.tagName = tagFilter;
        if (showArchived) params.isArchived = true;
        if (authorFilter) {
          const [type, ...nameParts] = authorFilter.split(":");
          params.authorType = type;
          if (nameParts.length > 0) params.authorName = nameParts.join(":");
        }
        const result = await api.notes.list(params);
        setNotes(result.notes);
        setTotal(result.total);
      }
    } catch (err) {
      console.error("Failed to load notes:", err);
    }
  }, [tagFilter, searchQuery, showArchived, authorFilter]);

  const loadNote = useCallback(async (id: string) => {
    try {
      const note = await api.notes.get(id);
      setActiveNote(note);
    } catch (err) {
      console.error("Failed to load note:", err);
    }
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  useEffect(() => {
    if (activeNoteId) {
      loadNote(activeNoteId);
    } else {
      setActiveNote(null);
    }
  }, [activeNoteId, loadNote]);

  useWebSocket((msg) => {
    if (msg.type.startsWith("note.")) {
      loadNotes();
      if (activeNoteId && msg.data.entityId === activeNoteId) {
        loadNote(activeNoteId);
      }
    }
  });

  const handleNewNote = async () => {
    try {
      const note = await api.notes.create({ title: "Untitled", content: "" });
      await loadNotes();
      setActiveNoteId(note.id);
    } catch (err) {
      console.error("Failed to create note:", err);
    }
  };

  const handleNoteUpdated = () => {
    loadNotes();
    if (activeNoteId) loadNote(activeNoteId);
  };

  const hasFilter = !!(tagFilter || searchQuery || showArchived || authorFilter);
  const listTitle = searchQuery
    ? `Search: "${searchQuery}"`
    : showArchived
      ? "Archived"
      : tagFilter
        ? `#${tagFilter}`
        : authorFilter
          ? `Notes by ${authorFilter.startsWith("agent:") ? authorFilter.split(":")[1] : "you"}`
          : "All Notes";

  return (
    <div className="flex h-screen">
      <NoteList
        notes={notes}
        total={total}
        activeNoteId={activeNoteId}
        onNoteSelect={setActiveNoteId}
        onNewNote={handleNewNote}
        title={listTitle}
        showClear={hasFilter}
      />
      {activeNote && showVersions ? (
        <VersionHistory
          noteId={activeNote.id}
          onClose={() => setShowVersions(false)}
          onRestore={async (content, title) => {
            await api.notes.update(activeNote.id, { content, title });
            setShowVersions(false);
            handleNoteUpdated();
          }}
        />
      ) : activeNote ? (
        <NoteEditor
          note={activeNote}
          onNoteUpdated={handleNoteUpdated}
          onShowVersions={() => setShowVersions(true)}
        />
      ) : (
        <NoteEditorEmpty />
      )}
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-cream text-ink-faint text-sm">Loading...</div>}>
      <NotesContent />
    </Suspense>
  );
}
