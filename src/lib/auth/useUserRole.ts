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

export const ROLE_LABELS: Record<RoleCode, string> = {
  super_admin: "Super Administrator",
  sales_rep: "Sales Representative",
  finance_manager: "Finance Manager",
  production_manager: "Production Manager",
  production_lead: "Production Lead",
  purchasing_officer: "Purchasing Officer",
  logistics_driver: "Logistics Driver",
  pest_control_tech: "Pest Control Technician",
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
        let roleName = "Standard Employee";

        if (userRoleRec && (userRoleRec as any).roles) {
          const roleObj = (userRoleRec as any).roles;
          const code = roleObj.code as RoleCode;
          if (ROLE_LABELS[code]) {
            roleCode = code;
            roleName = roleObj.name || ROLE_LABELS[code];
          }
        }

        // If no explicit user_roles record, check if user profile exists or fallback safely
        if (!roleCode) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("department")
            .eq("id", user.id)
            .maybeSingle();

          if (profile?.department === "Production") {
            roleCode = "production_lead";
            roleName = "Production Lead";
          } else if (profile?.department === "Finance") {
            roleCode = "finance_manager";
            roleName = "Finance Manager";
          } else if (profile?.department === "Pest Control") {
            roleCode = "pest_control_tech";
            roleName = "Pest Control Technician";
          } else {
            // Safe lowest privilege default
            roleCode = "sales_rep";
            roleName = "Sales Representative";
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

