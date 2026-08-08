"use client";

import React, { useState, useEffect } from "react";
import { Truck, Search, History, Package, ArrowDownRight, ArrowUpRight, Plus, Layers, Trash2, Edit3, ChevronDown } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopNavbar } from "@/components/Navigation/TopNavbar";
import { RoleGuard } from "@/components/Auth/RoleGuard";
import { OrderTaskView } from "@/components/Orders/OrderTaskView";
import { ComboboxInput } from "@/components/ui/ComboboxInput";

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  uom: string;
  current_stock: number;
  min_reorder_level: number;
  unit_cost: number;
}

interface InventoryMovement {
  id: string;
  timestamp: string;
  sku: string;
  name: string;
  reason: "PRODUCTION_YIELD" | "PRODUCTION_CONSUMPTION" | "PURCHASE_RECEIPT" | "PEST_CONTROL_CONSUMPTION" | "SALES_DISPATCH" | "STOCK_ADJUSTMENT";
  batch_lot: string;
  ref_doc: string;
  qty_delta: number;
  uom: string;
  user: string;
}

const LOCAL_STORAGE_PRODUCTS_KEY = "jrc_products_cache_v1";
const LOCAL_STORAGE_MOVEMENTS_KEY = "jrc_inventory_movements_cache_v1";

