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
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-blue-700 font-extrabold mb-1">
              <span>JRC Industrial OS</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-slate-900">Dashboard</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Operations Command Center
            </h2>
          </div>
          <span className="self-start sm:self-auto px-3.5 py-1.5 text-xs rounded-full bg-blue-50 text-blue-700 border-2 border-blue-200 font-extrabold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Logged in as {currentUserEmail}
          </span>
        </div>

        {/* RESPONSIVE DEPARTMENT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => router.push("/sales")}
            className="p-4 rounded-2xl bg-white border-2 border-slate-200 text-left hover:border-blue-600 hover:shadow-lg transition-all active:scale-[0.98] shadow-xs space-y-1 relative overflow-hidden group"
          >
            <div className="w-full h-1.5 bg-orange-500 absolute top-0 left-0"></div>
            <div className="flex items-center justify-between text-slate-600 text-xs font-bold uppercase tracking-wider">
              <span>Sales Department</span>
              <ShoppingCart className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{stats.totalSalesOrders} Orders</p>
            <span className="text-xs text-blue-700 font-extrabold block pt-0.5 group-hover:translate-x-1 transition-transform">
              Open Sales Orders →
            </span>
          </button>

          <button
            onClick={() => router.push("/recipes")}
            className="p-4 rounded-2xl bg-white border-2 border-slate-200 text-left hover:border-blue-600 hover:shadow-lg transition-all active:scale-[0.98] shadow-xs space-y-1 relative overflow-hidden group"
          >
            <div className="w-full h-1.5 bg-emerald-500 absolute top-0 left-0"></div>
            <div className="flex items-center justify-between text-slate-600 text-xs font-bold uppercase tracking-wider">
              <span>Production Department</span>
              <Package className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">Formulas</p>
            <span className="text-xs text-emerald-700 font-extrabold block pt-0.5 group-hover:translate-x-1 transition-transform">
              Chemical Work Orders →
            </span>
          </button>

          <button
            onClick={() => router.push("/inventory")}
            className="p-4 rounded-2xl bg-white border-2 border-slate-200 text-left hover:border-blue-600 hover:shadow-lg transition-all active:scale-[0.98] shadow-xs space-y-1 relative overflow-hidden group"
          >
            <div className="w-full h-1.5 bg-emerald-500 absolute top-0 left-0"></div>
            <div className="flex items-center justify-between text-slate-600 text-xs font-bold uppercase tracking-wider">
              <span>Logistics Department</span>
              <Boxes className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{stats.totalProducts} SKUs</p>
            <span className="text-xs text-blue-700 font-extrabold block pt-0.5 group-hover:translate-x-1 transition-transform">
              Inventory Ledger →
            </span>
          </button>

          <button
            onClick={() => router.push("/users")}
            className="p-4 rounded-2xl bg-white border-2 border-slate-200 text-left hover:border-blue-600 hover:shadow-lg transition-all active:scale-[0.98] shadow-xs space-y-1 relative overflow-hidden group"
          >
            <div className="w-full h-1.5 bg-orange-500 absolute top-0 left-0"></div>
            <div className="flex items-center justify-between text-slate-600 text-xs font-bold uppercase tracking-wider">
              <span>Security & RBAC</span>
              <ShieldCheck className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">Super Admin</p>
            <span className="text-xs text-orange-700 font-extrabold block pt-0.5 group-hover:translate-x-1 transition-transform">
              User Permissions →
            </span>
          </button>
        </div>

        {/* LIVE SYNCHRONIZED ORDERS TASK WORKSPACE */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-700 animate-pulse" />
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
                Live Shared Orders & Department Tasks
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500">Real-Time Single Order Lifecycle</span>
          </div>

          <OrderTaskView activeDepartment="Admin" employeeName="Operations Admin" />
        </div>
      </main>
    </div>
  );
}
