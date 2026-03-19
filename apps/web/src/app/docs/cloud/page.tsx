import { DocPage } from "@/components/docs/DocPage";

export default function Page() {
  return (
    <DocPage slug="cloud" title="Duet Cloud (Coming Soon)">
      <p>
        <strong>Duet Cloud</strong> is the fully managed version of Duet, hosted at{" "}
        <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">noteduet.com</code>.
        No servers, no databases, no configuration. Just sign up and start collaborating with your AI agents.
      </p>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>What You Get</h2>
      <div className="grid grid-cols-1 gap-3 my-6">
        {[
          ["Zero Setup", "No Docker, no PostgreSQL, no environment variables. Create an account and you're running in seconds."],
          ["Automatic Backups", "Your notes are continuously backed up. Never worry about data loss again."],
          ["Google & GitHub Login", "Sign in with your existing accounts. No passwords to remember."],
          ["Managed File Storage", "Upload images and attachments without configuring S3 buckets or storage volumes."],
          ["Automatic Updates", "Always on the latest version. New features and security patches are deployed instantly."],
          ["Priority Support", "Get direct help from the Duet team when you need it."],
        ].map(([title, desc]) => (
          <div key={title} className="border border-[#e5e5e5] rounded-xl p-4">
            <div className="font-semibold text-[14px] mb-1" style={{ fontFamily: "var(--font-sans)" }}>{title}</div>
            <div className="text-[14px] text-[#666]">{desc}</div>
          </div>
        ))}
      </div>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>MCP Setup for Cloud</h2>
      <p>
        When Duet Cloud launches, connecting your AI agents will be as simple as adding your Cloud API key
        to your MCP client configuration. See the{" "}
        <a href="/docs/mcp-setup" className="text-[#10b981] underline underline-offset-2">MCP Setup</a> page
        for a preview of how configuration works.
      </p>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Self-hosted vs Cloud</h2>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Feature</th>
              <th className="text-left px-4 py-2 font-semibold">Self-hosted</th>
              <th className="text-left px-4 py-2 font-semibold">Cloud</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Setup", "Docker/manual install", "Instant"],
              ["Hosting", "You manage", "Managed by Duet"],
              ["Backups", "You configure", "Automatic"],
              ["Updates", "Manual", "Automatic"],
              ["Data location", "Your server", "Duet Cloud (US/EU)"],
              ["Price", "Free (open source)", "TBD"],
              ["MCP Server", "Direct database access", "Remote API"],
            ].map(([feature, selfHosted, cloud]) => (
              <tr key={feature} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-2 font-medium">{feature}</td>
                <td className="px-4 py-2">{selfHosted}</td>
                <td className="px-4 py-2">{cloud}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Get Notified at Launch</h2>
      <p className="mb-4">Enter your email to be the first to know when Duet Cloud launches.</p>
      <div className="flex gap-2 max-w-md my-4">
        <input
          type="email"
          placeholder="you@example.com"
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#e5e5e5] text-[14px] focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        />
        <button
          className="px-5 py-2.5 bg-[#1a1a1a] text-white rounded-xl text-[14px] font-medium hover:bg-[#333] transition-colors whitespace-nowrap"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Notify Me
        </button>
      </div>
      <p className="text-[13px] text-[#999] mt-2">
        No spam. We&apos;ll only email you when Duet Cloud is ready.
      </p>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Can&apos;t Wait?</h2>
      <p>
        You can start using Duet today by self-hosting. It&apos;s free, open source, and takes under 5 minutes
        to set up. Check the{" "}
        <a href="/docs/self-hosted" className="text-[#10b981] underline underline-offset-2">Self-hosted Setup</a> guide
        to get started.
      </p>
    </DocPage>
  );
}
