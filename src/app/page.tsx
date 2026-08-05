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

interface LiveStats {
  totalProducts: number;
  totalSalesOrders: number;
  totalPestJobs: number;
}

export default function ERPHome() {
  const router = useRouter();
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("Super Admin");

  const [stats, setStats] = useState<LiveStats>({
    totalProducts: 0,
    totalSalesOrders: 0,
    totalPestJobs: 0,
  });

  useEffect(() => {
    async function loadLiveStats() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setCurrentUserEmail(user.email);
        }

        const { count: prodCount } = await supabase.from("products").select("*", { count: "exact", head: true });
        const { count: soCount } = await supabase.from("sales_orders").select("*", { count: "exact", head: true });
        const { count: pcCount } = await supabase.from("pest_control_jobs").select("*", { count: "exact", head: true });

        setStats({
          totalProducts: prodCount || 0,
          totalSalesOrders: soCount || 0,
          totalPestJobs: pcCount || 0,
        });
      } catch (err) {
        console.error("Notice loading stats:", err);
      }
    }

    loadLiveStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* STICKY TOP NAVIGATION BAR */}
      <TopNavbar />

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 space-y-3">
        {/* SIDE-BY-SIDE HEADER & COMPACT DEPARTMENT CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch">
          {/* LEFT: COMMAND CENTER TITLE & USER BADGE */}
          <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-3.5 rounded-xl border border-slate-800 shadow-md text-white flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
            <div className="space-y-1 relative z-10">
              <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-extrabold tracking-wider uppercase">
                <span>JRC Industrial OS</span>
                <ChevronRight className="w-3 h-3 text-amber-400" />
                <span className="text-slate-300">Dashboard</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight">
                Operations Command Center
              </h2>
            </div>

            <div className="pt-2 border-t border-slate-800/80 mt-2 relative z-10">
              <span className="px-2.5 py-1 text-[10px] rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/60 font-extrabold flex items-center gap-1.5 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Logged in as</span> {currentUserEmail}
              </span>
            </div>
          </div>

          {/* RIGHT: 4 DEPARTMENT CARDS GRID WITH SUBTLE COLOR FILLS */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* SALES CARD */}
            <button
              onClick={() => router.push("/sales")}
              className="p-2.5 rounded-xl bg-gradient-to-br from-orange-50/90 via-amber-50/40 to-white border border-orange-200/90 text-left hover:border-orange-500 hover:shadow-md hover:shadow-orange-500/10 transition-all active:scale-[0.98] shadow-2xs space-y-1 relative overflow-hidden group flex flex-col justify-between"
            >
              <div className="w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500 absolute top-0 left-0"></div>
              <div className="flex items-center justify-between text-orange-800 text-[10px] font-extrabold uppercase tracking-wider pt-0.5">
                <span>Sales</span>
                <div className="p-1 rounded-md bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform shadow-2xs">
                  <ShoppingCart className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900 leading-tight">{stats.totalSalesOrders} Orders</p>
                <span className="text-[10px] text-orange-700 font-extrabold block group-hover:translate-x-1 transition-transform">
                  Open Orders →
                </span>
              </div>
            </button>

            {/* PRODUCTION CARD */}
            <button
              onClick={() => router.push("/recipes")}
              className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border border-emerald-200/90 text-left hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-500/10 transition-all active:scale-[0.98] shadow-2xs space-y-1 relative overflow-hidden group flex flex-col justify-between"
            >
              <div className="w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 absolute top-0 left-0"></div>
              <div className="flex items-center justify-between text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider pt-0.5">
                <span>Production</span>
                <div className="p-1 rounded-md bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform shadow-2xs">
                  <Package className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900 leading-tight">Formulas</p>
                <span className="text-[10px] text-emerald-700 font-extrabold block group-hover:translate-x-1 transition-transform">
                  Work Orders →
                </span>
              </div>
            </button>

            {/* LOGISTICS CARD */}
            <button
              onClick={() => router.push("/inventory")}
              className="p-2.5 rounded-xl bg-gradient-to-br from-blue-50/90 via-indigo-50/40 to-white border border-blue-200/90 text-left hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/10 transition-all active:scale-[0.98] shadow-2xs space-y-1 relative overflow-hidden group flex flex-col justify-between"
            >
              <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 absolute top-0 left-0"></div>
              <div className="flex items-center justify-between text-blue-800 text-[10px] font-extrabold uppercase tracking-wider pt-0.5">
                <span>Logistics</span>
                <div className="p-1 rounded-md bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform shadow-2xs">
                  <Boxes className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900 leading-tight">{stats.totalProducts} SKUs</p>
                <span className="text-[10px] text-blue-700 font-extrabold block group-hover:translate-x-1 transition-transform">
                  Ledger →
                </span>
              </div>
            </button>

            {/* SECURITY CARD */}
            <button
              onClick={() => router.push("/users")}
              className="p-2.5 rounded-xl bg-gradient-to-br from-purple-50/90 via-violet-50/40 to-white border border-purple-200/90 text-left hover:border-purple-500 hover:shadow-md hover:shadow-purple-500/10 transition-all active:scale-[0.98] shadow-2xs space-y-1 relative overflow-hidden group flex flex-col justify-between"
            >
              <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-amber-500 absolute top-0 left-0"></div>
              <div className="flex items-center justify-between text-purple-800 text-[10px] font-extrabold uppercase tracking-wider pt-0.5">
                <span>Security</span>
                <div className="p-1 rounded-md bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900 leading-tight">Admin</p>
                <span className="text-[10px] text-purple-700 font-extrabold block group-hover:translate-x-1 transition-transform">
                  Permissions →
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
