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
  Menu,
  X,
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
      { name: "Product Catalog", icon: Package, badge: "SKUs", active: false },
      { name: "Recipes (BoM)", icon: FlaskConical, badge: "Formulas", active: false },
      { name: "Inventory Ledger", icon: Boxes, badge: "Live", active: false },
      { name: "Production Batches", icon: Factory, badge: null, active: false },
      { name: "Purchasing & POs", icon: Receipt, badge: null, active: false },
      { name: "Supplier Management", icon: Building2, badge: null, active: false },
    ],
  },
  {
    category: "COMMERCIAL & SERVICES",
    items: [
      { name: "Sales Orders", icon: ShoppingCart, badge: null, active: false },
      { name: "Customer Directory", icon: Users, badge: "B2B/B2C", active: false },
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
      { name: "Reports & Analytics", icon: BarChart3, badge: "BIR", active: false },
    ],
  },
];

interface LiveStats {
  totalProducts: number;
  totalSalesOrders: number;
  totalPestJobs: number;
}

export default function ERPHome() {
  const router = useRouter();
  const [activeModule, setActiveModule] = useState("Dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const handleNavigate = (moduleName: string) => {
    setActiveModule(moduleName);
    setIsMobileMenuOpen(false);

    const routeMap: Record<string, string> = {
      "Product Catalog": "/products",
      "Recipes (BoM)": "/recipes",
      "Inventory Ledger": "/inventory",
      "Sales Orders": "/sales",
      "Pest Control Services": "/pest-control",
      "Document Vault": "/documents",
      "User Security & RBAC": "/users",
    };

    if (routeMap[moduleName]) {
      router.push(routeMap[moduleName]);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#090d16] text-slate-100 overflow-hidden font-sans">
      {/* MOBILE HEADER BAR */}
      <header className="lg:hidden h-14 bg-[#0f172a] border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-emerald-400 p-[2px]">
            <div className="w-full h-full bg-[#0f172a] rounded-[6px] flex items-center justify-center font-bold text-sky-400 text-xs">
              JRC
            </div>
          </div>
          <span className="font-bold text-xs tracking-tight text-white">JRC Industrial ERP</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-sky-400" /> : <Menu className="w-5 h-5 text-sky-400" />}
          </button>
        </div>
      </header>

      {/* MOBILE SLIDE-OUT DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <aside
            className="w-4/5 max-w-sm h-full bg-[#0f172a] border-r border-slate-800 p-4 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-sm text-white">JRC Navigation</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {navigationCategories.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <h3 className="px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{group.category}</h3>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleNavigate(item.name)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-sky-400 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-sky-400" />
                          <span>{item.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 text-xs">
              <p className="font-semibold text-slate-200 truncate">{currentUserEmail}</p>
              <p className="text-[10px] text-sky-400">Super Administrator</p>
            </div>
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden lg:flex w-72 bg-[#0f172a]/95 border-r border-slate-800/80 flex-col justify-between shrink-0">
        <div className="flex flex-col h-full overflow-hidden">
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
                ERP Mobile System
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {navigationCategories.map((group, idx) => (
              <div key={idx} className="space-y-1">
                <h3 className="px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  {group.category}
                </h3>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeModule === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigate(item.name)}
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
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#090d16]">
        {/* DESKTOP TOP BAR */}
        <header className="hidden lg:flex h-16 border-b border-slate-800/80 bg-[#0f172a]/60 backdrop-blur px-6 items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Universal Search (Customers, SKUs, POs, Jobs)..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </header>

        {/* MOBILE-FIRST WORKSPACE BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 lg:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <span>JRC Industrial OS</span>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="text-sky-400 font-medium">{activeModule}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
                Mobile Command Dashboard
              </h2>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-1 text-[11px] rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Live Supabase Connection
            </span>
          </div>

          {/* MOBILE-FIRST RESPONSIVE GRID CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button
              onClick={() => router.push("/products")}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left hover:border-sky-500 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Product Master SKUs</span>
                <Package className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalProducts} SKUs</p>
              <span className="text-[10px] text-sky-400 font-medium block mt-1">Tap to manage catalog →</span>
            </button>

            <button
              onClick={() => router.push("/sales")}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left hover:border-emerald-500 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Sales Orders</span>
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalSalesOrders} Orders</p>
              <span className="text-[10px] text-emerald-400 font-medium block mt-1">Tap for commercial pipeline →</span>
            </button>

            <button
              onClick={() => router.push("/pest-control")}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left hover:border-amber-500 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Pest Control Field Jobs</span>
                <Bug className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalPestJobs} Jobs</p>
              <span className="text-[10px] text-amber-400 font-medium block mt-1">Tap for technician schedules →</span>
            </button>

            <button
              onClick={() => router.push("/users")}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left hover:border-purple-500 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>User Security & RBAC</span>
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">Super Admin</p>
              <span className="text-[10px] text-purple-400 font-medium block mt-1">Tap for role controls →</span>
            </button>
          </div>
        </div>

        {/* MOBILE STICKY BOTTOM NAVIGATION BAR */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0f172a]/95 border-t border-slate-800 px-4 flex items-center justify-around z-40 backdrop-blur">
          <button
            onClick={() => router.push("/")}
            className="flex flex-col items-center gap-1 text-sky-400"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button
            onClick={() => router.push("/products")}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white"
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-medium">Products</span>
          </button>
          <button
            onClick={() => router.push("/pest-control")}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white"
          >
            <Bug className="w-5 h-5" />
            <span className="text-[10px] font-medium">Pest Tech</span>
          </button>
          <button
            onClick={() => router.push("/users")}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white"
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-medium">Security</span>
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
