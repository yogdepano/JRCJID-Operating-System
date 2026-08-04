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
          <div className="lg:col-span-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-blue-700 font-extrabold">
                <span>JRC Industrial OS</span>
                <ChevronRight className="w-3 h-3 text-amber-500" />
                <span className="text-slate-900">Dashboard</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                Operations Command Center
              </h2>
            </div>

            <div className="pt-2 border-t border-slate-100 mt-2">
              <span className="px-2.5 py-1 text-[10px] rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-extrabold flex items-center gap-1.5 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Logged in as</span> {currentUserEmail}
              </span>
            </div>
          </div>

          {/* RIGHT: 4 DEPARTMENT CARDS GRID */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => router.push("/sales")}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-left hover:border-blue-600 hover:shadow-md transition-all active:scale-[0.98] shadow-2xs space-y-0.5 relative overflow-hidden group flex flex-col justify-between"
            >
              <div className="w-full h-1 bg-orange-500 absolute top-0 left-0"></div>
              <div className="flex items-center justify-between text-slate-500 text-[9px] font-extrabold uppercase tracking-wider pt-0.5">
                <span>Sales</span>
                <ShoppingCart className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900 leading-tight">{stats.totalSalesOrders} Orders</p>
                <span className="text-[10px] text-blue-700 font-extrabold block group-hover:translate-x-1 transition-transform">
                  Open Orders →
                </span>
              </div>
            </button>

            <button
              onClick={() => router.push("/recipes")}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-left hover:border-blue-600 hover:shadow-md transition-all active:scale-[0.98] shadow-2xs space-y-0.5 relative overflow-hidden group flex flex-col justify-between"
            >
              <div className="w-full h-1 bg-emerald-500 absolute top-0 left-0"></div>
              <div className="flex items-center justify-between text-slate-500 text-[9px] font-extrabold uppercase tracking-wider pt-0.5">
                <span>Production</span>
                <Package className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900 leading-tight">Formulas</p>
                <span className="text-[10px] text-emerald-700 font-extrabold block group-hover:translate-x-1 transition-transform">
                  Work Orders →
                </span>
              </div>
            </button>

            <button
              onClick={() => router.push("/inventory")}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-left hover:border-blue-600 hover:shadow-md transition-all active:scale-[0.98] shadow-2xs space-y-0.5 relative overflow-hidden group flex flex-col justify-between"
            >
              <div className="w-full h-1 bg-blue-500 absolute top-0 left-0"></div>
              <div className="flex items-center justify-between text-slate-500 text-[9px] font-extrabold uppercase tracking-wider pt-0.5">
                <span>Logistics</span>
                <Boxes className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900 leading-tight">{stats.totalProducts} SKUs</p>
                <span className="text-[10px] text-blue-700 font-extrabold block group-hover:translate-x-1 transition-transform">
                  Ledger →
                </span>
              </div>
            </button>

            <button
              onClick={() => router.push("/users")}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-left hover:border-blue-600 hover:shadow-md transition-all active:scale-[0.98] shadow-2xs space-y-0.5 relative overflow-hidden group flex flex-col justify-between"
            >
              <div className="w-full h-1 bg-amber-500 absolute top-0 left-0"></div>
              <div className="flex items-center justify-between text-slate-500 text-[9px] font-extrabold uppercase tracking-wider pt-0.5">
                <span>Security</span>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900 leading-tight">Admin</p>
                <span className="text-[10px] text-amber-700 font-extrabold block group-hover:translate-x-1 transition-transform">
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
