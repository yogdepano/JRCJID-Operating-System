"use client";

import React from "react";
import { UnifiedOrder } from "@/lib/orders/types";
import { Clock, X, User, Building2, CheckCircle2, ChevronRight } from "lucide-react";

interface OrderTimelineDrawerProps {
  order: UnifiedOrder | null;
  onClose: () => void;
}

export function OrderTimelineDrawer({ order, onClose }: OrderTimelineDrawerProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col font-sans">
        {/* DRAWER HEADER */}
        <div className="p-5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-amber-400 font-mono text-xs font-extrabold uppercase tracking-wider block">
              {order.order_number} • Live Order Activity Timeline
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-white">{order.customer_name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ORDER CURRENT RESPONSIBILITY SUMMARY */}
        <div className="p-4 bg-blue-50 border-b border-blue-200 flex items-center justify-between text-xs font-bold">
          <div>
            <span className="text-slate-500 text-[10px] uppercase block font-semibold">Current Status</span>
            <span className="text-blue-900 font-extrabold text-sm">{order.current_status}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 text-[10px] uppercase block font-semibold">Department Responsible</span>
            <span className="inline-block px-3 py-1 rounded-full bg-blue-700 text-white font-extrabold text-xs shadow-xs">
              {order.current_department_responsible}
            </span>
          </div>
        </div>

        {/* CHRONOLOGICAL TIMELINE EVENT LOG */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Clock className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Permanent History Log ({order.timeline.length} Events)
            </h3>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {order.timeline.map((event, idx) => (
              <div key={event.id || idx} className="relative group">
                {/* TIMELINE NODE */}
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-blue-600 border-4 border-white shadow-md flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-3.5 space-y-1.5 hover:bg-blue-50/50 hover:border-blue-300 transition-all shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-blue-800">{event.action}</span>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">{event.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-slate-800">{event.employee_name}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span className="font-semibold text-blue-700">{event.department}</span>
                    </span>
                  </div>

                  {event.notes && (
                    <p className="text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200 italic font-sans mt-1">
                      "{event.notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-500 font-semibold">
          Single Synchronized Shared Order • Live Activity Log
        </div>
      </div>
    </div>
  );
}
