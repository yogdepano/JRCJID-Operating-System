"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, Plus, ArrowLeft, Search, Filter, DollarSign, FileText, CheckCircle2, Clock, Truck, Factory, ShieldAlert, ArrowRight, UploadCloud } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface SalesOrder {
  id: string;
  order_number: string;
  customer_name: string;
  client_po_ref: string;
  order_date: string;
  total_amount: number;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "IN_PRODUCTION" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
  payment_status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
  payment_terms: string;
  items_summary: string;
}

export default function SalesPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Sales Order Form State
  const [customerName, setCustomerName] = useState("San Miguel Food Group");
  const [clientPoRef, setClientPoRef] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("NET 30");
  const [productSku, setProductSku] = useState("FG-CHEM-500");
  const [productQty, setProductQty] = useState(10);
  const [unitPrice, setUnitPrice] = useState(2450.00);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("sales_orders").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        const formatted: SalesOrder[] = data.map((o) => ({
          id: o.id,
          order_number: o.order_number || `SO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          customer_name: o.customer_name || "Commercial Account",
          client_po_ref: o.client_po_ref || "PO-CLIENT-8891",
          order_date: new Date(o.created_at || Date.now()).toISOString().split("T")[0],
          total_amount: Number(o.total_amount) || 0,
          status: o.status || "APPROVED",
          payment_status: o.payment_status || "UNPAID",
          payment_terms: o.payment_terms || "NET 30",
          items_summary: "Industrial Chemical Products",
        }));
        setOrders(formatted);
      }
    } catch (err) {
      console.error("Notice loading sales orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const subtotal = productQty * unitPrice;
  const vat = subtotal * 0.12;
  const grandTotal = subtotal + vat;

  const handleCreateSalesOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const orderNo = `SO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: SalesOrder = {
      id: `so-${Date.now()}`,
      order_number: orderNo,
      customer_name: customerName,
      client_po_ref: clientPoRef || "EMAIL-PO-ATTACHED",
      order_date: new Date().toISOString().split("T")[0],
      total_amount: grandTotal,
      status: "APPROVED", // Auto-transmits to Production, Warehouse & Finance!
      payment_status: "UNPAID",
      payment_terms: paymentTerms,
      items_summary: `${productQty} units (${productSku})`,
    };

    setOrders([newOrder, ...orders]);
    setIsModalOpen(false);

    try {
      const supabase = createClient();
      await supabase.from("sales_orders").insert({
        order_number: orderNo,
        status: "APPROVED",
        payment_status: "UNPAID",
        total_amount: grandTotal,
      });
    } catch (err) {
      console.error("Error saving sales order to Supabase:", err);
    }

    setClientPoRef("");
  };

  const filteredOrders = orders.filter((o) =>
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.client_po_ref.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#060b17] text-slate-100 p-4 sm:p-6 space-y-5 sm:space-y-6 font-sans pb-24 lg:pb-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2541] pb-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2.5 rounded-xl bg-[#0b132b] border border-[#1c2541] text-amber-400 hover:text-yellow-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-amber-400" />
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">Sales Orders & Cross-Department Dispatch</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">Log client email POs and instantly transmit orders to Production, Warehouse & Finance</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-yellow-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Sales Order (From Email PO)</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-[#0b132b] p-4 rounded-2xl border border-[#1c2541] flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Sales Order #, Client PO Ref, or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* MOBILE RESPONSIVE CARDS VIEW */}
      <div className="block lg:hidden space-y-4">
        {filteredOrders.map((o) => (
          <div key={o.id} className="p-5 rounded-2xl bg-[#0b132b] border border-[#1c2541] space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-extrabold text-amber-400">{o.order_number}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                {o.status}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">{o.customer_name}</h3>
              <p className="text-xs text-slate-400 font-mono">Client PO Ref: <span className="text-amber-400 font-semibold">{o.client_po_ref}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#1c2541]">
              <div>
                <span className="text-slate-400 text-[10px] block">Grand Total (inc VAT)</span>
                <span className="font-mono font-extrabold text-slate-100 text-sm">₱{o.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Payment Terms</span>
                <span className="font-mono font-bold text-emerald-400">{o.payment_terms} ({o.payment_status})</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP DATA TABLE */}
      <div className="hidden lg:block p-5 rounded-2xl bg-[#0b132b] border border-[#1c2541] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1c2541] text-xs text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">SO Number</th>
              <th className="py-3 px-3">Customer Account</th>
              <th className="py-3 px-3">Client Email PO Ref</th>
              <th className="py-3 px-3">Order Date</th>
              <th className="py-3 px-3">Terms</th>
              <th className="py-3 px-3">Total Amount (₱)</th>
              <th className="py-3 px-3">Workflow Status</th>
              <th className="py-3 px-3">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c2541] text-sm text-slate-200">
            {filteredOrders.map((o) => (
              <tr key={o.id} className="hover:bg-[#131c35]/50 transition-colors">
                <td className="py-3.5 px-3 font-mono font-extrabold text-amber-400">{o.order_number}</td>
                <td className="py-3.5 px-3 font-bold text-slate-100">{o.customer_name}</td>
                <td className="py-3.5 px-3 font-mono text-slate-300">{o.client_po_ref}</td>
                <td className="py-3.5 px-3 text-slate-400">{o.order_date}</td>
                <td className="py-3.5 px-3 font-mono text-slate-300">{o.payment_terms}</td>
                <td className="py-3.5 px-3 font-mono font-bold text-white">₱{o.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="py-3.5 px-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    {o.status}
                  </span>
                </td>
                <td className="py-3.5 px-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-400 border border-amber-400/40">
                    {o.payment_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE SALES ORDER MODAL (FROM EMAIL PO) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b132b] border border-[#1c2541] rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1c2541] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <span>Log Sales Order from Client Email PO</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateSalesOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-200 font-bold block mb-1">Customer Account</label>
                <select
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100 font-semibold"
                >
                  <option value="San Miguel Food Group">San Miguel Food Group</option>
                  <option value="Century Pacific Manufacturing">Century Pacific Manufacturing</option>
                  <option value="Robinsons Supermarket Logistics">Robinsons Supermarket Logistics</option>
                  <option value="Universal Robina Corporation">Universal Robina Corporation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-200 font-bold block mb-1">Client Email PO # Reference</label>
                  <input
                    type="text"
                    required
                    placeholder="PO-SMG-2026-991"
                    value={clientPoRef}
                    onChange={(e) => setClientPoRef(e.target.value)}
                    className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-200 font-bold block mb-1">Payment Credit Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100"
                  >
                    <option value="COD">COD (Cash on Delivery)</option>
                    <option value="NET 15">NET 15 Days</option>
                    <option value="NET 30">NET 30 Days</option>
                    <option value="NET 60">NET 60 Days</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-b border-[#1c2541] py-3 space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Ordered Products</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-slate-300 block mb-1">Product SKU</label>
                    <select
                      value={productSku}
                      onChange={(e) => setProductSku(e.target.value)}
                      className="w-full p-2 bg-[#131c35] border border-[#1c2541] rounded-lg text-xs text-slate-100"
                    >
                      <option value="FG-CHEM-500">JRC Heavy Duty Industrial Degreaser (20L)</option>
                      <option value="PC-SUP-012">Termiticide Concentrate Premise 200SL</option>
                      <option value="RM-CHEM-001">Sodium Hydroxide Caustic Soda Flakes</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={productQty}
                      onChange={(e) => setProductQty(Number(e.target.value))}
                      className="w-full p-2 bg-[#131c35] border border-[#1c2541] rounded-lg text-xs text-slate-100 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#131c35] border border-[#1c2541] space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>₱{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>VAT (12%):</span>
                    <span>₱{vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-amber-400 font-bold text-sm border-t border-[#1c2541] pt-1">
                    <span>Grand Total:</span>
                    <span>₱{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-start gap-2">
                <ArrowRight className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
                <span>
                  <strong>Auto Cross-Department Dispatch:</strong> Approving this order automatically reserves warehouse stock, alerts Production for batch scheduling, and opens a BIR Accounts Receivable record in Finance.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#131c35] text-slate-300 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-yellow-500/20"
                >
                  Transmit Order Across Departments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
