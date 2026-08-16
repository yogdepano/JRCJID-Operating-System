"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Sparkles, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("Production");

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
          if (!authData.session) {
            await supabase.auth.signInWithPassword({ email, password });
          }

          setSuccessMessage("Employee account created! Logging into workspace...");
          setTimeout(() => {
            router.push("/");
            router.refresh();
          }, 800);
        }
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          // If sign in failed with invalid credentials, check if user profile exists to auto-register auth credentials
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", email)
            .maybeSingle();

          if (existingProfile) {
            // Attempt to register Auth credentials for this registered employee profile
            const { data: autoRegData, error: autoRegError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  first_name: existingProfile.first_name || "Employee",
                  last_name: existingProfile.last_name || "User",
                  department: existingProfile.department || "General",
                },
              },
            });

            if (!autoRegError && autoRegData.user) {
              setSuccessMessage("Employee account login activated! Redirecting to workspace...");
              setTimeout(() => {
                router.push("/");
                router.refresh();
              }, 600);
              return;
            }
          }

          setErrorMessage(
            `${signInError.message}. If your account was added by an Admin, try creating your password via the 'Create Account' tab.`
          );
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
    <div className="min-h-screen bg-[#060b17] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* BACKGROUND DECORATIVE GLOWS */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* BRAND HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 p-[2px] shadow-xl shadow-yellow-500/20 mb-2">
            <div className="w-full h-full bg-[#0b132b] rounded-[14px] flex items-center justify-center font-extrabold text-amber-400 text-2xl tracking-wider">
              JRC
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">JRC Industrial Sales</h1>
          <p className="text-sm text-slate-300 font-semibold">Enterprise Resource Planning & Operational Intelligence</p>
        </div>

        {/* LOGIN / SIGNUP CARD */}
        <div className="p-6 rounded-2xl bg-[#0b132b] border border-[#1c2541] shadow-2xl space-y-5">
          {/* DUAL MODE TABS */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#131c35] border border-[#1c2541] text-xs sm:text-sm font-bold">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`py-2.5 rounded-lg transition-all ${
                !isRegistering
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-yellow-500/20"
                  : "text-slate-300 hover:text-white"
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
              className={`py-2.5 rounded-lg transition-all ${
                isRegistering
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-yellow-500/20"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegistering && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">First Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Juan"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100 focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Last Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Dela Cruz"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100 focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100 focus:border-amber-400"
                  >
                    <option value="Production">Chemical Production</option>
                    <option value="Sales">Sales & Distribution</option>
                    <option value="Pest Control">Pest Control Services</option>
                    <option value="Purchasing">Purchasing & Warehouse</option>
                    <option value="Finance">Finance & Accounting</option>
                    <option value="Management">Executive Management</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">Work Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="user@jrcindustrial.ph"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-yellow-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : isRegistering
                ? "Register Employee Account"
                : "Sign In to ERP"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {!isRegistering && (
            <div className="pt-3 border-t border-[#1c2541] space-y-2">
              <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Quick Demo Role Fill</span>
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleDemoFill("admin@jrcindustrial.ph")}
                  className="p-2.5 rounded-xl bg-[#131c35] border border-[#1c2541] hover:border-amber-400 text-left text-slate-200 hover:text-amber-400 transition-colors"
                >
                  <span className="font-bold block">Super Admin</span>
                  <span className="text-slate-400 text-[10px]">Full access</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill("production@jrcindustrial.ph")}
                  className="p-2.5 rounded-xl bg-[#131c35] border border-[#1c2541] hover:border-amber-400 text-left text-slate-200 hover:text-amber-400 transition-colors"
                >
                  <span className="font-bold block">Production</span>
                  <span className="text-slate-400 text-[10px]">Chemical BoM</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill("sales@jrcindustrial.ph")}
                  className="p-2.5 rounded-xl bg-[#131c35] border border-[#1c2541] hover:border-amber-400 text-left text-slate-200 hover:text-amber-400 transition-colors"
                >
                  <span className="font-bold block">Sales</span>
                  <span className="text-slate-400 text-[10px]">SO & Customers</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill("tech@jrcindustrial.ph")}
                  className="p-2.5 rounded-xl bg-[#131c35] border border-[#1c2541] hover:border-amber-400 text-left text-slate-200 hover:text-amber-400 transition-colors"
                >
                  <span className="font-bold block">Pest Control</span>
                  <span className="text-slate-400 text-[10px]">Field jobs</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Building2 className="w-4 h-4 text-slate-500" />
          <span>JRC Industrial Sales • Philippine Manufacturing</span>
        </div>
      </div>
    </div>
  );
}