export default function InventoryPage() {
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"stock_ledger" | "movements">("stock_ledger");

  // STOCK ADJUSTMENT MODAL STATE
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustSku, setAdjustSku] = useState("");
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<InventoryMovement["reason"]>("PURCHASE_RECEIPT");
  const [adjustRefDoc, setAdjustRefDoc] = useState("");

  const loadData = async () => {
    let prods: InventoryItem[] = [];

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        prods = parsed.map((p: any) => ({
          id: p.id || `p-${p.sku}`,
          sku: p.sku,
          name: p.name,
          category: p.category || "finished_chemical",
          uom: p.uom || "PCS",
          current_stock: Number(p.current_stock) || 0,
          min_reorder_level: Number(p.min_reorder_level) || 10,
          unit_cost: Number(p.unit_cost) || 0,
        }));
      }
    } catch (e) {
      console.error("Local storage product error:", e);
    }

    try {
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*");
      if (data && data.length > 0) {
        const remote: InventoryItem[] = data.map((p: any) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category || "finished_chemical",
          uom: p.uom || "PCS",
          current_stock: Number(p.current_stock) || 0,
          min_reorder_level: Number(p.min_reorder_level) || 10,
          unit_cost: Number(p.unit_cost) || 0,
        }));

        const map = new Map<string, InventoryItem>();
        prods.forEach((p) => map.set(p.sku, p));
        remote.forEach((p) => map.set(p.sku, p));
        prods = Array.from(map.values());
      }
    } catch (err) {
      console.error("Supabase inventory fetch error:", err);
    }

    setInventoryList(prods);

    try {
      const cachedM = localStorage.getItem(LOCAL_STORAGE_MOVEMENTS_KEY);
      if (cachedM) {
        setMovements(JSON.parse(cachedM));
      }
    } catch (e) {
      console.error("Movements cache error:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const targetProd = inventoryList.find((p) => p.sku === adjustSku);
    if (!targetProd) return;

    const newStock = targetProd.current_stock + adjustQty;
    const updatedList = inventoryList.map((p) => (p.sku === adjustSku ? { ...p, current_stock: newStock } : p));
    setInventoryList(updatedList);

    try {
      localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(updatedList));
    } catch (err) {
      console.error("Local storage stock update error:", err);
    }

    const newMovement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      sku: targetProd.sku,
      name: targetProd.name,
      reason: adjustReason,
      batch_lot: `LOT-${Date.now().toString().substring(6)}`,
      ref_doc: adjustRefDoc || "MANUAL-ADJUSTMENT",
      qty_delta: adjustQty,
      uom: targetProd.uom,
      user: "Logistics Officer",
    };

    const updatedMovements = [newMovement, ...movements];
    setMovements(updatedMovements);
    try {
      localStorage.setItem(LOCAL_STORAGE_MOVEMENTS_KEY, JSON.stringify(updatedMovements));
    } catch (err) {
      console.error("Movements local storage error:", err);
    }

    setIsAdjustModalOpen(false);
    setAdjustQty(0);
    setAdjustRefDoc("");
  };

  const filteredInventory = inventoryList.filter(
    (item) => item.sku.toLowerCase().includes(searchTerm.toLowerCase()) || item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMovements = movements.filter(
    (m) =>
      m.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.batch_lot.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStockValuation = inventoryList.reduce((acc, item) => acc + item.current_stock * item.unit_cost, 0);

  const handleDeleteInventoryItem = async (sku: string) => {
    if (!confirm(`Are you sure you want to delete SKU ${sku} from Logistics inventory?`)) return;
    const updated = inventoryList.filter((i) => i.sku !== sku);
    setInventoryList(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
    } catch (e) {}

    try {
      const supabase = createClient();
      await supabase.from("products").delete().eq("sku", sku);
    } catch (err) {
      console.error("Inventory item delete notice:", err);
    }
  };

  const [editingMovement, setEditingMovement] = useState<InventoryMovement | null>(null);

  const handleDeleteMovement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stock movement log entry?")) return;
    const updated = movements.filter((m) => m.id !== id);
    setMovements(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_MOVEMENTS_KEY, JSON.stringify(updated));
    } catch (e) {}

    try {
      const supabase = createClient();
      await supabase.from("inventory_movements").delete().eq("id", id);
    } catch (err) {
      console.error("Movement delete notice:", err);
    }
  };

  const handleSaveEditMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovement) return;
    const updated = movements.map((m) => (m.id === editingMovement.id ? editingMovement : m));
    setMovements(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_MOVEMENTS_KEY, JSON.stringify(updated));
    } catch (e) {}
    setEditingMovement(null);
  };

  return (
    <RoleGuard allowedRoles={["super_admin", "production_manager", "production_lead", "purchasing_officer", "logistics_driver"]} moduleName="Logistics & Inventory Control">
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* STICKY TOP NAVIGATION BAR */}
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <Truck className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Logistics Department (Delivery & Material Pickups)</h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Collect purchased raw materials, confirm supplier deliveries, dispatch finished goods, and update stock ledgers</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (inventoryList.length > 0) setAdjustSku(inventoryList[0].sku);
              setIsAdjustModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-500 text-slate-950 font-extrabold text-sm shadow-md shadow-yellow-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 text-slate-950" />
            <span>+ Receive / Adjust Stock</span>
          </button>
        </div>

        {/* TASK-ORIENTED SYNCHRONIZED ORDER WORKSPACE FOR LOGISTICS */}
        <OrderTaskView activeDepartment="Logistics" employeeName="Logistics Officer" />

        {/* SUMMARY BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-1 relative overflow-hidden">
            <div className="w-full h-1.5 bg-gradient-to-r from-blue-600 to-amber-400 absolute top-0 left-0"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Catalog SKUs</span>
            <p className="text-3xl font-extrabold text-blue-800 font-mono">{inventoryList.length} SKUs</p>
            <span className="text-[11px] text-slate-600 font-semibold block pt-1">Registered Chemical Catalog</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-1 relative overflow-hidden">
            <div className="w-full h-1.5 bg-gradient-to-r from-amber-400 to-blue-600 absolute top-0 left-0"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Inventory Valuation</span>
            <p className="text-3xl font-extrabold text-slate-900 font-mono">₱{totalStockValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <span className="text-[11px] text-slate-600 font-semibold block pt-1">Asset Value at Unit Cost</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-1 relative overflow-hidden">
            <div className="w-full h-1.5 bg-gradient-to-r from-blue-600 to-emerald-500 absolute top-0 left-0"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Recorded Stock Movements</span>
            <p className="text-3xl font-extrabold text-blue-900 font-mono">{movements.length} Logged</p>
            <span className="text-[11px] text-slate-600 font-semibold block pt-1">Audit Trail Entries</span>
          </div>
        </div>

        {/* SEARCH BAR & TABS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU Code or Product Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("stock_ledger")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === "stock_ledger"
                  ? "bg-blue-700 text-white shadow-sm ring-2 ring-amber-400"
                  : "bg-slate-100 text-slate-700 hover:bg-blue-50 border border-slate-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Current Stock Ledger ({inventoryList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("movements")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === "movements"
                  ? "bg-blue-700 text-white shadow-sm ring-2 ring-amber-400"
                  : "bg-slate-100 text-slate-700 hover:bg-blue-50 border border-slate-200"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Movement History ({movements.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: CURRENT STOCK LEDGER */}
        {activeTab === "stock_ledger" && (
          <>
            {filteredInventory.length === 0 ? (
              <div className="p-12 text-center bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-sm">
                <Package className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-900">No Inventory Items Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                  Add products in <Link href="/products" className="text-blue-700 underline font-bold">Product Catalog</Link> to view them in Logistics.
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-extrabold">
                      <th className="py-3 px-3">SKU Code</th>
                      <th className="py-3 px-3">Product Description</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">On-Hand Stock</th>
                      <th className="py-3 px-3">UOM</th>
                      <th className="py-3 px-3">Unit Cost (₱)</th>
                      <th className="py-3 px-3">Stock Valuation (₱)</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                    {filteredInventory.map((item) => (
                      <tr key={item.sku} className="hover:bg-blue-50/50 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-extrabold text-blue-700">{item.sku}</td>
                        <td className="py-3.5 px-3 font-extrabold text-slate-900">{item.name}</td>
                        <td className="py-3.5 px-3 uppercase text-xs font-bold text-slate-500">{item.category.replace("_", " ")}</td>
                        <td className="py-3.5 px-3 font-mono font-extrabold text-base text-slate-900">{item.current_stock}</td>
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-700">{item.uom}</td>
                        <td className="py-3.5 px-3 font-mono font-semibold">₱{item.unit_cost.toFixed(2)}</td>
                        <td className="py-3.5 px-3 font-mono font-extrabold text-blue-900">
                          ₱{(item.current_stock * item.unit_cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                              item.current_stock > item.min_reorder_level
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : item.current_stock > 0
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-rose-100 text-rose-800 border border-rose-300"
                            }`}
                          >
                            {item.current_stock > item.min_reorder_level
                              ? "IN STOCK"
                              : item.current_stock > 0
                              ? "LOW STOCK"
                              : "OUT OF STOCK"}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setAdjustSku(item.sku);
                                setIsAdjustModalOpen(true);
                              }}
                              className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-950 text-xs font-extrabold transition-all"
                            >
                              + Adjust Stock
                            </button>
                            <button
                              onClick={() => handleDeleteInventoryItem(item.sku)}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                              title="Delete Item from Inventory"
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
          </>
        )}

        {/* TAB 2: STOCK MOVEMENT HISTORY */}
        {activeTab === "movements" && (
          <>
            {filteredMovements.length === 0 ? (
              <div className="p-12 text-center bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-sm">
                <History className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-extrabold text-slate-900">No Stock Movements Logged Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                  Click "+ Receive / Adjust Stock" or dispatch orders to record stock movements.
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-extrabold">
                      <th className="py-3 px-3">Date / Time</th>
                      <th className="py-3 px-3">Product SKU</th>
                      <th className="py-3 px-3">Description</th>
                      <th className="py-3 px-3">Movement Reason</th>
                      <th className="py-3 px-3">Batch Lot #</th>
                      <th className="py-3 px-3">Ref Doc #</th>
                      <th className="py-3 px-3">Quantity Delta</th>
                      <th className="py-3 px-3">User</th>
                      <th className="py-3 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                    {filteredMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-blue-50/50 transition-colors">
                        <td className="py-3.5 px-3 font-mono text-xs text-slate-600 font-semibold">{m.timestamp}</td>
                        <td className="py-3.5 px-3 font-mono font-extrabold text-blue-700">{m.sku}</td>
                        <td className="py-3.5 px-3 font-extrabold text-slate-900">{m.name}</td>
                        <td className="py-3.5 px-3">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-800 uppercase border border-slate-200">
                            {m.reason.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-xs text-slate-700 font-semibold">{m.batch_lot}</td>
                        <td className="py-3.5 px-3 font-mono text-xs text-slate-700 font-semibold">{m.ref_doc}</td>
                        <td className="py-3.5 px-3 font-mono font-extrabold">
                          <span
                            className={`px-2 py-0.5 rounded text-xs inline-flex items-center gap-1 ${
                              m.qty_delta > 0
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-rose-100 text-rose-800 border border-rose-300"
                            }`}
                          >
                            {m.qty_delta > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {m.qty_delta > 0 ? `+${m.qty_delta}` : m.qty_delta} {m.uom}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-xs text-slate-600 font-bold">{m.user}</td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setEditingMovement(m)}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                              title="Edit Movement Entry"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMovement(m.id)}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
                              title="Delete Movement Entry"
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
          </>
        )}

        {/* STOCK ADJUSTMENT MODAL */}
        {isAdjustModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white border-2 border-blue-600 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-5 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-700" />
                  <span>Receive / Adjust Inventory Stock</span>
                </h3>
                <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveStockAdjustment} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Product SKU / Item Name (Type or Select Catalog)</label>
                  <ComboboxInput
                    value={adjustSku}
                    onChange={(val) => setAdjustSku(val)}
                    placeholder="Type product name/SKU or select catalog..."
                    className="p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-extrabold focus:border-blue-600 focus:outline-none"
                    options={inventoryList.map((p) => ({
                      value: p.sku,
                      label: p.sku,
                      sublabel: `${p.name} — Current Stock: ${p.current_stock} ${p.uom}`
                    }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Quantity Delta (+/-)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 50 or -10"
                      value={adjustQty}
                      onChange={(e) => setAdjustQty(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono font-extrabold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Reason</label>
                    <select
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value as InventoryMovement["reason"])}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                    >
                      <option value="PURCHASE_RECEIPT">Purchase Receipt (+ Stock)</option>
                      <option value="PRODUCTION_YIELD">Production Yield (+ Finished Goods)</option>
                      <option value="PRODUCTION_CONSUMPTION">Production Consumption (- Raw Material)</option>
                      <option value="SALES_DISPATCH">Sales Dispatch (- Client Delivery)</option>
                      <option value="STOCK_ADJUSTMENT">Stock Adjustment (Audit)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Reference Document / PO #</label>
                  <input
                    type="text"
                    placeholder="e.g. PO-RAW-2026-001 or DR-2026-88"
                    value={adjustRefDoc}
                    onChange={(e) => setAdjustRefDoc(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono text-slate-900 font-semibold"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-extrabold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-extrabold shadow-md ring-2 ring-amber-400"
                  >
                    Update Stock & Log Movement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT STOCK MOVEMENT MODAL */}
        {editingMovement && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white border-2 border-amber-500 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-5 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-600" />
                  <span>Edit Stock Movement Log ({editingMovement.sku})</span>
                </h3>
                <button onClick={() => setEditingMovement(null)} className="text-slate-400 hover:text-slate-900 text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveEditMovement} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Product SKU & Name</label>
                  <input
                    type="text"
                    disabled
                    value={`${editingMovement.name} (${editingMovement.sku})`}
                    className="w-full p-2.5 bg-slate-100 border-2 border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Quantity Delta (+/-)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingMovement.qty_delta}
                      onChange={(e) => setEditingMovement({ ...editingMovement, qty_delta: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono font-extrabold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Reason</label>
                    <select
                      value={editingMovement.reason}
                      onChange={(e) => setEditingMovement({ ...editingMovement, reason: e.target.value as any })}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                    >
                      <option value="PURCHASE_RECEIPT">Purchase Receipt (+ Stock)</option>
                      <option value="PRODUCTION_YIELD">Production Yield (+ Finished Goods)</option>
                      <option value="PRODUCTION_CONSUMPTION">Production Consumption (- Raw Material)</option>
                      <option value="SALES_DISPATCH">Sales Dispatch (- Client Delivery)</option>
                      <option value="STOCK_ADJUSTMENT">Stock Adjustment (Audit)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Batch Lot #</label>
                    <input
                      type="text"
                      value={editingMovement.batch_lot}
                      onChange={(e) => setEditingMovement({ ...editingMovement, batch_lot: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono text-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Ref Doc #</label>
                    <input
                      type="text"
                      value={editingMovement.ref_doc}
                      onChange={(e) => setEditingMovement({ ...editingMovement, ref_doc: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono text-slate-900 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-800 font-extrabold block mb-1">Logged User</label>
                  <input
                    type="text"
                    value={editingMovement.user}
                    onChange={(e) => setEditingMovement({ ...editingMovement, user: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMovement(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-extrabold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-950 text-xs font-extrabold shadow-md active:scale-95 transition-all"
                  >
                    Save Movement Log Changes
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
