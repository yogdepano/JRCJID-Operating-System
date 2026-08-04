"use client";

import React, { useState, useEffect } from "react";
import { UnifiedOrder, Department, OrderStatus, MaterialRequisitionItem, OrderLineItem } from "@/lib/orders/types";
import { useUnifiedOrders } from "@/lib/orders/useUnifiedOrders";
import { useUserRole } from "@/lib/auth/useUserRole";
import { OrderTimelineDrawer } from "@/components/Orders/OrderTimelineDrawer";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  ArrowRight,
  Plus,
  Camera,
  Search,
  PackageCheck,
  Send,
  HelpCircle,
  X,
  History,
  ShoppingCart,
  Boxes,
  DollarSign,
  Trash2,
  Pencil,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

interface OrderTaskViewProps {
  activeDepartment: Department | "Admin";
  employeeName?: string;
}

const LOCAL_STORAGE_PRODUCTS_KEY = "jrc_product_catalog_cache_v1";

const ALL_STATUS_OPTIONS: OrderStatus[] = [
  "Waiting for Sales",
  "Waiting for Production",
  "In Production",
  "Waiting for Finance",
  "Waiting for Logistics",
  "Waiting for Marketing",
  "Materials Being Purchased",
  "Ready for Delivery",
  "Delivered",
  "Completed",
  "Cancelled",
];

const ALL_DEPARTMENT_OPTIONS: Department[] = [
  "Sales",
  "Production",
  "Finance",
  "Logistics",
  "Marketing",
];

