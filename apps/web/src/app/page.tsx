"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FileText, Search, Pencil, Archive, ListTodo, CheckCircle, ClipboardList, RefreshCw, Activity, History, BookOpen, FilePlus } from "lucide-react";

/* ── Logo ── */
function Logo({ s = 18 }: { s?: number }) {
  return (
    <span className="inline-flex items-baseline gap-[1px] select-none">
      <span style={{ fontSize: s * 1.4 }} className="font-light text-[#10b981] leading-none">{"["}</span>
      <span style={{ fontSize: s }} className="font-extrabold tracking-tight text-[#1a1a1a] leading-none">duet</span>
      <span style={{ fontSize: s * 1.4 }} className="font-light text-[#a78bfa] leading-none">{"]"}</span>
    </span>
  );
}

/* ── Scroll reveal ── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Card ── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-[20px] border border-[#e0e0e0] bg-white ${className}`}>{children}</div>;
}

/* ── Data ── */
const TOOLS = [
  { name: "create_note", icon: FilePlus },
  { name: "read_note", icon: FileText },
  { name: "update_note", icon: Pencil },
  { name: "search_notes", icon: Search },
  { name: "list_notes", icon: BookOpen },
  { name: "archive_note", icon: Archive },
  { name: "create_todo", icon: ListTodo },
  { name: "complete_todo", icon: CheckCircle },
  { name: "list_todos", icon: ClipboardList },
  { name: "update_todo", icon: RefreshCw },
  { name: "get_activity", icon: Activity },
  { name: "get_history", icon: History },
];

const FEATURES = [
  { title: "Real-time sync", desc: "Agent writes a note? You see it instantly. WebSocket push via PostgreSQL LISTEN/NOTIFY.", icon: "◉" },
  { title: "CLI & API", desc: "Full command line. Pipe-friendly. JSON output. Complete REST API for any integration.", icon: "▸" },
  { title: "Calendar sync", desc: "Todos sync to Google Calendar. Agent events flagged. Two-way sync.", icon: "◷" },
  { title: "Rich editor", desc: "Headings, lists, checklists, code blocks, images. Drag blocks to reorder.", icon: "✎" },
  { title: "Version history", desc: "Every edit tracked with author. Restore any version. Full diff timeline.", icon: "↺" },
  { title: "Full-text search", desc: "PostgreSQL tsvector powered. Instant search across all your notes.", icon: "⌕" },
];

const FAQ = [
  { q: "What is Duet?", a: "A self-hosted note-taking app with a built-in MCP server. AI agents read, write, and collaborate on notes - with full attribution and permission control." },
  { q: "What is MCP?", a: "Model Context Protocol - an open standard for AI agent tool use. Duet exposes 12 tools for notes and todo management." },
  { q: "Can agents delete notes?", a: "No. Agents can read, write, and archive - never delete. This is a core safety boundary that can't be overridden." },
  { q: "What agents work with Duet?", a: "Any MCP client: Claude Code, Cursor, VS Code, OpenClaw, or any custom agent that speaks MCP." },
  { q: "Is it free?", a: "Self-hosted is free and open source under the AGPLv3 license. Duet Cloud (hosted version) is coming soon at $8/mo." },
  { q: "Can I export my data?", a: "Yes. CLI, API, or direct database access. No lock-in, ever." },
];

/* ── Demo notes for interactive preview ── */
const DEMO_NOTES = [
  { id: 0, dot: "bg-[#8b5cf6]", who: "agent:claude", badge: "bg-[#ede9fe] text-[#5b21b6]", title: "Research Notes", preview: "Found papers on multi-agent...", content: "Found several papers on <strong>multi-agent collaboration</strong>. The ReAct framework shows promise for combining reasoning and action in autonomous agents.", heading: "Key Findings", bullets: ["ReAct improves task completion by 30%", "MCP protocols outperform custom integrations", "Clear attribution is essential for human-agent trust"] },
  { id: 1, dot: "bg-[#10b981]", who: "you", badge: "bg-[#ecfdf5] text-[#065f46]", title: "Sprint Planning", preview: "Discussed deploy timeline...", content: "Team aligned on the deployment timeline for Q2. Main focus areas are performance optimization and the new agent dashboard.", heading: "Action Items", bullets: ["Deploy staging by Friday", "Run load tests on WebSocket connections", "Review agent permission model with security team"] },
  { id: 2, dot: "bg-[#10b981]", who: "you", badge: "bg-[#ecfdf5] text-[#065f46]", title: "Deploy Checklist", preview: "1. Run migrations 2. Env vars...", content: "Standard deployment checklist for production releases. Follow these steps in order.", heading: "Steps", bullets: ["Run database migrations", "Update environment variables", "Verify health check endpoint", "Monitor error rates for 30 minutes"] },
];

