import { DocPage, CodeBlock } from "@/components/docs/DocPage";

export default function Page() {
  return (
    <DocPage slug="deploy-docker" title="Docker Deployment">
      <p>
        Deploy Duet with Docker Compose in minutes. This setup includes PostgreSQL and the Duet application
        in containers, with data persisted in Docker volumes.
      </p>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Prerequisites</h2>
      <ul className="list-disc pl-5 space-y-1 mb-6">
        <li><strong>Docker</strong> - version 20.10 or later</li>
        <li><strong>Docker Compose</strong> - version 2.0 or later (included with Docker Desktop)</li>
      </ul>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Step 1: Clone the Repository</h2>
      <CodeBlock>{`git clone https://github.com/emreparker/duet.git
cd duet`}</CodeBlock>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Step 2: Configure Environment</h2>
      <p>Copy the example environment file and edit it:</p>
      <CodeBlock>{`cp .env.example .env`}</CodeBlock>
      <p className="mt-3">
        Open <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">.env</code> and
        set your <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">SESSION_SECRET</code>.
        This is used to sign session cookies and should be a long, random string:
      </p>
      <CodeBlock>{`# Generate a random secret
openssl rand -base64 32

# Add it to your .env
SESSION_SECRET=your-generated-random-string`}</CodeBlock>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Step 3: Start Duet</h2>
      <CodeBlock>{`docker compose up -d`}</CodeBlock>
      <p className="mt-3">
        This starts two containers: a PostgreSQL database and the Duet application. The database
        is automatically initialized with the required schema.
      </p>
      <p className="mt-3">Check that everything is running:</p>
      <CodeBlock>{`docker compose ps

# Check logs
docker compose logs -f duet`}</CodeBlock>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Step 4: Initial Setup</h2>
      <ol className="list-decimal pl-5 space-y-2 mb-6">
        <li>
          Open{" "}
          <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">http://localhost:7777</code>{" "}
          in your browser.
        </li>
        <li>Set your password on the setup screen. This is the only password - Duet is single-user.</li>
        <li>You&apos;re in. Start creating notes.</li>
      </ol>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Step 5: Register an Agent</h2>
      <ol className="list-decimal pl-5 space-y-2 mb-6">
        <li>In the Duet UI, go to <strong>Agents</strong> in the sidebar.</li>
        <li>Click <strong>Register Agent</strong> and enter a name (e.g. &quot;claude&quot;).</li>
        <li>Copy the API key - it is only shown once.</li>
        <li>Configure your MCP client with the API key. See the{" "}
          <a href="/docs/mcp-setup" className="text-[#10b981] underline underline-offset-2">MCP Setup</a> guide.
        </li>
      </ol>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Docker Compose Architecture</h2>
      <p>
        The <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">docker-compose.yml</code> creates:
      </p>
      <ul className="list-disc pl-5 space-y-1 my-4">
        <li><strong>duet</strong> - the application container (Node.js, Hono API, Next.js frontend)</li>
        <li><strong>postgres</strong> - PostgreSQL 16 database</li>
        <li><strong>duet_data</strong> - a named volume for PostgreSQL data persistence</li>
      </ul>
      <p>Data persists across container restarts in the Docker volume. Removing the containers does not delete your data.</p>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Managing the Deployment</h2>
      <CodeBlock>{`# Stop Duet (preserves data)
docker compose stop

# Start again
docker compose start

# Restart
docker compose restart

# Update to latest version
git pull
docker compose up -d --build

# View logs
docker compose logs -f duet

# Destroy everything (WARNING: deletes all data)
docker compose down -v`}</CodeBlock>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Production Tips</h2>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>Use a Strong SESSION_SECRET</h3>
      <p>
        The session secret is used to sign cookies. In production, use a cryptographically random string
        of at least 32 characters. Never share it or commit it to version control.
      </p>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>Set Up a Reverse Proxy with HTTPS</h3>
      <p>
        For production, put Duet behind a reverse proxy like{" "}
        <strong>Caddy</strong> or <strong>nginx</strong> with TLS termination.
      </p>
      <p className="mt-3">Example Caddyfile:</p>
      <CodeBlock>{`duet.yourdomain.com {
    reverse_proxy localhost:7777
}`}</CodeBlock>
      <p className="mt-3">Caddy automatically provisions and renews Let&apos;s Encrypt certificates.</p>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>Back Up PostgreSQL</h3>
      <p>Set up regular backups of the PostgreSQL volume or use <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">pg_dump</code>:</p>
      <CodeBlock>{`# Backup
docker compose exec postgres pg_dump -U duet duet > backup.sql

# Restore
cat backup.sql | docker compose exec -T postgres psql -U duet duet`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>Google Calendar (Optional)</h3>
      <p>To enable Google Calendar sync, add the OAuth credentials to your <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">.env</code>:</p>
      <CodeBlock>{`GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret`}</CodeBlock>
      <p className="mt-3">
        Then restart with{" "}
        <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">docker compose up -d</code>.
        See the{" "}
        <a href="/docs/calendar" className="text-[#10b981] underline underline-offset-2">Google Calendar Sync</a> guide
        for full setup instructions.
      </p>
    </DocPage>
  );
}
