"use client";

import React, { useState } from "react";
import { Bug, Plus, ArrowLeft, Search, Calendar, UserCheck, ShieldAlert, CheckCircle2, FileText } from "lucide-react";
import Link from "next/link";

interface PestJob {
  id: string;
  job_number: string;
  customer_name: string;
  service_address: string;
  scheduled_date: string;
  status: "SCHEDULED" | "IN_TRANSIT" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  technician: string;
  chemicals_used: string;
}

const mockJobs: PestJob[] = [
  {
    id: "pc1",
    job_number: "PC-2026-0155",
    customer_name: "Robinsons Mall Commercial Complex",
    service_address: "EDSA Ortigas Ave, Quezon City",
    scheduled_date: "2026-07-31 09:00 AM",
    status: "COMPLETED",
    technician: "Mario Santos (Senior Tech)",
    chemicals_used: "5L Termiticide Premise 200SL",
  },
  {
    id: "pc2",
    job_number: "PC-2026-0156",
    customer_name: "Ayala Land Logistics Warehouse",
    service_address: "Biñan Industrial Estate, Laguna",
    scheduled_date: "2026-07-31 02:00 PM",
    status: "IN_PROGRESS",
    technician: "Juan Dela Cruz (Tech Lead)",
    chemicals_used: "10L Fogging Concentrate",
  },
  {
    id: "pc3",
    job_number: "PC-2026-0157",
    customer_name: "Jollibee Commissary Branch",
    service_address: "Pasig City Warehouse",
    scheduled_date: "2026-08-01 10:00 AM",
    status: "SCHEDULED",
    technician: "Pedro Penduko",
    chemicals_used: "Pending Site Inspection",
  },
];

export default function PestControlPage() {
  const [jobs] = useState<PestJob[]>(mockJobs);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredJobs = jobs.filter((j) =>
    j.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
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
              <Bug className="w-5 h-5 text-amber-400" />
              <h1 className="text-xl font-bold tracking-tight text-white">Pest Control Service Scheduler</h1>
            </div>
            <p className="text-xs text-slate-400">Field service dispatch, technician assignment, and chemical consumption logging</p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold text-xs shadow-lg shadow-amber-500/20">
          <Plus className="w-4 h-4" />
          <span>Schedule Pest Control Job</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-[#0f172a]/60 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Job # or Customer Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* PEST CONTROL JOBS TABLE */}
      <div className="p-5 rounded-xl bg-[#0f172a]/60 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">Job Number</th>
              <th className="py-3 px-3">Customer Account</th>
              <th className="py-3 px-3">Service Address</th>
              <th className="py-3 px-3">Scheduled Date/Time</th>
              <th className="py-3 px-3">Lead Technician</th>
              <th className="py-3 px-3">Chemicals Consumed</th>
              <th className="py-3 px-3 text-right">Job Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
            {filteredJobs.map((j) => (
              <tr key={j.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-3 font-mono font-medium text-amber-400">{j.job_number}</td>
                <td className="py-3 px-3 font-semibold text-slate-100">{j.customer_name}</td>
                <td className="py-3 px-3 text-slate-400 max-w-xs truncate">{j.service_address}</td>
                <td className="py-3 px-3 font-mono text-slate-300">{j.scheduled_date}</td>
                <td className="py-3 px-3 font-medium text-slate-200">{j.technician}</td>
                <td className="py-3 px-3 font-mono text-purple-300">{j.chemicals_used}</td>
                <td className="py-3 px-3 text-right">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                    j.status === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : j.status === "IN_PROGRESS"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse"
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}>
                    {j.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