export default function LandingPage() {
  const [faq, setFaq] = useState<number | null>(null);
  const [activeNote, setActiveNote] = useState(0);
  const [demoTab, setDemoTab] = useState<"notes" | "todos" | "activity">("notes");

  return (
    <div className="min-h-screen bg-[#f8f8f8] text-[#1a1a1a] select-none scroll-smooth" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#f8f8f8]/80 backdrop-blur-2xl border-b border-[#e0e0e0]/60">
        <div className="max-w-[1240px] mx-auto px-8 h-[64px] flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-8">
            {["Features", "Pricing"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-[13px] text-[#333] hover:text-[#1a1a1a] transition-colors hidden md:block cursor-pointer">{l}</a>
            ))}
            <Link href="/docs" className="text-[13px] text-[#333] hover:text-[#1a1a1a] transition-colors hidden md:block">Docs</Link>
            <a href="https://github.com/emreparker/duet" className="text-[13px] text-[#333] hover:text-[#1a1a1a] transition-colors hidden md:block">GitHub</a>
            <Link href="/docs/self-hosted" className="text-[13px] font-semibold bg-[#1a1a1a] text-white px-5 py-[9px] rounded-full hover:bg-[#333] transition-colors cursor-pointer">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative px-8 overflow-hidden" style={{ minHeight: "100vh", paddingTop: "160px", paddingBottom: "60px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {/* Hero video background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-[0.4]" onError={(e) => { (e.target as HTMLVideoElement).style.display = 'none'; }}>
            <source src="/hero-loop.mp4" type="video/mp4" />
          </video>
        </div>
        {/* Gradient overlay to fade video edges */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "linear-gradient(to bottom, #f8f8f8 0%, transparent 20%, transparent 80%, #f8f8f8 100%)"
        }} />

        <div className="relative z-10 max-w-[820px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#e0e0e0] bg-white text-[12px] text-[#333] mb-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <span className="w-[6px] h-[6px] rounded-full bg-[#10b981] animate-pulse" />
            Open source · AGPLv3 Licensed
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(42px,7vw,84px)] font-extrabold leading-[0.96] tracking-[-0.05em] mb-7"
          >
            Notes for
            <br />
            <span className="text-[#10b981]">humans</span>
            {" "}<span className="text-[#1a1a1a]">&</span>{" "}
            <span className="text-[#a78bfa]" style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 500 }}>agents</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-[17px] md:text-[18px] leading-[1.7] text-[#333] max-w-[480px] mx-auto mb-10"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            The note-taking app with a built-in MCP server. Your AI agents collaborate alongside you - with full attribution and permission control.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <Link href="/docs/self-hosted" className="group inline-flex items-center gap-2 px-8 py-[14px] rounded-full text-[14px] font-semibold bg-[#1a1a1a] text-white hover:bg-[#333] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_2px_16px_rgba(0,0,0,0.1)] cursor-pointer">
              Get Started
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" d="M5 12h14m-4-4l4 4-4 4" /></svg>
            </Link>
            <a href="https://github.com/emreparker/duet" className="inline-flex items-center gap-2 px-8 py-[14px] rounded-full text-[14px] font-medium border border-[#e0e0e0] bg-white text-[#333] hover:text-[#1a1a1a] hover:border-[#c0c0c0] transition-all cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
              Star on GitHub
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══ APP PREVIEW (below hero, visible on scroll) ═══ */}
      <section className="px-8 pb-20 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-[1040px] mx-auto mt-16"
        >
          <Card className="shadow-[0_24px_80px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="flex items-center gap-[6px] px-5 py-3 border-b border-[#eee] bg-[#fafafa]">
              <span className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#febc2e]" />
              <span className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
              <span className="ml-auto text-[11px] text-[#333] tracking-wide">duet</span>
            </div>
            <div className="flex bg-white" style={{ height: "400px" }}>
              {/* Sidebar */}
              <div className="w-[155px] border-r border-[#f0f0f0] bg-[#fafafa] p-4 hidden md:flex flex-col gap-4">
                <Logo s={12} />
                <div className="space-y-[2px] text-[11px]">
                  {(["notes", "todos", "activity"] as const).map((tab) => (
                    <div
                      key={tab}
                      onClick={() => setDemoTab(tab)}
                      className={`px-3 py-[7px] rounded-xl cursor-pointer transition-colors ${demoTab === tab ? "bg-[#eee] text-[#1a1a1a] font-medium" : "text-[#666] hover:text-[#333] hover:bg-[#f5f5f5]"}`}
                    >
                      {tab === "notes" ? "All Notes" : tab === "todos" ? "Todos" : "Activity"}
                    </div>
                  ))}
                </div>
                <div className="mt-auto">
                  <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#aaa] mb-2 px-3">Agents</div>
                  <div className="px-3 py-1 text-[11px] text-[#666] flex items-center gap-1.5"><span className="w-[5px] h-[5px] rounded-full bg-[#8b5cf6]" />claude</div>
                </div>
              </div>
              {/* List panel - changes based on demoTab */}
              <div className="w-[210px] border-r border-[#f0f0f0] p-3 hidden sm:block">
                <motion.div key={demoTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                  {demoTab === "notes" && (
                    <>
                      <div className="text-[12px] font-bold text-[#333] mb-4 px-1">All Notes</div>
                      {DEMO_NOTES.map((n) => (
                        <motion.div key={n.id} onClick={() => setActiveNote(n.id)} className={`px-3 py-2.5 rounded-xl mb-[3px] cursor-pointer transition-colors ${activeNote === n.id ? "bg-[#f0f0f0]" : "hover:bg-[#f8f8f8]"}`} whileTap={{ scale: 0.98 }}>
                          <div className="flex items-center gap-1 text-[9px] text-[#999] mb-[3px]"><span className={`w-[4px] h-[4px] rounded-full ${n.dot}`} />{n.who}</div>
                          <div className="text-[11px] font-semibold text-[#333] leading-snug">{n.title}</div>
                          <div className="text-[9px] text-[#999] mt-[2px]">{n.preview}</div>
                        </motion.div>
                      ))}
                    </>
                  )}
                  {demoTab === "todos" && (
                    <>
                      <div className="text-[12px] font-bold text-[#333] mb-4 px-1">Todos</div>
                      {[
                        { done: false, text: "Review agent research", priority: "high", who: "you" },
                        { done: true, text: "Deploy to staging", priority: "medium", who: "you" },
                        { done: false, text: "Update API docs", priority: "low", who: "agent:claude" },
                        { done: false, text: "Run load tests", priority: "high", who: "you" },
                      ].map((t, i) => (
                        <div key={i} className="px-3 py-2 rounded-xl mb-[3px] flex items-start gap-2">
                          <div className={`w-[14px] h-[14px] rounded border-2 mt-[2px] flex-shrink-0 flex items-center justify-center ${t.done ? "bg-[#10b981] border-[#10b981]" : "border-[#ddd]"}`}>
                            {t.done && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <div>
                            <div className={`text-[11px] leading-snug ${t.done ? "line-through text-[#bbb]" : "text-[#333] font-medium"}`}>{t.text}</div>
                            <div className="text-[9px] text-[#999] mt-[1px]">{t.priority} · {t.who}</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  {demoTab === "activity" && (
                    <>
                      <div className="text-[12px] font-bold text-[#333] mb-4 px-1">Activity</div>
                      {[
                        { icon: "✏️", text: "You edited \"Sprint Planning\"", time: "2m" },
                        { icon: "📝", text: "agent:claude created \"Research Notes\"", time: "1h" },
                        { icon: "✅", text: "You completed \"Deploy to staging\"", time: "3h" },
                        { icon: "🤖", text: "You registered agent \"claude\"", time: "1d" },
                      ].map((a, i) => (
                        <div key={i} className="px-3 py-2 rounded-xl mb-[3px] text-[10px]">
                          <div className="flex items-start gap-2">
                            <span className="text-[12px]">{a.icon}</span>
                            <div>
                              <div className="text-[#333] leading-snug">{a.text}</div>
                              <div className="text-[#999] mt-[1px]">{a.time} ago</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </motion.div>
              </div>
              {/* Editor - reactive to selected note */}
              <div className="flex-1 p-6 overflow-hidden select-text">
                <motion.div
                  key={activeNote}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-[18px] font-bold text-[#1a1a1a] mb-3 tracking-tight">{DEMO_NOTES[activeNote].title}</div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-[9px] px-2 py-[3px] rounded-lg font-semibold flex items-center gap-1 ${DEMO_NOTES[activeNote].badge}`}>
                      <span className={`w-[4px] h-[4px] rounded-full ${DEMO_NOTES[activeNote].dot}`} />{DEMO_NOTES[activeNote].who}
                    </span>
                    <span className="text-[10px] text-[#333]">v3 · Mar 15</span>
                  </div>
                  <div className="h-px bg-[#f0f0f0] mb-4" />
                  <div className="text-[12px] leading-[2] text-[#333]" style={{ fontFamily: "var(--font-serif)" }}>
                    <p dangerouslySetInnerHTML={{ __html: DEMO_NOTES[activeNote].content }} />
                    <p className="mt-3 text-[13px] font-bold text-[#1a1a1a]" style={{ fontFamily: "var(--font-sans)" }}>{DEMO_NOTES[activeNote].heading}</p>
                    <ul className="mt-1.5 space-y-[3px] list-disc pl-4">
                      {DEMO_NOTES[activeNote].bullets.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* ═══ WORKS WITH ═══ */}

      <Reveal>
        <section className="py-12 mt-8 border-y border-[#e0e0e0]">
          <div className="max-w-[1240px] mx-auto px-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            <span className="text-[11px] text-[#333] uppercase tracking-[0.2em] font-bold">Works with</span>
            {[
              { name: "Claude", favicon: "https://www.anthropic.com/favicon.ico" },
              { name: "Cursor", favicon: "https://www.cursor.com/favicon.ico" },
              { name: "VS Code", favicon: "https://code.visualstudio.com/favicon.ico" },
              { name: "Any MCP client", favicon: null },
            ].map((item) => (
              <span key={item.name} className="text-[14px] text-[#333] font-medium flex items-center gap-2.5">
                {item.favicon ? (
                  <img src={item.favicon} alt={item.name} className="w-5 h-5 rounded" />
                ) : (
                  <svg className="w-5 h-5 text-[#a78bfa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
                {item.name}
              </span>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ═══ WHY DUET ═══ */}
      <section className="py-32 px-8">
        <div className="max-w-[960px] mx-auto">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#10b981] mb-6">Why Duet</p>
            <h2 className="text-[clamp(30px,5vw,54px)] font-extrabold tracking-[-0.045em] leading-[1.05] mb-5">
              The notes app that<br />speaks <span className="text-[#a78bfa]">MCP</span>.
            </h2>
            <p className="text-[#333] text-[17px] mb-20 max-w-[480px] leading-relaxed" style={{ fontFamily: "var(--font-serif)" }}>Traditional note apps weren't designed for AI agents.</p>
          </Reveal>

          <Reveal delay={0.12}>
            <Card className="overflow-hidden">
              <div className="grid grid-cols-[1.2fr_1fr_1.3fr] text-[10px] font-bold uppercase tracking-[0.2em] border-b border-[#eee] bg-[#fafafa]">
                <div className="px-6 py-4 text-[#333]" />
                <div className="px-6 py-4 text-[#333] border-l border-[#eee]">Traditional</div>
                <div className="px-6 py-4 text-[#10b981] border-l border-[#eee]">Duet</div>
              </div>
              {[
                ["Agent access", "None", "Built-in MCP server, 12 tools"],
                ["Attribution", "No tracking", "Per-note, per-edit author tracking"],
                ["Permissions", "All or nothing", "Granular - agents can't delete"],
                ["Real-time", "Manual refresh", "WebSocket push updates"],
                ["Data", "Their servers", "Your PostgreSQL, your server"],
                ["Extensibility", "Plugins maybe", "CLI, REST API, MCP, webhooks"],
              ].map(([f, o, d], i) => (
                <motion.div
                  key={i}
                  className="grid grid-cols-[1.2fr_1fr_1.3fr] text-[14px] border-b border-[#f3f3f3] last:border-0 hover:bg-[#fafafa] transition-colors"
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.04 * i, duration: 0.4 }}
                >
                  <div className="px-6 py-[16px] font-semibold text-[#333]">{f}</div>
                  <div className="px-6 py-[16px] text-[#333] border-l border-[#f3f3f3]">{o}</div>
                  <div className="px-6 py-[16px] text-[#333] border-l border-[#f3f3f3] bg-[#f0fdf4]/40">{d}</div>
                </motion.div>
              ))}
            </Card>
          </Reveal>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-32 px-8 bg-white">
        <div className="max-w-[1140px] mx-auto">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#a78bfa] mb-6">Features</p>
            <h2 className="text-[clamp(30px,5vw,54px)] font-extrabold tracking-[-0.045em] leading-[1.05] mb-20">
              Everything you need to<br />build with agents.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <Reveal delay={0.08}>
              <div className="rounded-[20px] border border-[#e0e0e0] bg-[#fafafa] p-10 min-h-[380px] flex flex-col relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#a78bfa]/[0.04] blur-[50px] pointer-events-none" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a78bfa] mb-5">MCP Server</p>
                <h3 className="text-[26px] font-bold tracking-tight leading-[1.2] mb-4">Your agents write alongside you.</h3>
                <p className="text-[15px] text-[#333] leading-relaxed mb-8 max-w-[340px]" style={{ fontFamily: "var(--font-serif)" }}>12 tools out of the box. Any MCP-compatible agent connects in seconds.</p>
                <code className="text-[12px] px-5 py-3 rounded-2xl bg-white border border-[#e0e0e0] inline-block font-mono text-[#333] mt-auto self-start shadow-sm">
                  <span className="text-[#333]">$ </span>npx @noteduet/mcp-server
                </code>
              </div>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="rounded-[20px] border border-[#e0e0e0] bg-[#fafafa] p-10 min-h-[380px] flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#333] mb-5">12 Tools</p>
                <div className="grid grid-cols-2 gap-[6px] mt-auto">
                  {TOOLS.map((t) => (
                    <motion.div key={t.name} className="text-[11px] font-mono px-4 py-[10px] rounded-2xl bg-white border border-[#e0e0e0] text-[#333] hover:text-[#8b5cf6] hover:border-[#a78bfa]/40 hover:shadow-[0_2px_12px_rgba(139,92,246,0.1)] transition-all cursor-default flex items-center gap-2 group" whileHover={{ scale: 1.02 }}>
                      <t.icon className="w-3.5 h-3.5 text-[#999] group-hover:text-[#a78bfa] transition-colors" />
                      {t.name}
                    </motion.div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <Reveal delay={0.1}>
              <div className="rounded-[20px] border border-[#e0e0e0] bg-[#fafafa] p-10 min-h-[360px] flex flex-col relative overflow-hidden">
                <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-[#10b981]/[0.04] blur-[50px] pointer-events-none" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#10b981] mb-5">Attribution</p>
                <h3 className="text-[26px] font-bold tracking-tight leading-[1.2] mb-6">Always know who wrote what.</h3>
                <div className="space-y-[6px] mt-auto">
                  {[
                    { v:"v3", w:"You", bg:"bg-[#ecfdf5]", tx:"text-[#065f46]", m:"Added checklist", t:"2h" },
                    { v:"v2", w:"agent:claude", bg:"bg-[#ede9fe]", tx:"text-[#5b21b6]", m:"Research findings", t:"5h" },
                    { v:"v1", w:"You", bg:"bg-[#ecfdf5]", tx:"text-[#065f46]", m:"Created note", t:"1d" },
                  ].map((v) => (
                    <div key={v.v} className="flex items-center gap-3 text-[12px] px-4 py-3 rounded-2xl bg-white border border-[#e0e0e0] shadow-sm">
                      <span className="font-mono text-[#333] w-5">{v.v}</span>
                      <span className={`text-[10px] px-2 py-[2px] rounded-lg font-semibold ${v.bg} ${v.tx}`}>{v.w}</span>
                      <span className="text-[#333] flex-1">{v.m}</span>
                      <span className="text-[#333] text-[11px]">{v.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="rounded-[20px] border border-[#e0e0e0] bg-[#fafafa] p-10 min-h-[360px] flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#333] mb-5">Permissions</p>
                <h3 className="text-[26px] font-bold tracking-tight leading-[1.2] mb-6">Your data, your rules.</h3>
                <div className="space-y-[6px] mt-auto">
                  {["read","write","archive"].map((p) => (
                    <div key={p} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white border border-[#e0e0e0] shadow-sm">
                      <span className="text-[12px] text-[#333] flex items-center gap-2"><span className="w-[5px] h-[5px] rounded-full bg-[#8b5cf6]" />agent → <span className="font-mono">{p}</span></span>
                      <span className="text-[11px] text-[#10b981] font-bold">✓</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-red-50 border border-red-200/60">
                    <span className="text-[12px] text-[#333] flex items-center gap-2"><span className="w-[5px] h-[5px] rounded-full bg-[#8b5cf6]" />agent → <span className="font-mono">delete</span></span>
                    <span className="text-[11px] text-red-400 font-bold">✕</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={0.06 * i}>
                <motion.div className="rounded-[20px] border border-[#e0e0e0] bg-[#fafafa] p-7 hover:border-[#ccc] hover:shadow-sm transition-all h-full cursor-default" whileHover={{ y: -3 }}>
                  <div className="text-[18px] mb-3 text-[#333]">{f.icon}</div>
                  <h4 className="text-[14px] font-bold text-[#333] mb-2">{f.title}</h4>
                  <p className="text-[12px] text-[#333] leading-relaxed">{f.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-32 px-8">
        <div className="max-w-[960px] mx-auto">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#333] mb-6">How it works</p>
            <h2 className="text-[clamp(30px,5vw,54px)] font-extrabold tracking-[-0.045em] leading-[1.05] mb-20">Three steps.<br />Five minutes.</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-14">
            {[
              { n: "01", t: "Connect your agent", d: "Register an agent. Get an API key. Add MCP config. One command." },
              { n: "02", t: "Write together", d: "You write in the editor. Agent writes via MCP. Both in real-time with clear attribution." },
              { n: "03", t: "Stay in control", d: "Review agent content. Manage permissions. Track every change." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={0.1 * i}>
                <div>
                  <div className="text-[68px] font-extrabold text-[#333] leading-none mb-5">{s.n}</div>
                  <h3 className="text-[17px] font-bold text-[#1a1a1a] mb-3">{s.t}</h3>
                  <p className="text-[14px] text-[#333] leading-[1.7]" style={{ fontFamily: "var(--font-serif)" }}>{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="py-32 px-8 bg-white">
        <div className="max-w-[820px] mx-auto">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#10b981] mb-6">Pricing</p>
            <h2 className="text-[clamp(30px,5vw,54px)] font-extrabold tracking-[-0.045em] leading-[1.05] mb-5">Simple. Transparent.</h2>
            <p className="text-[#333] text-[17px] mb-20" style={{ fontFamily: "var(--font-serif)" }}>Self-host free forever. Or let us handle everything.</p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-5">
            <Reveal delay={0.08}>
              <Card className="p-10 h-full flex flex-col bg-[#fafafa]">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#333] mb-4">Self-hosted</div>
                <div className="text-[50px] font-extrabold leading-none mb-1">Free</div>
                <div className="text-[13px] text-[#333] mb-10">Open source · AGPLv3</div>
                <ul className="space-y-3 text-[13px] text-[#333] mb-10 flex-1">
                  {["Unlimited everything","Full MCP server","CLI & API","Calendar sync","Rich editor","Your server, your data"].map((i) => (
                    <li key={i} className="flex gap-3"><span className="text-[#10b981]">✓</span>{i}</li>
                  ))}
                </ul>
                <Link href="/docs/self-hosted" className="block text-center py-3.5 rounded-full text-[13px] font-semibold border border-[#e0e0e0] text-[#333] hover:text-[#1a1a1a] hover:bg-[#f5f5f5] transition-all cursor-pointer">Get Started</Link>
              </Card>
            </Reveal>
            <Reveal delay={0.16}>
              <div className="rounded-[20px] border border-[#a78bfa]/20 p-10 h-full flex flex-col relative overflow-hidden bg-gradient-to-br from-[#faf5ff] to-white">
                <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-[#a78bfa]/[0.06] blur-[50px] pointer-events-none" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a78bfa]">Duet Cloud</div>
                    <span className="text-[9px] font-bold bg-[#a78bfa] text-white px-3 py-1 rounded-full">Coming Soon</span>
                  </div>
                  <div className="text-[50px] font-extrabold leading-none mb-1">$8<span className="text-[17px] font-normal text-[#333]">/mo</span></div>
                  <div className="text-[13px] text-[#333] mb-10">Hosted · Zero setup</div>
                  <ul className="space-y-3 text-[13px] text-[#333] mb-10 flex-1">
                    {["Everything in self-hosted","No server to manage","Automatic backups","Google & GitHub login","File storage included","Priority support"].map((i) => (
                      <li key={i} className="flex gap-3"><span className="text-[#a78bfa]">✓</span>{i}</li>
                    ))}
                  </ul>
                  <div className="py-3.5 rounded-full text-[13px] font-semibold text-center text-[#a78bfa] border border-[#a78bfa]/20">Coming Soon</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-32 px-8">
        <div className="max-w-[680px] mx-auto">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#333] mb-6">FAQ</p>
            <h2 className="text-[clamp(26px,4vw,42px)] font-extrabold tracking-[-0.04em] mb-14">Questions & answers</h2>
          </Reveal>
          {FAQ.map((f, i) => (
            <Reveal key={i} delay={0.03 * i}>
              <div className="border-b border-[#e0e0e0]">
                <button className="w-full flex items-center justify-between py-5 text-left text-[15px] font-semibold text-[#333] hover:text-[#1a1a1a] transition-colors cursor-pointer" onClick={() => setFaq(faq === i ? null : i)}>
                  {f.q}
                  <motion.svg className="w-4 h-4 text-[#333] ml-6 flex-shrink-0" animate={{ rotate: faq === i ? 180 : 0 }} transition={{ duration: 0.25 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M19 9l-7 7-7-7" /></motion.svg>
                </button>
                <motion.div initial={false} animate={{ height: faq === i ? "auto" : 0, opacity: faq === i ? 1 : 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                  <p className="pb-5 text-[14px] text-[#333] leading-[1.8] pr-10 select-text" style={{ fontFamily: "var(--font-serif)" }}>{f.a}</p>
                </motion.div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-32 px-8 bg-white">
        <Reveal>
          <div className="max-w-[720px] mx-auto text-center">
            <Logo s={42} />
            <h2 className="text-[clamp(30px,5vw,56px)] font-extrabold tracking-[-0.045em] leading-[1.05] mt-8 mb-5">Your notes.<br />Your server.<br />Your agents.</h2>
            <p className="text-[#333] text-[17px] mb-10" style={{ fontFamily: "var(--font-serif)" }}>Free, open source. Deploy in five minutes.</p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Link href="/docs/self-hosted" className="px-10 py-[14px] rounded-full text-[14px] font-semibold bg-[#1a1a1a] text-white hover:bg-[#333] transition-all cursor-pointer">Get Started</Link>
              <a href="https://github.com/emreparker/duet" className="px-10 py-[14px] rounded-full text-[14px] font-medium border border-[#e0e0e0] bg-[#fafafa] text-[#333] hover:text-[#1a1a1a] transition-all cursor-pointer">Star on GitHub</a>
            </div>
            <code className="text-[12px] px-6 py-3 rounded-full bg-[#f2f2f2] border border-[#e0e0e0] inline-block font-mono text-[#333] select-text"><span className="text-[#333]">$ </span>docker compose up -d</code>
          </div>
        </Reveal>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[#e0e0e0] py-10 px-8 bg-[#fafafa]">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo s={13} />
          <span className="text-[11px] text-[#333]">Open source · AGPLv3 License · Duet Cloud coming soon</span>
          <div className="flex gap-6 text-[13px] text-[#333]">
            <Link href="/docs" className="hover:text-[#1a1a1a] transition-colors cursor-pointer">Docs</Link>
            <a href="https://github.com/emreparker/duet" className="hover:text-[#1a1a1a] transition-colors cursor-pointer">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
