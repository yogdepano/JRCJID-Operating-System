"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingCart,
  ShieldCheck,
  ChevronRight,
  Boxes,
  Activity
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TopNavbar } from "@/components/Navigation/TopNavbar";
import { OrderTaskView } from "@/components/Orders/OrderTaskView";
import { useUserRole } from "@/lib/auth/useUserRole";

interface LiveStats {
  totalProducts: number;
  totalSalesOrders: number;
  totalPestJobs: number;
}

export default function ERPHome() {
  const router = useRouter();
  const { role, roleName } = useUserRole();
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("Super Admin");

  const [stats, setStats] = useState<LiveStats>({
    totalProducts: 0,
    totalSalesOrders: 0,
    totalPestJobs: 0,
  });

  const isSuperAdmin = role === "super_admin";
  const canAccessSales = isSuperAdmin || role === "sales_rep";
  const canAccessProduction = isSuperAdmin || role === "production_manager" || role === "production_lead";
  const canAccessLogistics = isSuperAdmin || role === "production_manager" || role === "production_lead" || role === "purchasing_officer" || role === "logistics_driver";
  const canAccessSecurity = isSuperAdmin;

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) setCurrentUserEmail(user.email);

        const { count: prodCount } = await supabase.from("products").select("*", { count: "exact", head: true });
        const { count: salesCount } = await supabase.from("sales_orders").select("*", { count: "exact", head: true });
        const { count: pestCount } = await supabase.from("pest_control_jobs").select("*", { count: "exact", head: true });

        setStats({
          totalProducts: prodCount || 0,
          totalSalesOrders: salesCount || 0,
          totalPestJobs: pestCount || 0,
        });
      } catch (err) {
        console.error("Notice loading stats:", err);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* STICKY TOP NAVIGATION BAR */}
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* TOP COMMAND HERO + DEPARTMENT STATUS CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
          {/* LEFT: COMMAND CENTER METRICS BRANDING CARD */}
          <div className="lg:col-span-4 bg-[#0f172a] text-white p-4 rounded-xl border border-amber-900/60 shadow-lg relative overflow-hidden flex flex-col justify-between space-y-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-blue-500/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="space-y-1 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800/60">
                  ⚡ Active Role: {roleName}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">v2.4 Live</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-snug pt-1">
                JRC Industrial Operating System
              </h2>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Centralized ERP for Chemical Manufacturing, Sales Orders & Pest Control
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 mt-2 relative z-10">
              <span className="px-2.5 py-1 text-[10px] rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/60 font-extrabold flex items-center gap-1.5 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Role:</span> {roleName} ({currentUserEmail})
              </span>
            </div>
          </div>

          {/* RIGHT: 4 DARK-THEME DEPARTMENT CARDS GRID WITH STRICT ROLE LOCKING */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* SALES CARD */}
            <button
              onClick={() => canAccessSales && router.push("/sales")}
              disabled={!canAccessSales}
              className={`p-2.5 rounded-xl bg-[#0f172a] text-left transition-all shadow-md space-y-1 relative overflow-hidden flex flex-col justify-between ${
                canAccessSales
                  ? "border border-amber-900/60 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 active:scale-[0.98] cursor-pointer group"
                  : "border border-slate-800 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 absolute top-0 left-0"></div>
              <div className="flex items-center justify-between text-amber-400 text-[10px] font-extrabold uppercase tracking-wider pt-0.5">
                <span>Sales</span>
                <div className="p-1 rounded-md bg-amber-950/80 text-amber-400 border border-amber-800/60">
                  <ShoppingCart className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-base font-extrabold text-white leading-tight">{stats.totalSalesOrders} Orders</p>
                <span className="text-[10px] text-amber-300 font-extrabold block">
                  {canAccessSales ? "Open Orders →" : "🔒 No Access"}
                </span>
              </div>
            </button>

            {/* PRODUCTION CARD */}
            <button
              onClick={() => canAccessProduction && router.push("/recipes")}
              disabled={!canAccessProduction}
              className={`p-2.5 rounded-xl bg-[#0f172a] text-left transition-all shadow-md space-y-1 relative overflow-hidden flex flex-col justify-between ${
                canAccessProduction
                  ? "border border-emerald-900/60 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] cursor-pointer group"
                  : "border border-slate-800 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400 absolute top-0 left-0"></div>
              <div className="flex items-center justify-between text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider pt-0.5">
                <span>Production</span>
                <div className="p-1 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  <Package className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-base font-extrabold text-white leading-tight">Formulas</p>
                <span className="text-[10px] text-emerald-300 font-extrabold block">
                  {canAccessProduction ? "Work Orders →" : "🔒 No Access"}
                </span>
              </div>
            </button>

            {/* LOGISTICS CARD */}
            <button
              onClick={() => canAccessLogistics && router.push("/inventory")}
              disabled={!canAccessLogistics}
              className={`p-2.5 rounded-xl bg-[#0f172a] text-left transition-all shadow-md space-y-1 relative overflow-hidden flex flex-col justify-between ${
                canAccessLogistics
                  ? "border border-blue-900/60 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] cursor-pointer group"
                  : "border border-slate-800 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-400 absolute top-0 left-0"></div>
              <div className="flex items-center justify-between text-blue-400 text-[10px] font-extrabold uppercase tracking-wider pt-0.5">
                <span>Logistics</span>
                <div className="p-1 rounded-md bg-blue-950/80 text-blue-400 border border-blue-800/60">
                  <Boxes className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-base font-extrabold text-white leading-tight">{stats.totalProducts} SKUs</p>
                <span className="text-[10px] text-blue-300 font-extrabold block">
                  {canAccessLogistics ? "Ledger →" : "🔒 No Access"}
                </span>
              </div>
            </button>

            {/* SECURITY CARD */}
            <button
              onClick={() => canAccessSecurity && router.push("/users")}
              disabled={!canAccessSecurity}
              className={`p-2.5 rounded-xl bg-[#0f172a] text-left transition-all shadow-md space-y-1 relative overflow-hidden flex flex-col justify-between ${
                canAccessSecurity
                  ? "border border-purple-900/60 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10 active:scale-[0.98] cursor-pointer group"
                  : "border border-slate-800 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400 absolute top-0 left-0"></div>
              <div className="flex items-center justify-between text-purple-400 text-[10px] font-extrabold uppercase tracking-wider pt-0.5">
                <span>Security</span>
                <div className="p-1 rounded-md bg-purple-950/80 text-purple-400 border border-purple-800/60">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-base font-extrabold text-white leading-tight">Admin</p>
                <span className="text-[10px] text-purple-300 font-extrabold block">
                  {canAccessSecurity ? "Permissions →" : "🔒 No Access"}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* LIVE SYNCHRONIZED ORDERS TASK WORKSPACE */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-700 animate-pulse" />
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Live Shared Orders & Department Tasks
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Real-Time Single Order Lifecycle</span>
          </div>

          <OrderTaskView activeDepartment="Admin" employeeName="Operations Admin" />
        </div>
      </main>
    </div>
  );
}
