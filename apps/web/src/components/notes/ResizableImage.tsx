"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useRef, useState, useCallback } from "react";

export function ResizableImageView({ node, updateAttributes, selected }: NodeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    startX.current = e.clientX;
    startWidth.current = containerRef.current?.querySelector("img")?.clientWidth ?? 300;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX.current;
      const newWidth = Math.max(100, startWidth.current + diff);
      updateAttributes({ width: newWidth });
    };

    const handleMouseUp = () => {
      setResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [updateAttributes]);

  const width = node.attrs.width;

  return (
    <NodeViewWrapper className="my-4">
      <div
        ref={containerRef}
        className={`relative inline-block group ${selected ? "ring-2 ring-amber ring-offset-2 rounded-lg" : ""}`}
        style={{ width: width ? `${width}px` : "auto", maxWidth: "100%" }}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt ?? ""}
          className="block rounded-lg w-full h-auto"
          draggable={false}
        />

        {/* Resize handle - bottom right corner */}
        <div
          onMouseDown={handleMouseDown}
          className={`absolute bottom-1 right-1 w-4 h-4 cursor-se-resize rounded-sm transition-opacity ${
            selected || resizing
              ? "opacity-100 bg-amber"
              : "opacity-0 group-hover:opacity-70 bg-ink-faint"
          }`}
          style={{ touchAction: "none" }}
        >
          <svg viewBox="0 0 16 16" className="w-full h-full text-white p-0.5">
            <path d="M14 2L2 14M14 6L6 14M14 10L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Width indicator while resizing */}
        {resizing && width && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-ink text-cream text-[10px] font-medium px-2 py-0.5 rounded">
            {Math.round(width)}px
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
