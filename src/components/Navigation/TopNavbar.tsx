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
  ChevronDown
} from "lucide-react";

const mainDepartmentNav = [
  { name: "Home", href: "/", icon: LayoutDashboard },
  { name: "Sales", href: "/sales", icon: ShoppingCart },
  { name: "Finance", href: "/documents", icon: DollarSign },
  { name: "Marketing", href: "/products", icon: Target },
  { name: "Production", href: "/recipes", icon: Factory },
  { name: "Logistics", href: "/inventory", icon: Truck },
];

const secondaryNav = [
  { name: "Product Catalog Master", href: "/products", icon: Package },
  { name: "Pest Control Dispatch", href: "/pest-control", icon: Bug },
  { name: "User Security & RBAC", href: "/users", icon: ShieldCheck },
  { name: "Document Vault (BIR)", href: "/documents", icon: FileText },
];

export function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-[#0b132b] border-b border-[#1c2541] shadow-xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
        {/* BRAND LOGO */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 p-[2px] shadow-lg shadow-yellow-500/20">
            <div className="w-full h-full bg-[#0b132b] rounded-[10px] flex items-center justify-center font-extrabold text-amber-400 text-xs">
              JRC
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-sm tracking-tight text-white block leading-none">JRC Industrial</span>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">ERP System</span>
          </div>
        </Link>

        {/* STICKY MAIN DEPARTMENT NAVIGATION - ALWAYS ON TOP */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 px-1 no-scrollbar">
          {mainDepartmentNav.map((dept) => {
            const Icon = dept.icon;
            const isActive = pathname === dept.href;
            return (
              <Link
                key={dept.name}
                href={dept.href}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-amber-400 text-slate-950 shadow-md shadow-yellow-500/20"
                    : "text-slate-200 hover:text-amber-400 hover:bg-[#131c35]"
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
                <span>{dept.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* MORE / SECURITY DRAWER TOGGLE */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#131c35] border border-[#1c2541] text-amber-400 hover:text-yellow-300 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
          >
            {isDrawerOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5 text-amber-400" />}
            <span className="hidden md:inline">More</span>
          </button>
        </div>
      </div>

      {/* SLIDE-OUT OVERLAY FOR SECONDARY MODULES & SECURITY */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div
            className="absolute top-16 right-4 w-72 bg-[#0b132b] border border-[#1c2541] rounded-2xl p-4 space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1c2541] pb-2">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">All ERP Modules</span>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-1">
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.href);
                      setIsDrawerOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:bg-[#131c35] hover:text-amber-400 transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
