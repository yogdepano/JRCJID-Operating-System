"use client";

import { useEffect } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Client-side exception caught:", error);
  }, [error]);

  const handleClearCacheAndReload = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-md w-full bg-white border-2 border-amber-300 rounded-2xl p-6 sm:p-8 space-y-5 shadow-2xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-700 shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Application Notice</h2>
          <p className="text-xs text-slate-600 font-medium">
            The workspace encountered a temporary client update. Click below to clear local cache and re-sync with cloud.
          </p>

          {error?.message && (
            <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-mono text-rose-600 font-semibold break-words max-h-24 overflow-y-auto text-left">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleClearCacheAndReload}
            className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 ring-2 ring-amber-400"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Clear Local Cache & Reload</span>
          </button>

          <button
            onClick={() => reset()}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs border border-slate-300 transition-all"
          >
            <span>Try Resetting View</span>
          </button>
        </div>
      </div>
    </div>
  );
}
