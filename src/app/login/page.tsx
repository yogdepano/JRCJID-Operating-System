"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles, Building2, UserPlus, UserCheck, Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Login & Registration state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("Production");
  const [roleCode, setRoleCode] = useState("production_manager");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const supabase = createClient();

      if (isRegistering) {
        // REGISTER NEW ACCOUNT
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              department: department,
            },
          },
        });

        if (signUpError) {
          setErrorMessage(signUpError.message);
        } else if (authData.user) {
          // Sync profile details into public.profiles
          const { error: profileError } = await supabase.from("profiles").insert({
            id: authData.user.id,
            email: email,
            first_name: firstName,
            last_name: lastName,
            department: department,
          });

          if (profileError) {
            console.error("Profile sync notice:", profileError.message);
          }

          setSuccessMessage("Account created successfully! Redirecting to workspace...");
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 1500);
        }
      } else {
        // SIGN IN TO EXISTING ACCOUNT
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setErrorMessage(signInError.message);
        } else {
          router.push("/");
          router.refresh();
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "An authentication error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (roleEmail: string) => {
    setIsRegistering(false);
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

        {/* LOGIN / SIGNUP CARD */}
        <div className="p-6 rounded-2xl bg-[#0f172a]/80 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-5">
          {/* DUAL MODE TABS (SIGN IN vs CREATE ACCOUNT) */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`py-2 rounded-lg transition-all ${
                !isRegistering
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(true);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`py-2 rounded-lg transition-all ${
                isRegistering
                  ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {/* ADDITIONAL FIELDS FOR NEW ACCOUNT CREATION */}
            {isRegistering && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">First Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Juan"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Last Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Dela Cruz"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-sky-500"
                    >
                      <option value="Production">Chemical Production</option>
                      <option value="Sales">Sales & Distribution</option>
                      <option value="Pest Control">Pest Control Services</option>
                      <option value="Purchasing">Purchasing & Warehouse</option>
                      <option value="Finance">Finance & Accounting</option>
                      <option value="Management">Executive Management</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">System Role</label>
                    <select
                      value={roleCode}
                      onChange={(e) => setRoleCode(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:border-sky-500"
                    >
                      <option value="production_manager">Production Manager</option>
                      <option value="sales_rep">Sales Representative</option>
                      <option value="purchasing_officer">Purchasing Officer</option>
                      <option value="pest_control_tech">Pest Control Tech</option>
                      <option value="finance_manager">Finance Manager</option>
                      <option value="super_admin">Super Administrator</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Work Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="user@jrcindustrial.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Password</label>
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
              {loading
                ? "Processing..."
                : isRegistering
                ? "Create ERP Account"
                : "Sign In to ERP"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* DEMO ROLE QUICK-FILL */}
          {!isRegistering && (
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
          )}
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
