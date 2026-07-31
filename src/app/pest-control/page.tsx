"use client";

import React, { useState } from "react";
import { Bug, Plus, Search, MapPin, Calendar, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { TopNavbar } from "@/components/Navigation/TopNavbar";

interface ServiceJob {
  id: string;
  job_number: string;
  client_name: string;
  target_pest: string;
  technician: string;
  service_date: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
}

const INITIAL_JOBS: ServiceJob[] = [
  {
    id: "job-1",
    job_number: "PC-2026-0012",
    client_name: "Robinsons Supermarket Logistics Hub",
    target_pest: "Termite & General Pest Treatment",
    technician: "Ramon M. (Lead Tech)",
    service_date: "2026-08-02",
    status: "SCHEDULED",
  },
];

export default function PestControlPage() {
  const [jobs] = useState<ServiceJob[]>(INITIAL_JOBS);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* STICKY TOP NAVIGATION BAR */}
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* HEADER - LIGHT MODE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <Bug className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Pest Control Service Dispatch</h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Commercial pest control schedules, chemical consumption tracking, and technician dispatch</p>
            </div>
          </div>

          <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-500 text-slate-950 font-extrabold text-sm shadow-md shadow-yellow-500/20 active:scale-95 transition-all">
            <Plus className="w-5 h-5 text-slate-950" />
            <span>+ Schedule Service Dispatch</span>
          </button>
        </div>

        {/* JOBS TABLE */}
        <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-extrabold">
                <th className="py-3 px-3">Job Reference</th>
                <th className="py-3 px-3">Client Account</th>
                <th className="py-3 px-3">Pest Treatment Type</th>
                <th className="py-3 px-3">Assigned Lead Tech</th>
                <th className="py-3 px-3">Service Date</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-extrabold text-blue-700">{j.job_number}</td>
                  <td className="py-3.5 px-3 font-extrabold text-slate-900">{j.client_name}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-700">{j.target_pest}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{j.technician}</td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-slate-700">{j.service_date}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                      {j.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
