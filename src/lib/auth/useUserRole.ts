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
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setRoleState({
            role: "super_admin", // Default fallback if unauthenticated demo
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
  }, []);

  return roleState;
}
