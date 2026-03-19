import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="duet-app min-h-screen bg-cream-mid">
      <nav className="max-w-[1200px] mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-0">
          <span className="text-[24px] font-light text-amber">{"["}</span>
          <span className="text-[18px] font-bold text-ink">duet</span>
          <span className="text-[24px] font-light text-amber">{"]"}</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/docs" className="text-sm text-ink-muted hover:text-ink transition-colors">Docs</Link>
          <Link href="/" className="text-sm text-ink-muted hover:text-ink transition-colors">Home</Link>
          <Link href="/docs/self-hosted" className="text-sm font-semibold bg-ink text-cream px-4 py-2 rounded-lg hover:bg-ink-light transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      <div className="max-w-[800px] mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-[42px] font-bold mb-4" style={{ fontFamily: "var(--font-serif)" }}>Simple, transparent pricing</h1>
          <p className="text-ink-muted text-lg">Self-host for free forever. Duet Cloud coming soon.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-cream border border-border rounded-xl p-8">
            <div className="text-sm font-semibold text-ink-muted mb-2">Self-hosted</div>
            <div className="text-[40px] font-bold mb-1">Free</div>
            <div className="text-sm text-ink-faint mb-8">Open source, AGPLv3 License</div>
            <ul className="space-y-3 text-[14px] text-ink-muted mb-10">
              {[
                "Unlimited notes, todos, and agents",
                "Full MCP server with 12 tools",
                "CLI & REST API",
                "Google Calendar sync",
                "Rich text editor with images",
                "Real-time WebSocket updates",
                "Version history",
                "Your server, your data, full control",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="text-human mt-0.5 flex-shrink-0">✓</span> {item}
                </li>
              ))}
            </ul>
            <Link href="/docs/self-hosted" className="block text-center px-4 py-3 border border-border rounded-lg text-sm font-semibold hover:bg-cream-mid transition-colors">
              Get Started
            </Link>
          </div>

          <div className="bg-ink text-cream rounded-xl p-8 relative">
            <div className="absolute top-4 right-4 text-[10px] font-semibold bg-amber text-white px-2.5 py-1 rounded-full">Coming Soon</div>
            <div className="text-sm font-semibold text-cream/60 mb-2">Duet Cloud</div>
            <div className="text-[40px] font-bold mb-1">$8<span className="text-xl font-normal text-cream/40">/month</span></div>
            <div className="text-sm text-cream/40 mb-8">Zero setup, we handle everything</div>
            <ul className="space-y-3 text-[14px] text-cream/70 mb-10">
              {[
                "Everything in self-hosted",
                "No server to manage",
                "Automatic daily backups",
                "Sign in with Google & GitHub",
                "Managed file storage",
                "Automatic updates",
                "Priority email support",
                "Cancel anytime",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="text-amber mt-0.5 flex-shrink-0">✓</span> {item}
                </li>
              ))}
            </ul>
            <div className="px-4 py-3 rounded-lg text-sm font-semibold text-center text-amber border border-amber/20">Coming Soon</div>
          </div>
        </div>

        <div className="text-center mt-12 text-sm text-ink-faint">
          Questions? Check the <Link href="/docs" className="text-amber hover:underline">docs</Link> or open an issue on <a href="https://github.com/emreparker/duet" className="text-amber hover:underline">GitHub</a>.
        </div>
      </div>
    </div>
  );
}
