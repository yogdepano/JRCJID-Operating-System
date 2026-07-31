"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Plus, Search, UserCheck, Lock, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopNavbar } from "@/components/Navigation/TopNavbar";

interface SystemUser {
  id: string;
  email: string;
  role: "super_admin" | "sales_rep" | "production_lead" | "logistics_driver" | "finance_officer";
  full_name: string;
  department: string;
  status: "ACTIVE" | "INACTIVE";
}

const INITIAL_USERS: SystemUser[] = [
  {
    id: "usr-1",
    email: "admin@jrcindustrial.ph",
    role: "super_admin",
    full_name: "Operations Super Admin",
    department: "Executive Management",
    status: "ACTIVE",
  },
  {
    id: "usr-2",
    email: "sales@jrcindustrial.ph",
    role: "sales_rep",
    full_name: "Maria Santos",
    department: "Sales & Commercial",
    status: "ACTIVE",
  },
  {
    id: "usr-3",
    email: "production@jrcindustrial.ph",
    role: "production_lead",
    full_name: "Juan Dela Cruz",
    department: "Chemical Manufacturing",
    status: "ACTIVE",
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* STICKY TOP NAVIGATION BAR */}
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* HEADER - LIGHT MODE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <ShieldCheck className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">User Security & Role-Based Access (RBAC)</h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Manage staff accounts, department authorizations, and system permissions</p>
            </div>
          </div>

          <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-500 text-slate-950 font-extrabold text-sm shadow-md shadow-yellow-500/20 active:scale-95 transition-all">
            <Plus className="w-5 h-5 text-slate-950" />
            <span>+ Add New Employee Account</span>
          </button>
        </div>

        {/* USERS TABLE */}
        <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-extrabold">
                <th className="py-3 px-3">Employee Name</th>
                <th className="py-3 px-3">Email Address</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Assigned Role</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-3.5 px-3 font-extrabold text-slate-900">{u.full_name}</td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-blue-700">{u.email}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-700">{u.department}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-0.5 rounded text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200 uppercase">
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
