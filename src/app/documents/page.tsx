"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Printer, Building2, CheckCircle2 } from "lucide-react";
import { TopNavbar } from "@/components/Navigation/TopNavbar";
import { RoleGuard } from "@/components/Auth/RoleGuard";
import PrintableDocument from "@/components/documents/PrintableDocument";
import { createClient } from "@/lib/supabase/client";

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
  client_po_ref?: string;
  delivery_address?: string;
  order_date: string;
  total_amount: number;
  payment_terms?: string;
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
    async function fetchOrders() {
      let loadedOrders: SalesOrder[] = [];

      // 1. Try local storage cache first
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_SALES_KEY);
        if (stored) {
          const parsed: SalesOrder[] = JSON.parse(stored);
          if (parsed && Array.isArray(parsed) && parsed.length > 0) {
            loadedOrders = parsed;
          }
        }
      } catch (e) {
        console.error("Local sales order read error:", e);
      }

      // 2. Fetch from Supabase
      try {
        const supabase = createClient();
        const { data: dbOrders, error } = await supabase
          .from("sales_orders")
          .select("*, customers(company_name, shipping_address, payment_terms)")
          .order("created_at", { ascending: false });

        if (!error && dbOrders && dbOrders.length > 0) {
          const supabaseOrders: SalesOrder[] = dbOrders.map((so: any) => ({
            id: so.id,
            order_number: so.order_number || `SO-2026-${so.id.slice(0, 4)}`,
            customer_name: so.customers?.company_name || "Commercial Client",
            delivery_address: typeof so.customers?.shipping_address === "string" 
              ? so.customers.shipping_address 
              : so.customers?.shipping_address?.street || "Client Main Facility",
            order_date: so.created_at ? so.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
            total_amount: Number(so.total_amount) || 0,
            payment_terms: so.customers?.payment_terms || "NET 30 Days",
          }));

          const map = new Map<string, SalesOrder>();
          loadedOrders.forEach((o) => map.set(o.order_number, o));
          supabaseOrders.forEach((o) => map.set(o.order_number, o));
          loadedOrders = Array.from(map.values());
        }
      } catch (err) {
        console.error("Supabase sales orders fetch error:", err);
      }

      setOrders(loadedOrders);
      if (loadedOrders.length > 0) {
        const found = targetSoNum ? loadedOrders.find((o) => o.order_number === targetSoNum) : loadedOrders[0];
        if (found) {
          setSelectedSoNum(found.order_number);
        } else {
          setSelectedSoNum(loadedOrders[0].order_number);
        }
      }
    }

    fetchOrders();
  }, [targetSoNum]);

  const activeOrder = orders.find((o) => o.order_number === selectedSoNum) || orders[0];

  const docNumber = targetInvNum || (activeOrder ? (docType === "sales_invoice" ? `SI-2026-${activeOrder.order_number.replace("SO-", "")}` : `DR-2026-${activeOrder.order_number.replace("SO-", "")}`) : "DOC-PENDING");

  const displayItems = activeOrder?.items && activeOrder.items.length > 0
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
          unit_price: activeOrder?.total_amount ? activeOrder.total_amount / 1.12 : 10000,
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
            Official Sales Invoice (12% VAT)
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
          {orders.length === 0 ? (
            <span className="text-xs font-bold text-slate-400 italic">No Sales Orders Issued Yet</span>
          ) : (
            <select
              value={selectedSoNum}
              onChange={(e) => setSelectedSoNum(e.target.value)}
              className="p-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-blue-600"
            >
              {orders.map((o) => (
                <option key={o.id || o.order_number} value={o.order_number}>
                  {o.order_number} — {o.customer_name} (₱{(o.total_amount || 0).toLocaleString()})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* REUSABLE PRINTABLE DOCUMENT */}
      <PrintableDocument
        document_type={docType === "sales_invoice" ? "SALES_INVOICE" : "DELIVERY_RECEIPT"}
        document_number={docNumber}
        date={activeOrder?.order_date || new Date().toISOString().split("T")[0]}
        party_name={activeOrder?.customer_name || "Official Commercial Client"}
        party_address={activeOrder?.delivery_address || "Client Registered Office & Delivery Facility"}
        payment_terms={activeOrder?.payment_terms || "NET 30 Days"}
        tin="105-355-027-000 VAT"
        items={displayItems}
      />
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <RoleGuard allowedRoles={["super_admin", "sales_rep", "finance_manager"]} moduleName="Document Vault & Printable Records">
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
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Generate Official Sales Invoices, Delivery Receipts (DR), and Service Certificates</p>
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
    </RoleGuard>
  );
}
