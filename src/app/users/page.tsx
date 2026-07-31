"use client";

import React, { useState, useEffect } from "react";
import { Users, ShieldCheck, ArrowLeft, Search, Plus, CheckCircle2, UserX, Trash2, Building2, UserPlus, X } from "lucide-react";
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

  // Modal State for New Employee Creation
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newDepartment, setNewDepartment] = useState("Chemical Production");
  const [newRoleCode, setNewRoleCode] = useState("production_manager");

  // Fetch Live Profiles from Supabase
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Map profiles and fetch roles
      const formattedUsers: UserProfile[] = (profilesData || []).map((p) => ({
        id: p.id,
        email: p.email,
        first_name: p.first_name || "Employee",
        last_name: p.last_name || "User",
        department: p.department || "General Operations",
        is_active: p.is_active ?? true,
        roles: [AVAILABLE_ROLES[0]], // Default initial view
      }));

      setUsers(formattedUsers);
    } catch (err) {
      console.error("Error fetching users from Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update Department for User
  const handleDepartmentChange = (userId: string, newDept: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, department: newDept } : u)));
  };

  // Add Role to User
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

  // Remove Role from User
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

  // Toggle Account Active Status
  const toggleUserStatus = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u)));
  };

  // Handle Admin Creating New Employee Account
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
      // Reset Form
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
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 space-y-6 font-sans">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <h1 className="text-xl font-bold tracking-tight text-white">User Security & Multi-Role RBAC</h1>
            </div>
            <p className="text-xs text-slate-400">Super Admin command panel for assigning departments and multi-role security permissions</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-[#0f172a]/60 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search employees by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* USERS & ROLES DATA TABLE */}
      <div className="p-5 rounded-xl bg-[#0f172a]/60 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">Employee Name</th>
              <th className="py-3 px-3">Work Email</th>
              <th className="py-3 px-3">Department (Editable)</th>
              <th className="py-3 px-3">Assigned System Roles (Multi-Role Support)</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-3 font-semibold text-slate-100 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs border border-sky-500/30">
                    {u.first_name.charAt(0)}
                  </div>
                  <span>{u.first_name} {u.last_name}</span>
                </td>
                <td className="py-3 px-3 text-slate-400 font-mono">{u.email}</td>
                
                {/* EDITABLE DEPARTMENT SELECTOR */}
                <td className="py-3 px-3">
                  <select
                    value={u.department}
                    onChange={(e) => handleDepartmentChange(u.id, e.target.value)}
                    className="p-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:border-sky-500"
                  >
                    {ALL_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </td>

                {/* MULTI-ROLE BADGES & ADD ROLE BUTTON */}
                <td className="py-3 px-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {u.roles.map((r) => (
                      <span
                        key={r.code}
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/30 flex items-center gap-1"
                      >
                        {r.name}
                        {u.roles.length > 1 && (
                          <button
                            onClick={() => handleRemoveRoleFromUser(u.id, r.code)}
                            className="hover:text-rose-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}

                    {/* ADD ROLE DROPDOWN */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddRoleToUser(u.id, e.target.value);
                          e.target.value = "";
                        }
                      }}
                      className="px-2 py-0.5 bg-slate-900 border border-dashed border-slate-700 rounded-full text-[10px] text-slate-400 hover:text-sky-400 hover:border-sky-500 focus:outline-none"
                    >
                      <option value="">+ Add Role</option>
                      {AVAILABLE_ROLES.filter((ar) => !u.roles.some((ur) => ur.code === ar.code)).map((ar) => (
                        <option key={ar.code} value={ar.code}>
                          {ar.name}
                        </option>
                      ))}
                    </select>
                  </div>
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

      {/* MODAL FOR CREATING NEW EMPLOYEE */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-sky-400" />
                <span>Create New Staff Account</span>
              </h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Juan"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Dela Cruz"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="employee@jrcindustrial.ph"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Initial Temporary Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:border-sky-500"
                  >
                    {ALL_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Primary Role</label>
                  <select
                    value={newRoleCode}
                    onChange={(e) => setNewRoleCode(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:border-sky-500"
                  >
                    {AVAILABLE_ROLES.map((r) => (
                      <option key={r.code} value={r.code}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold shadow-lg shadow-sky-500/20"
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
