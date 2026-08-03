"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import { useUserRole, RoleCode } from "@/lib/auth/useUserRole";

interface RoleGuardProps {
  allowedRoles: RoleCode[];
  children: React.ReactNode;
  moduleName?: string;
}

export function RoleGuard({ allowedRoles, children, moduleName = "this page" }: RoleGuardProps) {
  const { role, roleName, loading } = useUserRole();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying role authorizations...</span>
        </div>
      </div>
    );
  }

  const isAllowed = role === "super_admin" || (role && allowedRoles.includes(role));

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white border-2 border-rose-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center mx-auto text-rose-600 shadow-md">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Access Restricted</h2>
            <p className="text-xs text-slate-600 font-medium">
              Your account assigned role (<span className="font-extrabold text-blue-700 uppercase">{roleName}</span>) does not have RBAC permission to access {moduleName}.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono font-semibold text-slate-700 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-rose-500" />
            <span>Authorized roles: {allowedRoles.join(", ")}</span>
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all ring-2 ring-amber-400"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Allowed Workspace Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
