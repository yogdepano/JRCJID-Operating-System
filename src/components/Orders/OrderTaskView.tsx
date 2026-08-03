"use client";

import React, { useState } from "react";
import { UnifiedOrder, Department, OrderStatus } from "@/lib/orders/types";
import { useUnifiedOrders } from "@/lib/orders/useUnifiedOrders";
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
  FileText,
  Search,
  PackageCheck,
  Send,
  HelpCircle,
  X,
  History
} from "lucide-react";
import Link from "next/link";

interface OrderTaskViewProps {
  activeDepartment: Department | "Admin";
  employeeName?: string;
}

export function OrderTaskView({ activeDepartment, employeeName = "Internal Employee" }: OrderTaskViewProps) {
  const { orders, loading, transitionOrder, requestDepartment } = useUnifiedOrders();
  const [activeTab, setActiveTab] = useState<"waiting" | "in_progress" | "completed">("waiting");
  const [selectedOrderForTimeline, setSelectedOrderForTimeline] = useState<UnifiedOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Flexible Department Request Modal State
  const [requestModalOrder, setRequestModalOrder] = useState<UnifiedOrder | null>(null);
  const [targetDept, setTargetDept] = useState<Department>("Marketing");
  const [requestReason, setRequestReason] = useState("");
  const [requestNotes, setRequestNotes] = useState("");

  const userDept = activeDepartment === "Admin" ? "Sales" : activeDepartment;

  // Filter orders by tab & search
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.client_po_ref.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const isCompletedOrCancelled = o.current_status === "Completed" || o.current_status === "Cancelled";

    if (activeTab === "completed") {
      return isCompletedOrCancelled;
    }

    if (isCompletedOrCancelled) return false;

    const isMyResponsibility =
      activeDepartment === "Admin"
        ? true
        : o.current_department_responsible.toLowerCase() === activeDepartment.toLowerCase();

    if (activeTab === "waiting") {
      return isMyResponsibility;
    } else {
      // in_progress
      return !isMyResponsibility;
    }
  });

  const waitingCount = orders.filter(
    (o) =>
      o.current_status !== "Completed" &&
      o.current_status !== "Cancelled" &&
      (activeDepartment === "Admin" || o.current_department_responsible.toLowerCase() === activeDepartment.toLowerCase())
  ).length;

  const inProgressCount = orders.filter(
    (o) =>
      o.current_status !== "Completed" &&
      o.current_status !== "Cancelled" &&
      activeDepartment !== "Admin" &&
      o.current_department_responsible.toLowerCase() !== activeDepartment.toLowerCase()
  ).length;

  const completedCount = orders.filter(
    (o) => o.current_status === "Completed" || o.current_status === "Cancelled"
  ).length;

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

  return (
    <div className="space-y-6 font-sans">
      {/* TASK FILTER TABS */}
      <div className="bg-white p-2 sm:p-3 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("waiting")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
              activeTab === "waiting"
                ? "bg-blue-700 text-white shadow-md shadow-blue-600/30 ring-2 ring-amber-400"
                : "text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>📬 Orders Waiting for Me</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${activeTab === "waiting" ? "bg-amber-400 text-slate-950" : "bg-slate-200 text-slate-800"}`}>
              {waitingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("in_progress")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
              activeTab === "in_progress"
                ? "bg-blue-700 text-white shadow-md shadow-blue-600/30 ring-2 ring-amber-400"
                : "text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>⏳ Orders In Progress</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${activeTab === "in_progress" ? "bg-amber-400 text-slate-950" : "bg-slate-200 text-slate-800"}`}>
              {inProgressCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all whitespace-nowrap ${
              activeTab === "completed"
                ? "bg-blue-700 text-white shadow-md shadow-blue-600/30 ring-2 ring-amber-400"
                : "text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>✅ Completed & Closed</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${activeTab === "completed" ? "bg-amber-400 text-slate-950" : "bg-slate-200 text-slate-800"}`}>
              {completedCount}
            </span>
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order # or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
          />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOrders.map((o) => {
            const isMyTurn =
              activeDepartment === "Admin" ||
              o.current_department_responsible.toLowerCase() === activeDepartment.toLowerCase();

            return (
              <div
                key={o.id}
                className={`p-5 rounded-2xl border-2 space-y-4 shadow-sm transition-all bg-white ${
                  isMyTurn ? "border-amber-400 ring-2 ring-amber-400/30" : "border-slate-200"
                }`}
              >
                {/* CARD HEADER: STATUS & RESPONSIBILITY BADGES */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-sm font-extrabold text-blue-700 block">{o.order_number}</span>
                    <span className="text-xs font-bold text-slate-900">{o.customer_name}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Responsible Dept</span>
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-900 text-amber-300 font-extrabold text-xs shadow-xs">
                      {o.current_department_responsible}
                    </span>
                  </div>
                </div>

                {/* STATUS BAR & DETAILS */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-600">Current Status:</span>
                    <span className="font-extrabold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-md border border-blue-200">
                      {o.current_status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-500 font-medium">Grand Total:</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      ₱{o.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {o.delivery_address && (
                    <div className="text-[11px] text-slate-600 font-medium truncate">
                      📍 Delivery Address: <span className="font-bold text-slate-800">{o.delivery_address}</span>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 font-medium flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span>Updated by: <strong className="text-slate-700">{o.last_updated_by}</strong></span>
                    <span>{o.last_updated_time}</span>
                  </div>
                </div>

                {/* LINE ITEMS PREVIEW */}
                {o.items && o.items.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-1">
                    <span className="text-[10px] font-extrabold text-blue-800 uppercase block">Ordered Products:</span>
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between font-semibold text-slate-800">
                        <span className="truncate max-w-[200px]">{it.product_name}</span>
                        <span className="font-mono text-blue-700 font-bold">{it.qty} {it.uom}</span>
                      </div>
                    ))}
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
                                onClick={() =>
                                  transitionOrder(
                                    o.id,
                                    "Waiting for Finance",
                                    "Finance",
                                    "Need Materials (Purchase Approval)",
                                    employeeName,
                                    "Raw materials insufficient. Sent to Finance for purchasing approval."
                                  )
                                }
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
                                    "Raw material purchase approved by Finance. Returned to Sales for procurement."
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
    </div>
  );
}
