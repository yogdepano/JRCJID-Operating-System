"use client";

import React from "react";
import { Printer, Download, Building2, CheckCircle2 } from "lucide-react";

interface LineItem {
  code: string;
  description: string;
  qty: number;
  uom: string;
  unit_price: number;
}

interface DocumentProps {
  document_type: "SALES_INVOICE" | "DELIVERY_RECEIPT" | "PURCHASE_ORDER" | "PEST_CONTROL_CERTIFICATE";
  document_number: string;
  date: string;
  party_name: string;
  party_address: string;
  tin?: string;
  payment_terms?: string;
  items: LineItem[];
}

export default function PrintableDocument({
  document_type,
  document_number,
  date,
  party_name,
  party_address,
  tin = "105-355-027-000 VAT",
  payment_terms = "NET 30",
  items,
}: DocumentProps) {

  const handlePrint = () => {
    window.print();
  };

  const subtotal = items.reduce((acc, item) => acc + item.qty * item.unit_price, 0);
  const vat = subtotal * 0.12;
  const grandTotal = subtotal + vat;

  return (
    <div className="space-y-4">
      {/* PRINT CONTROLS HEADER */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800 print:hidden">
        <div>
          <h3 className="text-xs font-bold text-slate-200">Official Document Preview</h3>
          <p className="text-[11px] text-slate-400">Ready for high-resolution printing or PDF export</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold rounded-lg shadow-lg shadow-sky-500/20"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* PRINTABLE DOCUMENT BODY */}
      <div className="bg-white text-slate-900 p-8 rounded-xl border border-slate-200 shadow-2xl max-w-4xl mx-auto space-y-6 font-sans print:border-none print:shadow-none print:p-0">
        {/* COMPANY LETTERHEAD */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">JRC INDUSTRIAL SALES</h1>
            <p className="text-xs text-slate-600 font-medium">Household & Industrial Chemicals Manufacturing • Pest Control Services</p>
            <p className="text-[11px] text-slate-500 mt-1">#5 Luzon St. Filipinas Village, Brgy. Malanday, Marikina City 1805</p>
            <p className="text-[11px] text-slate-500">Tel. No.: 02-8948-2516 | Email: jrcjid@yahoo.com | TIN: 105-355-027-000 VAT</p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs rounded uppercase tracking-wider mb-2">
              {document_type.replace("_", " ")}
            </span>
            <p className="text-xs font-mono font-bold text-slate-900">{document_number}</p>
            <p className="text-[11px] text-slate-600">Date: {date}</p>
          </div>
        </div>

        {/* BILL TO / PARTY DETAILS */}
        <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div>
            <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Customer / Account:</p>
            <p className="font-bold text-slate-900 text-sm">{party_name}</p>
            <p className="text-slate-600 mt-1">{party_address}</p>
            <p className="text-slate-600">TIN: {tin}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Transaction Details:</p>
            <p className="text-slate-600">Payment Terms: <span className="font-bold text-slate-900">{payment_terms}</span></p>
            <p className="text-slate-600">Currency: <span className="font-bold text-slate-900">PHP (₱)</span></p>
          </div>
        </div>

        {/* LINE ITEMS TABLE */}
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-slate-900 text-slate-700 uppercase tracking-wider text-[10px]">
              <th className="py-2 px-2">Item Code</th>
              <th className="py-2 px-2">Description</th>
              <th className="py-2 px-2 text-center">Qty</th>
              <th className="py-2 px-2 text-center">UOM</th>
              <th className="py-2 px-2 text-right">Unit Price (₱)</th>
              <th className="py-2 px-2 text-right">Total (₱)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item, idx) => {
              const lineTotal = item.qty * item.unit_price;
              return (
                <tr key={idx}>
                  <td className="py-2.5 px-2 font-mono font-semibold text-slate-800">{item.code}</td>
                  <td className="py-2.5 px-2 text-slate-900 font-medium">{item.description}</td>
                  <td className="py-2.5 px-2 text-center font-mono">{item.qty}</td>
                  <td className="py-2.5 px-2 text-center font-mono">{item.uom}</td>
                  <td className="py-2.5 px-2 text-right font-mono">₱{item.unit_price.toFixed(2)}</td>
                  <td className="py-2.5 px-2 text-right font-mono font-bold">₱{lineTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* FINANCIAL TOTALS BREAKDOWN */}
        <div className="border-t-2 border-slate-900 pt-4 flex justify-end">
          <div className="w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold text-slate-900">₱{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>VAT (12%):</span>
              <span className="font-mono font-semibold text-slate-900">₱{vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t border-slate-900 pt-1.5">
              <span>Grand Total:</span>
              <span className="font-mono text-sky-700">₱{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* SIGNATURE BLOCK */}
        <div className="pt-10 grid grid-cols-2 gap-12 text-xs border-t border-slate-200">
          <div>
            <p className="text-slate-500 mb-8">Prepared / Dispatched By:</p>
            <div className="border-b border-slate-400 w-48"></div>
            <p className="font-bold text-slate-800 mt-1">Authorized Signature</p>
          </div>
          <div>
            <p className="text-slate-500 mb-8">Received In Good Order & Condition By:</p>
            <div className="border-b border-slate-400 w-48"></div>
            <p className="font-bold text-slate-800 mt-1">Customer Printed Name & Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}
