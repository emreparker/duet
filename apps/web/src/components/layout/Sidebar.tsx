"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import * as api from "@/lib/api";

const NAV_ITEMS = [
  {
    label: "All Notes",
    href: "/notes",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    label: "Todos",
    href: "/todos",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Activity",
    href: "/activity",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Agents",
    href: "/agents",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    label: "Archived",
    href: "/notes?archived=true",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
];

export function Sidebar() {
  return (
    <Suspense>
      <SidebarContent />
    </Suspense>
  );
}

function SidebarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const sp = useSearchParams();
  const currentUrl = pathname + (sp.toString() ? `?${sp.toString()}` : "");
  const [tags, setTags] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api.tags.list().then((res) => setTags(res.tags)).catch(() => {});
    api.agents.list().then((res) => setAgents(res.agents)).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/notes?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <aside className="w-[220px] min-w-[220px] bg-cream-mid border-r border-border flex flex-col h-screen">
      {/* Logo */}
      <div className="px-4 pt-4 pb-5 flex items-center">
        <span className="text-[22px] font-light text-[#10b981]">{"["}</span>
        <span className="text-[17px] font-bold">duet</span>
        <span className="text-[22px] font-light text-[#a78bfa]">{"]"}</span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="px-3 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full px-3 py-2 text-[13px] bg-cream border border-border rounded-md outline-none focus:border-amber focus:ring-2 focus:ring-amber-bg placeholder:text-ink-faint"
        />
      </form>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2">
        {NAV_ITEMS.map((item) => {
          let isActive = false;
          if (item.href === "/notes") {
            // "All Notes" is active only when on /notes with no filters
            isActive = pathname === "/notes" && !sp.has("archived") && !sp.has("tag") && !sp.has("q") && !sp.has("author");
          } else if (item.href === "/notes?archived=true") {
            isActive = pathname === "/notes" && sp.get("archived") === "true";
          } else {
            isActive = pathname.startsWith(item.href);
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-all mb-0.5 ${
                isActive
                  ? "bg-cream-deep text-ink font-medium"
                  : "text-ink-muted hover:bg-cream-deep/60 hover:text-ink"
              }`}
            >
              <span className={isActive ? "opacity-100" : "opacity-50"}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {/* Tags section */}
        {tags.length > 0 && (
          <>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint px-3 pt-5 pb-1.5">
              Tags
            </div>
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/notes?tag=${tag.name}`}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] text-ink-muted hover:bg-cream-deep/60 hover:text-ink transition-all"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color ?? "#9c8f7f" }}
                />
                {tag.name}
              </Link>
            ))}
          </>
        )}

        {/* Agents section */}
        {agents.length > 0 && (
          <>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint px-3 pt-5 pb-1.5">
              Agents
            </div>
            {agents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents?id=${agent.id}`}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] text-ink-muted hover:bg-cream-deep/60 hover:text-ink transition-all"
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${agent.isActive ? "bg-agent" : "bg-cream-dark"}`} />
                {agent.name}
                <span className="ml-auto text-[11px] text-ink-faint bg-cream-deep px-1.5 py-px rounded-full">
                  {agent.isActive ? "active" : "off"}
                </span>
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-all ${
            pathname === "/settings"
              ? "bg-cream-deep text-ink font-medium"
              : "text-ink-muted hover:bg-cream-deep/60 hover:text-ink"
          }`}
        >
          <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </Link>
      </div>
    </aside>
  );
}
