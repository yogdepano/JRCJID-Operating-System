"use client";

import React, { useState, useEffect } from "react";
import { FlaskConical, Plus, Search, Scale, Factory, Trash2, Package } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TopNavbar } from "@/components/Navigation/TopNavbar";

interface IngredientItem {
  raw_material_sku: string;
  name: string;
  ratio_qty: number;
  uom: string;
}

interface BoMRecipe {
  id: string;
  finished_product_sku: string;
  finished_product_name: string;
  batch_yield_qty: number;
  batch_yield_uom: string;
  version: string;
  ingredients: IngredientItem[];
}

const LOCAL_STORAGE_RECIPES_KEY = "jrc_recipes_cache_v1";
const LOCAL_STORAGE_PRODUCTS_KEY = "jrc_products_cache_v1";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<BoMRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<BoMRecipe | null>(null);
  const [targetBatchQty, setTargetBatchQty] = useState<number>(1000);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // FORM STATE FOR NEW RECIPE CREATION
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProductSku, setSelectedProductSku] = useState("");
  const [batchYieldQty, setBatchYieldQty] = useState<number>(500);
  const [batchYieldUom, setBatchYieldUom] = useState("L (Liters)");
  const [recipeVersion, setRecipeVersion] = useState("v1.0");

  const [formIngredients, setFormIngredients] = useState<IngredientItem[]>([]);

  // Load recipes and product list
  const loadData = async () => {
    // Load products for dropdown
    try {
      const storedProds = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
      if (storedProds) {
        const parsed = JSON.parse(storedProds);
        setAvailableProducts(parsed);
        if (parsed.length > 0 && !selectedProductSku) {
          setSelectedProductSku(parsed[0].sku);
        }
      }
    } catch (e) {
      console.error("Products cache error:", e);
    }

    // Load recipes
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_RECIPES_KEY);
      if (stored) {
        const parsed: BoMRecipe[] = JSON.parse(stored);
        setRecipes(parsed);
        if (parsed.length > 0) {
          setSelectedRecipe(parsed[0]);
          setTargetBatchQty(parsed[0].batch_yield_qty * 2);
        }
      }
    } catch (e) {
      console.error("Recipes cache error:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddIngredient = () => {
    const defaultSku = availableProducts[0]?.sku || "RM-001";
    const defaultName = availableProducts[0]?.name || "Raw Chemical Ingredient";
    setFormIngredients([
      ...formIngredients,
      { raw_material_sku: defaultSku, name: defaultName, ratio_qty: 10, uom: "KG" },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setFormIngredients(formIngredients.filter((_, i) => i !== index));
  };

  const handleUpdateIngredient = (index: number, field: keyof IngredientItem, value: any) => {
    setFormIngredients(
      formIngredients.map((ing, i) => {
        if (i === index) {
          const updated = { ...ing, [field]: value };
          if (field === "raw_material_sku") {
            const p = availableProducts.find((item) => item.sku === value);
            if (p) {
              updated.name = p.name;
              updated.uom = p.uom || "KG";
            }
          }
          return updated;
        }
        return ing;
      })
    );
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = availableProducts.find((p) => p.sku === selectedProductSku);
    const newRec: BoMRecipe = {
      id: `bom-${Date.now()}`,
      finished_product_sku: selectedProductSku || "FG-001",
      finished_product_name: prod ? prod.name : "Finished Chemical Product",
      batch_yield_qty: batchYieldQty,
      batch_yield_uom: batchYieldUom,
      version: recipeVersion || "v1.0",
      ingredients: formIngredients,
    };

    const updated = [newRec, ...recipes];
    setRecipes(updated);
    setSelectedRecipe(newRec);
    setTargetBatchQty(newRec.batch_yield_qty * 2);
    try {
      localStorage.setItem(LOCAL_STORAGE_RECIPES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Local storage recipe write error:", err);
    }
    setIsModalOpen(false);
    setFormIngredients([]);
  };

  const scalingMultiplier = selectedRecipe ? targetBatchQty / (selectedRecipe.batch_yield_qty || 1) : 1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* STICKY TOP NAVIGATION BAR */}
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* HEADER - LIGHT MODE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <FlaskConical className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">Production Department (BoM Formulas)</h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">Link raw chemical ingredients, scents, and batch scaling for finished products</p>
            </div>
          </div>

          <button
            onClick={() => {
              loadData();
              if (formIngredients.length === 0) {
                handleAddIngredient();
              }
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-500 text-slate-950 font-extrabold text-sm shadow-md shadow-yellow-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 text-slate-950" />
            <span>+ Build Product Recipe / Formula</span>
          </button>
        </div>

        {/* WORKSPACE GRID */}
        {recipes.length === 0 ? (
          <div className="p-12 text-center bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-sm">
            <FlaskConical className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900">No Product Formulas Added Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Click "+ Build Product Recipe / Formula" to register your chemical raw materials, scent additives, and standard batch yield ratios.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* RECIPE MASTER LIST */}
            <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">Product Formula Master ({recipes.length})</h3>
              <div className="space-y-2">
                {recipes.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRecipe(r);
                      setTargetBatchQty(r.batch_yield_qty * 2);
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedRecipe?.id === r.id
                        ? "bg-blue-50 border-blue-600 shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-blue-700">{r.finished_product_sku}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-200 text-slate-800">{r.version}</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 mt-1">{r.finished_product_name}</h4>
                    <p className="text-xs text-slate-600 font-medium mt-1">Standard Batch: {r.batch_yield_qty} {r.batch_yield_uom} ({r.ingredients.length} ingredients)</p>
                  </button>
                ))}
              </div>
            </div>

            {/* SCALED INGREDIENTS DETAILED DISPLAY */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm space-y-5">
              {selectedRecipe ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-100 pb-4">
                    <div>
                      <span className="font-mono text-xs font-extrabold text-blue-700">{selectedRecipe.finished_product_sku}</span>
                      <h3 className="text-lg font-extrabold text-slate-900">{selectedRecipe.finished_product_name}</h3>
                      <p className="text-xs text-slate-500 font-medium">Standard Formula Base: {selectedRecipe.batch_yield_qty} {selectedRecipe.batch_yield_uom}</p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border-2 border-slate-200">
                      <Scale className="w-4 h-4 text-amber-500 shrink-0" />
                      <label className="text-xs font-extrabold text-slate-700 whitespace-nowrap">Scale Production Batch:</label>
                      <input
                        type="number"
                        value={targetBatchQty}
                        onChange={(e) => setTargetBatchQty(Number(e.target.value))}
                        className="w-24 p-1.5 bg-white border-2 border-slate-300 rounded-lg text-xs font-mono font-extrabold text-slate-900 text-right focus:border-blue-600"
                      />
                      <span className="text-xs font-mono font-bold text-slate-700">{selectedRecipe.batch_yield_uom}</span>
                    </div>
                  </div>

                  {/* INGREDIENT RATIOS TABLE */}
                  <div className="space-y-3">
                    <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider block">
                      Scaled Chemical Consumption ({scalingMultiplier.toFixed(2)}x Multiplier)
                    </span>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b-2 border-slate-200 text-xs text-slate-500 uppercase tracking-wider font-extrabold">
                            <th className="py-2.5 px-3">Raw Material SKU</th>
                            <th className="py-2.5 px-3">Ingredient Name</th>
                            <th className="py-2.5 px-3">Standard Ratio</th>
                            <th className="py-2.5 px-3">Scaled Requirement ({targetBatchQty} Batch)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                          {selectedRecipe.ingredients.map((ing, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                              <td className="py-3 px-3 font-mono font-extrabold text-blue-700">{ing.raw_material_sku}</td>
                              <td className="py-3 px-3 font-extrabold text-slate-900">{ing.name}</td>
                              <td className="py-3 px-3 font-mono font-semibold text-slate-700">{ing.ratio_qty} {ing.uom}</td>
                              <td className="py-3 px-3 font-mono font-extrabold text-blue-900">
                                {(ing.ratio_qty * scalingMultiplier).toFixed(2)} {ing.uom}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-400">Select a formula to view scaled ingredients</div>
              )}
            </div>
          </div>
        )}

        {/* CREATE RECIPE MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white border-2 border-blue-600 rounded-2xl w-full max-w-2xl p-5 sm:p-6 space-y-5 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-blue-700" />
                  <span>Build Chemical BoM Recipe / Formula</span>
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveRecipe} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-800 font-extrabold block mb-1">Finished Product SKU</label>
                    {availableProducts.length > 0 ? (
                      <select
                        value={selectedProductSku}
                        onChange={(e) => setSelectedProductSku(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold"
                      >
                        {availableProducts.map((p) => (
                          <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        placeholder="e.g. FG-DEGR-500"
                        value={selectedProductSku}
                        onChange={(e) => setSelectedProductSku(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 font-bold"
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-800 font-extrabold block mb-1">Base Yield Qty</label>
                      <input
                        type="number"
                        required
                        value={batchYieldQty}
                        onChange={(e) => setBatchYieldQty(Number(e.target.value))}
                        className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-slate-800 font-extrabold block mb-1">Yield UOM</label>
                      <input
                        type="text"
                        required
                        value={batchYieldUom}
                        onChange={(e) => setBatchYieldUom(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* INGREDIENTS BUILDER */}
                <div className="border-t-2 border-b-2 border-slate-100 py-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">Raw Chemical Ingredients</span>
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="px-3 py-1 rounded bg-amber-400 text-slate-950 font-extrabold text-xs"
                    >
                      + Add Ingredient
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {formIngredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <input
                          type="text"
                          placeholder="Raw Material SKU"
                          value={ing.raw_material_sku}
                          onChange={(e) => handleUpdateIngredient(idx, "raw_material_sku", e.target.value)}
                          className="w-1/3 p-2 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Ingredient Name"
                          value={ing.name}
                          onChange={(e) => handleUpdateIngredient(idx, "name", e.target.value)}
                          className="w-1/3 p-2 bg-white border border-slate-300 rounded text-xs font-bold"
                        />
                        <input
                          type="number"
                          placeholder="Ratio"
                          value={ing.ratio_qty}
                          onChange={(e) => handleUpdateIngredient(idx, "ratio_qty", Number(e.target.value))}
                          className="w-1/6 p-2 bg-white border border-slate-300 rounded text-xs font-mono font-bold"
                        />
                        <input
                          type="text"
                          placeholder="UOM"
                          value={ing.uom}
                          onChange={(e) => handleUpdateIngredient(idx, "uom", e.target.value)}
                          className="w-1/6 p-2 bg-white border border-slate-300 rounded text-xs font-mono"
                        />
                        {formIngredients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(idx)}
                            className="text-rose-600 font-bold px-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-extrabold text-xs ring-2 ring-amber-400"
                  >
                    Save BoM Recipe
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
