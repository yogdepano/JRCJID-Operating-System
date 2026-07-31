"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, FileText, TrendingUp, Clock, CheckCircle2, ArrowRight, Search, Plus, Filter, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopNavbar } from "@/components/Navigation/TopNavbar";

interface InvoiceRecord {
  id: string;
  invoice_number: string;
  so_number: string;
  customer_name: string;
  due_date: string;
  subtotal: number;
  vat_amount: number;
  grand_total: number;
  payment_terms: string;
  status: "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
}

const LOCAL_STORAGE_SALES_KEY = "jrc_sales_orders_cache_v1";

export default function FinancePage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadFinanceData = async () => {
    setLoading(true);
    let invoiceList: InvoiceRecord[] = [];

    try {
      const cachedSales = localStorage.getItem(LOCAL_STORAGE_SALES_KEY);
      if (cachedSales) {
        const parsed = JSON.parse(cachedSales);
        invoiceList = parsed.map((so: any, idx: number) => {
          const sub = Number(so.total_amount) / 1.12 || 10000;
          const vat = Number(so.total_amount) - sub;
          return {
            id: so.id || `inv-${idx}`,
            invoice_number: `SI-2026-${Math.floor(1000 + idx * 17)}`,
            so_number: so.order_number || `SO-2026-${1000 + idx}`,
            customer_name: so.customer_name || "Commercial Client",
            due_date: "2026-08-30",
            subtotal: sub,
            vat_amount: vat,
            grand_total: Number(so.total_amount) || 11200,
            payment_terms: so.payment_terms || "NET 30 Days",
            status: so.payment_status || "UNPAID",
          };
        });
      }
    } catch (e) {
      console.error("Finance local cache error:", e);
    }

    try {
      const supabase = createClient();
      const { data } = await supabase.from("sales_orders").select("*");
      if (data && data.length > 0) {
        const remoteInvoices: InvoiceRecord[] = data.map((so: any, idx: number) => {
          const total = Number(so.total_amount) || 15000;
          const sub = total / 1.12;
          const vat = total - sub;
          return {
            id: so.id,
            invoice_number: `SI-2026-00${idx + 1}`,
            so_number: so.order_number,
            customer_name: so.customer_name || "Commercial Account",
            due_date: "2026-08-30",
            subtotal: sub,
            vat_amount: vat,
            grand_total: total,
            payment_terms: so.payment_terms || "NET 30 Days",
            status: so.payment_status || "UNPAID",
          };
        });

        const map = new Map<string, InvoiceRecord>();
        invoiceList.forEach((inv) => map.set(inv.so_number, inv));
        remoteInvoices.forEach((inv) => map.set(inv.so_number, inv));
        invoiceList = Array.from(map.values());
      }
    } catch (err) {
      console.error("Supabase finance fetch notice:", err);
    }

    setInvoices(invoiceList);
    setLoading(false);
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const totalAR = invoices.reduce((acc, inv) => acc + inv.grand_total, 0);
  const totalVat = invoices.reduce((acc, inv) => acc + inv.vat_amount, 0);
  const paidCount = invoices.filter((i) => i.status === "PAID").length;

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) || inv.so_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* STICKY TOP NAVIGATION BAR */}
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <DollarSign className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Finance & Accounts Receivable (AR)</h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">BIR 12% VAT accounting, sales invoicing, collection schedules, and credit monitoring</p>
            </div>
          </div>

          <Link
            href="/documents"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-500 text-slate-950 font-extrabold text-sm shadow-md shadow-yellow-500/20 active:scale-95 transition-all"
          >
            <FileText className="w-5 h-5 text-slate-950" />
            <span>Open Printable BIR Document Vault →</span>
          </Link>
        </div>

        {/* FINANCIAL SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-1 relative overflow-hidden">
            <div className="w-full h-1.5 bg-gradient-to-r from-blue-600 to-amber-400 absolute top-0 left-0"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Receivables (Gross)</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-800 font-mono">₱{totalAR.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <span className="text-[11px] text-slate-600 font-semibold block pt-1">Active Accounts Receivable</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-1 relative overflow-hidden">
            <div className="w-full h-1.5 bg-gradient-to-r from-amber-400 to-blue-600 absolute top-0 left-0"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">BIR Output VAT (12%)</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono">₱{totalVat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <span className="text-[11px] text-slate-600 font-semibold block pt-1">Philippine BIR Sales Tax</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-1 relative overflow-hidden">
            <div className="w-full h-1.5 bg-gradient-to-r from-blue-600 to-emerald-500 absolute top-0 left-0"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Collection Rate</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{paidCount} of {invoices.length} Invoices</p>
            <span className="text-[11px] text-slate-600 font-semibold block pt-1">Cash / Credit Settlements</span>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Invoice #, SO #, or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["ALL", "UNPAID", "PAID", "OVERDUE"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? "bg-blue-700 text-white border-2 border-amber-400 shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-blue-50 border border-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* INVOICE TABLE */}
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-sm">
            <DollarSign className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900">No Finance Invoices Logged Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Sales Orders submitted in the Sales Department automatically reflect in Finance for BIR invoicing.
            </p>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-extrabold">
                  <th className="py-3 px-3">BIR Invoice #</th>
                  <th className="py-3 px-3">Sales Order Ref</th>
                  <th className="py-3 px-3">Customer Account</th>
                  <th className="py-3 px-3">Terms</th>
                  <th className="py-3 px-3">Subtotal (₱)</th>
                  <th className="py-3 px-3">VAT 12% (₱)</th>
                  <th className="py-3 px-3">Grand Total (₱)</th>
                  <th className="py-3 px-3">Payment Status</th>
                  <th className="py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-extrabold text-blue-700">{inv.invoice_number}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-700">{inv.so_number}</td>
                    <td className="py-3.5 px-3 font-extrabold text-slate-900">{inv.customer_name}</td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-700">{inv.payment_terms}</td>
                    <td className="py-3.5 px-3 font-mono font-semibold">₱{inv.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-amber-600">₱{inv.vat_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-3 font-mono font-extrabold text-blue-900">₱{inv.grand_total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                        inv.status === "PAID"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <Link
                        href="/documents"
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-extrabold text-xs transition-all flex items-center gap-1 w-fit"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Print Invoice</span>
                      </Link>
                    </td>
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
