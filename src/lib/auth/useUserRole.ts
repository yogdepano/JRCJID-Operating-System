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

export function setRoleOverride(newRole: RoleCode) {
  try {
    localStorage.setItem("jrc_active_role_override", newRole);
    window.dispatchEvent(new Event("jrc_role_changed"));
  } catch (err) {}
}

export function useUserRole(): UserRoleState {
  const [roleState, setRoleState] = useState<UserRoleState>({
    role: null,
    roleName: "User",
    email: null,
    userId: null,
    loading: true,
  });

  useEffect(() => {
    async function fetchRole() {
      try {
        const override = localStorage.getItem("jrc_active_role_override") as RoleCode | null;

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (override && ROLE_LABELS[override]) {
          setRoleState({
            role: override,
            roleName: ROLE_LABELS[override],
            email: user?.email || `${override}@jrcindustrial.ph`,
            userId: user?.id || null,
            loading: false,
          });
          return;
        }

        if (!user) {
          setRoleState({
            role: "super_admin",
            roleName: "Super Administrator",
            email: "admin@jrcindustrial.ph",
            userId: null,
            loading: false,
          });
          return;
        }

        // Fetch user role from user_roles table
        const { data: userRoleRec } = await supabase
          .from("user_roles")
          .select("role_id, roles(code, name)")
          .eq("user_id", user.id)
          .single();

        let roleCode: RoleCode = "super_admin";
        let roleName = "Super Administrator";

        if (userRoleRec && (userRoleRec as any).roles) {
          const roleObj = (userRoleRec as any).roles;
          roleCode = roleObj.code as RoleCode;
          roleName = roleObj.name || roleObj.code;
        }

        setRoleState({
          role: roleCode,
          roleName,
          email: user.email || null,
          userId: user.id,
          loading: false,
        });
      } catch (err) {
        console.error("Error fetching user role:", err);
        setRoleState({
          role: "super_admin",
          roleName: "Super Administrator",
          email: null,
          userId: null,
          loading: false,
        });
      }
    }

    fetchRole();

    const handleRoleChange = () => {
      fetchRole();
    };

    window.addEventListener("jrc_role_changed", handleRoleChange);
    return () => {
      window.removeEventListener("jrc_role_changed", handleRoleChange);
    };
  }, []);

  return roleState;
}
