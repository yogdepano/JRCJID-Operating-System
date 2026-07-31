"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  FlaskConical,
  Boxes,
  ShoppingCart,
  Receipt,
  Factory,
  Bug,
  DollarSign,
  Truck,
  Car,
  Target,
  Clock,
  FileText,
  Bell,
  BarChart3,
  Search,
  Activity,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navigationCategories = [
  {
    category: "CORE ENGINE",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, badge: null, active: true },
      { name: "User Security & RBAC", icon: ShieldCheck, badge: "Admin", active: false },
      { name: "Universal Search", icon: Search, badge: "Ctrl+K", active: false },
      { name: "Activity Timeline", icon: Activity, badge: null, active: false },
      { name: "Audit Log", icon: ShieldCheck, badge: "Secured", active: false },
    ],
  },
  {
    category: "SUPPLY & MANUFACTURING",
    items: [
      { name: "Product Catalog", icon: Package, badge: "Live SKUs", active: false },
      { name: "Recipes (BoM)", icon: FlaskConical, badge: "Formulas", active: false },
      { name: "Inventory Ledger", icon: Boxes, badge: "Realtime", active: false },
      { name: "Production Batches", icon: Factory, badge: null, active: false },
      { name: "Purchasing & POs", icon: Receipt, badge: null, active: false },
      { name: "Supplier Management", icon: Building2, badge: null, active: false },
    ],
  },
  {
    category: "COMMERCIAL & SERVICES",
    items: [
      { name: "Sales Orders", icon: ShoppingCart, badge: null, active: false },
      { name: "Customer Directory", icon: Users, badge: "B2B / B2C", active: false },
      { name: "Pest Control Services", icon: Bug, badge: null, active: false },
      { name: "Marketing & Leads", icon: Target, badge: null, active: false },
    ],
  },
  {
    category: "FINANCE & LOGISTICS",
    items: [
      { name: "Finance & Invoicing", icon: DollarSign, badge: "AR/AP", active: false },
      { name: "Logistics & Dispatch", icon: Truck, badge: null, active: false },
      { name: "Vehicle Management", icon: Car, badge: "Fleet", active: false },
      { name: "Document Vault", icon: FileText, badge: "PDFs", active: false },
      { name: "Attendance & Shifts", icon: Clock, badge: null, active: false },
      { name: "Reports & Analytics", icon: BarChart3, badge: "BIR Ready", active: false },
    ],
  },
];

interface LiveStats {
  totalProducts: number;
  totalSalesOrders: number;
  totalPestJobs: number;
  lowStockCount: number;
}

export default function ERPHome() {
  const router = useRouter();
  const [activeModule, setActiveModule] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("Super Admin");

  const [stats, setStats] = useState<LiveStats>({
    totalProducts: 0,
    totalSalesOrders: 0,
    totalPestJobs: 0,
    lowStockCount: 0,
  });

  useEffect(() => {
    async function loadLiveStats() {
      try {
        const supabase = createClient();
        
        // Get current user email
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setCurrentUserEmail(user.email);
        }

        // Query product count
        const { count: prodCount } = await supabase.from("products").select("*", { count: "exact", head: true });
        
        // Query sales orders count
        const { count: soCount } = await supabase.from("sales_orders").select("*", { count: "exact", head: true });

        // Query pest control jobs count
        const { count: pcCount } = await supabase.from("pest_control_jobs").select("*", { count: "exact", head: true });

        setStats({
          totalProducts: prodCount || 0,
          totalSalesOrders: soCount || 0,
          totalPestJobs: pcCount || 0,
          lowStockCount: 0,
        });
      } catch (err) {
        console.error("Notice loading live stats:", err);
      }
    }

    loadLiveStats();
  }, []);

  return (
    <div className="flex h-screen bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-[#0f172a]/95 border-r border-slate-800/80 flex flex-col justify-between shrink-0">
        <div className="flex flex-col h-full overflow-hidden">
          {/* BRAND HEADER */}
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-[2px] shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-[#0f172a] rounded-[10px] flex items-center justify-center font-bold text-sky-400 text-lg">
                JRC
              </div>
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-slate-100 text-sm">JRC Industrial Sales</h1>
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ERP Operating System
              </p>
            </div>
          </div>

          {/* NAVIGATION ITEMS */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {navigationCategories.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  {group.category}
                </h3>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeModule === item.name;
                  const routeMap: Record<string, string> = {
                    "Product Catalog": "/products",
                    "Recipes (BoM)": "/recipes",
                    "Inventory Ledger": "/inventory",
                    "Sales Orders": "/sales",
                    "Pest Control Services": "/pest-control",
                    "Document Vault": "/documents",
                    "User Security & RBAC": "/users",
                  };

                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setActiveModule(item.name);
                        if (routeMap[item.name]) {
                          router.push(routeMap[item.name]);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                        isSelected
                          ? "bg-gradient-to-r from-sky-500/20 to-indigo-500/10 text-sky-400 border-l-2 border-sky-400 shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-sky-400" : "text-slate-400"}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* USER PROFILE FOOTER */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center font-bold text-sky-400 text-xs">
                SA
              </div>
              <div className="text-left max-w-[130px] truncate">
                <p className="text-xs font-semibold text-slate-200 truncate">{currentUserEmail}</p>
                <p className="text-[10px] text-sky-400 font-medium">Super Administrator</p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#090d16]">
        {/* TOP BAR HEADER */}
        <header className="h-16 border-b border-slate-800/80 bg-[#0f172a]/60 backdrop-blur px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Universal Search (Customers, SKUs, POs, Jobs)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-400"></span>
            </button>
            <button
              onClick={() => router.push("/products")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-sky-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Record</span>
            </button>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* BREADCRUMB & SECTION TITLE */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <span>JRC Industrial OS</span>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="text-sky-400 font-medium">{activeModule}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                Enterprise Operations Command Center
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Database: Live (Singapore ap-southeast-1)
              </span>
            </div>
          </div>

          {/* REALTIME LIVE METRIC CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Total Registered SKUs</span>
                <span className="p-1.5 rounded-md bg-sky-500/10 text-sky-400">
                  <Package className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">{stats.totalProducts} SKUs</p>
              <div className="mt-2 text-[11px] text-sky-400 flex items-center gap-1 font-medium">
                <span>Live Supabase Master</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Sales Orders</span>
                <span className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                  <ShoppingCart className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">{stats.totalSalesOrders} Orders</p>
              <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <span>Commercial pipeline</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Pest Control Service Jobs</span>
                <span className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
                  <Bug className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">{stats.totalPestJobs} Jobs</p>
              <div className="mt-2 text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                <span>Field service schedules</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Stock Warnings</span>
                <span className="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
                  <Boxes className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">0 Reorders</p>
              <div className="mt-2 text-[11px] text-purple-400 flex items-center gap-1 font-medium">
                <span>Inventory ledger online</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
