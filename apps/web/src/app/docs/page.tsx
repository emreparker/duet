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

function Sidebar({ active }: { active: string }) {
  return (
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
                active === item.slug ? "bg-[#eee] text-[#1a1a1a] font-medium" : "text-[#555] hover:text-[#1a1a1a] hover:bg-[#f0f0f0]"
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>
      ))}
    </aside>
  );
}

export { Sidebar, DOCS_NAV };

export default function DocsPage() {
  return (
    <div className="flex min-h-screen bg-white" style={{ fontFamily: "var(--font-sans)" }}>
      <Sidebar active="" />
      <main className="flex-1 max-w-[720px] px-10 py-12">
        <h1 className="text-[32px] font-bold mb-4">Welcome to Duet</h1>
        <p className="text-[16px] text-[#333] mb-8 leading-relaxed" style={{ fontFamily: "var(--font-serif)" }}>
          Duet is a note-taking application designed for <strong>collaborative use between humans and AI agents</strong>.
          It features a built-in MCP server, rich text editing, version history, and clear attribution of who wrote what.
        </p>

        <h2 className="text-[22px] font-bold mb-3 mt-10">Key Features</h2>
        <ul className="space-y-2 text-[15px] text-[#333] leading-relaxed list-disc pl-5" style={{ fontFamily: "var(--font-serif)" }}>
          <li><strong>MCP Server</strong> - 12 tools for AI agents to create, read, search, and manage notes</li>
          <li><strong>Author Attribution</strong> - every note and edit tracks whether it was written by a human or agent</li>
          <li><strong>Permission Boundaries</strong> - agents can read, write, and archive, but never delete</li>
          <li><strong>Real-time Updates</strong> - WebSocket-powered live updates when agents create or edit notes</li>
          <li><strong>Rich Text Editor</strong> - headings, lists, checklists, code blocks, images, drag-drop</li>
          <li><strong>CLI</strong> - full command-line interface for power users</li>
          <li><strong>Google Calendar Sync</strong> - todos with due dates sync to your calendar</li>
        </ul>

        <h2 className="text-[22px] font-bold mb-3 mt-10">Two Ways to Run</h2>
        <div className="rounded-xl border border-[#e5e5e5] overflow-hidden mt-4">
          <div className="grid grid-cols-3 text-[12px] font-bold uppercase tracking-wider bg-[#fafafa] border-b border-[#e5e5e5]">
            <div className="px-5 py-3 text-[#999]" />
            <div className="px-5 py-3 text-[#999] border-l border-[#e5e5e5]">Self-hosted</div>
            <div className="px-5 py-3 text-[#1a1a1a] border-l border-[#e5e5e5]">Duet Cloud</div>
          </div>
          {[
            ["Cost", "Free, open source", "$8/mo"],
            ["Setup", "Docker or Fly.io", "Zero setup"],
            ["Auth", "Password", "Google & GitHub"],
            ["Data", "Your server", "Managed by us"],
          ].map(([f, a, b], i) => (
            <div key={i} className="grid grid-cols-3 text-[14px] border-b border-[#f0f0f0] last:border-0">
              <div className="px-5 py-3 font-semibold">{f}</div>
              <div className="px-5 py-3 text-[#555] border-l border-[#f0f0f0]">{a}</div>
              <div className="px-5 py-3 text-[#555] border-l border-[#f0f0f0]">{b}</div>
            </div>
          ))}
        </div>

        <h2 className="text-[22px] font-bold mb-3 mt-10">Quick Links</h2>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            { title: "Self-hosted Setup", href: "/docs/self-hosted", desc: "Docker setup in 2 minutes" },
            { title: "Cloud Quickstart", href: "/docs/cloud", desc: "Sign up and connect an agent" },
            { title: "MCP Server Setup", href: "/docs/mcp-setup", desc: "Connect your AI agents" },
            { title: "CLI Reference", href: "/docs/cli", desc: "Command-line interface" },
          ].map((link) => (
            <Link key={link.href} href={link.href} className="rounded-xl border border-[#e5e5e5] p-4 hover:border-[#ccc] hover:shadow-sm transition-all block">
              <div className="text-[14px] font-bold mb-1">{link.title}</div>
              <div className="text-[12px] text-[#555]">{link.desc}</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
