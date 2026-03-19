import { DocPage, CodeBlock } from "@/components/docs/DocPage";

export default function SelfHostedPage() {
  return (
    <DocPage slug="self-hosted" title="Self-hosted Setup">
      <p>Get Duet running on your own server in under 5 minutes.</p>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Prerequisites</h2>
      <ul className="list-disc pl-5 space-y-1 mb-6">
        <li>Docker and Docker Compose</li>
        <li>Or: Node.js 22+ and PostgreSQL 16+</li>
      </ul>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Option 1: Docker Compose</h2>
      <CodeBlock>{`# Clone the repo
git clone https://github.com/emreparker/duet.git
cd duet

# Start everything
docker compose up -d`}</CodeBlock>
      <p>Duet is now running at <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">http://localhost:7777</code>. Open it in your browser and set your password.</p>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Option 2: Manual Setup</h2>
      <CodeBlock>{`# Clone and install
git clone https://github.com/emreparker/duet.git
cd duet
pnpm install

# Create database
createdb duet_dev

# Run migrations
DATABASE_URL="postgresql://localhost:5432/duet_dev" pnpm db:migrate

# Start the server
DATABASE_URL="postgresql://localhost:5432/duet_dev" pnpm dev:core`}</CodeBlock>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Environment Variables</h2>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead><tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
            <th className="text-left px-4 py-2 font-semibold">Variable</th>
            <th className="text-left px-4 py-2 font-semibold">Required</th>
            <th className="text-left px-4 py-2 font-semibold">Description</th>
          </tr></thead>
          <tbody>
            {[
              ["DATABASE_URL", "Yes", "PostgreSQL connection string"],
              ["PORT", "No", "Server port (default 7777)"],
              ["SESSION_SECRET", "No", "Secret for session cookies"],
              ["GOOGLE_CLIENT_ID", "No", "For Google Calendar sync"],
              ["GOOGLE_CLIENT_SECRET", "No", "For Google Calendar sync"],
            ].map(([v, r, d]) => (
              <tr key={v} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-2 font-mono text-[12px]">{v}</td>
                <td className="px-4 py-2">{r}</td>
                <td className="px-4 py-2">{d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DocPage>
  );
}
