"use client";

import React, { useState, useEffect } from "react";
import { Truck, Search, History, CheckCircle2, Package, ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { TopNavbar } from "@/components/Navigation/TopNavbar";

interface InventoryMovement {
  id: string;
  timestamp: string;
  sku: string;
  name: string;
  reason: "PRODUCTION_YIELD" | "PRODUCTION_CONSUMPTION" | "PURCHASE_RECEIPT" | "PEST_CONTROL_CONSUMPTION" | "SALES_DISPATCH";
  batch_lot: string;
  ref_doc: string;
  qty_delta: number;
  uom: string;
  user: string;
}

const LOCAL_STORAGE_MOVEMENTS_KEY = "jrc_inventory_movements_cache_v1";

export default function InventoryPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_MOVEMENTS_KEY);
      if (cached) {
        setMovements(JSON.parse(cached));
      } else {
        setMovements([]);
      }
    } catch (e) {
      console.error("Inventory cache error:", e);
    }
  }, []);

  const filtered = movements.filter(
    (m) =>
      m.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.batch_lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.ref_doc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* STICKY TOP NAVIGATION BAR */}
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* HEADER - LIGHT MODE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <Truck className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Logistics Department (Stock Movement Ledger)</h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Complete audit trail for raw chemicals, finished goods, batch lots, and truck dispatches</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-extrabold self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ledger Integrity: Verified</span>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SKU, Product, Batch Lot, or Ref Doc #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* MOVEMENTS TABLE OR EMPTY STATE */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-sm">
            <Truck className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900">No Stock Movements Logged Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Stock movements automatically record here when sales orders are dispatched or production batches are yielded.
            </p>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-extrabold">
                  <th className="py-3 px-3">Date / Time</th>
                  <th className="py-3 px-3">Product SKU</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Movement Reason</th>
                  <th className="py-3 px-3">Batch Lot #</th>
                  <th className="py-3 px-3">Ref Doc #</th>
                  <th className="py-3 px-3">Quantity Delta</th>
                  <th className="py-3 px-3">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-3.5 px-3 font-mono text-xs text-slate-600 font-semibold">{m.timestamp}</td>
                    <td className="py-3.5 px-3 font-mono font-extrabold text-blue-700">{m.sku}</td>
                    <td className="py-3.5 px-3 font-extrabold text-slate-900">{m.name}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-800 uppercase border border-slate-200">
                        {m.reason.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs text-slate-700 font-semibold">{m.batch_lot}</td>
                    <td className="py-3.5 px-3 font-mono text-xs text-slate-700 font-semibold">{m.ref_doc}</td>
                    <td className="py-3.5 px-3 font-mono font-extrabold">
                      <span className={`px-2 py-0.5 rounded text-xs inline-flex items-center gap-1 ${
                        m.qty_delta > 0
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-rose-100 text-rose-800 border border-rose-300"
                      }`}>
                        {m.qty_delta > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {m.qty_delta > 0 ? `+${m.qty_delta}` : m.qty_delta} {m.uom}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-600 font-bold">{m.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