export function OrderTaskView({ activeDepartment, employeeName = "Internal Employee" }: OrderTaskViewProps) {
  const { orders, loading, transitionOrder, requestMaterials, requestDepartment, deleteOrder, updateOrder, refreshOrders } = useUnifiedOrders();
  const { role } = useUserRole();
  const isSuperAdmin = role === "super_admin" || activeDepartment === "Admin";

  const [activeTab, setActiveTab] = useState<"waiting" | "in_progress" | "completed">("waiting");
  const [selectedOrderForTimeline, setSelectedOrderForTimeline] = useState<UnifiedOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Product Catalog Cache for Requisition Dropdown
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);

  // Flexible Department Request Modal State
  const [requestModalOrder, setRequestModalOrder] = useState<UnifiedOrder | null>(null);
  const [targetDept, setTargetDept] = useState<Department>("Marketing");
  const [requestReason, setRequestReason] = useState("");
  const [requestNotes, setRequestNotes] = useState("");

  // Production Material Requisition Modal State
  const [materialModalOrder, setMaterialModalOrder] = useState<UnifiedOrder | null>(null);
  const [requisitionItems, setRequisitionItems] = useState<MaterialRequisitionItem[]>([]);
  const [requisitionNotes, setRequisitionNotes] = useState("");

  // Super Admin Edit Order Modal State
  const [editModalOrder, setEditModalOrder] = useState<UnifiedOrder | null>(null);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editClientPoRef, setEditClientPoRef] = useState("");
  const [editDeliveryAddress, setEditDeliveryAddress] = useState("");
  const [editPaymentTerms, setEditPaymentTerms] = useState("");
  const [editStatus, setEditStatus] = useState<OrderStatus>("Waiting for Production");
  const [editDept, setEditDept] = useState<Department>("Production");
  const [editLineItems, setEditLineItems] = useState<OrderLineItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
      if (stored) {
        setCatalogProducts(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error reading product catalog cache:", e);
    }
  }, []);

  // Filter orders by tab & search
  const filteredOrders = orders.filter((o) => {
    if (!o) return false;
    const orderNo = (o.order_number || "").toLowerCase();
    const custName = (o.customer_name || "").toLowerCase();
    const poRef = (o.client_po_ref || "").toLowerCase();
    const search = (searchTerm || "").toLowerCase();

    const matchesSearch =
      orderNo.includes(search) ||
      custName.includes(search) ||
      poRef.includes(search);

    if (!matchesSearch) return false;

    const isCompletedOrCancelled = o.current_status === "Completed" || o.current_status === "Cancelled";

    if (activeTab === "completed") {
      return isCompletedOrCancelled;
    }

    if (isCompletedOrCancelled) return false;

    const deptResp = (o.current_department_responsible || "Sales").toLowerCase();
    const targetDept = activeDepartment.toLowerCase();

    const isMyResponsibility =
      activeDepartment === "Admin"
        ? true
        : deptResp === targetDept;

    if (activeTab === "waiting") {
      return isMyResponsibility;
    } else {
      return !isMyResponsibility;
    }
  });

  const waitingCount = orders.filter(
    (o) =>
      o &&
      o.current_status !== "Completed" &&
      o.current_status !== "Cancelled" &&
      (activeDepartment === "Admin" || (o.current_department_responsible || "Sales").toLowerCase() === activeDepartment.toLowerCase())
  ).length;

  const inProgressCount = orders.filter(
    (o) =>
      o &&
      o.current_status !== "Completed" &&
      o.current_status !== "Cancelled" &&
      activeDepartment !== "Admin" &&
      (o.current_department_responsible || "Sales").toLowerCase() !== activeDepartment.toLowerCase()
  ).length;

  const completedCount = orders.filter(
    (o) => o && (o.current_status === "Completed" || o.current_status === "Cancelled")
  ).length;

  // Material Requisition Handlers
  const handleOpenMaterialModal = (order: UnifiedOrder) => {
    setMaterialModalOrder(order);
    const defaultProduct = catalogProducts.find((p) => p.category === "raw_material") || catalogProducts[0];
    const initialItem: MaterialRequisitionItem = {
      id: `req-${Date.now()}`,
      material_sku: defaultProduct?.sku || "RM-RAW-01",
      material_name: defaultProduct?.name || "Raw Chemical Material",
      qty_needed: 10,
      uom: defaultProduct?.uom || "KG",
      supplier_name: defaultProduct?.supplier_name || "Primary Chemical Distributor",
      estimated_unit_cost: Number(defaultProduct?.supplier_price || defaultProduct?.unit_cost) || 150,
      total_cost: (Number(defaultProduct?.supplier_price || defaultProduct?.unit_cost) || 150) * 10,
    };
    setRequisitionItems([initialItem]);
    setRequisitionNotes("");
  };

  const handleAddRequisitionItem = () => {
    const defaultProduct = catalogProducts.find((p) => p.category === "raw_material") || catalogProducts[0];
    const newItem: MaterialRequisitionItem = {
      id: `req-${Date.now()}-${Math.random()}`,
      material_sku: defaultProduct?.sku || "RM-RAW-01",
      material_name: defaultProduct?.name || "Raw Chemical Material",
      qty_needed: 10,
      uom: defaultProduct?.uom || "KG",
      supplier_name: defaultProduct?.supplier_name || "Primary Chemical Distributor",
      estimated_unit_cost: Number(defaultProduct?.supplier_price || defaultProduct?.unit_cost) || 150,
      total_cost: (Number(defaultProduct?.supplier_price || defaultProduct?.unit_cost) || 150) * 10,
    };
    setRequisitionItems([...requisitionItems, newItem]);
  };

  const handleRemoveRequisitionItem = (id: string) => {
    if (requisitionItems.length <= 1) return;
    setRequisitionItems(requisitionItems.filter((i) => i.id !== id));
  };

  const handleUpdateRequisitionItem = (id: string, field: keyof MaterialRequisitionItem, value: any) => {
    setRequisitionItems(
      requisitionItems.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };

        if (field === "material_sku") {
          const prod = catalogProducts.find((p) => p.sku === value);
          if (prod) {
            updated.material_name = prod.name;
            updated.uom = prod.uom || "KG";
            updated.supplier_name = prod.supplier_name || "Chemical Supplier";
            updated.estimated_unit_cost = Number(prod.supplier_price || prod.unit_cost) || 150;
          }
        }

        const qty = field === "qty_needed" ? Number(value) : updated.qty_needed;
        const cost = field === "estimated_unit_cost" ? Number(value) : updated.estimated_unit_cost || 0;
        updated.total_cost = qty * cost;

        return updated;
      })
    );
  };

  const handleSubmitMaterialRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialModalOrder) return;

    requestMaterials(materialModalOrder.id, requisitionItems, employeeName, requisitionNotes);
    setMaterialModalOrder(null);
  };

  const handleCustomRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalOrder) return;

    requestDepartment(
      requestModalOrder.id,
      targetDept,
      requestReason || "Inter-Department Task Request",
      employeeName,
      requestNotes
    );

    setRequestModalOrder(null);
    setRequestReason("");
    setRequestNotes("");
  };

  // Super Admin Master Control Handlers
  const handleOpenEditModal = (order: UnifiedOrder) => {
    setEditModalOrder(order);
    setEditCustomerName(order.customer_name);
    setEditClientPoRef(order.client_po_ref);
    setEditDeliveryAddress(order.delivery_address || "");
    setEditPaymentTerms(order.payment_terms || "NET 30 Days");
    setEditStatus(order.current_status);
    setEditDept(order.current_department_responsible);
    setEditLineItems(order.items || []);
  };

  const handleDeleteOrder = (order: UnifiedOrder) => {
    if (window.confirm(`Are you sure you want to permanently delete order "${order.order_number}" (${order.customer_name})? This cannot be undone.`)) {
      deleteOrder(order.id, employeeName || "Super Admin");
    }
  };

  const handleSaveEditOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalOrder) return;

    const subtotal = editLineItems.reduce((sum, item) => sum + item.total_price, 0);
    const vat = subtotal * 0.12;
    const grandTotal = subtotal + vat;

    updateOrder(
      editModalOrder.id,
      {
        customer_name: editCustomerName,
        client_po_ref: editClientPoRef,
        delivery_address: editDeliveryAddress,
        payment_terms: editPaymentTerms,
        current_status: editStatus,
        current_department_responsible: editDept,
        items: editLineItems,
        subtotal,
        vat_amount: vat,
        grand_total: grandTotal,
      },
      employeeName || "Super Admin"
    );

    setEditModalOrder(null);
  };

  return (
    <div className="space-y-3 font-sans">
      {/* TASK FILTER TABS */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("waiting")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === "waiting"
                ? "bg-blue-700 text-white shadow-xs ring-1 ring-amber-400"
                : "text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>📫 Orders Waiting for Me</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono font-bold ${activeTab === "waiting" ? "bg-amber-400 text-slate-950" : "bg-slate-200 text-slate-800"}`}>
              {waitingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("in_progress")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === "in_progress"
                ? "bg-blue-700 text-white shadow-xs ring-1 ring-amber-400"
                : "text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>⏳ Orders In Progress</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono font-bold ${activeTab === "in_progress" ? "bg-amber-400 text-slate-950" : "bg-slate-200 text-slate-800"}`}>
              {inProgressCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === "completed"
                ? "bg-blue-700 text-white shadow-xs ring-1 ring-amber-400"
                : "text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>✅ Completed & Closed</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono font-bold ${activeTab === "completed" ? "bg-amber-400 text-slate-950" : "bg-slate-200 text-slate-800"}`}>
              {completedCount}
            </span>
          </button>
        </div>

        {/* SEARCH BAR & SYNC BUTTON */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search order # or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
            />
          </div>

          <button
            onClick={() => refreshOrders()}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-700 font-extrabold text-xs flex items-center gap-1 shrink-0 active:scale-95 transition-all"
            title="Force sync database orders across all devices"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Sync DB</span>
          </button>
        </div>
      </div>

      {/* ORDERS CARDS GRID */}
      {loading ? (
        <div className="p-12 text-center bg-white border-2 border-slate-200 rounded-2xl text-slate-500 font-bold">
          Loading live synchronized orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900">
            {activeTab === "waiting"
              ? "No Orders Waiting For Your Action!"
              : activeTab === "in_progress"
              ? "No Orders Currently In Progress Across Other Departments"
              : "No Completed Orders Yet"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
            {activeTab === "waiting"
              ? "All pending tasks for your department are completed. When another department sends an order, it will automatically populate here."
              : "Active orders created by Sales will move through Production, Finance, Logistics, and Marketing automatically."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredOrders.map((o) => {
            const deptResp = (o.current_department_responsible || "Sales").toLowerCase();
            const targetDept = activeDepartment.toLowerCase();
            const isMyTurn = activeDepartment === "Admin" || deptResp === targetDept;

            const requisitionTotal = o.requested_materials
              ? o.requested_materials.reduce((sum, item) => sum + (item.total_cost || 0), 0)
              : 0;

            return (
              <div
                key={o.id}
                className={`p-3.5 rounded-xl border space-y-2.5 shadow-2xs transition-all bg-white ${
                  isMyTurn ? "border-amber-400 ring-1 ring-amber-400/40" : "border-slate-200"
                }`}
              >
                {/* CARD HEADER: STATUS & RESPONSIBILITY BADGES */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-mono text-xs font-extrabold text-blue-700 block leading-tight">{o.order_number}</span>
                    <span className="text-xs font-bold text-slate-900 truncate block max-w-[200px]">{o.customer_name}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9px] uppercase font-extrabold text-slate-400 block leading-none mb-0.5">Responsible Dept</span>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-blue-900 text-amber-300 font-extrabold text-[11px] shadow-2xs">
                      {o.current_department_responsible}
                    </span>
                  </div>
                </div>

                {/* STATUS BAR & DETAILS */}
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-500 text-[11px]">Current Status:</span>
                    <span className="font-extrabold text-blue-800 bg-blue-100 px-2 py-0.2 rounded border border-blue-200 text-[11px]">
                      {o.current_status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-500 font-medium text-[11px]">Grand Total:</span>
                    <span className="font-extrabold text-slate-900 text-xs">
                      ₱{o.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {o.delivery_address && (
                    <div className="text-[10px] text-slate-600 font-medium truncate">
                      📍 <span className="font-bold text-slate-800">{o.delivery_address}</span>
                    </div>
                  )}

                  <div className="text-[9px] text-slate-400 font-medium flex items-center justify-between pt-0.5 border-t border-slate-200/60">
                    <span>Updated by: <strong className="text-slate-700">{o.last_updated_by}</strong></span>
                    <span>{o.last_updated_time}</span>
                  </div>
                </div>

                {/* ORDERED LINE ITEMS PREVIEW */}
                {o.items && o.items.length > 0 && (
                  <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-200 text-[11px] space-y-0.5">
                    <span className="text-[9px] font-extrabold text-blue-800 uppercase block">Ordered Products:</span>
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between font-semibold text-slate-800">
                        <span className="truncate max-w-[180px]">{it.product_name}</span>
                        <span className="font-mono text-blue-700 font-bold">{it.qty} {it.uom}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* REQUESTED MATERIALS BREAKDOWN FOR FINANCE REVIEW */}
                {o.requested_materials && o.requested_materials.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-xs space-y-2 shadow-xs">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                      <span className="font-extrabold text-amber-900 uppercase tracking-tight flex items-center gap-1.5">
                        <Boxes className="w-4 h-4 text-amber-600" />
                        <span>Material Purchase Requisition (From Production)</span>
                      </span>
                      <span className="font-mono font-extrabold text-amber-900">
                        Total ₱{requisitionTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {o.requested_materials.map((m, idx) => (
                        <div key={m.id || idx} className="p-2 bg-white rounded-lg border border-amber-200 flex items-center justify-between font-semibold text-slate-800">
                          <div>
                            <span className="font-bold text-slate-900 block">{m.material_name}</span>
                            <span className="text-[10px] text-slate-500 font-medium">Supplier: {m.supplier_name || "Chemical Vendor"}</span>
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-xs font-extrabold text-blue-700 block">{m.qty_needed} {m.uom}</span>
                            <span className="text-[10px] text-slate-600">@ ₱{(m.estimated_unit_cost || 0).toFixed(2)}/unit = ₱{(m.total_cost || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ACTION BUTTONS TAILORED FOR DEPARTMENTS */}
                {isMyTurn && o.current_status !== "Completed" && o.current_status !== "Cancelled" && (
                  <div className="pt-2 border-t-2 border-slate-100 space-y-2">
                    <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">
                      ⚡ Required Department Action:
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {/* SALES ACTIONS */}
                      {(activeDepartment === "Sales" || activeDepartment === "Admin") && (
                        <>
                          {o.current_status === "Waiting for Sales" && (
                            <button
                              onClick={() =>
                                transitionOrder(
                                  o.id,
                                  "Waiting for Production",
                                  "Production",
                                  "Submitted Order to Production & Finance",
                                  employeeName
                                )
                              }
                              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-950 font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5"
                            >
                              <span>Send for Review</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}

                          {o.current_status === "Materials Being Purchased" && (
                            <button
                              onClick={() =>
                                transitionOrder(
                                  o.id,
                                  "Waiting for Logistics",
                                  "Logistics",
                                  "Materials Ordered from Supplier",
                                  employeeName,
                                  "Materials purchased; ready for supplier collection by Logistics."
                                )
                              }
                              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-950 font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5"
                            >
                              <span>Materials Ordered</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}

                          {o.current_status === "Delivered" && (
                            <button
                              onClick={() =>
                                transitionOrder(
                                  o.id,
                                  "Completed",
                                  "Sales",
                                  "Payment Recorded & Complete Order",
                                  employeeName,
                                  "Final payment collected. Order completed and closed."
                                )
                              }
                              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5"
                            >
                              <span>Complete Order</span>
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}

                      {/* PRODUCTION ACTIONS */}
                      {(activeDepartment === "Production" || activeDepartment === "Admin") && (
                        <>
                          {o.current_status === "Waiting for Production" && (
                            <>
                              <button
                                onClick={() =>
                                  transitionOrder(
                                    o.id,
                                    "In Production",
                                    "Production",
                                    "Start Production",
                                    employeeName,
                                    "Finished goods/raw materials sufficient. Chemical batch mixing started."
                                  )
                                }
                                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1"
                              >
                                <span>Start Production</span>
                              </button>

                              <button
                                onClick={() => handleOpenMaterialModal(o)}
                                className="py-2.5 px-3 rounded-xl bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-800 font-extrabold text-xs shadow-sm"
                              >
                                Need Materials
                              </button>
                            </>
                          )}

                          {o.current_status === "In Production" && (
                            <button
                              onClick={() =>
                                transitionOrder(
                                  o.id,
                                  "Ready for Delivery",
                                  "Logistics",
                                  "Complete Production",
                                  employeeName,
                                  "Chemical batch production completed. Transmitted to Logistics for delivery."
                                )
                              }
                              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5"
                            >
                              <span>Complete Production</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}

                      {/* FINANCE ACTIONS */}
                      {(activeDepartment === "Finance" || activeDepartment === "Admin") && (
                        <>
                          {o.current_status === "Waiting for Finance" && (
                            <>
                              <button
                                onClick={() =>
                                  transitionOrder(
                                    o.id,
                                    "Materials Being Purchased",
                                    "Sales",
                                    "Approve Purchase",
                                    employeeName,
                                    `Raw material purchase (₱${requisitionTotal.toFixed(2)}) approved by Finance. Returned to Sales for procurement.`
                                  )
                                }
                                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm"
                              >
                                Approve Purchase
                              </button>

                              <button
                                onClick={() =>
                                  transitionOrder(
                                    o.id,
                                    "Waiting for Sales",
                                    "Sales",
                                    "Reject Purchase",
                                    employeeName,
                                    "Purchase rejected by Finance due to budget limits."
                                  )
                                }
                                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-sm"
                              >
                                Reject Purchase
                              </button>
                            </>
                          )}
                        </>
                      )}

                      {/* LOGISTICS ACTIONS */}
                      {(activeDepartment === "Logistics" || activeDepartment === "Admin") && (
                        <>
                          {o.current_status === "Waiting for Logistics" && (
                            <button
                              onClick={() =>
                                transitionOrder(
                                  o.id,
                                  "Waiting for Production",
                                  "Production",
                                  "Materials Received",
                                  employeeName,
                                  "Raw materials collected from supplier and delivered to plant. Returned to Production."
                                )
                              }
                              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-950 font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5"
                            >
                              <span>Materials Received</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          )}

                          {o.current_status === "Ready for Delivery" && (
                            <button
                              onClick={() =>
                                transitionOrder(
                                  o.id,
                                  "Delivered",
                                  "Sales",
                                  "Delivered",
                                  employeeName,
                                  "Finished products delivered to client site. Sent to Sales for payment collection."
                                )
                              }
                              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5"
                            >
                              <span>Delivered</span>
                              <PackageCheck className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}

                      {/* MARKETING ACTIONS */}
                      {(activeDepartment === "Marketing" || activeDepartment === "Admin") && (
                        <>
                          {o.current_status === "Waiting for Marketing" && (
                            <button
                              onClick={() =>
                                transitionOrder(
                                  o.id,
                                  "Waiting for Production",
                                  "Production",
                                  "Complete Marketing Request",
                                  employeeName,
                                  "Marketing labels, packaging, and artwork completed. Returned to Production."
                                )
                              }
                              className="flex-1 py-2.5 px-3 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs shadow-sm"
                            >
                              Complete Marketing Request
                            </button>
                          )}
                        </>
                      )}

                      {/* FLEXIBLE DEPARTMENT REQUEST BUTTON */}
                      <button
                        onClick={() => {
                          setRequestModalOrder(o);
                          setTargetDept(activeDepartment === "Production" ? "Marketing" : "Sales");
                        }}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs flex items-center gap-1"
                        title="Request another department for labels, info, or damaged goods"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span>Request Dept</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* SUPER ADMIN OVERRIDE CONTROL BAR */}
                {isSuperAdmin && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 bg-amber-50/60 p-1.5 rounded-lg border border-amber-200/80">
                    <div className="flex items-center gap-1 text-[10px] font-extrabold text-amber-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Super Admin Master Control</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(o)}
                        className="px-2 py-0.5 rounded-md bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-950 font-extrabold text-[10px] flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                        title="Edit customer, status, department, and items for this order"
                      >
                        <Pencil className="w-3 h-3 text-slate-950" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteOrder(o)}
                        className="px-2 py-0.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                        title="Permanently delete this order from the system"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* CARD FOOTER: TIMELINE LIGHTBOX & OFFICIAL DOCUMENTS */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setSelectedOrderForTimeline(o)}
                    className="text-blue-700 hover:underline font-extrabold flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5 text-amber-500" />
                    <span>View Activity Log ({o.timeline.length})</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/documents?type=sales_invoice&so=${encodeURIComponent(o.order_number)}`}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 font-bold text-[11px]"
                    >
                      Invoice
                    </Link>
                    <Link
                      href={`/documents?type=delivery_receipt&so=${encodeURIComponent(o.order_number)}`}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-amber-50 text-slate-700 font-bold text-[11px]"
                    >
                      DR
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CHRONOLOGICAL TIMELINE DRAWER */}
      {selectedOrderForTimeline && (
        <OrderTimelineDrawer
          order={selectedOrderForTimeline}
          onClose={() => setSelectedOrderForTimeline(null)}
        />
      )}

      {/* PRODUCTION MATERIAL REQUISITION MODAL */}
      {materialModalOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border-2 border-blue-600 rounded-2xl w-full max-w-2xl p-5 sm:p-6 space-y-4 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-700" />
                <span>Specify Raw Materials Needed ({materialModalOrder.order_number})</span>
              </h3>
              <button onClick={() => setMaterialModalOrder(null)} className="text-slate-400 hover:text-slate-900 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitMaterialRequisition} className="space-y-4 text-xs sm:text-sm">
              <p className="text-xs text-slate-600 font-medium">
                Specify the exact chemical raw materials, quantities, and units needed for Finance to approve purchasing.
              </p>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {requisitionItems.map((item, index) => (
                  <div key={item.id} className="p-3 sm:p-4 rounded-xl bg-slate-50 border-2 border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-600">Material Requirement #{index + 1}</span>
                      {requisitionItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRequisitionItem(item.id)}
                          className="text-rose-600 hover:text-rose-700 p-1 font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-800 font-extrabold block mb-1">Select Raw Material from Catalog</label>
                        <select
                          value={item.material_sku}
                          onChange={(e) => handleUpdateRequisitionItem(item.id, "material_sku", e.target.value)}
                          className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold"
                        >
                          {catalogProducts.map((p) => (
                            <option key={p.sku} value={p.sku}>
                              {p.name} ({p.sku} — Supplier: {p.supplier_name || "Vendor"} ₱{Number(p.supplier_price || p.unit_cost || 0).toFixed(2)}/{p.uom || "unit"})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-800 font-extrabold block mb-1">Supplier Name</label>
                        <input
                          type="text"
                          value={item.supplier_name || ""}
                          onChange={(e) => handleUpdateRequisitionItem(item.id, "supplier_name", e.target.value)}
                          placeholder="e.g. Metro Chemical Supplies"
                          className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-slate-800 font-extrabold block mb-1">Qty Needed</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.qty_needed}
                          onChange={(e) => handleUpdateRequisitionItem(item.id, "qty_needed", e.target.value)}
                          className="w-full p-2 bg-white border-2 border-slate-200 rounded-xl text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-slate-800 font-extrabold block mb-1">Unit (UOM)</label>
                        <input
                          type="text"
                          required
                          value={item.uom}
                          onChange={(e) => handleUpdateRequisitionItem(item.id, "uom", e.target.value)}
                          className="w-full p-2 bg-white border-2 border-slate-200 rounded-xl text-xs font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-slate-800 font-extrabold block mb-1">Est Total (₱)</label>
                        <div className="p-2 bg-amber-50 border-2 border-amber-200 rounded-xl font-mono font-extrabold text-amber-900 text-xs flex items-center justify-end">
                          ₱{(item.total_cost || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddRequisitionItem}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-400 border border-amber-500 text-slate-950 font-extrabold text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Material Line Item</span>
              </button>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1">Optional Notes for Finance</label>
                <textarea
                  rows={2}
                  placeholder="Specify why materials are insufficient or urgent delivery notes..."
                  value={requisitionNotes}
                  onChange={(e) => setRequisitionNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMaterialModalOrder(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md"
                >
                  Submit Material Request to Finance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FLEXIBLE INTER-DEPARTMENT REQUEST MODAL */}
      {requestModalOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-blue-600 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-700" />
                <span>Request Department Task ({requestModalOrder.order_number})</span>
              </h3>
              <button onClick={() => setRequestModalOrder(null)} className="text-slate-400 hover:text-slate-900 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomRequestSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-slate-800 block mb-1">Target Department Needed</label>
                <select
                  value={targetDept}
                  onChange={(e) => setTargetDept(e.target.value as Department)}
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="Marketing">Marketing (Labels, Packaging & Artwork)</option>
                  <option value="Sales">Sales (Incomplete Information / Re-quote)</option>
                  <option value="Production">Production (Damaged Material Check / Mixing)</option>
                  <option value="Finance">Finance (Special Purchase Approval)</option>
                  <option value="Logistics">Logistics (Special Pickup)</option>
                </select>
              </div>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1">Reason for Request</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Requesting custom container labels..."
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1">Optional Notes</label>
                <textarea
                  rows={2}
                  placeholder="Add specific instructions for the department..."
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRequestModalOrder(null)}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-extrabold shadow-sm"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPER ADMIN EDIT ORDER MASTER MODAL */}
      {editModalOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border-2 border-amber-500 rounded-2xl w-full max-w-2xl p-5 sm:p-6 space-y-4 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>Super Admin Master Edit ({editModalOrder.order_number})</span>
              </h3>
              <button onClick={() => setEditModalOrder(null)} className="text-slate-400 hover:text-slate-900 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditOrder} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Customer Account Name</label>
                  <input
                    type="text"
                    required
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Client PO # Reference</label>
                  <input
                    type="text"
                    value={editClientPoRef}
                    onChange={(e) => setEditClientPoRef(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={editPaymentTerms}
                    onChange={(e) => setEditPaymentTerms(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Current Order Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  >
                    {ALL_STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Responsible Department</label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value as Department)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                  >
                    {ALL_DEPARTMENT_OPTIONS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-800 font-extrabold block mb-1">Delivery Address</label>
                <input
                  type="text"
                  value={editDeliveryAddress}
                  onChange={(e) => setEditDeliveryAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-extrabold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-950 text-xs font-extrabold shadow-md"
                >
                  Save Master Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
