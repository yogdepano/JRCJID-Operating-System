"use client";

import { useState, useEffect } from "react";
import { UnifiedOrder, Department, OrderStatus, TimelineEvent, MaterialRequisitionItem } from "./types";
import { createClient } from "@/lib/supabase/client";

const LOCAL_STORAGE_UNIFIED_KEY = "jrc_unified_orders_v5";
const LOCAL_STORAGE_DELETED_KEY = "jrc_deleted_order_ids_v2";

const getDeletedOrderIds = (): string[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_DELETED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addDeletedOrderId = (idOrNum: string) => {
  if (!idOrNum) return;
  try {
    const deleted = getDeletedOrderIds();
    if (!deleted.includes(idOrNum)) {
      const updated = [...deleted, idOrNum];
      localStorage.setItem(LOCAL_STORAGE_DELETED_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error("Error saving deleted order id:", e);
  }
};

export function useUnifiedOrders() {
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    let currentOrders: UnifiedOrder[] = [];
    const deletedIds = getDeletedOrderIds();

    // 1. Clean stale local caches
    try {
      ["jrc_unified_orders_v1", "jrc_unified_orders_v2", "jrc_unified_orders_v3", "jrc_unified_orders_v4"].forEach(
        (key) => localStorage.removeItem(key)
      );

      const cached = localStorage.getItem(LOCAL_STORAGE_UNIFIED_KEY);
      if (cached) {
        const parsed: UnifiedOrder[] = JSON.parse(cached);
        currentOrders = parsed.filter(
          (o) => !deletedIds.includes(o.id) && !deletedIds.includes(o.order_number)
        );
      }
    } catch (e) {
      console.error("Local storage read error:", e);
    }

    // 2. Fetch ground truth from Supabase Database
    try {
      const supabase = createClient();
      const { data: dbOrders } = await supabase
        .from("sales_orders")
        .select("*, customers(company_name, shipping_address, payment_terms)")
        .order("created_at", { ascending: false });

      if (dbOrders) {
        const validDbOrders = dbOrders.filter(
          (so: any) => !deletedIds.includes(so.id) && !deletedIds.includes(so.order_number)
        );

        const remoteMapped: UnifiedOrder[] = validDbOrders.map((so: any) => {
          const matchedLocal = currentOrders.find((o) => o.order_number === so.order_number || o.id === so.id);
          if (matchedLocal) return matchedLocal;

          return {
            id: so.id,
            order_number: so.order_number || `PO-2026-${so.id.slice(0, 4)}`,
            customer_name: so.customers?.company_name || "Commercial Account",
            client_po_ref: "EMAIL-PO-ATTACHED",
            delivery_address: typeof so.customers?.shipping_address === "string" 
              ? so.customers.shipping_address 
              : so.customers?.shipping_address?.street || "Client Registered Site",
            po_date: so.created_at ? so.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
            payment_terms: so.customers?.payment_terms || "NET 30 Days",
            prepared_by: "Sales Representative",
            current_status: (so.status === "COMPLETED" ? "Completed" : "Waiting for Production") as OrderStatus,
            current_department_responsible: (so.status === "COMPLETED" ? "Sales" : "Production") as Department,
            last_updated_by: "System",
            last_updated_time: "Just now",
            items: [],
            subtotal: Number(so.total_amount) || 0,
            vat_amount: (Number(so.total_amount) || 0) * 0.12,
            grand_total: (Number(so.total_amount) || 0) * 1.12,
            timeline: [
              {
                id: `t-${so.id}`,
                timestamp: new Date().toLocaleString(),
                employee_name: "System",
                department: "Sales",
                action: "Order Created",
                notes: "Order synced from database",
              },
            ],
          };
        });

        // Supabase database is master source of truth for list
        currentOrders = remoteMapped.filter(
          (o) => !deletedIds.includes(o.id) && !deletedIds.includes(o.order_number)
        );
      }
    } catch (err) {
      console.error("Notice loading remote unified orders:", err);
    }

    setOrders(currentOrders);
    try {
      localStorage.setItem(LOCAL_STORAGE_UNIFIED_KEY, JSON.stringify(currentOrders));
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();

    const uniqueChannelId = `realtime_so_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let channel: any = null;

    try {
      const supabase = createClient();
      channel = supabase
        .channel(uniqueChannelId)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "sales_orders" },
          (payload) => {
            if (payload.eventType === "DELETE") {
              const deletedId = payload.old?.id || payload.old?.order_number;
              if (deletedId) {
                addDeletedOrderId(deletedId);
                setOrders((prev) => {
                  const filtered = prev.filter((o) => o.id !== deletedId && o.order_number !== deletedId);
                  try {
                    localStorage.setItem(LOCAL_STORAGE_UNIFIED_KEY, JSON.stringify(filtered));
                  } catch (e) {}
                  return filtered;
                });
              }
            } else {
              loadOrders();
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.error("Notice setting up realtime subscription:", err);
    }

    return () => {
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch (e) {}
      }
    };
  }, []);

  const saveOrders = (updated: UnifiedOrder[]) => {
    setOrders(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_UNIFIED_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving orders to localStorage:", e);
    }
  };

  const createOrder = async (orderData: Partial<UnifiedOrder>, employeeName: string) => {
    const orderNo = orderData.order_number || `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timestampStr = `${now.toISOString().split("T")[0]} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    const initialTimeline: TimelineEvent[] = [
      {
        id: `timeline-${Date.now()}-1`,
        timestamp: timestampStr,
        employee_name: employeeName,
        department: "Sales",
        action: "Order Created & Transmitted",
        notes: `Customer PO ${orderData.client_po_ref || ""} created by ${employeeName}`,
      },
    ];

    const newOrder: UnifiedOrder = {
      id: `so-${Date.now()}`,
      order_number: orderNo,
      customer_name: orderData.customer_name || "Commercial Account",
      client_po_ref: orderData.client_po_ref || "EMAIL-PO-REF",
      delivery_address: orderData.delivery_address || "Client Facility Address",
      po_date: orderData.po_date || now.toISOString().split("T")[0],
      delivery_date: orderData.delivery_date || "",
      payment_terms: orderData.payment_terms || "NET 30 Days",
      prepared_by: employeeName,
      authorized_by: orderData.authorized_by || "",
      po_photo_url: orderData.po_photo_url || "",
      current_status: "Waiting for Production",
      current_department_responsible: "Production",
      last_updated_by: employeeName,
      last_updated_time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      vat_amount: orderData.vat_amount || 0,
      grand_total: orderData.grand_total || 0,
      timeline: initialTimeline,
    };

    const updated = [newOrder, ...orders];
    saveOrders(updated);

    try {
      const supabase = createClient();
      await supabase.from("sales_orders").insert({
        order_number: orderNo,
        status: "APPROVED",
        payment_status: orderData.payment_terms?.startsWith("Cash") ? "PAID" : "UNPAID",
        total_amount: orderData.grand_total || 0,
      });
    } catch (err) {
      console.error("Error inserting to Supabase:", err);
    }

    return newOrder;
  };

  const transitionOrder = (
    orderId: string,
    nextStatus: OrderStatus,
    nextDepartment: Department,
    actionName: string,
    employeeName: string,
    notes?: string
  ) => {
    const now = new Date();
    const timestampStr = `${now.toISOString().split("T")[0]} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    const updated = orders.map((o) => {
      if (o.id !== orderId && o.order_number !== orderId) return o;

      const newTimelineEvent: TimelineEvent = {
        id: `timeline-${Date.now()}`,
        timestamp: timestampStr,
        employee_name: employeeName,
        department: o.current_department_responsible,
        action: actionName,
        notes: notes || `Moved order to ${nextStatus} (${nextDepartment})`,
      };

      return {
        ...o,
        current_status: nextStatus,
        current_department_responsible: nextDepartment,
        last_updated_by: employeeName,
        last_updated_time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timeline: [newTimelineEvent, ...o.timeline],
      };
    });

    saveOrders(updated);
  };

  const requestMaterials = (
    orderId: string,
    materials: MaterialRequisitionItem[],
    employeeName: string,
    notes?: string
  ) => {
    const now = new Date();
    const timestampStr = `${now.toISOString().split("T")[0]} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    const materialSummary = materials.map((m) => `${m.material_name} (${m.qty_needed} ${m.uom})`).join(", ");

    const updated = orders.map((o) => {
      if (o.id !== orderId && o.order_number !== orderId) return o;

      const newTimelineEvent: TimelineEvent = {
        id: `timeline-${Date.now()}`,
        timestamp: timestampStr,
        employee_name: employeeName,
        department: "Production",
        action: "Need Materials (Purchase Approval)",
        notes: notes || `Requested raw materials from Finance: ${materialSummary}`,
      };

      return {
        ...o,
        requested_materials: materials,
        current_status: "Waiting for Finance" as OrderStatus,
        current_department_responsible: "Finance" as Department,
        last_updated_by: employeeName,
        last_updated_time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timeline: [newTimelineEvent, ...o.timeline],
      };
    });

    saveOrders(updated);
  };

  const requestDepartment = (
    orderId: string,
    targetDepartment: Department,
    requestReason: string,
    employeeName: string,
    notes?: string
  ) => {
    const nextStatus: OrderStatus = `Waiting for ${targetDepartment}` as OrderStatus;
    transitionOrder(orderId, nextStatus, targetDepartment, `Requested ${targetDepartment}: ${requestReason}`, employeeName, notes);
  };

  const deleteOrder = async (orderId: string, employeeName: string) => {
    const targetOrder = orders.find((o) => o.id === orderId || o.order_number === orderId);
    if (targetOrder) {
      addDeletedOrderId(targetOrder.id);
      addDeletedOrderId(targetOrder.order_number);
    } else {
      addDeletedOrderId(orderId);
    }

    const updated = orders.filter((o) => o.id !== orderId && o.order_number !== orderId);
    saveOrders(updated);

    try {
      const supabase = createClient();
      await supabase
        .from("sales_orders")
        .delete()
        .or(`id.eq.${orderId},order_number.eq.${orderId}`);
    } catch (err) {
      console.error("Error deleting order from Supabase:", err);
    }
  };

  const updateOrder = async (orderId: string, updatedFields: Partial<UnifiedOrder>, employeeName: string) => {
    const now = new Date();
    const timestampStr = `${now.toISOString().split("T")[0]} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    const updated = orders.map((o) => {
      if (o.id !== orderId && o.order_number !== orderId) return o;

      const newTimelineEvent: TimelineEvent = {
        id: `timeline-${Date.now()}`,
        timestamp: timestampStr,
        employee_name: employeeName,
        department: o.current_department_responsible,
        action: "Master Edit (Super Admin)",
        notes: `Order details updated by Super Admin ${employeeName}`,
      };

      return {
        ...o,
        ...updatedFields,
        last_updated_by: employeeName,
        last_updated_time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        timeline: [newTimelineEvent, ...o.timeline],
      };
    });

    saveOrders(updated);

    try {
      const supabase = createClient();
      await supabase
        .from("sales_orders")
        .update({
          total_amount: updatedFields.grand_total,
          status: updatedFields.current_status === "Completed" ? "COMPLETED" : "APPROVED",
        })
        .or(`id.eq.${orderId},order_number.eq.${orderId}`);
    } catch (err) {
      console.error("Error updating order in Supabase:", err);
    }
  };

  return {
    orders,
    loading,
    createOrder,
    transitionOrder,
    requestMaterials,
    requestDepartment,
    deleteOrder,
    updateOrder,
    refreshOrders: loadOrders,
  };
}
