"use client";

import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import ImageExt from "@tiptap/extension-image";
import DragHandle from "@tiptap/extension-drag-handle-react";
import { useEffect, useRef } from "react";
import { ResizableImageView } from "./ResizableImage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7777";

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/uploads`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return `${API_BASE}${data.url}`;
}

interface RichEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick,
  isActive,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-[30px] h-[30px] flex items-center justify-center rounded text-sm transition-all ${
        isActive
          ? "bg-cream-deep text-ink font-semibold"
          : "text-ink-muted hover:bg-cream-mid hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarSep() {
  return <div className="w-px h-5 bg-border mx-1" />;
}

export function RichEditor({ content, onChange, placeholder = "Start writing..." }: RichEditorProps) {
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        dropcursor: { color: "#b45309", width: 2 },
      }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-amber underline underline-offset-2 hover:text-amber-light" },
      }),
      ImageExt.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: { default: null, renderHTML: (attrs) => attrs.width ? { width: attrs.width } : {} },
          };
        },
        addNodeView() {
          return ReactNodeViewRenderer(ResizableImageView);
        },
      }).configure({
        allowBase64: true,
      }),
    ],
    content: contentToHtml(content),
    editorProps: {
      attributes: {
        class: "outline-none min-h-[400px]",
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            uploadFile(file).then((url) => {
              const { tr } = view.state;
              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
              if (pos !== undefined) {
                const node = view.state.schema.nodes.image.create({ src: url });
                view.dispatch(tr.insert(pos, node));
              }
            });
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) {
                uploadFile(file).then((url) => {
                  const node = view.state.schema.nodes.image.create({ src: url });
                  view.dispatch(view.state.tr.replaceSelectionWith(node));
                });
              }
              return true;
            }
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && !isInternalUpdate.current) {
      const currentHtml = editor.getHTML();
      const newHtml = contentToHtml(content);
      if (currentHtml !== newHtml) {
        editor.commands.setContent(newHtml);
      }
    }
    isInternalUpdate.current = false;
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="relative">
      {/* Drag handle - appears on hover to the left of blocks */}
      {/* @ts-expect-error tippyOptions exists at runtime but missing from types */}
      <DragHandle editor={editor} tippyOptions={{ offset: [-2, 4] }}>
        <div className="flex items-center justify-center w-5 h-5 rounded hover:bg-cream-deep cursor-grab active:cursor-grabbing transition-colors">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="4" cy="3" r="1" fill="#9c8f7f" />
            <circle cx="8" cy="3" r="1" fill="#9c8f7f" />
            <circle cx="4" cy="6" r="1" fill="#9c8f7f" />
            <circle cx="8" cy="6" r="1" fill="#9c8f7f" />
            <circle cx="4" cy="9" r="1" fill="#9c8f7f" />
            <circle cx="8" cy="9" r="1" fill="#9c8f7f" />
          </svg>
        </div>
      </DragHandle>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 py-2 mb-4 border-b border-border-light sticky top-0 bg-cream z-10">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold (⌘B)"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic (⌘I)"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <span className="line-through">S</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="Inline code (⌘E)"
        >
          <span className="font-mono text-[11px]">{"<>"}</span>
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <span className="text-xs font-bold">H1</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <span className="text-xs font-bold">H2</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <span className="text-xs font-bold">H3</span>
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered list"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13" />
            <text x="1" y="8" fontSize="7" fill="currentColor" fontWeight="bold">1</text>
            <text x="1" y="14" fontSize="7" fill="currentColor" fontWeight="bold">2</text>
            <text x="1" y="20" fontSize="7" fill="currentColor" fontWeight="bold">3</text>
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive("taskList")}
          title="Checklist"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Quote"
        >
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.71 11 13.122 11 15c0 1.105-.896 2-2 2-1.104 0-2-.895-2-2 0-.26.022-.515.075-.76L4.583 17.32zM14.583 17.321C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.71 21 13.122 21 15c0 1.105-.896 2-2 2-1.104 0-2-.895-2-2 0-.26.022-.515.075-.76l-2.492 3.081z" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="Code block"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          <span className="text-xs">-</span>
        </ToolbarButton>

        <ToolbarSep />

        <ToolbarButton
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async () => {
              const file = input.files?.[0];
              if (file) {
                const url = await uploadFile(file);
                editor.chain().focus().setImage({ src: url }).run();
              }
            };
            input.click();
          }}
          title="Insert image"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}

function contentToHtml(content: string): string {
  if (!content) return "<p></p>";
  if (content.startsWith("<")) return content; // Already HTML

  // Convert simple markdown to HTML
  return content
    .split("\n\n")
    .map((block) => {
      if (block.startsWith("# ")) return `<h1>${block.slice(2)}</h1>`;
      if (block.startsWith("## ")) return `<h2>${block.slice(3)}</h2>`;
      if (block.startsWith("### ")) return `<h3>${block.slice(4)}</h3>`;
      if (block.startsWith("- ") || block.startsWith("* ")) {
        const items = block.split("\n").map((l) => `<li><p>${l.replace(/^[-*] /, "")}</p></li>`).join("");
        return `<ul>${items}</ul>`;
      }
      if (block.startsWith("> ")) return `<blockquote><p>${block.slice(2)}</p></blockquote>`;
      if (block.startsWith("```")) {
        const code = block.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
        return `<pre><code>${code}</code></pre>`;
      }
      return `<p>${block.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}
