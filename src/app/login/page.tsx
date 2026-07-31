"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("DemoPassword123!");
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* BACKGROUND DECORATIVE GLOWS */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* BRAND HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-[2px] shadow-xl shadow-sky-500/20 mb-2">
            <div className="w-full h-full bg-[#0d1322] rounded-[14px] flex items-center justify-center font-bold text-sky-400 text-xl tracking-wider">
              JRC
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">JRC Industrial Sales</h1>
          <p className="text-xs text-slate-400 font-medium">Enterprise Resource Planning & Operational Intelligence</p>
        </div>

        {/* LOGIN FORM CARD */}
        <div className="p-6 rounded-2xl bg-[#0f172a]/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-400" />
              <span>Secure Authentication</span>
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              RBAC Protected
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@jrcindustrial.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-slate-300">Password</label>
                <span className="text-slate-500 hover:text-sky-400 cursor-pointer">Forgot?</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-600 hover:from-sky-400 hover:to-indigo-400 text-white font-semibold text-xs shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to ERP"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* DEMO ROLE QUICK-FILL ACCORDION */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Demo Role Fill</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => handleDemoFill("admin@jrcindustrial.ph")}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500 text-left text-slate-300 hover:text-sky-400 transition-colors"
              >
                <span className="font-bold block">Super Admin</span>
                <span className="text-slate-500 text-[9px]">Full access</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("production@jrcindustrial.ph")}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-purple-500 text-left text-slate-300 hover:text-purple-400 transition-colors"
              >
                <span className="font-bold block">Production Manager</span>
                <span className="text-slate-500 text-[9px]">Chemical BoM</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("sales@jrcindustrial.ph")}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500 text-left text-slate-300 hover:text-emerald-400 transition-colors"
              >
                <span className="font-bold block">Sales Rep</span>
                <span className="text-slate-500 text-[9px]">SO & Customers</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("tech@jrcindustrial.ph")}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500 text-left text-slate-300 hover:text-amber-400 transition-colors"
              >
                <span className="font-bold block">Pest Control Tech</span>
                <span className="text-slate-500 text-[9px]">Field jobs</span>
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER METADATA */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-slate-600" />
          <span>JRC Industrial Sales • Philippine Manufacturing</span>
        </div>
      </div>
    </div>
  );
}
