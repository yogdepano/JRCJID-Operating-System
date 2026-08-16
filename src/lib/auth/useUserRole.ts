"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export type RoleCode =
  | "super_admin"
  | "production_manager"
  | "production_lead"
  | "sales_rep"
  | "purchasing_officer"
  | "logistics_driver"
  | "pest_control_tech"
  | "finance_manager";

export interface UserRoleState {
  role: RoleCode | null;
  roleName: string;
  email: string | null;
  userId: string | null;
  loading: boolean;
}

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  sales_rep: "Sales",
  sales: "Sales",
  finance_manager: "Finance",
  finance: "Finance",
  production_manager: "Production",
  production_lead: "Production",
  production: "Production",
  purchasing_officer: "Logistics",
  logistics_driver: "Logistics",
  logistics: "Logistics",
  pest_control_tech: "Pest Control",
  pest_control: "Pest Control",
};

/**
 * Cleanse legacy override if present to prevent client-side role forgery.
 */
export function setRoleOverride(_newRole?: RoleCode) {
  try {
    localStorage.removeItem("jrc_active_role_override");
  } catch (err) {}
}

export function useUserRole(): UserRoleState {
  const [roleState, setRoleState] = useState<UserRoleState>({
    role: null,
    roleName: "Authenticating...",
    email: null,
    userId: null,
    loading: true,
  });

  useEffect(() => {
    // Purge any stored client-side role override on mount
    try {
      localStorage.removeItem("jrc_active_role_override");
    } catch (e) {}

    async function fetchRole() {
      try {
        const supabase = createClient();
        const { data: { user }, error: userErr } = await supabase.auth.getUser();

        if (!user || userErr) {
          setRoleState({
            role: null,
            roleName: "Guest",
            email: null,
            userId: null,
            loading: false,
          });
          return;
        }

        // Fetch authentic user role from user_roles & roles table
        const { data: userRoleRec, error: roleErr } = await supabase
          .from("user_roles")
          .select("role_id, roles(code, name)")
          .eq("user_id", user.id)
          .maybeSingle();

        let roleCode: RoleCode | null = null;
        let roleName = "General";

        if (userRoleRec && (userRoleRec as any).roles) {
          const roleObj = (userRoleRec as any).roles;
          const code = roleObj.code as RoleCode;
          if (ROLE_LABELS[code]) {
            roleCode = code;
            roleName = ROLE_LABELS[code];
          } else {
            roleCode = code;
            roleName = roleObj.name || code;
          }
        }

        // If no explicit user_roles record, check if user profile exists or fallback safely
        if (!roleCode) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("department")
            .eq("id", user.id)
            .maybeSingle();

          const dept = (profile?.department || "").toLowerCase();
          if (dept.includes("production")) {
            roleCode = "production_manager";
            roleName = "Production";
          } else if (dept.includes("finance") || dept.includes("accounting")) {
            roleCode = "finance_manager";
            roleName = "Finance";
          } else if (dept.includes("pest")) {
            roleCode = "pest_control_tech";
            roleName = "Pest Control";
          } else if (dept.includes("logistics") || dept.includes("purchasing") || dept.includes("warehouse")) {
            roleCode = "purchasing_officer";
            roleName = "Logistics";
          } else if (dept.includes("management") || dept.includes("executive") || dept.includes("admin")) {
            roleCode = "super_admin";
            roleName = "Super Admin";
          } else {
            // Safe default
            roleCode = "sales_rep";
            roleName = "Sales";
          }
        }

        setRoleState({
          role: roleCode,
          roleName,
          email: user.email || null,
          userId: user.id,
          loading: false,
        });
      } catch (err) {
        console.error("Error fetching authentic user role:", err);
        setRoleState({
          role: null,
          roleName: "Standard Employee",
          email: null,
          userId: null,
          loading: false,
        });
      }
    }

    fetchRole();
  }, []);

  return roleState;
}

