"use client";

import React, { useState, useEffect } from "react";
import { Package, Plus, Search, Filter, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: "raw_material" | "finished_chemical" | "packaging" | "pest_control_supply";
  uom: string;
  min_reorder_level: number;
  current_stock: number;
  unit_cost: number;
  selling_price: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Product["category"]>("raw_material");
  const [uom, setUom] = useState("KG");
  const [minReorder, setMinReorder] = useState(100);
  const [unitCost, setUnitCost] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);

  const fetchProducts = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        setProducts(data as Product[]);
      }
    } catch (err) {
      console.error("Notice loading products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProd: Product = {
      id: `p-${Date.now()}`,
      sku,
      name,
      category,
      uom,
      min_reorder_level: Number(minReorder),
      current_stock: 0,
      unit_cost: Number(unitCost),
      selling_price: Number(sellingPrice),
    };

    setProducts([newProd, ...products]);
    setIsModalOpen(false);

    try {
      const supabase = createClient();
      await supabase.from("products").insert({
        sku,
        name,
        category,
        uom,
        min_reorder_level: Number(minReorder),
        unit_cost: Number(unitCost),
        selling_price: Number(sellingPrice),
      });
    } catch (err) {
      console.error("Error saving product to Supabase:", err);
    }

    setSku("");
    setName("");
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-4 sm:p-6 space-y-4 sm:space-y-6 font-sans pb-20 lg:pb-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-sky-400" />
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">Product Catalog Master</h1>
            </div>
            <p className="text-xs text-slate-400">Mobile-First Product & Raw Chemical Catalog</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product SKU</span>
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0f172a]/60 p-3 sm:p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search SKU or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "raw_material", "finished_chemical", "packaging", "pest_control_supply"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE PRODUCT CARDS (SMALL SCREENS) */}
      <div className="block lg:hidden space-y-3">
        {filteredProducts.map((p) => {
          const isLowStock = (p.current_stock || 0) <= p.min_reorder_level;
          return (
            <div key={p.id} className="p-4 rounded-xl bg-[#0f172a]/90 border border-slate-800 space-y-2 shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-400">{p.sku}</span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 uppercase">
                  {p.category.replace("_", " ")}
                </span>
              </div>
              <h3 className="text-xs font-bold text-white">{p.name}</h3>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/60">
                <div>
                  <span className="text-[10px] text-slate-500 block">Unit Cost</span>
                  <span className="font-mono font-bold text-slate-200">₱{p.unit_cost?.toFixed(2) || "0.00"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Selling Price</span>
                  <span className="font-mono font-bold text-slate-200">₱{p.selling_price?.toFixed(2) || "0.00"}</span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center bg-[#0f172a]/40 border border-slate-800 rounded-xl space-y-2">
            <Package className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No product SKUs found. Tap "+ Add Product SKU" to register chemicals.</p>
          </div>
        )}
      </div>

      {/* DESKTOP DATA TABLE (LARGE SCREENS) */}
      <div className="hidden lg:block p-5 rounded-xl bg-[#0f172a]/60 border border-slate-800 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">SKU</th>
              <th className="py-3 px-3">Product Name</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">UOM</th>
              <th className="py-3 px-3">Unit Cost (₱)</th>
              <th className="py-3 px-3">Selling Price (₱)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-3 font-mono font-medium text-sky-400">{p.sku}</td>
                <td className="py-3 px-3 font-semibold text-slate-100">{p.name}</td>
                <td className="py-3 px-3 uppercase text-[10px] font-bold text-slate-400">{p.category.replace("_", " ")}</td>
                <td className="py-3 px-3 font-mono">{p.uom}</td>
                <td className="py-3 px-3 font-mono">₱{p.unit_cost?.toFixed(2) || "0.00"}</td>
                <td className="py-3 px-3 font-mono">₱{p.selling_price?.toFixed(2) || "0.00"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-sky-400" />
                <span>Add Product to Catalog</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="RM-CHEM-009"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Product["category"])}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value="raw_material">Raw Material</option>
                    <option value="finished_chemical">Finished Chemical</option>
                    <option value="packaging">Packaging</option>
                    <option value="pest_control_supply">Pest Control Supply</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Product Description / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Concentrated Degreaser Solution"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">UOM</label>
                  <input
                    type="text"
                    required
                    value={uom}
                    onChange={(e) => setUom(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Unit Cost (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Selling Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold shadow-lg shadow-sky-500/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
