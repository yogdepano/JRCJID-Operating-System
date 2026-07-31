"use client";

import React, { useState, useEffect } from "react";
import { Package, Plus, Search, Filter, AlertTriangle, ArrowLeft, Wand2, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopNavbar } from "@/components/Navigation/TopNavbar";

interface Product {
  id: string;
  sku: string;
  name: string;
  variant_scent: string;
  category: "raw_material" | "finished_chemical" | "packaging" | "pest_control_supply";
  uom: string;
  min_reorder_level: number;
  current_stock: number;
  unit_cost: number;
  selling_price: number;
}

interface NewProductItem {
  id: string;
  name: string;
  variant_scent: string;
  sku: string;
  category: Product["category"];
  uom: string;
  unit_cost: number;
  selling_price: number;
}

const LOCAL_STORAGE_KEY = "jrc_products_cache_v1";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // BATCH MULTI-PRODUCT CREATION STATE
  const [newItems, setNewItems] = useState<NewProductItem[]>([
    {
      id: "item-1",
      name: "",
      variant_scent: "Standard / Unscented",
      sku: "",
      category: "finished_chemical",
      uom: "Drum (200L)",
      unit_cost: 0,
      selling_price: 0,
    },
  ]);

  const fetchProducts = async () => {
    let cachedList: Product[] = [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        cachedList = JSON.parse(stored);
        setProducts(cachedList);
      }
    } catch (e) {
      console.error("Local storage error:", e);
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        const remoteList = data.map((p: any) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          variant_scent: p.variant_scent || "Standard",
          category: p.category,
          uom: p.uom,
          min_reorder_level: Number(p.min_reorder_level) || 10,
          current_stock: Number(p.current_stock) || 0,
          unit_cost: Number(p.unit_cost) || 0,
          selling_price: Number(p.selling_price) || 0,
        }));

        const combinedMap = new Map<string, Product>();
        cachedList.forEach((p) => combinedMap.set(p.sku, p));
        remoteList.forEach((p) => combinedMap.set(p.sku, p));
        const combined = Array.from(combinedMap.values());
        setProducts(combined);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(combined));
      }
    } catch (err) {
      console.error("Notice loading products from Supabase:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // AUTO SKU GENERATOR LOGIC
  const generateSkuFromName = (productName: string, cat: Product["category"], variant: string) => {
    if (!productName.trim()) return "";
    
    const categoryPrefixMap: Record<Product["category"], string> = {
      raw_material: "RM",
      finished_chemical: "FG",
      packaging: "PK",
      pest_control_supply: "PC",
    };

    const prefix = categoryPrefixMap[cat] || "PRD";

    const words = productName.trim().split(/\s+/).filter(Boolean);
    let nameCode = "";
    if (words.length === 1) {
      nameCode = words[0].substring(0, 4).toUpperCase();
    } else {
      nameCode = words.map((w) => w[0]).join("").toUpperCase().substring(0, 4);
    }

    let scentCode = "";
    if (variant && variant !== "Standard / Unscented") {
      scentCode = `-${variant.substring(0, 3).toUpperCase()}`;
    }

    const numbersMatch = productName.match(/\d+/);
    const numPart = numbersMatch ? `-${numbersMatch[0]}` : "";

    return `${prefix}-${nameCode}${scentCode}${numPart}`;
  };

  // MULTI-ITEM FORM HANDLERS
  const handleAddMoreProductItem = () => {
    const newItem: NewProductItem = {
      id: `item-${Date.now()}`,
      name: "",
      variant_scent: "Standard / Unscented",
      sku: "",
      category: "finished_chemical",
      uom: "Drum (200L)",
      unit_cost: 0,
      selling_price: 0,
    };
    setNewItems([...newItems, newItem]);
  };

  const handleRemoveProductItem = (id: string) => {
    if (newItems.length === 1) return;
    setNewItems(newItems.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof NewProductItem, value: any) => {
    setNewItems(
      newItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "name" || field === "category" || field === "variant_scent") {
            updated.sku = generateSkuFromName(updated.name, updated.category, updated.variant_scent);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleSaveAllProducts = async (e: React.FormEvent) => {
    e.preventDefault();

    const createdProducts: Product[] = newItems.map((item) => ({
      id: `p-${Date.now()}-${Math.random()}`,
      sku: item.sku || generateSkuFromName(item.name, item.category, item.variant_scent) || `SKU-${Date.now()}`,
      name: item.variant_scent && item.variant_scent !== "Standard / Unscented" ? `${item.name} (${item.variant_scent})` : item.name,
      variant_scent: item.variant_scent || "Standard",
      category: item.category,
      uom: item.uom || "PCS",
      min_reorder_level: 10,
      current_stock: 0,
      unit_cost: Number(item.unit_cost) || 0,
      selling_price: Number(item.selling_price) || 0,
    }));

    const updatedList = [...createdProducts, ...products];
    setProducts(updatedList);
    
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (err) {
      console.error("Local storage write error:", err);
    }

    setIsModalOpen(false);

    try {
      const supabase = createClient();
      for (const p of createdProducts) {
        await supabase.from("products").insert({
          sku: p.sku,
          name: p.name,
          category: p.category,
          uom: p.uom,
          min_reorder_level: p.min_reorder_level,
          unit_cost: p.unit_cost,
          selling_price: p.selling_price,
        });
      }
    } catch (err) {
      console.error("Error saving products to Supabase:", err);
    }

    setNewItems([
      {
        id: "item-1",
        name: "",
        variant_scent: "Standard / Unscented",
        sku: "",
        category: "finished_chemical",
        uom: "Drum (200L)",
        unit_cost: 0,
        selling_price: 0,
      },
    ]);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* STICKY TOP NAVIGATION BAR */}
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <Package className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Marketing & Product Catalog Master</h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Batch register SKUs, scent variants, unit costs, and selling prices</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-500 text-slate-950 font-extrabold text-sm shadow-md shadow-yellow-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 text-slate-950" />
            <span>Add Products to Catalog</span>
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["ALL", "raw_material", "finished_chemical", "packaging", "pest_control_supply"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-700 text-white border-2 border-amber-400 shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-blue-50 border border-slate-200"
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
            <div key={p.id} className="p-5 rounded-2xl bg-white border-2 border-slate-200 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-extrabold text-blue-700">{p.sku}</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 uppercase">
                  {p.category.replace("_", " ")}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">{p.name}</h3>
              <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-500 block font-bold">UOM</span>
                  <span className="font-mono font-bold text-slate-800">{p.uom}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-bold">Unit Cost</span>
                  <span className="font-mono font-bold text-slate-800">₱{p.unit_cost?.toFixed(2) || "0.00"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block font-bold">Selling Price</span>
                  <span className="font-mono font-extrabold text-blue-700">₱{p.selling_price?.toFixed(2) || "0.00"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP DATA TABLE */}
        <div className="hidden lg:block p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-extrabold">
                <th className="py-3 px-3">SKU Code</th>
                <th className="py-3 px-3">Product Name & Variant</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">UOM</th>
                <th className="py-3 px-3">Unit Cost (₱)</th>
                <th className="py-3 px-3">Selling Price (₱)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-extrabold text-blue-700">{p.sku}</td>
                  <td className="py-3.5 px-3 font-extrabold text-slate-900">{p.name}</td>
                  <td className="py-3.5 px-3 uppercase text-xs font-extrabold text-slate-500">{p.category.replace("_", " ")}</td>
                  <td className="py-3.5 px-3 font-mono font-semibold">{p.uom}</td>
                  <td className="py-3.5 px-3 font-mono font-semibold">₱{p.unit_cost?.toFixed(2) || "0.00"}</td>
                  <td className="py-3.5 px-3 font-mono font-extrabold text-blue-800">₱{p.selling_price?.toFixed(2) || "0.00"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BATCH MULTI-PRODUCT CREATION MODAL - LIGHT MODE */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white border-2 border-blue-600 rounded-2xl w-full max-w-3xl p-5 sm:p-6 space-y-5 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-700" />
                  <span>Add Products to Catalog (Scent Variants & Explicit Pricing)</span>
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveAllProducts} className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">
                    Product Items ({newItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddMoreProductItem}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 border border-amber-500 text-slate-950 hover:bg-amber-300 text-xs font-extrabold transition-all"
                  >
                    <Plus className="w-4 h-4 text-slate-950" />
                    <span>+ Add More Items</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {newItems.map((item, index) => (
                    <div key={item.id} className="p-4 rounded-xl bg-slate-50 border-2 border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-600">Product #{index + 1}</span>
                        {newItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveProductItem(item.id)}
                            className="text-rose-600 hover:text-rose-700 p-1 font-bold"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-slate-800 font-extrabold block">SKU Code</label>
                            <button
                              type="button"
                              onClick={() => handleUpdateItem(item.id, "sku", generateSkuFromName(item.name, item.category, item.variant_scent))}
                              className="text-[10px] text-blue-700 hover:underline font-extrabold flex items-center gap-1"
                            >
                              <Wand2 className="w-3 h-3" /> Auto
                            </button>
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="FG-DEGR-LEM-500"
                            value={item.sku}
                            onChange={(e) => handleUpdateItem(item.id, "sku", e.target.value)}
                            className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-mono font-extrabold text-blue-700 focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="text-slate-800 font-extrabold block mb-1">Category</label>
                          <select
                            value={item.category}
                            onChange={(e) => handleUpdateItem(item.id, "category", e.target.value as Product["category"])}
                            className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                          >
                            <option value="finished_chemical">Finished Chemical</option>
                            <option value="raw_material">Raw Material</option>
                            <option value="packaging">Packaging</option>
                            <option value="pest_control_supply">Pest Control Supply</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-slate-800 font-extrabold block mb-1">Product Description / Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Heavy Duty Industrial Degreaser"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                            className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="text-slate-800 font-extrabold block mb-1">Variant / Scent (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Lemon Fresh, Lavender, Unscented..."
                            value={item.variant_scent}
                            onChange={(e) => handleUpdateItem(item.id, "variant_scent", e.target.value)}
                            className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-blue-700 font-semibold focus:border-blue-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-slate-800 font-extrabold block mb-1">UOM</label>
                          <input
                            type="text"
                            required
                            placeholder="Drum (200L), Pail (20L)..."
                            value={item.uom}
                            onChange={(e) => handleUpdateItem(item.id, "uom", e.target.value)}
                            className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-mono text-slate-900 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="text-slate-800 font-extrabold block mb-1">Unit Cost (₱)</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={item.unit_cost}
                            onChange={(e) => handleUpdateItem(item.id, "unit_cost", Number(e.target.value))}
                            className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-mono font-extrabold text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-slate-800 font-extrabold block mb-1">Full Selling Price (₱)</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={item.selling_price}
                            onChange={(e) => handleUpdateItem(item.id, "selling_price", Number(e.target.value))}
                            className="w-full p-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-mono font-extrabold text-blue-700"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleAddMoreProductItem}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 border border-amber-500 text-slate-950 hover:bg-amber-300 text-xs font-extrabold"
                  >
                    <Plus className="w-4 h-4 text-slate-950" />
                    <span>+ Add More Items</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-extrabold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-extrabold shadow-md ring-2 ring-amber-400"
                    >
                      Save All Products to Catalog
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
