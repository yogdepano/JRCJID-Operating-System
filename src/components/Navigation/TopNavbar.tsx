"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
import { useUserRole, RoleCode } from "@/lib/auth/useUserRole";
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
  const [mounted, setMounted] = useState(false);
  const { role, roleName, email } = useUserRole();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAllowed = (item: NavItem) => {
    if (!item.allowedRoles) return true;
    if (role === "super_admin") return true;
    return role ? item.allowedRoles.includes(role) : false;
  };

  const visibleMainNav = mainDepartmentNav.filter(isAllowed);
  const visibleSecondaryNav = secondaryNav.filter(isAllowed);

  return (
    <header className="sticky top-0 left-0 right-0 z-40 shadow-md font-sans">
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

          {/* AUTHENTIC USER ROLE BADGE (READ-ONLY RBAC ENFORCED) & HAMBURGER TOGGLE */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-xs font-extrabold text-blue-900 shadow-2xs"
              title={`Verified Assigned Role: ${roleName}`}
            >
              <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-700 shrink-0" />
              <span className="truncate max-w-[110px] sm:max-w-none">{roleName}</span>
            </div>

            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer"
              aria-label="Toggle navigation drawer"
            >
              {isDrawerOpen ? <X className="w-4 h-4 text-slate-950" /> : <Menu className="w-4 h-4 text-slate-950" />}
              <span className="hidden md:inline">More</span>
              <span className="inline md:hidden text-[10px] font-black uppercase">Menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* SLIDE-OUT OVERLAY MOUNTED DIRECTLY ON DOCUMENT.BODY VIA REACT PORTAL */}
      {mounted && isDrawerOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-end font-sans">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Slide-over Panel */}
          <div
            className="relative z-10 w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col border-l-4 border-amber-400 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="bg-[#060b17] p-4 text-white flex items-center justify-between border-b-2 border-amber-400 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-amber-400 p-[2px] shadow-sm">
                  <div className="w-full h-full bg-blue-900 rounded-[9px] flex items-center justify-center font-extrabold text-amber-400 text-xs">
                    JRC
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-wide text-white uppercase leading-none">Workspace Menu</h3>
                  <p className="text-[10px] text-amber-400 font-bold mt-0.5">{roleName} ({email || "User"})</p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-extrabold transition-all"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50">
              {/* MOBILE-ONLY MAIN DEPARTMENTS GRID */}
              <div className="block md:hidden space-y-2">
                <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider block px-1">Main Departments</span>
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
                            ? "bg-blue-700 text-white border-amber-400 shadow-md ring-2 ring-blue-600/30"
                            : "bg-white text-slate-800 hover:bg-blue-50 hover:text-blue-700 border-slate-200"
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
              <div className="space-y-2">
                <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider block px-1">
                  <span className="hidden md:inline">Authorized System Modules</span>
                  <span className="inline md:hidden">System Modules & Vault</span>
                </span>
                <div className="space-y-1.5">
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
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-colors text-left border ${
                          isActive
                            ? "bg-blue-50 text-blue-900 border-blue-400 font-black ring-2 ring-blue-200"
                            : "bg-white text-slate-800 hover:bg-blue-50 hover:text-blue-700 border-slate-200"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-blue-600 shrink-0" />
                        <span className="flex-1">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-3 bg-white border-t border-slate-200 text-center shrink-0">
              <span className="text-[10px] text-slate-500 font-bold">JRC Industrial Sales ERP</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
