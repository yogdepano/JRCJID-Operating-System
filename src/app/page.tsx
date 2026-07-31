"use client";

import React, { useState } from "react";
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

const navigationCategories = [
  {
    category: "CORE ENGINE",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, badge: null, active: true },
      { name: "Universal Search", icon: Search, badge: "Ctrl+K", active: false },
      { name: "Activity Timeline", icon: Activity, badge: null, active: false },
      { name: "Audit Log", icon: ShieldCheck, badge: "Secured", active: false },
    ],
  },
  {
    category: "SUPPLY & MANUFACTURING",
    items: [
      { name: "Product Catalog", icon: Package, badge: "142 SKUs", active: false },
      { name: "Recipes (BoM)", icon: FlaskConical, badge: "Formulas", active: false },
      { name: "Inventory Ledger", icon: Boxes, badge: "Live", active: false },
      { name: "Production Batches", icon: Factory, badge: "3 Active", active: false },
      { name: "Purchasing & POs", icon: Receipt, badge: "2 Pending", active: false },
      { name: "Supplier Management", icon: Building2, badge: null, active: false },
    ],
  },
  {
    category: "COMMERCIAL & SERVICES",
    items: [
      { name: "Sales Orders", icon: ShoppingCart, badge: "₱1.2M", active: false },
      { name: "Customer Directory", icon: Users, badge: "B2B / B2C", active: false },
      { name: "Pest Control Services", icon: Bug, badge: "5 Scheduled", active: false },
      { name: "Marketing & Leads", icon: Target, badge: null, active: false },
    ],
  },
  {
    category: "FINANCE & LOGISTICS",
    items: [
      { name: "Finance & Invoicing", icon: DollarSign, badge: "AR/AP", active: false },
      { name: "Logistics & Dispatch", icon: Truck, badge: "4 Trips", active: false },
      { name: "Vehicle Management", icon: Car, badge: "Fleet", active: false },
      { name: "Document Vault", icon: FileText, badge: "PDFs", active: false },
      { name: "Attendance & Shifts", icon: Clock, badge: null, active: false },
      { name: "Reports & Analytics", icon: BarChart3, badge: "BIR Ready", active: false },
    ],
  },
];

export default function ERPHome() {
  const [activeModule, setActiveModule] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");

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
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveModule(item.name)}
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
                AD
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-200">Admin User</p>
                <p className="text-[10px] text-slate-400">Super Administrator</p>
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
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-sky-500/20 transition-all">
              <Plus className="w-3.5 h-3.5" />
              <span>New Transaction</span>
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
                Database: Connected (Singapore ap-southeast-1)
              </span>
            </div>
          </div>

          {/* TOP KPI METRIC CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Monthly Revenue (PHP)</span>
                <span className="p-1.5 rounded-md bg-sky-500/10 text-sky-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">₱2,480,950.00</p>
              <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <span>+14.2%</span>
                <span className="text-slate-500">vs last month</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Active Chemical Batches</span>
                <span className="p-1.5 rounded-md bg-purple-500/10 text-purple-400">
                  <Factory className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">3 Batches</p>
              <div className="mt-2 text-[11px] text-purple-400 flex items-center gap-1 font-medium">
                <span>500L Solvents, 1000L Degreaser</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Pest Control Jobs Today</span>
                <span className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
                  <Bug className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">5 Scheduled</p>
              <div className="mt-2 text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                <span>3 Completed • 2 In Transit</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span>Raw Chemical Reorders</span>
                <span className="p-1.5 rounded-md bg-rose-500/10 text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-100">2 Low Stock</p>
              <div className="mt-2 text-[11px] text-rose-400 flex items-center gap-1 font-medium">
                <span>Surfactant A-40 & Hydroxide</span>
              </div>
            </div>
          </div>

          {/* RECENT OPERATIONAL TRANSACTIONS TABLE */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Recent Workflow Transactions</h3>
                <p className="text-xs text-slate-400">Real-time status tracking across Sales, Purchasing, and Production</p>
              </div>
              <button className="text-xs text-sky-400 hover:underline font-medium">View All History →</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Transaction #</th>
                    <th className="py-2.5 px-3">Department / Module</th>
                    <th className="py-2.5 px-3">Entity / Customer</th>
                    <th className="py-2.5 px-3">Amount (PHP)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-sky-400">SO-2026-0089</td>
                    <td className="py-3 px-3">Sales Order</td>
                    <td className="py-3 px-3 font-medium text-slate-200">San Miguel Food Group</td>
                    <td className="py-3 px-3 font-mono">₱185,000.00</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center w-max gap-1">
                        <Factory className="w-3 h-3" /> IN_PRODUCTION
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        UNPAID (NET30)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button className="text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded text-[11px]">
                        Inspect
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-sky-400">PO-2026-0042</td>
                    <td className="py-3 px-3">Purchase Order</td>
                    <td className="py-3 px-3 font-medium text-slate-200">ChemSupply Philippines Corp.</td>
                    <td className="py-3 px-3 font-mono">₱340,000.00</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center w-max gap-1">
                        <Truck className="w-3 h-3" /> PARTIALLY_RECEIVED
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        PAID
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button className="text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded text-[11px]">
                        Inspect
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-sky-400">PC-2026-0155</td>
                    <td className="py-3 px-3">Pest Control Job</td>
                    <td className="py-3 px-3 font-medium text-slate-200">Robinsons Mall Commercial</td>
                    <td className="py-3 px-3 font-mono">₱24,500.00</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center w-max gap-1">
                        <CheckCircle2 className="w-3 h-3" /> COMPLETED
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        PAID
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button className="text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded text-[11px]">
                        Inspect
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
