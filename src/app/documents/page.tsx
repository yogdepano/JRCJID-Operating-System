"use client";

import React, { useState } from "react";
import { FileText, ArrowLeft, Search, Eye } from "lucide-react";
import Link from "next/link";
import PrintableDocument from "@/components/documents/PrintableDocument";

export default function DocumentsPage() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>("SI-2026-0089");

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
              <FileText className="w-5 h-5 text-sky-400" />
              <h1 className="text-xl font-bold tracking-tight text-white">Document Vault & Printable Records</h1>
            </div>
            <p className="text-xs text-slate-400">Generate BIR-compliant Official Invoices, Delivery Receipts, and Service Certificates</p>
          </div>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER */}
      <div className="space-y-6">
        <PrintableDocument
          document_type="SALES_INVOICE"
          document_number="SI-2026-0089"
          date="2026-07-31"
          party_name="San Miguel Food Group"
          party_address="San Miguel Head Office Complex, Mandaluyong City, Metro Manila"
          tin="000-456-789-000 VAT"
          payment_terms="NET 30"
          items={[
            { code: "FG-CHEM-500", description: "JRC Heavy Duty Industrial Degreaser (20L Drum)", qty: 5, uom: "DRUM", unit_price: 2450.00 },
            { code: "RM-CHEM-001", description: "Sodium Hydroxide Caustic Soda Flakes", qty: 10, uom: "KG", unit_price: 85.00 },
            { code: "PC-SRV-01", description: "Monthly Chemical Pest Control Treatment", qty: 1, uom: "SRV", unit_price: 15000.00 },
          ]}
        />
      </div>
    </div>
  );
}
