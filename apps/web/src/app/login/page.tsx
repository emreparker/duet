"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import * as api from "@/lib/api";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(error ?? "");
  const [loading, setLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.auth.me().then((res: any) => {
      if (res.authenticated) router.replace("/notes");
      else setIsSetup(!!res.setupRequired);
      setChecking(false);
    }).catch(() => setChecking(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      if (isSetup) await api.auth.setup(password);
      else await api.auth.login(password);
      router.replace("/notes");
    } catch (err: any) {
      setLoginError(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center"><div className="text-white/30 text-sm">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-6" style={{ fontFamily: "var(--font-sans)" }}>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[960px] rounded-[24px] border border-[#e0e0e0] overflow-hidden flex min-h-[620px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]">

        {/* Left - Visual panel */}
        <div className="hidden lg:flex w-[440px] flex-col justify-between p-10 relative overflow-hidden bg-[#1a1a1a]">
          <div className="absolute inset-0 pointer-events-none opacity-30" style={{ background: "radial-gradient(ellipse at 30% 80%, #10b981 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, #8b5cf6 0%, transparent 60%)" }} />

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-baseline gap-[1px]">
              <span className="text-[28px] font-light text-[#10b981]">{"["}</span>
              <span className="text-[20px] font-extrabold tracking-tight text-white">duet</span>
              <span className="text-[28px] font-light text-[#a78bfa]">{"]"}</span>
            </Link>
          </div>

          {/* Mini app preview */}
          <div className="relative z-10 rounded-xl border border-white/10 overflow-hidden bg-white/5">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5">
              <span className="w-2 h-2 rounded-full bg-white/10" />
              <span className="w-2 h-2 rounded-full bg-white/10" />
              <span className="w-2 h-2 rounded-full bg-white/10" />
            </div>
            <div className="p-4 text-[11px]">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded bg-[#8b5cf6]/20 text-[#a78bfa] text-[9px] font-semibold flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#8b5cf6]" />agent:claude
                </span>
                <span className="text-white/20 text-[9px]">just now</span>
              </div>
              <div className="text-white/50 leading-relaxed" style={{ fontFamily: "var(--font-serif)" }}>
                Found papers on <strong className="text-white/80">multi-agent collaboration</strong>. The ReAct framework shows promise...
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <h2 className="text-[28px] font-bold text-white leading-[1.15] mb-3" style={{ fontFamily: "var(--font-serif)" }}>
              Where humans<br />& agents write<br />together.
            </h2>
            <p className="text-white/40 text-[13px] leading-relaxed">
              AI agents collaborate on your notes with full attribution, version history, and permission control.
            </p>
          </div>
        </div>

        {/* Right - Form panel */}
        <div className="flex-1 bg-white p-10 lg:p-14 flex flex-col justify-center">
          <div className="max-w-[380px] mx-auto w-full">
            {/* Logo on mobile */}
            <div className="lg:hidden flex justify-center mb-8">
              <Link href="/" className="inline-flex items-baseline gap-[1px]">
                <span className="text-[24px] font-light text-[#10b981]">{"["}</span>
                <span className="text-[18px] font-extrabold tracking-tight text-[#1a1a1a]">duet</span>
                <span className="text-[24px] font-light text-[#a78bfa]">{"]"}</span>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h1 className="text-[28px] font-bold text-[#1a1a1a] text-center mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                {isSetup ? "Set Up Your Instance" : "Welcome Back"}
              </h1>
              <p className="text-[14px] text-[#555] text-center mb-8">
                {isSetup ? "Create a password to get started" : "Enter your password to access your notes"}
              </p>

              <form onSubmit={handleSubmit}>
                <label className="block text-[13px] font-semibold text-[#333] mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSetup ? "At least 6 characters" : "Enter your password"}
                  className="w-full px-4 py-3 text-[14px] bg-[#f8f8f8] border border-[#e0e0e0] text-[#1a1a1a] rounded-xl outline-none focus:border-[#1a1a1a] focus:ring-1 focus:ring-[#1a1a1a] placeholder:text-[#888] mb-4 transition-colors"
                  autoFocus
                  required
                  minLength={isSetup ? 6 : 1}
                />

                {loginError && (
                  <div className="text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 mb-4">{loginError}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#1a1a1a] text-white text-[14px] font-semibold rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50 cursor-pointer mb-4"
                >
                  {loading ? "..." : isSetup ? "Create Password" : "Sign In"}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f8f8]" />}>
      <LoginContent />
    </Suspense>
  );
}
