"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  Target,
  Factory,
  Truck,
  ShieldCheck,
  Package,
  Bug,
  FileText,
  Menu,
  X,
  UserCheck
} from "lucide-react";
import { useUserRole, RoleCode, setRoleOverride, ROLE_LABELS } from "@/lib/auth/useUserRole";
import { TopStatusProgress } from "@/components/Navigation/TopStatusProgress";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  allowedRoles?: RoleCode[];
}

const mainDepartmentNav: NavItem[] = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Sales", href: "/sales", icon: ShoppingCart, allowedRoles: ["super_admin", "sales_rep"] },
  { name: "Finance", href: "/finance", icon: DollarSign, allowedRoles: ["super_admin", "finance_manager"] },
  { name: "Marketing", href: "/products", icon: Target, allowedRoles: ["super_admin", "sales_rep", "purchasing_officer"] },
  { name: "Production", href: "/recipes", icon: Factory, allowedRoles: ["super_admin", "production_manager", "production_lead"] },
  { name: "Logistics", href: "/inventory", icon: Truck, allowedRoles: ["super_admin", "production_manager", "production_lead", "purchasing_officer", "logistics_driver"] },
];

const secondaryNav: NavItem[] = [
  { name: "Product Catalog", href: "/products", icon: Package, allowedRoles: ["super_admin", "sales_rep", "purchasing_officer", "production_manager"] },
  { name: "Pest Control", href: "/pest-control", icon: Bug, allowedRoles: ["super_admin", "sales_rep", "pest_control_tech", "purchasing_officer", "logistics_driver"] },
  { name: "User Security", href: "/users", icon: ShieldCheck, allowedRoles: ["super_admin"] },
  { name: "Document Vault", href: "/documents", icon: FileText, allowedRoles: ["super_admin", "sales_rep", "finance_manager"] },
];

export function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { role, roleName, email } = useUserRole();

  const isAllowed = (item: NavItem) => {
    if (!item.allowedRoles) return true;
    if (role === "super_admin") return true;
    return role ? item.allowedRoles.includes(role) : false;
  };

  const visibleMainNav = mainDepartmentNav.filter(isAllowed);
  const visibleSecondaryNav = secondaryNav.filter(isAllowed);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 shadow-md backdrop-blur-md font-sans">
      {/* TIER 1: TOP CENTER STATUS BAR CONTAINER (MATCHING MOCKUP DESIGN) */}
      <div className="bg-[#060b17] border-b border-amber-400/40 py-1.5 px-3 flex items-center justify-center relative">
        <TopStatusProgress />
      </div>

      {/* TIER 2: MAIN NAVIGATION BAR */}
      <div className="bg-white border-b-2 border-amber-400">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* BRAND LOGO */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-amber-400 p-[2px] shadow-md shadow-blue-500/20">
              <div className="w-full h-full bg-blue-900 rounded-[10px] flex items-center justify-center font-extrabold text-amber-400 text-xs tracking-wider">
                JRC
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-none">JRC Industrial</span>
              <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">ERP Operating System</span>
            </div>
          </Link>

          {/* DESKTOP MAIN DEPARTMENT NAVIGATION (HIDDEN ON MOBILE) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 py-1 px-1">
            {visibleMainNav.map((dept) => {
              const Icon = dept.icon;
              const isActive = pathname === dept.href;
              return (
                <Link
                  key={dept.name}
                  href={dept.href}
                  className={`flex items-center gap-1.5 px-3 lg:px-4 py-1.5 rounded-xl text-xs lg:text-sm font-extrabold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-700 text-white shadow-md shadow-blue-600/30 ring-2 ring-amber-400"
                      : "text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-slate-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-amber-300" : "text-blue-600"}`} />
                  <span>{dept.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* USER ROLE SELECTOR DROPDOWN & MOBILE/DESKTOP HAMBURGER TOGGLE */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-xs font-extrabold text-blue-900">
              <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-700 shrink-0" />
              <select
                value={role || "super_admin"}
                onChange={(e) => setRoleOverride(e.target.value as RoleCode)}
                className="bg-transparent font-extrabold text-xs text-blue-900 cursor-pointer focus:outline-none max-w-[100px] sm:max-w-none truncate"
                title="Switch active role for UI testing"
              >
                {(Object.keys(ROLE_LABELS) as RoleCode[]).map((rCode) => (
                  <option key={rCode} value={rCode}>
                    {ROLE_LABELS[rCode]}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-sm"
              aria-label="Toggle navigation drawer"
            >
              {isDrawerOpen ? <X className="w-4 h-4 text-slate-950" /> : <Menu className="w-4 h-4 text-slate-950" />}
              <span className="hidden md:inline">More</span>
              <span className="inline md:hidden text-[10px] font-black uppercase">Menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* SLIDE-OUT OVERLAY FOR MOBILE & SECONDARY MODULES */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 p-3 sm:p-4 flex justify-end"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white border-2 border-blue-600 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl mt-14 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider block">Workspace Navigation</span>
                <span className="text-[10px] text-slate-500 font-bold block">{roleName} ({email || "Active User"})</span>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-900 font-extrabold text-base p-1">✕</button>
            </div>

            {/* MOBILE-ONLY MAIN DEPARTMENTS GRID */}
            <div className="block md:hidden space-y-2">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block px-1">Main Departments</span>
              <div className="grid grid-cols-2 gap-2">
                {visibleMainNav.map((dept) => {
                  const Icon = dept.icon;
                  const isActive = pathname === dept.href;
                  return (
                    <button
                      key={dept.name}
                      onClick={() => {
                        router.push(dept.href);
                        setIsDrawerOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-extrabold transition-all text-left border ${
                        isActive
                          ? "bg-blue-700 text-white border-amber-400 shadow-sm"
                          : "bg-slate-50 text-slate-800 hover:bg-blue-50 hover:text-blue-700 border-slate-200"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-amber-300" : "text-blue-600"}`} />
                      <span className="truncate">{dept.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECONDARY SYSTEM MODULES */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block px-1">
                <span className="hidden md:inline">Authorized System Modules</span>
                <span className="inline md:hidden">System Modules & Vault</span>
              </span>
              <div className="space-y-1">
                {visibleSecondaryNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        router.push(item.href);
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-extrabold transition-colors text-left border ${
                        isActive
                          ? "bg-blue-50 text-blue-900 border-blue-300 font-black"
                          : "text-slate-800 hover:bg-blue-50 hover:text-blue-700 border-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
