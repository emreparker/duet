"use client";

import { useEffect, useState } from "react";
import { AuthorBadge } from "@/components/ui/AuthorBadge";
import * as api from "@/lib/api";

interface VersionHistoryProps {
  noteId: string;
  onClose: () => void;
  onRestore: (content: string, title: string) => void;
}

export function VersionHistory({ noteId, onClose, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);

  useEffect(() => {
    api.notes.versions(noteId).then((res) => {
      setVersions(res.versions);
      if (res.versions.length > 0) {
        setSelectedVersion(res.versions[0]);
      }
    });
  }, [noteId]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="flex-1 flex flex-col bg-cream min-w-0 h-screen">
      {/* Header */}
      <div className="px-6 py-3.5 border-b border-border-light flex items-center justify-between flex-shrink-0">
        <div className="text-[13px] font-medium text-ink">Version History</div>
        <button
          onClick={onClose}
          className="text-xs text-ink-faint hover:text-ink px-2 py-1 rounded-md hover:bg-cream-mid transition-all"
        >
          Close
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Version list */}
        <div className="w-[240px] border-r border-border-light overflow-y-auto py-2 px-2">
          {versions.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVersion(v)}
              className={`w-full text-left px-3 py-2.5 rounded-lg mb-0.5 transition-all ${
                selectedVersion?.id === v.id ? "bg-cream-deep" : "hover:bg-cream-mid"
              }`}
            >
              <div className="text-[13px] font-medium">v{v.versionNumber}</div>
              <div className="text-[11px] text-ink-faint mt-0.5">
                {formatDate(v.createdAt)}
              </div>
              <div className="mt-1">
                {v.authorType === "human" ? (
                  <span className="text-[10px] font-medium text-human-text bg-human-bg px-1.5 py-px rounded">You</span>
                ) : (
                  <span className="text-[10px] font-medium text-agent-text bg-agent-bg px-1.5 py-px rounded">agent:{v.authorName}</span>
                )}
              </div>
            </button>
          ))}
          {versions.length === 0 && (
            <div className="text-center py-8 text-ink-faint text-xs">No versions yet</div>
          )}
        </div>

        {/* Version preview */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {selectedVersion ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedVersion.title}</h2>
                  <div className="text-xs text-ink-faint mt-1">
                    Version {selectedVersion.versionNumber} - {formatDate(selectedVersion.createdAt)} by{" "}
                    {selectedVersion.authorType === "human" ? "You" : `agent:${selectedVersion.authorName}`}
                  </div>
                </div>
                {selectedVersion.versionNumber !== versions[0]?.versionNumber && (
                  <button
                    onClick={() => onRestore(selectedVersion.content, selectedVersion.title)}
                    className="px-3 py-1.5 text-xs font-medium bg-amber text-white rounded-md hover:bg-amber-light transition-colors"
                  >
                    Restore this version
                  </button>
                )}
              </div>
              <div className="h-px bg-border-light mb-4" />
              <div
                className="tiptap text-[14px] leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: selectedVersion.content.startsWith("<")
                    ? selectedVersion.content
                    : `<p>${selectedVersion.content.replace(/\n/g, "<br>")}</p>`,
                }}
              />
            </>
          ) : (
            <div className="text-center py-12 text-ink-faint text-sm">Select a version to preview</div>
          )}
        </div>
      </div>
    </div>
  );
}
