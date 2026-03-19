import { DocPage, CodeBlock } from "@/components/docs/DocPage";

export default function Page() {
  return (
    <DocPage slug="calendar" title="Google Calendar Sync">
      <p>
        Duet can sync todos with due dates to Google Calendar, giving you a unified view of your
        schedule. Agent-created events are automatically flagged so you know where they came from.
      </p>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Features</h2>
      <ul className="list-disc pl-5 space-y-1 mb-6">
        <li><strong>Two-way sync</strong> - changes in Duet update your calendar, and vice versa.</li>
        <li><strong>Agent-created events flagged</strong> - events created by agents are labeled so you can distinguish them from your own.</li>
        <li><strong>Automatic sync</strong> - whenever a todo with a due date is created or updated, the calendar syncs automatically.</li>
        <li><strong>Manual sync</strong> - trigger a sync at any time from settings or via the API.</li>
      </ul>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Step 1: Create a Google Cloud Project</h2>
      <ol className="list-decimal pl-5 space-y-2 mb-6">
        <li>
          Go to the{" "}
          <a href="https://console.cloud.google.com/" className="text-[#10b981] underline underline-offset-2" target="_blank" rel="noopener noreferrer">
            Google Cloud Console
          </a>.
        </li>
        <li>Click <strong>Select a project</strong> at the top, then <strong>New Project</strong>.</li>
        <li>Name it something like &quot;Duet Calendar&quot; and click <strong>Create</strong>.</li>
        <li>Select your new project from the project picker.</li>
      </ol>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Step 2: Enable the Google Calendar API</h2>
      <ol className="list-decimal pl-5 space-y-2 mb-6">
        <li>In the Cloud Console, go to <strong>APIs &amp; Services</strong> &gt; <strong>Library</strong>.</li>
        <li>Search for <strong>Google Calendar API</strong>.</li>
        <li>Click on it and press <strong>Enable</strong>.</li>
      </ol>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Step 3: Create OAuth 2.0 Credentials</h2>
      <ol className="list-decimal pl-5 space-y-2 mb-6">
        <li>Go to <strong>APIs &amp; Services</strong> &gt; <strong>Credentials</strong>.</li>
        <li>Click <strong>Create Credentials</strong> &gt; <strong>OAuth client ID</strong>.</li>
        <li>If prompted, configure the OAuth consent screen first:
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>User Type: <strong>External</strong> (or Internal if using Google Workspace)</li>
            <li>Fill in the required fields (app name, support email)</li>
            <li>Add the scope: <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">https://www.googleapis.com/auth/calendar</code></li>
            <li>Add your email as a test user</li>
          </ul>
        </li>
        <li>For Application type, select <strong>Web application</strong>.</li>
        <li>Name it &quot;Duet&quot;.</li>
        <li>
          Under <strong>Authorized redirect URIs</strong>, add your callback URL:
        </li>
      </ol>
      <CodeBlock>{`# For local development:
http://localhost:7777/api/calendar/callback

# For production (replace with your domain):
https://your-domain.com/api/calendar/callback`}</CodeBlock>
      <ol className="list-decimal pl-5 space-y-2 mb-6" start={7}>
        <li>Click <strong>Create</strong> and note down your <strong>Client ID</strong> and <strong>Client Secret</strong>.</li>
      </ol>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Step 4: Configure Environment Variables</h2>
      <p>Add the OAuth credentials to your Duet environment:</p>
      <CodeBlock>{`# In your .env file or environment:
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret`}</CodeBlock>
      <p className="mt-3">
        If you&apos;re using Docker, add these to your{" "}
        <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">.env</code> file.
        If deployed to Fly.io, use{" "}
        <code className="bg-[#f2f2f2] px-1.5 py-0.5 rounded text-[13px] font-mono">fly secrets set</code>.
      </p>
      <CodeBlock>{`# Fly.io
fly secrets set GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
fly secrets set GOOGLE_CLIENT_SECRET=your-client-secret`}</CodeBlock>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Step 5: Connect in Duet</h2>
      <ol className="list-decimal pl-5 space-y-2 mb-6">
        <li>Open Duet in your browser.</li>
        <li>Go to <strong>Settings</strong>.</li>
        <li>In the Google Calendar section, click <strong>Connect Google Calendar</strong>.</li>
        <li>You&apos;ll be redirected to Google to authorize access.</li>
        <li>Grant Duet permission to manage your calendar events.</li>
        <li>You&apos;ll be redirected back to Duet. The connection status should show as connected.</li>
      </ol>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>How Sync Works</h2>
      <ul className="list-disc pl-5 space-y-2 mb-6">
        <li>When you create or update a todo with a <strong>due date</strong>, a corresponding calendar event is created or updated automatically.</li>
        <li>When you mark a todo as <strong>done</strong>, the calendar event is updated to reflect completion.</li>
        <li>Events created by agents include an <strong>[Agent]</strong> prefix in the event title so they stand out.</li>
        <li>Deleting a todo removes its associated calendar event.</li>
      </ul>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>API Endpoints</h2>
      <p>You can also manage the calendar integration via the API:</p>
      <div className="rounded-xl border border-[#e5e5e5] overflow-hidden my-4">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
              <th className="text-left px-4 py-2 font-semibold">Endpoint</th>
              <th className="text-left px-4 py-2 font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["GET /api/calendar/auth-url", "Get the OAuth authorization URL"],
              ["GET /api/calendar/callback", "OAuth callback (redirect target)"],
              ["GET /api/calendar/status", "Check if calendar is connected"],
              ["POST /api/calendar/sync", "Trigger a manual sync"],
              ["POST /api/calendar/disconnect", "Disconnect Google Calendar"],
            ].map(([endpoint, desc]) => (
              <tr key={endpoint} className="border-b border-[#f0f0f0] last:border-0">
                <td className="px-4 py-2 font-mono text-[12px]">{endpoint}</td>
                <td className="px-4 py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CodeBlock>{`# Check connection status
curl http://localhost:7777/api/calendar/status -b cookies.txt

# Trigger a manual sync
curl -X POST http://localhost:7777/api/calendar/sync -b cookies.txt`}</CodeBlock>

      <h2 className="text-[22px] font-bold mt-10 mb-3" style={{ fontFamily: "var(--font-sans)" }}>Troubleshooting</h2>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>OAuth error: redirect_uri_mismatch</strong> - make sure the redirect URI in your Google Cloud Console
          exactly matches your Duet callback URL, including the protocol and port.
        </li>
        <li>
          <strong>Events not appearing</strong> - verify the todo has a due date set. Only todos with due dates are synced to the calendar.
        </li>
        <li>
          <strong>Token expired</strong> - Duet automatically refreshes OAuth tokens. If issues persist, disconnect and reconnect the calendar from Settings.
        </li>
        <li>
          <strong>Test user restriction</strong> - if your OAuth consent screen is in &quot;Testing&quot; mode, only users added as test users can authorize the app. Add your Google account as a test user or publish the app.
        </li>
      </ul>
    </DocPage>
  );
}
