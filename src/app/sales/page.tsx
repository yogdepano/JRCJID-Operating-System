"use client";

import React, { useState } from "react";
import { ShoppingCart, Plus, ArrowLeft, Search, Filter, DollarSign, FileText, CheckCircle2, Clock, Truck } from "lucide-react";
import Link from "next/link";

interface SalesOrder {
  id: string;
  order_number: string;
  customer_name: string;
  order_date: string;
  total_amount: number;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "IN_PRODUCTION" | "DISPATCHED" | "COMPLETED" | "CANCELLED";
  payment_status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
  payment_terms: string;
}

const mockOrders: SalesOrder[] = [
  {
    id: "so1",
    order_number: "SO-2026-0089",
    customer_name: "San Miguel Food Group",
    order_date: "2026-07-31",
    total_amount: 185000.00,
    status: "IN_PRODUCTION",
    payment_status: "UNPAID",
    payment_terms: "NET 30",
  },
  {
    id: "so2",
    order_number: "SO-2026-0088",
    customer_name: "Century Pacific Manufacturing",
    order_date: "2026-07-30",
    total_amount: 420000.00,
    status: "APPROVED",
    payment_status: "PAID",
    payment_terms: "COD",
  },
  {
    id: "so3",
    order_number: "SO-2026-0087",
    customer_name: "Robinsons Supermarket Logistics",
    order_date: "2026-07-28",
    total_amount: 98500.00,
    status: "COMPLETED",
    payment_status: "PAID",
    payment_terms: "NET 15",
  },
];

export default function SalesPage() {
  const [orders] = useState<SalesOrder[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter((o) =>
    o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 space-y-6 font-sans">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-sky-400" />
              <h1 className="text-xl font-bold tracking-tight text-white">Sales Orders & Commercial Pipeline</h1>
            </div>
            <p className="text-xs text-slate-400">Manage client quotes, credit terms, sales order approval, and invoicing</p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20">
          <Plus className="w-4 h-4" />
          <span>Create Sales Order</span>
        </button>
      </div>

      {/* SEARCH RIBBON */}
      <div className="bg-[#0f172a]/60 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search Sales Order # or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* SALES ORDERS TABLE */}
      <div className="p-5 rounded-xl bg-[#0f172a]/60 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">Order Number</th>
              <th className="py-3 px-3">Customer Account</th>
              <th className="py-3 px-3">Order Date</th>
              <th className="py-3 px-3">Terms</th>
              <th className="py-3 px-3">Total Amount (₱)</th>
              <th className="py-3 px-3">Workflow Status</th>
              <th className="py-3 px-3">Payment Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
            {filteredOrders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-3 font-mono font-medium text-sky-400">{o.order_number}</td>
                <td className="py-3 px-3 font-semibold text-slate-100">{o.customer_name}</td>
                <td className="py-3 px-3 text-slate-400">{o.order_date}</td>
                <td className="py-3 px-3 font-mono text-slate-400">{o.payment_terms}</td>
                <td className="py-3 px-3 font-mono font-bold text-slate-100">₱{o.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center w-max gap-1">
                    <Clock className="w-3 h-3" /> {o.status}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center w-max gap-1 ${
                    o.payment_status === "PAID"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}>
                    {o.payment_status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors">
                    Print PDF Invoice
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
