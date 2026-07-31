"use client";

import React, { useState } from "react";
import { Boxes, Plus, Search, ArrowLeft, TrendingUp, TrendingDown, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface InventoryMovement {
  id: string;
  timestamp: string;
  product_sku: string;
  product_name: string;
  movement_type: "PURCHASE_RECEIPT" | "PRODUCTION_CONSUMPTION" | "PRODUCTION_YIELD" | "SALES_DISPATCH" | "PEST_CONTROL_CONSUMPTION" | "ADJUSTMENT";
  quantity: number;
  uom: string;
  batch_number: string;
  reference_no: string;
  performed_by: string;
}

const mockMovements: InventoryMovement[] = [
  {
    id: "m1",
    timestamp: "2026-07-31 16:45",
    product_sku: "FG-CHEM-500",
    product_name: "JRC Heavy Duty Industrial Degreaser",
    movement_type: "PRODUCTION_YIELD",
    quantity: 500,
    uom: "L",
    batch_number: "LOT-20260731-01",
    reference_no: "PB-2026-005",
    performed_by: "Production Lead",
  },
  {
    id: "m2",
    timestamp: "2026-07-31 16:40",
    product_sku: "RM-CHEM-001",
    product_name: "Sodium Hydroxide (Caustic Soda)",
    movement_type: "PRODUCTION_CONSUMPTION",
    quantity: -80,
    uom: "KG",
    batch_number: "LOT-RAW-8891",
    reference_no: "PB-2026-005",
    performed_by: "Production Lead",
  },
  {
    id: "m3",
    timestamp: "2026-07-31 14:10",
    product_sku: "RM-CHEM-002",
    product_name: "Linear Alkylbenzene Sulfonic Acid (LABSA)",
    movement_type: "PURCHASE_RECEIPT",
    quantity: 600,
    uom: "KG",
    batch_number: "LOT-RAW-9920",
    reference_no: "PO-2026-0042",
    performed_by: "Warehouse Receiver",
  },
  {
    id: "m4",
    timestamp: "2026-07-31 11:20",
    product_sku: "PC-SUP-012",
    product_name: "Termiticide Concentrate Premise 200SL",
    movement_type: "PEST_CONTROL_CONSUMPTION",
    quantity: -5,
    uom: "L",
    batch_number: "LOT-PC-3312",
    reference_no: "PC-2026-0155",
    performed_by: "Pest Tech Manila",
  },
];

export default function InventoryPage() {
  const [movements] = useState<InventoryMovement[]>(mockMovements);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMovements = movements.filter((m) =>
    m.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.product_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.reference_no.toLowerCase().includes(searchTerm.toLowerCase())
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
              <Boxes className="w-5 h-5 text-emerald-400" />
              <h1 className="text-xl font-bold tracking-tight text-white">Immutable Stock Movement Ledger</h1>
            </div>
            <p className="text-xs text-slate-400">Complete historical audit trail for raw chemicals, finished goods, and batch lots</p>
          </div>
        </div>

        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Ledger Integrity: Verified</span>
        </span>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-[#0f172a]/60 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by SKU, Product, Batch Lot, or Reference #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* INVENTORY MOVEMENTS LEDGER TABLE */}
      <div className="p-5 rounded-xl bg-[#0f172a]/60 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">Date / Time</th>
              <th className="py-3 px-3">Product SKU</th>
              <th className="py-3 px-3">Description</th>
              <th className="py-3 px-3">Movement Reason</th>
              <th className="py-3 px-3">Batch Lot #</th>
              <th className="py-3 px-3">Ref Doc #</th>
              <th className="py-3 px-3">Quantity Delta</th>
              <th className="py-3 px-3 text-right">User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
            {filteredMovements.map((m) => {
              const isPositive = m.quantity > 0;
              return (
                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {m.timestamp}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-medium text-sky-400">{m.product_sku}</td>
                  <td className="py-3 px-3 font-semibold text-slate-100">{m.product_name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                      {m.movement_type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-purple-300 font-medium">{m.batch_number}</td>
                  <td className="py-3 px-3 font-mono text-slate-300">{m.reference_no}</td>
                  <td className="py-3 px-3 font-mono font-bold">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs ${
                      isPositive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    }`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isPositive ? `+${m.quantity}` : m.quantity} {m.uom}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-400">{m.performed_by}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
