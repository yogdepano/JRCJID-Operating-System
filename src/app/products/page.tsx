"use client";

import React, { useState, useEffect } from "react";
import { Package, Plus, Search, Filter, AlertTriangle, ArrowLeft, Wand2 } from "lucide-react";
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
  const [uom, setUom] = useState("Drum");
  const [minReorder, setMinReorder] = useState(10);
  const [unitCost, setUnitCost] = useState(17000);
  const [sellingPrice, setSellingPrice] = useState(18500);

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

  // AUTO SKU GENERATOR LOGIC
  const generateSkuFromName = (productName: string, cat: Product["category"]) => {
    if (!productName.trim()) return "";
    
    const categoryPrefixMap: Record<Product["category"], string> = {
      raw_material: "RM",
      finished_chemical: "FG",
      packaging: "PK",
      pest_control_supply: "PC",
    };

    const prefix = categoryPrefixMap[cat] || "PRD";

    // Extract initials or key words from name
    const words = productName.trim().split(/\s+/).filter(Boolean);
    let nameCode = "";
    if (words.length === 1) {
      nameCode = words[0].substring(0, 4).toUpperCase();
    } else {
      nameCode = words.map((w) => w[0]).join("").toUpperCase().substring(0, 4);
    }

    // Extract numbers if present (e.g. 99% -> 99)
    const numbersMatch = productName.match(/\d+/);
    const numPart = numbersMatch ? `-${numbersMatch[0]}` : `-${Math.floor(100 + Math.random() * 900)}`;

    return `${prefix}-${nameCode}${numPart}`;
  };

  // Auto-update SKU whenever Name or Category changes (if SKU wasn't manually edited)
  const handleNameChange = (val: string) => {
    setName(val);
    setSku(generateSkuFromName(val, category));
  };

  const handleCategoryChange = (cat: Product["category"]) => {
    setCategory(cat);
    if (name) {
      setSku(generateSkuFromName(name, cat));
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSku = sku || generateSkuFromName(name, category) || `SKU-${Date.now()}`;

    const newProd: Product = {
      id: `p-${Date.now()}`,
      sku: finalSku,
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
        sku: finalSku,
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
    <div className="min-h-screen bg-[#060b17] text-slate-100 p-4 sm:p-6 space-y-5 sm:space-y-6 font-sans pb-24 lg:pb-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2541] pb-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2.5 rounded-xl bg-[#0b132b] border border-[#1c2541] text-amber-400 hover:text-yellow-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-400" />
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">Product Catalog Master</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">Manage SKUs, auto-generate codes, unit costs, and selling prices</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-yellow-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product SKU</span>
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0b132b] p-4 rounded-2xl border border-[#1c2541]">
        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search SKU or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["ALL", "raw_material", "finished_chemical", "packaging", "pest_control_supply"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-amber-400/20 text-amber-400 border border-amber-400/40"
                  : "bg-[#131c35] text-slate-300 hover:text-white border border-[#1c2541]"
              }`}
            >
              {cat.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE PRODUCT CARDS */}
      <div className="block lg:hidden space-y-4">
        {filteredProducts.map((p) => (
          <div key={p.id} className="p-5 rounded-2xl bg-[#0b132b] border border-[#1c2541] space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-extrabold text-amber-400">{p.sku}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#131c35] text-slate-300 uppercase">
                {p.category.replace("_", " ")}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white">{p.name}</h3>
            <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-[#1c2541]">
              <div>
                <span className="text-[10px] text-slate-400 block">UOM</span>
                <span className="font-mono font-bold text-slate-200">{p.uom}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Unit Cost</span>
                <span className="font-mono font-bold text-slate-200">₱{p.unit_cost?.toFixed(2) || "0.00"}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Selling Price</span>
                <span className="font-mono font-extrabold text-amber-400">₱{p.selling_price?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP DATA TABLE */}
      <div className="hidden lg:block p-5 rounded-2xl bg-[#0b132b] border border-[#1c2541] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1c2541] text-xs text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">SKU Code</th>
              <th className="py-3 px-3">Product Name</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">UOM</th>
              <th className="py-3 px-3">Unit Cost (₱)</th>
              <th className="py-3 px-3">Selling Price (₱)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1c2541] text-sm text-slate-200">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-[#131c35]/50 transition-colors">
                <td className="py-3.5 px-3 font-mono font-extrabold text-amber-400">{p.sku}</td>
                <td className="py-3.5 px-3 font-bold text-white">{p.name}</td>
                <td className="py-3.5 px-3 uppercase text-xs font-bold text-slate-400">{p.category.replace("_", " ")}</td>
                <td className="py-3.5 px-3 font-mono">{p.uom}</td>
                <td className="py-3.5 px-3 font-mono">₱{p.unit_cost?.toFixed(2) || "0.00"}</td>
                <td className="py-3.5 px-3 font-mono font-bold text-amber-400">₱{p.selling_price?.toFixed(2) || "0.00"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL WITH AUTOMATIC SKU GENERATOR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b132b] border border-[#1c2541] rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1c2541] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <span>Add Product to Catalog</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-200 font-bold block">SKU Code</label>
                    <button
                      type="button"
                      onClick={() => setSku(generateSkuFromName(name, category))}
                      className="text-[10px] text-amber-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <Wand2 className="w-3 h-3" /> Auto
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="RM-CHEM-009"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-xs font-mono font-bold text-amber-400 focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-slate-200 font-bold block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value as Product["category"])}
                    className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-xs text-slate-100 font-semibold"
                  >
                    <option value="raw_material">Raw Material</option>
                    <option value="finished_chemical">Finished Chemical</option>
                    <option value="packaging">Packaging</option>
                    <option value="pest_control_supply">Pest Control Supply</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-200 font-bold block mb-1">Product Description / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Isopropyl Alcohol 99%"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-xs sm:text-sm text-slate-100 font-semibold focus:border-amber-400"
                />
                <span className="text-[10px] text-amber-400 font-medium block mt-1">
                  💡 Type name to automatically generate standardized SKU code (e.g. {generateSkuFromName(name || "Isopropyl Alcohol 99%", category)})
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-200 font-bold block mb-1">UOM</label>
                  <input
                    type="text"
                    required
                    value={uom}
                    onChange={(e) => setUom(e.target.value)}
                    className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-xs font-mono text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-200 font-bold block mb-1">Unit Cost (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-xs font-mono font-bold text-slate-100"
                  />
                </div>
                <div>
                  <label className="text-slate-200 font-bold block mb-1">Selling Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-xs font-mono font-bold text-amber-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#131c35] text-slate-300 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-yellow-500/20"
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
