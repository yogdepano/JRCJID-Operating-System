"use client";

import React, { useState, useEffect } from "react";
import { Users, ShieldCheck, ArrowLeft, Search, Plus, CheckCircle2, UserX, UserPlus, X, Building2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface SystemRole {
  id: string;
  code: string;
  name: string;
}

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  department: string;
  is_active: boolean;
  roles: SystemRole[];
}

const ALL_DEPARTMENTS = [
  "Chemical Production",
  "Sales & Distribution",
  "Pest Control Services",
  "Purchasing & Warehouse",
  "Finance & Accounting",
  "Executive Management",
  "General Operations"
];

const AVAILABLE_ROLES: SystemRole[] = [
  { id: "r1", code: "super_admin", name: "Super Administrator" },
  { id: "r2", code: "production_manager", name: "Production Manager" },
  { id: "r3", code: "sales_rep", name: "Sales Representative" },
  { id: "r4", code: "purchasing_officer", name: "Purchasing Officer" },
  { id: "r5", code: "pest_control_tech", name: "Pest Control Technician" },
  { id: "r6", code: "finance_manager", name: "Finance Manager" },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newDepartment, setNewDepartment] = useState("Chemical Production");
  const [newRoleCode, setNewRoleCode] = useState("production_manager");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const formattedUsers: UserProfile[] = (profilesData || []).map((p) => ({
        id: p.id,
        email: p.email,
        first_name: p.first_name || "Employee",
        last_name: p.last_name || "User",
        department: p.department || "General Operations",
        is_active: p.is_active ?? true,
        roles: [AVAILABLE_ROLES[0]],
      }));

      setUsers(formattedUsers);
    } catch (err) {
      console.error("Notice loading profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDepartmentChange = (userId: string, newDept: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, department: newDept } : u)));
  };

  const handleAddRoleToUser = (userId: string, roleCode: string) => {
    const roleToAdd = AVAILABLE_ROLES.find((r) => r.code === roleCode);
    if (!roleToAdd) return;

    setUsers(
      users.map((u) => {
        if (u.id === userId) {
          const alreadyHasRole = u.roles.some((r) => r.code === roleCode);
          if (alreadyHasRole) return u;
          return { ...u, roles: [...u.roles, roleToAdd] };
        }
        return u;
      })
    );
  };

  const handleRemoveRoleFromUser = (userId: string, roleCode: string) => {
    setUsers(
      users.map((u) => {
        if (u.id === userId) {
          return { ...u, roles: u.roles.filter((r) => r.code !== roleCode) };
        }
        return u;
      })
    );
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u)));
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newEmail,
        password: newPassword,
        options: {
          data: {
            first_name: newFirstName,
            last_name: newLastName,
            department: newDepartment,
          },
        },
      });

      if (authError) throw authError;

      const initialRole = AVAILABLE_ROLES.find((r) => r.code === newRoleCode) || AVAILABLE_ROLES[1];

      const newProfile: UserProfile = {
        id: authData.user?.id || `usr-${Date.now()}`,
        email: newEmail,
        first_name: newFirstName,
        last_name: newLastName,
        department: newDepartment,
        is_active: true,
        roles: [initialRole],
      };

      setUsers([newProfile, ...users]);
      setIsAddUserModalOpen(false);
      setNewEmail("");
      setNewPassword("");
      setNewFirstName("");
      setNewLastName("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error creating user");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#060b17] text-slate-100 p-4 sm:p-6 space-y-5 sm:space-y-6 font-sans pb-24 lg:pb-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2541] pb-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2.5 rounded-xl bg-[#0b132b] border border-[#1c2541] text-amber-400 hover:text-yellow-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">User Security & Multi-Role RBAC</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">Manage employee departments and system role permissions</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-yellow-500/20 active:scale-95 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-[#0b132b] p-4 rounded-2xl border border-[#1c2541] flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* MOBILE RESPONSIVE CARDS VIEW (FOR SMALL SCREENS) */}
      <div className="block lg:hidden space-y-4">
        {filteredUsers.map((u) => (
          <div key={u.id} className="p-5 rounded-2xl bg-[#0b132b] border border-[#1c2541] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-400/20 text-amber-400 font-extrabold flex items-center justify-center text-sm border border-amber-400/40">
                  {u.first_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{u.first_name} {u.last_name}</h3>
                  <p className="text-xs text-slate-300 font-mono truncate">{u.email}</p>
                </div>
              </div>
              <button
                onClick={() => toggleUserStatus(u.id)}
                className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  u.is_active ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                }`}
              >
                {u.is_active ? "ACTIVE" : "SUSPENDED"}
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-xs font-bold text-amber-400/90 uppercase tracking-wider">Department</label>
              <select
                value={u.department}
                onChange={(e) => handleDepartmentChange(u.id, e.target.value)}
                className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100 font-semibold"
              >
                {ALL_DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-400/90 uppercase tracking-wider">Assigned Roles</label>
              <div className="flex flex-wrap items-center gap-2">
                {u.roles.map((r) => (
                  <span key={r.code} className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center gap-1.5">
                    {r.name}
                    {u.roles.length > 1 && (
                      <button onClick={() => handleRemoveRoleFromUser(u.id, r.code)}><X className="w-3.5 h-3.5 text-rose-400" /></button>
                    )}
                  </span>
                ))}
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddRoleToUser(u.id, e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="px-3 py-1 bg-[#131c35] border border-dashed border-[#1c2541] rounded-full text-xs text-slate-300 font-semibold"
                >
                  <option value="">+ Add Role</option>
                  {AVAILABLE_ROLES.filter((ar) => !u.roles.some((ur) => ur.code === ar.code)).map((ar) => (
                    <option key={ar.code} value={ar.code}>{ar.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP DATA TABLE (LARGE SCREENS) */}
      <div className="hidden lg:block p-5 rounded-2xl bg-[#0b132b] border border-[#1c2541] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1c2541] text-xs text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">Employee Name</th>
              <th className="py-3 px-3">Work Email</th>
              <th className="py-3 px-3">Department (Editable)</th>
              <th className="py-3 px-3">Assigned System Roles</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c2541] text-sm text-slate-200">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-[#131c35]/50 transition-colors">
                <td className="py-3.5 px-3 font-semibold text-slate-100 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 font-bold flex items-center justify-center text-xs border border-amber-400/40">
                    {u.first_name.charAt(0)}
                  </div>
                  <span>{u.first_name} {u.last_name}</span>
                </td>
                <td className="py-3.5 px-3 text-slate-300 font-mono">{u.email}</td>
                
                <td className="py-3.5 px-3">
                  <select
                    value={u.department}
                    onChange={(e) => handleDepartmentChange(u.id, e.target.value)}
                    className="p-2 bg-[#131c35] border border-[#1c2541] rounded-xl text-xs text-slate-100 font-semibold"
                  >
                    {ALL_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </td>

                <td className="py-3.5 px-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {u.roles.map((r) => (
                      <span key={r.code} className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center gap-1">
                        {r.name}
                        {u.roles.length > 1 && (
                          <button onClick={() => handleRemoveRoleFromUser(u.id, r.code)}><X className="w-3.5 h-3.5 text-rose-400" /></button>
                        )}
                      </span>
                    ))}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddRoleToUser(u.id, e.target.value);
                          e.target.value = "";
                        }
                      }}
                      className="px-2 py-0.5 bg-[#131c35] border border-dashed border-[#1c2541] rounded-full text-xs text-slate-300 font-semibold"
                    >
                      <option value="">+ Add Role</option>
                      {AVAILABLE_ROLES.filter((ar) => !u.roles.some((ur) => ur.code === ar.code)).map((ar) => (
                        <option key={ar.code} value={ar.code}>{ar.name}</option>
                      ))}
                    </select>
                  </div>
                </td>

                <td className="py-3.5 px-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    u.is_active ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  }`}>
                    {u.is_active ? "ACTIVE" : "SUSPENDED"}
                  </span>
                </td>

                <td className="py-3.5 px-3 text-right">
                  <button
                    onClick={() => toggleUserStatus(u.id)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#131c35] hover:bg-[#1c2541] text-slate-200"
                  >
                    {u.is_active ? "Suspend Staff" : "Activate Staff"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL FOR CREATING NEW EMPLOYEE */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b132b] border border-[#1c2541] rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1c2541] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>Create New Staff Account</span>
              </h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-200 font-bold block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Juan"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-200 font-bold block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Dela Cruz"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-200 font-bold block mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="employee@jrcindustrial.ph"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100"
                />
              </div>

              <div>
                <label className="text-slate-200 font-bold block mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-200 font-bold block mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100"
                  >
                    {ALL_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-200 font-bold block mb-1">Primary Role</label>
                  <select
                    value={newRoleCode}
                    onChange={(e) => setNewRoleCode(e.target.value)}
                    className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100"
                  >
                    {AVAILABLE_ROLES.map((r) => (
                      <option key={r.code} value={r.code}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#131c35] text-slate-300 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-yellow-500/20"
                >
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
