import { DocPage, CodeBlock } from "@/components/docs/DocPage";

export default function Page() {
  return (
    <DocPage slug="deploy-fly" title="Fly.io Deployment">
      <p>
        Deploy Duet to Fly.io for a managed, globally distributed setup. Fly.io handles TLS, scaling,
        and infrastructure so you can focus on your notes.
      </p>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Prerequisites</h2>
      <ul className="list-disc pl-5 space-y-1 mb-6">
        <li>
          <strong>flyctl</strong> - install from{" "}
          <a href="https://fly.io/docs/flyctl/install/" className="text-[#10b981] underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            fly.io/docs/flyctl/install
          </a>
        </li>
        <li><strong>Fly.io account</strong> - sign up at{" "}
          <a href="https://fly.io" className="text-[#10b981] underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            fly.io
          </a>
        </li>
      </ul>
      <p>Verify flyctl is installed:</p>
      <CodeBlock>{`flyctl version`}</CodeBlock>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Step 1: Clone the Repository</h2>
      <CodeBlock>{`git clone https://github.com/emreparker/duet.git
cd duet`}</CodeBlock>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Step 2: Launch on Fly.io</h2>
      <p>
        The repository includes a{" "}
        <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">fly.toml</code>{" "}
        configuration file. Run the launch command to set up your Fly app:
      </p>
      <CodeBlock>{`fly launch`}</CodeBlock>
      <p className="mt-3">
        This will detect the existing{" "}
        <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">fly.toml</code> and
        prompt you to confirm settings. Accept the defaults or customize the app name and region.
      </p>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Step 3: Create a PostgreSQL Database</h2>
      <p>Create a Fly Postgres cluster and attach it to your app:</p>
      <CodeBlock>{`# Create the database
fly postgres create --name duet-db

# Attach it to your app (sets DATABASE_URL automatically)
fly postgres attach duet-db`}</CodeBlock>
      <p className="mt-3">
        Attaching the database automatically sets the{" "}
        <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">DATABASE_URL</code>{" "}
        secret on your app.
      </p>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Step 4: Set Secrets</h2>
      <p>
        Set the session secret used for signing cookies:
      </p>
      <CodeBlock>{`# Generate a random secret and set it
fly secrets set SESSION_SECRET=$(openssl rand -base64 32)`}</CodeBlock>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Step 5: Deploy</h2>
      <CodeBlock>{`fly deploy`}</CodeBlock>
      <p className="mt-3">
        Fly will build and deploy your app. The first deploy may take a few minutes as it builds the
        Docker image. Subsequent deploys are faster.
      </p>
      <p className="mt-3">Check the deployment status:</p>
      <CodeBlock>{`fly status`}</CodeBlock>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Step 6: Open Duet</h2>
      <p>
        Your app is now live. Open it in your browser:
      </p>
      <CodeBlock>{`fly open`}</CodeBlock>
      <p className="mt-3">
        Or visit{" "}
        <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">https://your-app-name.fly.dev</code>{" "}
        directly. Set your password on the first visit and start using Duet.
      </p>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Google Calendar (Optional)</h2>
      <p>To enable Google Calendar sync, set the OAuth credentials as secrets:</p>
      <CodeBlock>{`fly secrets set \\
  GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com \\
  GOOGLE_CLIENT_SECRET=your-client-secret`}</CodeBlock>
      <p className="mt-3">
        Make sure your Google Cloud OAuth redirect URI is set to{" "}
        <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">https://your-app-name.fly.dev/api/calendar/callback</code>.
        See the{" "}
        <a href="/docs/calendar" className="text-[#10b981] underline underline-offset-2">Google Calendar Sync</a> guide
        for full setup.
      </p>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Managing Your Deployment</h2>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>View Logs</h3>
      <CodeBlock>{`fly logs`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>SSH into the Container</h3>
      <CodeBlock>{`fly ssh console`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>Update to Latest Version</h3>
      <CodeBlock>{`git pull
fly deploy`}</CodeBlock>

      <h3 className="text-[18px] font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-sans)" }}>Connect to the Database</h3>
      <CodeBlock>{`fly postgres connect -a duet-db`}</CodeBlock>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Scaling</h2>
      <p>Fly.io makes it easy to adjust resources:</p>
      <CodeBlock>{`# Set the number of instances
fly scale count 1

# Adjust memory (in MB)
fly scale memory 512

# Change VM size
fly scale vm shared-cpu-1x`}</CodeBlock>
      <p className="mt-3">
        Duet is designed to run efficiently as a single instance. For most single-user setups, the default
        resources are more than sufficient.
      </p>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Custom Domain</h2>
      <p>To use your own domain instead of the default <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">.fly.dev</code> subdomain:</p>
      <CodeBlock>{`# Add your domain
fly certs add duet.yourdomain.com`}</CodeBlock>
      <p className="mt-3">
        Then add a CNAME record for your domain pointing to your Fly app. Fly automatically provisions
        and renews TLS certificates.
      </p>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Database Backups</h2>
      <p>Fly Postgres includes daily automatic snapshots. You can also take manual snapshots:</p>
      <CodeBlock>{`# List existing snapshots
fly postgres snapshots list -a duet-db

# Create a manual backup using pg_dump
fly postgres connect -a duet-db -c "pg_dump -U duet duet" > backup.sql`}</CodeBlock>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Environment Variables Reference</h2>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Variable</th>
              <th className="text-left px-4 py-2 font-semibold">Required</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["DATABASE_URL", "Auto", "Set automatically by fly postgres attach"],
              ["SESSION_SECRET", "Yes", "Secret for signing session cookies"],
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
