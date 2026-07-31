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
    <div className="flex flex-col lg:flex-row h-screen bg-[#060b17] text-slate-100 overflow-hidden font-sans">
      {/* MOBILE HEADER BAR - COBALT BLUE & ELECTRIC GOLD */}
      <header className="lg:hidden h-16 bg-[#0b132b] border-b border-[#1c2541] px-4 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 p-[2px] shadow-lg shadow-yellow-500/20">
            <div className="w-full h-full bg-[#0b132b] rounded-[10px] flex items-center justify-center font-bold text-amber-400 text-sm">
              JRC
            </div>
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">JRC Industrial ERP</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-xl bg-[#131c35] border border-[#1c2541] text-amber-400 hover:text-yellow-300 active:scale-95"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE SLIDE-OUT DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <aside
            className="w-4/5 max-w-sm h-full bg-[#0b132b] border-r border-[#1c2541] p-5 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#1c2541] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="font-extrabold text-base text-white">ERP Navigation</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-6 h-6 text-amber-400" />
                </button>
              </div>

              {navigationCategories.map((group, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h3 className="px-2 text-xs font-bold text-amber-400/90 uppercase tracking-wider">{group.category}</h3>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.name}
                        onClick={() => handleNavigate(item.name)}
                        className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-200 hover:bg-[#131c35] hover:text-amber-400 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-amber-400" />
                          <span>{item.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#1c2541] text-xs">
              <p className="font-bold text-slate-100 text-sm truncate">{currentUserEmail}</p>
              <p className="text-xs text-amber-400 font-semibold">Super Administrator</p>
            </div>
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR NAVIGATION */}
      <aside className="hidden lg:flex w-72 bg-[#0b132b] border-r border-[#1c2541] flex-col justify-between shrink-0">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-5 border-b border-[#1c2541] flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 p-[2px] shadow-lg shadow-yellow-500/20">
              <div className="w-full h-full bg-[#0b132b] rounded-[10px] flex items-center justify-center font-extrabold text-amber-400 text-lg">
                JRC
              </div>
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-slate-100 text-sm sm:text-base">JRC Industrial</h1>
              <p className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                ERP Operating System
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
            {navigationCategories.map((group, idx) => (
              <div key={idx} className="space-y-1.5">
                <h3 className="px-3 text-xs font-bold tracking-wider text-amber-400/90 uppercase">
                  {group.category}
                </h3>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeModule === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigate(item.name)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                        isSelected
                          ? "bg-amber-400/10 text-amber-400 border-l-4 border-amber-400 shadow-sm"
                          : "text-slate-300 hover:text-amber-400 hover:bg-[#131c35]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isSelected ? "text-amber-400" : "text-slate-400"}`} />
                        <span>{item.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-[#1c2541] bg-[#080e1e] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center font-bold text-amber-400 text-xs">
                SA
              </div>
              <div className="text-left max-w-[130px] truncate">
                <p className="text-xs font-bold text-slate-100 truncate">{currentUserEmail}</p>
                <p className="text-xs text-amber-400 font-semibold">Super Admin</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#060b17]">
        {/* DESKTOP TOP BAR */}
        <header className="hidden lg:flex h-16 border-b border-[#1c2541] bg-[#0b132b]/80 backdrop-blur px-6 items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Universal Search (Customers, SKUs, POs, Jobs)..."
                className="w-full pl-9 pr-4 py-2 bg-[#131c35] border border-[#1c2541] rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </header>

        {/* MOBILE-FIRST WORKSPACE BODY WITH LARGER READABLE FONTS */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6 pb-24 lg:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1c2541] pb-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <span>JRC Industrial OS</span>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="text-amber-400 font-bold">{activeModule}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Operations Command Dashboard
              </h2>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 text-xs rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Live Supabase System
            </span>
          </div>

          {/* MOBILE-FIRST RESPONSIVE GRID CARDS WITH LARGER TEXT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push("/products")}
              className="p-5 rounded-2xl bg-[#0b132b] border border-[#1c2541] text-left hover:border-amber-400 transition-all active:scale-[0.98] shadow-lg space-y-2"
            >
              <div className="flex items-center justify-between text-slate-300 text-xs font-bold uppercase tracking-wider">
                <span>Product Master SKUs</span>
                <Package className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{stats.totalProducts} SKUs</p>
              <span className="text-xs text-amber-400 font-bold block pt-1">Manage catalog →</span>
            </button>

            <button
              onClick={() => router.push("/sales")}
              className="p-5 rounded-2xl bg-[#0b132b] border border-[#1c2541] text-left hover:border-amber-400 transition-all active:scale-[0.98] shadow-lg space-y-2"
            >
              <div className="flex items-center justify-between text-slate-300 text-xs font-bold uppercase tracking-wider">
                <span>Sales Orders</span>
                <ShoppingCart className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{stats.totalSalesOrders} Orders</p>
              <span className="text-xs text-amber-400 font-bold block pt-1">View pipeline →</span>
            </button>

            <button
              onClick={() => router.push("/pest-control")}
              className="p-5 rounded-2xl bg-[#0b132b] border border-[#1c2541] text-left hover:border-amber-400 transition-all active:scale-[0.98] shadow-lg space-y-2"
            >
              <div className="flex items-center justify-between text-slate-300 text-xs font-bold uppercase tracking-wider">
                <span>Pest Control Jobs</span>
                <Bug className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">{stats.totalPestJobs} Jobs</p>
              <span className="text-xs text-amber-400 font-bold block pt-1">Technician schedule →</span>
            </button>

            <button
              onClick={() => router.push("/users")}
              className="p-5 rounded-2xl bg-[#0b132b] border border-[#1c2541] text-left hover:border-amber-400 transition-all active:scale-[0.98] shadow-lg space-y-2"
            >
              <div className="flex items-center justify-between text-slate-300 text-xs font-bold uppercase tracking-wider">
                <span>User Security & RBAC</span>
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold text-white">Super Admin</p>
              <span className="text-xs text-amber-400 font-bold block pt-1">Security controls →</span>
            </button>
          </div>
        </div>

        {/* MOBILE STICKY BOTTOM NAVIGATION BAR - COBALT BLUE & GOLD */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0b132b] border-t border-[#1c2541] px-4 flex items-center justify-around z-40 backdrop-blur">
          <button
            onClick={() => router.push("/")}
            className="flex flex-col items-center gap-1 text-amber-400"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-xs font-bold">Home</span>
          </button>
          <button
            onClick={() => router.push("/products")}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-amber-400"
          >
            <Package className="w-5 h-5" />
            <span className="text-xs font-bold">Products</span>
          </button>
          <button
            onClick={() => router.push("/pest-control")}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-amber-400"
          >
            <Bug className="w-5 h-5" />
            <span className="text-xs font-bold">Pest Tech</span>
          </button>
          <button
            onClick={() => router.push("/users")}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-amber-400"
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold">Security</span>
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-amber-400"
          >
            <Menu className="w-5 h-5" />
            <span className="text-xs font-bold">More</span>
          </button>
        </nav>
      </main>
    </div>
  );
}
