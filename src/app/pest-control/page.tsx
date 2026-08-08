"use client";

import React, { useState, useEffect } from "react";
import { Bug, Plus, Search, MapPin, Calendar, CheckCircle2, Clock, Trash2, Edit3, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopNavbar } from "@/components/Navigation/TopNavbar";
import { RoleGuard } from "@/components/Auth/RoleGuard";

interface ServiceJob {
  id: string;
  job_number: string;
  client_name: string;
  service_address: string;
  target_pest: string;
  technician: string;
  service_date: string;
  notes: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

const INITIAL_JOBS: ServiceJob[] = [];

const LOCAL_STORAGE_KEY = "jrc_pest_control_cache_v1";

const TREATMENT_TYPES = [
  "Termite Soil Barrier & Injection",
  "General Pest Control (GPC Spray)",
  "Rodent Abatement & Bait Stations",
  "Thermal Mosquito & Fly Fogging",
  "Food-Grade Cockroach Gel Baiting",
  "Industrial Chemical Disinfection",
];

export default function PestControlPage() {
  const [jobs, setJobs] = useState<ServiceJob[]>(INITIAL_JOBS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [clientName, setClientName] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");
  const [targetPest, setTargetPest] = useState(TREATMENT_TYPES[0]);
  const [technician, setTechnician] = useState("Ramon M. (Lead Tech)");
  const [serviceDate, setServiceDate] = useState("2026-08-05");
  const [notes, setNotes] = useState("");

  const loadJobs = async () => {
    let localJobs = INITIAL_JOBS;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        localJobs = JSON.parse(stored);
        setJobs(localJobs);
      }
    } catch (e) {
      console.error("Local storage pest control read error:", e);
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("pest_control_jobs").select("*");
      if (!error && data && data.length > 0) {
        const remoteJobs: ServiceJob[] = data.map((j: any) => ({
          id: j.id,
          job_number: j.job_number || `PC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          client_name: j.client_name || "Commercial Client",
          service_address: j.service_address || "",
          target_pest: j.notes ? j.notes.split(" — ")[0] || "General Pest Treatment" : "General Pest Control",
          technician: "Ramon M. (Lead Tech)",
          service_date: j.scheduled_date ? j.scheduled_date.split("T")[0] : "2026-08-05",
          notes: j.notes || "",
          status: j.status || "SCHEDULED",
        }));

        const map = new Map<string, ServiceJob>();
        localJobs.forEach((item) => map.set(item.job_number, item));
        remoteJobs.forEach((item) => map.set(item.job_number, item));
        const combined = Array.from(map.values());
        setJobs(combined);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(combined));
      }
    } catch (err) {
      console.error("Supabase pest jobs load error:", err);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCreateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingJobId) {
      const updated = jobs.map((j) =>
        j.id === editingJobId
          ? {
              ...j,
              client_name: clientName,
              service_address: serviceAddress,
              target_pest: targetPest,
              technician: technician,
              service_date: serviceDate,
              notes: notes,
            }
          : j
      );
      setJobs(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      setEditingJobId(null);
    } else {
      const newJobNo = `PC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newJob: ServiceJob = {
        id: `pc-${Date.now()}`,
        job_number: newJobNo,
        client_name: clientName,
        service_address: serviceAddress,
        target_pest: targetPest,
        technician: technician,
        service_date: serviceDate,
        notes: notes,
        status: "SCHEDULED",
      };

      const updated = [newJob, ...jobs];
      setJobs(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Pest control write error:", e);
      }

      try {
        const supabase = createClient();
        await supabase.from("pest_control_jobs").insert({
          job_number: newJobNo,
          service_address: serviceAddress || clientName,
          scheduled_date: new Date(serviceDate).toISOString(),
          status: "SCHEDULED",
          notes: `${targetPest} — ${notes}`,
        });
      } catch (err) {}
    }

    setIsModalOpen(false);
    setClientName("");
    setServiceAddress("");
    setNotes("");
  };

  const handleToggleStatus = (jobId: string) => {
    const statusCycle: Record<ServiceJob["status"], ServiceJob["status"]> = {
      SCHEDULED: "IN_PROGRESS",
      IN_PROGRESS: "COMPLETED",
      COMPLETED: "SCHEDULED",
      CANCELLED: "SCHEDULED",
    };

    const updated = jobs.map((j) => (j.id === jobId ? { ...j, status: statusCycle[j.status] } : j));
    setJobs(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const handleOpenEditJob = (j: ServiceJob) => {
    setEditingJobId(j.id);
    setClientName(j.client_name);
    setServiceAddress(j.service_address || "");
    setTargetPest(j.target_pest);
    setTechnician(j.technician);
    setServiceDate(j.service_date);
    setNotes(j.notes || "");
    setIsModalOpen(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to cancel and delete this service record?")) return;
    const targetJob = jobs.find((j) => j.id === jobId);
    const updated = jobs.filter((j) => j.id !== jobId);
    setJobs(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Delete job error:", e);
    }

    try {
      const supabase = createClient();
      const jobNum = targetJob?.job_number || jobId;
      await supabase.from("pest_control_jobs").delete().or(`id.eq.${jobId},job_number.eq.${jobNum}`);
    } catch (err) {
      console.error("Pest control job delete notice:", err);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.target_pest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.technician.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <RoleGuard allowedRoles={["super_admin", "sales_rep", "pest_control_tech", "purchasing_officer", "logistics_driver"]} moduleName="Pest Control Services">
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* STICKY TOP NAVIGATION BAR */}
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <Bug className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Pest Control Services</h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Commercial pest control schedules, chemical formulation notes, and field technician assignments</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-500 text-slate-950 font-extrabold text-sm shadow-md shadow-yellow-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 text-slate-950" />
            <span>+ Schedule Pest Control</span>
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Client Name, Job #, or Tech..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["ALL", "SCHEDULED", "IN_PROGRESS", "COMPLETED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? "bg-blue-700 text-white border-2 border-amber-400 shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-blue-50 border border-slate-200"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* JOBS DATA TABLE */}
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-sm">
            <Bug className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900">No Pest Control Services Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Click "+ Schedule Pest Control" to register a new commercial pest control treatment or technician schedule.
            </p>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-extrabold">
                  <th className="py-3 px-3">Job Ref #</th>
                  <th className="py-3 px-3">Client Account & Site</th>
                  <th className="py-3 px-3">Pest Treatment Type</th>
                  <th className="py-3 px-3">Assigned Lead Tech</th>
                  <th className="py-3 px-3">Scheduled Date</th>
                  <th className="py-3 px-3">Chemical Notes</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                {filteredJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-extrabold text-blue-700">{j.job_number}</td>
                    <td className="py-3.5 px-3">
                      <p className="font-extrabold text-slate-900">{j.client_name}</p>
                      {j.service_address && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 font-medium truncate max-w-xs">
                          <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{j.service_address}</span>
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">{j.target_pest}</td>
                    <td className="py-3.5 px-3 font-semibold text-blue-900">{j.technician}</td>
                    <td className="py-3.5 px-3 font-mono font-semibold text-slate-700">{j.service_date}</td>
                    <td className="py-3.5 px-3 text-xs text-slate-600 max-w-xs truncate">{j.notes || "—"}</td>
                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => handleToggleStatus(j.id)}
                        className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all border ${
                          j.status === "COMPLETED"
                            ? "bg-emerald-500 text-white border-emerald-600"
                            : j.status === "IN_PROGRESS"
                            ? "bg-orange-500 text-white border-orange-600 animate-pulse"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {j.status === "COMPLETED" ? "✓ COMPLETED" : j.status === "IN_PROGRESS" ? "⚡ IN PROGRESS" : "⏳ SCHEDULED"}
                      </button>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditJob(j)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                          title="Edit Job Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(j.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SCHEDULE DISPATCH MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white border-2 border-blue-600 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-5 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Bug className="w-5 h-5 text-blue-700" />
                  <span>Schedule Pest Control Service</span>
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateDispatch} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Commercial Client Account Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Robinsons Supermarket, SM Prime, Mega Mall..."
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Service Facility / Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Warehouse 3, Expressway Highway, Pasig City"
                    value={serviceAddress}
                    onChange={(e) => setServiceAddress(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Pest Treatment Protocol</label>
                    <select
                      value={targetPest}
                      onChange={(e) => setTargetPest(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                    >
                      {TREATMENT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Assigned Lead Technician</label>
                    <select
                      value={technician}
                      onChange={(e) => setTechnician(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-bold"
                    >
                      <option value="Ramon M. (Lead Tech)">Ramon M. (Lead Tech)</option>
                      <option value="Eduardo S. (Specialist)">Eduardo S. (Specialist)</option>
                      <option value="Mark A. (Field Tech)">Mark A. (Field Tech)</option>
                      <option value="Gabriel P. (Supervisor)">Gabriel P. (Supervisor)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Target Service Schedule Date</label>
                  <input
                    type="date"
                    required
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Chemical Formulation & Safety Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Enter chemical dilution ratio (e.g. Cypermethrin 10EC @ 50mL per 10L water), safety gear requirements..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:border-blue-600"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-extrabold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-950 text-xs font-extrabold shadow-md"
                  >
                    Assign Service to Field Tech
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      </div>
    </RoleGuard>
  );
}
