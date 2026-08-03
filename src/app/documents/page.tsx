"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Printer, Building2, CheckCircle2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { TopNavbar } from "@/components/Navigation/TopNavbar";
import PrintableDocument from "@/components/documents/PrintableDocument";

interface OrderLineItem {
  id: string;
  product_sku: string;
  product_name: string;
  qty: number;
  uom: string;
  unit_price: number;
  total_price: number;
}

interface SalesOrder {
  id: string;
  order_number: string;
  customer_name: string;
  client_po_ref: string;
  delivery_address: string;
  order_date: string;
  total_amount: number;
  payment_terms: string;
  items?: OrderLineItem[];
}

const LOCAL_STORAGE_SALES_KEY = "jrc_sales_orders_cache_v1";

function DocumentVaultContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "delivery_receipt" ? "delivery_receipt" : "sales_invoice";
  const targetSoNum = searchParams.get("so") || "";
  const targetInvNum = searchParams.get("inv") || "";

  const [docType, setDocType] = useState<"sales_invoice" | "delivery_receipt">(initialType);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [selectedSoNum, setSelectedSoNum] = useState<string>(targetSoNum || "");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_SALES_KEY);
      if (stored) {
        const parsed: SalesOrder[] = JSON.parse(stored);
        if (parsed.length > 0) {
          setOrders(parsed);
          const found = targetSoNum ? parsed.find((o) => o.order_number === targetSoNum) : parsed[0];
          if (found) setSelectedSoNum(found.order_number);
        }
      }
    } catch (e) {
      console.error("Local sales order read error:", e);
    }
  }, [targetSoNum]);

  const activeOrder = orders.find((o) => o.order_number === selectedSoNum) || orders[0];

  const docNumber = targetInvNum || (activeOrder ? (docType === "sales_invoice" ? `SI-2026-${activeOrder.order_number.replace("SO-", "")}` : `DR-2026-${activeOrder.order_number.replace("SO-", "")}`) : "DOC-PENDING");

  const displayItems = activeOrder.items && activeOrder.items.length > 0
    ? activeOrder.items.map((it) => ({
        code: it.product_sku,
        description: it.product_name,
        qty: it.qty,
        uom: it.uom,
        unit_price: it.unit_price,
      }))
    : [
        {
          code: "FG-CHEM-500",
          description: "Industrial Chemical Detergent Formulation",
          qty: 1,
          uom: "LOT",
          unit_price: activeOrder.total_amount / 1.12,
        },
      ];

  return (
    <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-lg space-y-6">
      {/* DOCUMENT TYPE & ORDER SELECTOR CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDocType("sales_invoice")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              docType === "sales_invoice"
                ? "bg-blue-700 text-white shadow-sm ring-2 ring-amber-400"
                : "bg-slate-100 text-slate-700 hover:bg-blue-50 border border-slate-200"
            }`}
          >
            Official Sales Invoice (BIR 12% VAT)
          </button>
          <button
            onClick={() => setDocType("delivery_receipt")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              docType === "delivery_receipt"
                ? "bg-blue-700 text-white shadow-sm ring-2 ring-amber-400"
                : "bg-slate-100 text-slate-700 hover:bg-blue-50 border border-slate-200"
            }`}
          >
            Delivery Receipt (DR)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-extrabold text-slate-700 whitespace-nowrap">Select Sales Order:</label>
          <select
            value={selectedSoNum}
            onChange={(e) => setSelectedSoNum(e.target.value)}
            className="p-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-blue-600"
          >
            {orders.map((o) => (
              <option key={o.id || o.order_number} value={o.order_number}>
                {o.order_number} — {o.customer_name} (₱{o.total_amount.toLocaleString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* REUSABLE PRINTABLE DOCUMENT */}
      <PrintableDocument
        document_type={docType === "sales_invoice" ? "SALES_INVOICE" : "DELIVERY_RECEIPT"}
        document_number={docNumber}
        date={activeOrder?.order_date || new Date().toISOString().split("T")[0]}
        party_name={activeOrder?.customer_name || "Select a Sales Order"}
        party_address={activeOrder?.delivery_address || "Client Delivery Location"}
        payment_terms={activeOrder?.payment_terms || "NET 30 Days"}
        tin="123-456-789-000 VAT"
        items={displayItems}
      />
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* STICKY TOP NAVIGATION BAR */}
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <FileText className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Document Vault & Printable Records</h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Generate BIR-compliant Official Sales Invoices, Delivery Receipts (DR), and Service Certificates</p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-extrabold text-sm shadow-md ring-2 ring-amber-400 active:scale-95 transition-all"
          >
            <Printer className="w-5 h-5 text-amber-300" />
            <span>Print / Export PDF</span>
          </button>
        </div>

        {/* SUSPENSE BOUNDARY FOR SEARCH PARAMS */}
        <Suspense fallback={<div className="p-8 text-center text-slate-400 font-medium">Loading Document Vault...</div>}>
          <DocumentVaultContent />
        </Suspense>
      </main>
    </div>
  );
}
