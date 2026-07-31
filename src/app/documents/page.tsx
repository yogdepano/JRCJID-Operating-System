"use client";

import React, { useState } from "react";
import { FileText, Printer, Search, Download, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { TopNavbar } from "@/components/Navigation/TopNavbar";

export default function DocumentsPage() {
  const [docType, setDocType] = useState<"sales_invoice" | "delivery_receipt">("sales_invoice");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* STICKY TOP NAVIGATION BAR */}
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* HEADER - LIGHT MODE */}
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

        {/* DOCUMENT PREVIEW CONTAINER - LIGHT MODE */}
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDocType("sales_invoice")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  docType === "sales_invoice"
                    ? "bg-blue-700 text-white shadow-sm ring-2 ring-amber-400"
                    : "bg-slate-100 text-slate-700 hover:bg-blue-50 border border-slate-200"
                }`}
              >
                Official Sales Invoice (BIR)
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

            <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Document Preview Ready
            </span>
          </div>

          {/* BIR FORM SHEET */}
          <div className="max-w-3xl mx-auto bg-white p-8 border-2 border-slate-300 rounded-xl shadow-md space-y-6 text-slate-900 print:shadow-none print:border-none font-sans">
            {/* COMPANY HEADER */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">JRC INDUSTRIAL SALES</h2>
                <p className="text-xs text-slate-700 font-bold">Household & Industrial Chemicals Manufacturing • Pest Control Services</p>
                <p className="text-[11px] text-slate-600 font-medium">123 Industrial Avenue, Barangay Metro, Manila, Philippines</p>
                <p className="text-[11px] text-slate-600 font-medium">Tel: +63 (02) 8888-5678 | Email: billing@jrcindustrial.ph | TIN: 123-456-789-000 VAT</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded bg-slate-900 text-amber-400 font-extrabold text-xs uppercase tracking-wider block">
                  {docType === "sales_invoice" ? "SALES INVOICE" : "DELIVERY RECEIPT"}
                </span>
                <p className="font-mono text-xs font-bold text-slate-900 mt-1">SI-2026-0089</p>
                <p className="text-[11px] text-slate-600 font-bold">Date: 2026-07-31</p>
              </div>
            </div>

            {/* CUSTOMER DETAILS */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-300 text-xs">
              <div>
                <span className="font-bold text-slate-500 block uppercase">CUSTOMER / ACCOUNT:</span>
                <p className="font-extrabold text-slate-900 text-sm">San Miguel Food Group</p>
                <p className="text-slate-700 font-medium">San Miguel Head Office Complex, Mandaluyong City, Metro Manila</p>
                <p className="text-slate-600 font-mono">TIN: 000-456-789-000 VAT</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-500 block uppercase">TRANSACTION DETAILS:</span>
                <p className="font-semibold text-slate-800">Payment Terms: <span className="font-bold text-blue-700">NET 30</span></p>
                <p className="font-semibold text-slate-800">Currency: <span className="font-bold">PHP (₱)</span></p>
              </div>
            </div>

            {/* LINE ITEMS */}
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-900 uppercase font-extrabold text-slate-700">
                  <th className="py-2">ITEM CODE</th>
                  <th className="py-2">DESCRIPTION</th>
                  <th className="py-2 text-center">QTY</th>
                  <th className="py-2 text-center">UOM</th>
                  <th className="py-2 text-right">UNIT PRICE (₱)</th>
                  <th className="py-2 text-right">TOTAL (₱)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                <tr>
                  <td className="py-2 font-mono font-bold">FG-CHEM-500</td>
                  <td className="py-2 font-bold">JRC Heavy Duty Industrial Degreaser (20L Drum)</td>
                  <td className="py-2 text-center font-bold">5</td>
                  <td className="py-2 text-center">DRUM</td>
                  <td className="py-2 text-right font-mono">₱2,450.00</td>
                  <td className="py-2 text-right font-mono font-bold">₱12,250.00</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono font-bold">RM-CHEM-001</td>
                  <td className="py-2 font-bold">Sodium Hydroxide Caustic Soda Flakes</td>
                  <td className="py-2 text-center font-bold">10</td>
                  <td className="py-2 text-center">KG</td>
                  <td className="py-2 text-right font-mono">₱85.00</td>
                  <td className="py-2 text-right font-mono font-bold">₱850.00</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono font-bold">PC-SRV-01</td>
                  <td className="py-2 font-bold">Monthly Chemical Pest Control Treatment</td>
                  <td className="py-2 text-center font-bold">1</td>
                  <td className="py-2 text-center">SRV</td>
                  <td className="py-2 text-right font-mono">₱15,000.00</td>
                  <td className="py-2 text-right font-mono font-bold">₱15,000.00</td>
                </tr>
              </tbody>
            </table>

            {/* TOTALS */}
            <div className="flex justify-end pt-3 border-t-2 border-slate-900 text-xs">
              <div className="w-60 space-y-1 font-mono text-right">
                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Subtotal:</span>
                  <span>₱28,100.00</span>
                </div>
                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>VAT (12%):</span>
                  <span>₱3,372.00</span>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t border-slate-300 pt-1">
                  <span>Grand Total:</span>
                  <span className="text-blue-900">₱31,472.00</span>
                </div>
              </div>
            </div>

            {/* SIGNATURE SECTION */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-xs">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Prepared / Dispatched By:</span>
                <div className="mt-8 border-b border-slate-400 w-48"></div>
                <span className="text-[10px] font-bold text-slate-700 block mt-1">Authorized Signature</span>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Received In Good Order & Condition By:</span>
                <div className="mt-8 border-b border-slate-400 w-48 ml-auto"></div>
                <span className="text-[10px] font-bold text-slate-700 block mt-1">Customer Printed Name & Signature</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
