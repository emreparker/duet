import Link from "next/link";

const DOCS_NAV = [
  { section: "Getting Started", items: [
    { title: "Introduction", slug: "" },
    { title: "Self-hosted Setup", slug: "self-hosted" },
    { title: "Cloud Quickstart", slug: "cloud" },
  ]},
  { section: "MCP Server", items: [
    { title: "Setup", slug: "mcp-setup" },
    { title: "Tools Reference", slug: "mcp-tools" },
  ]},
  { section: "Reference", items: [
    { title: "CLI", slug: "cli" },
    { title: "API", slug: "api" },
  ]},
  { section: "Guides", items: [
    { title: "Google Calendar", slug: "calendar" },
    { title: "Deploy with Docker", slug: "deploy-docker" },
    { title: "Deploy to Fly.io", slug: "deploy-fly" },
  ]},
];

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-[#1a1a1a] text-[#e5e5e5] rounded-xl p-5 text-[13px] font-mono leading-relaxed overflow-x-auto my-4">
      <code>{children}</code>
    </pre>
  );
}

export function DocPage({ slug, title, children }: { slug: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Sidebar */}
      <aside className="w-[240px] min-w-[240px] border-r border-[#e5e5e5] bg-[#fafafa] p-6 hidden md:block overflow-y-auto h-screen sticky top-0">
        <a href="/" className="inline-flex items-baseline gap-[1px] mb-8">
          <span className="text-[20px] font-light text-[#10b981]">{"["}</span>
          <span className="text-[15px] font-extrabold tracking-tight text-[#1a1a1a]">duet</span>
          <span className="text-[20px] font-light text-[#a78bfa]">{"]"}</span>
          <span className="text-[12px] text-[#999] ml-2 font-medium">docs</span>
        </a>
        {DOCS_NAV.map((section) => (
          <div key={section.section} className="mb-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#999] mb-2">{section.section}</div>
            {section.items.map((item) => (
              <Link
                key={item.slug}
                href={item.slug ? `/docs/${item.slug}` : "/docs"}
                className={`block px-3 py-1.5 rounded-lg text-[13px] mb-0.5 transition-colors ${
                  slug === item.slug ? "bg-[#eee] text-[#1a1a1a] font-medium" : "text-[#555] hover:text-[#1a1a1a] hover:bg-[#f0f0f0]"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        ))}
      </aside>

      {/* Content */}
      <main className="flex-1 max-w-[720px] px-10 py-12 select-text">
        <h1 className="text-[32px] font-bold mb-6">{title}</h1>
        <div className="prose-duet text-[15px] text-[#333] leading-relaxed" style={{ fontFamily: "var(--font-serif)" }}>
          {children}
        </div>
      </main>
    </div>
  );
}

export { CodeBlock };
