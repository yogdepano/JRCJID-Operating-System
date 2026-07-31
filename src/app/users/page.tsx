"use client";

import React, { useState } from "react";
import { Users, ShieldCheck, ArrowLeft, Search, UserCheck, ShieldAlert, CheckCircle2, UserX } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  role_code: "super_admin" | "production_manager" | "sales_rep" | "purchasing_officer" | "pest_control_tech" | "finance_manager";
  role_name: string;
  is_active: boolean;
}

const mockUsers: UserProfile[] = [
  {
    id: "u1",
    name: "Admin User",
    email: "admin@jrcindustrial.ph",
    department: "Executive Management",
    role_code: "super_admin",
    role_name: "Super Administrator",
    is_active: true,
  },
  {
    id: "u2",
    name: "Elena Rostova",
    email: "production@jrcindustrial.ph",
    department: "Chemical Production",
    role_code: "production_manager",
    role_name: "Production Manager",
    is_active: true,
  },
  {
    id: "u3",
    name: "Carlos Reyes",
    email: "sales@jrcindustrial.ph",
    department: "Sales & Distribution",
    role_code: "sales_rep",
    role_name: "Sales Representative",
    is_active: true,
  },
  {
    id: "u4",
    name: "Mario Santos",
    email: "tech@jrcindustrial.ph",
    department: "Pest Control Services",
    role_code: "pest_control_tech",
    role_name: "Pest Control Technician",
    is_active: true,
  },
  {
    id: "u5",
    name: "Juan Dela Cruz",
    email: "juan@jrcindustrial.ph",
    department: "Purchasing & Warehouse",
    role_code: "purchasing_officer",
    role_name: "Purchasing Officer",
    is_active: true,
  },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");

  const handleRoleChange = (userId: string, newRoleCode: UserProfile["role_code"]) => {
    const roleNames: Record<string, string> = {
      super_admin: "Super Administrator",
      production_manager: "Production Manager",
      sales_rep: "Sales Representative",
      purchasing_officer: "Purchasing Officer",
      pest_control_tech: "Pest Control Technician",
      finance_manager: "Finance Manager",
    };

    setUsers(
      users.map((u) =>
        u.id === userId ? { ...u, role_code: newRoleCode, role_name: roleNames[newRoleCode] } : u
      )
    );
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u)));
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 space-y-6 font-sans">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <h1 className="text-xl font-bold tracking-tight text-white">User & RBAC Security Management</h1>
            </div>
            <p className="text-xs text-slate-400">Administrator command panel for managing staff accounts, departments, and system roles</p>
          </div>
        </div>

        <span className="px-3 py-1 text-xs rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 font-medium">
          Super Admin Restricted Access
        </span>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-[#0f172a]/60 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Filter staff by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* USERS DATA TABLE */}
      <div className="p-5 rounded-xl bg-[#0f172a]/60 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">Employee Name</th>
              <th className="py-3 px-3">Work Email</th>
              <th className="py-3 px-3">Department</th>
              <th className="py-3 px-3">Assigned System Role (Admin Granted)</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Account Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-3 font-semibold text-slate-100 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs">
                    {u.name.charAt(0)}
                  </div>
                  {u.name}
                </td>
                <td className="py-3 px-3 text-slate-400 font-mono">{u.email}</td>
                <td className="py-3 px-3 font-medium text-slate-300">{u.department}</td>
                <td className="py-3 px-3">
                  <select
                    value={u.role_code}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserProfile["role_code"])}
                    className="p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-sky-400 font-semibold focus:border-sky-500"
                  >
                    <option value="super_admin">Super Administrator</option>
                    <option value="production_manager">Production Manager</option>
                    <option value="sales_rep">Sales Representative</option>
                    <option value="purchasing_officer">Purchasing Officer</option>
                    <option value="pest_control_tech">Pest Control Technician</option>
                    <option value="finance_manager">Finance Manager</option>
                  </select>
                </td>
                <td className="py-3 px-3">
                  {u.is_active ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center w-max gap-1">
                      <CheckCircle2 className="w-3 h-3" /> ACTIVE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center w-max gap-1">
                      <UserX className="w-3 h-3" /> SUSPENDED
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => toggleUserStatus(u.id)}
                    className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                      u.is_active
                        ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {u.is_active ? "Suspend Staff" : "Activate Staff"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
