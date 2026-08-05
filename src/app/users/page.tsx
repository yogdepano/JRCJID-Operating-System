"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Plus, Search, UserCheck, Trash2, Edit3, UserPlus, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TopNavbar } from "@/components/Navigation/TopNavbar";
import { RoleGuard } from "@/components/Auth/RoleGuard";

export interface SystemUser {
  id: string;
  email: string;
  role: "super_admin" | "production_manager" | "sales_rep" | "purchasing_officer" | "pest_control_tech" | "finance_manager";
  role_name: string;
  full_name: string;
  department: string;
  status: "ACTIVE" | "INACTIVE";
}

const ROLE_OPTIONS = [
  { code: "super_admin", name: "Super Administrator" },
  { code: "production_manager", name: "Production Manager" },
  { code: "sales_rep", name: "Sales Representative" },
  { code: "purchasing_officer", name: "Purchasing Officer" },
  { code: "pest_control_tech", name: "Pest Control Tech" },
  { code: "finance_manager", name: "Finance Manager" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // New User Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("Chemical Manufacturing");
  const [role, setRole] = useState<SystemUser["role"]>("sales_rep");
  const [status, setStatus] = useState<SystemUser["status"]>("ACTIVE");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Fetch Profiles
      const { data: profiles, error: profileErr } = await supabase.from("profiles").select("*");
      
      // Fetch Roles & User Roles
      const { data: userRoles } = await supabase.from("user_roles").select("user_id, role_id");
      const { data: dbRoles } = await supabase.from("roles").select("id, code, name");

      const roleMap = new Map<string, { code: string; name: string }>();
      if (dbRoles) {
        dbRoles.forEach((r: any) => roleMap.set(r.id, { code: r.code, name: r.name }));
      }

      const userRoleAssignments = new Map<string, { code: string; name: string }>();
      if (userRoles) {
        userRoles.forEach((ur: any) => {
          const roleObj = roleMap.get(ur.role_id);
          if (roleObj) {
            userRoleAssignments.set(ur.user_id, roleObj);
          }
        });
      }

      if (profiles && profiles.length > 0) {
        const loadedUsers: SystemUser[] = profiles.map((p: any) => {
          const assigned = userRoleAssignments.get(p.id);
          return {
            id: p.id,
            email: p.email,
            role: (assigned?.code as SystemUser["role"]) || "sales_rep",
            role_name: assigned?.name || "Sales Representative",
            full_name: `${p.first_name || "Employee"} ${p.last_name || ""}`.trim(),
            department: p.department || "General Operations",
            status: p.is_active ? "ACTIVE" : "INACTIVE",
          };
        });

        setUsers(loadedUsers);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Error loading users from Supabase:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const supabase = createClient();
      const names = fullName.trim().split(" ");
      const firstName = names[0] || fullName;
      const lastName = names.slice(1).join(" ") || "Employee";

      // Insert profile
      const { data: newProfile, error: profileErr } = await supabase
        .from("profiles")
        .insert({
          email,
          first_name: firstName,
          last_name: lastName,
          department,
          is_active: status === "ACTIVE",
        })
        .select()
        .single();

      if (profileErr) {
        alert(`Notice adding profile: ${profileErr.message}`);
      }

      // Assign Role in user_roles
      const targetUserId = newProfile?.id;
      if (targetUserId) {
        const { data: roleRec } = await supabase
          .from("roles")
          .select("id")
          .eq("code", role)
          .single();

        if (roleRec?.id) {
          await supabase.from("user_roles").insert({
            user_id: targetUserId,
            role_id: roleRec.id,
          });
        }
      }

      setIsModalOpen(false);
      setFullName("");
      setEmail("");
      await loadUsers();
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  const handleOpenEditModal = (u: SystemUser) => {
    setEditingUser({ ...u });
    setIsEditModalOpen(true);
  };

  const handleSaveEditedUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const supabase = createClient();

      // Update Profile
      await supabase
        .from("profiles")
        .update({
          department: editingUser.department,
          is_active: editingUser.status === "ACTIVE",
        })
        .eq("id", editingUser.id);

      // Update Role in user_roles
      const { data: roleRec } = await supabase
        .from("roles")
        .select("id")
        .eq("code", editingUser.role)
        .single();

      if (roleRec?.id) {
        await supabase.from("user_roles").delete().eq("user_id", editingUser.id);
        await supabase.from("user_roles").insert({
          user_id: editingUser.id,
          role_id: roleRec.id,
        });
      }

      setIsEditModalOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      console.error("Error updating user role:", err);
    }
  };

  const handleQuickRoleChange = async (userId: string, newRoleCode: SystemUser["role"]) => {
    try {
      const supabase = createClient();
      const { data: roleRec } = await supabase
        .from("roles")
        .select("id")
        .eq("code", newRoleCode)
        .single();

      if (roleRec?.id) {
        await supabase.from("user_roles").delete().eq("user_id", userId);
        await supabase.from("user_roles").insert({
          user_id: userId,
          role_id: roleRec.id,
        });
        await loadUsers();
      }
    } catch (err) {
      console.error("Error toggling role:", err);
    }
  };

  const handleToggleStatus = async (user: SystemUser) => {
    try {
      const supabase = createClient();
      const newStatus = user.status === "ACTIVE" ? false : true;
      await supabase.from("profiles").update({ is_active: newStatus }).eq("id", user.id);
      await loadUsers();
    } catch (e) {
      console.error("Status toggle error:", e);
    }
  };

  const handleDeleteUser = async (user: SystemUser) => {
    if (!confirm(`Are you sure you want to remove authorization for ${user.full_name} (${user.email})?`)) return;
    try {
      const supabase = createClient();
      await supabase.from("user_roles").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);
      await loadUsers();
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === "ALL" || u.department.toLowerCase().includes(departmentFilter.toLowerCase());
    return matchesSearch && matchesDept;
  });

  return (
    <RoleGuard allowedRoles={["super_admin"]} moduleName="User Security">
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* STICKY TOP NAVIGATION BAR */}
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <ShieldCheck className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">User Security & Permissions</h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Manage staff accounts, department authorizations, and system permissions</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={loadUsers}
              className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-300"
              title="Refresh Users"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-500 text-slate-950 font-extrabold text-sm shadow-md shadow-yellow-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 text-slate-950" />
              <span>+ Add New Employee Account</span>
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Name, Email, or Department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["ALL", "Executive", "Sales", "Manufacturing", "Pest Control", "Finance"].map((dept) => (
              <button
                key={dept}
                onClick={() => setDepartmentFilter(dept)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors ${
                  departmentFilter === dept
                    ? "bg-blue-700 text-white border-2 border-amber-400 shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-blue-50 border border-slate-200"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* USERS DATA TABLE */}
        {loading ? (
          <div className="p-12 text-center bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-sm">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600">Loading user accounts from database...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-sm">
            <UserCheck className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900">No Employee Accounts Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Click "+ Add New Employee Account" to register staff accounts or manage account role authorizations.
            </p>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-extrabold">
                  <th className="py-3 px-3">Employee Name</th>
                  <th className="py-3 px-3">Work Email Address</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Assigned Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-3.5 px-3 font-extrabold text-slate-900">{u.full_name}</td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-blue-700">{u.email}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700">{u.department}</td>
                    <td className="py-3.5 px-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleQuickRoleChange(u.id, e.target.value as SystemUser["role"])}
                        className="px-2.5 py-1 rounded text-xs font-extrabold bg-blue-50 text-blue-900 border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.code} value={r.code}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border transition-all ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                        }`}
                      >
                        {u.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                          title="Edit User Info"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                          title="Delete User Authorization"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ADD EMPLOYEE ACCOUNT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white border-2 border-blue-600 rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-5 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-700" />
                  <span>Register Employee Account</span>
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Employee Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Juan Dela Cruz"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Company Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="employee@jrcindustrial.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 font-semibold focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold"
                  >
                    <option value="Chemical Manufacturing">Chemical Manufacturing (Production)</option>
                    <option value="Sales & Commercial">Sales & Commercial</option>
                    <option value="Pest Control Services">Pest Control Services</option>
                    <option value="Logistics & Warehouse">Logistics & Warehouse</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                    <option value="Executive Management">Executive Management</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Assigned Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as SystemUser["role"])}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Account Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as SystemUser["status"])}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-extrabold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-950 text-xs font-extrabold shadow-md"
                  >
                    Save Employee Authorization
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT USER MODAL */}
        {isEditModalOpen && editingUser && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white border-2 border-blue-600 rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-5 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-700" />
                  <span>Edit Employee Authorization</span>
                </h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveEditedUser} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={editingUser.department}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Assigned Role</label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as SystemUser["role"] })}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Status</label>
                    <select
                      value={editingUser.status}
                      onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as SystemUser["status"] })}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-extrabold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-extrabold shadow-md ring-2 ring-amber-400"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      </div>
    </RoleGuard>
  );
}
