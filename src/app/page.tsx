"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingCart,
  Bug,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TopNavbar } from "@/components/Navigation/TopNavbar";

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
    <div className="min-h-screen bg-[#060b17] text-slate-100 flex flex-col font-sans">
      {/* STICKY TOP NAVIGATION BAR - ALWAYS ON TOP */}
      <TopNavbar />

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1c2541] pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <span>JRC Industrial OS</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-amber-400 font-bold">Dashboard</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Operations Command Center
            </h2>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 text-xs rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Logged in as {currentUserEmail}
          </span>
        </div>

        {/* RESPONSIVE DEPARTMENT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => router.push("/sales")}
            className="p-5 rounded-2xl bg-[#0b132b] border border-[#1c2541] text-left hover:border-amber-400 transition-all active:scale-[0.98] shadow-lg space-y-2"
          >
            <div className="flex items-center justify-between text-slate-300 text-xs font-bold uppercase tracking-wider">
              <span>Sales Department</span>
              <ShoppingCart className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.totalSalesOrders} Orders</p>
            <span className="text-xs text-amber-400 font-bold block pt-1">Open Sales Orders →</span>
          </button>

          <button
            onClick={() => router.push("/recipes")}
            className="p-5 rounded-2xl bg-[#0b132b] border border-[#1c2541] text-left hover:border-amber-400 transition-all active:scale-[0.98] shadow-lg space-y-2"
          >
            <div className="flex items-center justify-between text-slate-300 text-xs font-bold uppercase tracking-wider">
              <span>Production Department</span>
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">Formulas</p>
            <span className="text-xs text-amber-400 font-bold block pt-1">Chemical BoM Recipes →</span>
          </button>

          <button
            onClick={() => router.push("/inventory")}
            className="p-5 rounded-2xl bg-[#0b132b] border border-[#1c2541] text-left hover:border-amber-400 transition-all active:scale-[0.98] shadow-lg space-y-2"
          >
            <div className="flex items-center justify-between text-slate-300 text-xs font-bold uppercase tracking-wider">
              <span>Logistics Department</span>
              <Package className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.totalProducts} SKUs</p>
            <span className="text-xs text-amber-400 font-bold block pt-1">Inventory Ledger →</span>
          </button>

          <button
            onClick={() => router.push("/users")}
            className="p-5 rounded-2xl bg-[#0b132b] border border-[#1c2541] text-left hover:border-amber-400 transition-all active:scale-[0.98] shadow-lg space-y-2"
          >
            <div className="flex items-center justify-between text-slate-300 text-xs font-bold uppercase tracking-wider">
              <span>Security & RBAC</span>
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-extrabold text-white">Super Admin</p>
            <span className="text-xs text-amber-400 font-bold block pt-1">User Permissions →</span>
          </button>
        </div>
      </main>
    </div>
  );
}
