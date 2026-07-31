"use client";

import React, { useState } from "react";
import { Package, Plus, Search, Filter, AlertTriangle, Layers, DollarSign, ArrowLeft } from "lucide-react";
import Link from "next/link";

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

const mockProducts: Product[] = [
  {
    id: "p1",
    sku: "RM-CHEM-001",
    name: "Sodium Hydroxide (Caustic Soda Flakes)",
    category: "raw_material",
    uom: "KG",
    min_reorder_level: 200,
    current_stock: 450,
    unit_cost: 85.00,
    selling_price: 0.00,
  },
  {
    id: "p2",
    sku: "RM-CHEM-002",
    name: "Linear Alkylbenzene Sulfonic Acid (LABSA)",
    category: "raw_material",
    uom: "KG",
    min_reorder_level: 300,
    current_stock: 120, // LOW STOCK
    unit_cost: 140.00,
    selling_price: 0.00,
  },
  {
    id: "p3",
    sku: "FG-CHEM-500",
    name: "JRC Heavy Duty Industrial Degreaser (20L Drum)",
    category: "finished_chemical",
    uom: "DRUM",
    min_reorder_level: 25,
    current_stock: 68,
    unit_cost: 1250.00,
    selling_price: 2450.00,
  },
  {
    id: "p4",
    sku: "PC-SUP-012",
    name: "Termiticide Concentrate Premise 200SL",
    category: "pest_control_supply",
    uom: "L",
    min_reorder_level: 15,
    current_stock: 42,
    unit_cost: 3200.00,
    selling_price: 4800.00,
  },
  {
    id: "p5",
    sku: "PKG-DRUM-20",
    name: "HDPE Blue Carboy Drum (20 Liter)",
    category: "packaging",
    uom: "PCS",
    min_reorder_level: 100,
    current_stock: 310,
    unit_cost: 180.00,
    selling_price: 0.00,
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
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

  const handleAddProduct = (e: React.FormEvent) => {
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
    // Reset Form
    setSku("");
    setName("");
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 space-y-6 font-sans">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-sky-400" />
              <h1 className="text-xl font-bold tracking-tight text-white">Product Catalog Master</h1>
            </div>
            <p className="text-xs text-slate-400">Manage raw chemicals, finished goods, packaging, and pest control supplies</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product SKU</span>
          </button>
        </div>
      </div>

      {/* SEARCH & CATEGORY FILTER RIBBON */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0f172a]/60 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Filter by SKU or Product Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          {["ALL", "raw_material", "finished_chemical", "packaging", "pest_control_supply"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
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

      {/* PRODUCTS DATA TABLE */}
      <div className="p-5 rounded-xl bg-[#0f172a]/60 border border-slate-800/80 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">SKU</th>
              <th className="py-3 px-3">Product Name</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">UOM</th>
              <th className="py-3 px-3">Current Stock</th>
              <th className="py-3 px-3">Unit Cost (₱)</th>
              <th className="py-3 px-3">Selling Price (₱)</th>
              <th className="py-3 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
            {filteredProducts.map((p) => {
              const isLowStock = p.current_stock <= p.min_reorder_level;
              return (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-sky-400">{p.sku}</td>
                  <td className="py-3 px-3 font-semibold text-slate-100">{p.name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                      {p.category.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">{p.uom}</td>
                  <td className="py-3 px-3 font-mono font-bold">
                    {p.current_stock.toLocaleString()} {p.uom}
                  </td>
                  <td className="py-3 px-3 font-mono">₱{p.unit_cost.toFixed(2)}</td>
                  <td className="py-3 px-3 font-mono">₱{p.selling_price.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right">
                    {isLowStock ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <AlertTriangle className="w-3 h-3" /> REORDER REQUIRED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        HEALTHY
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ADD PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
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
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Product["category"])}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:border-sky-500"
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
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:border-sky-500"
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
