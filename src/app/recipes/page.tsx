"use client";

import React, { useState, useEffect } from "react";
import { FlaskConical, Plus, ArrowLeft, Search, Calculator, CheckCircle2, Factory, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface RecipeIngredient {
  id: string;
  raw_material_sku: string;
  raw_material_name: string;
  quantity_required: number;
  uom: string;
  is_scent_additive: boolean;
  scent_variant_name?: string;
}

interface ProductRecipe {
  id: string;
  product_sku: string;
  product_name: string;
  standard_batch_size: number;
  standard_uom: string;
  version: string;
  ingredients: RecipeIngredient[];
}

const SAMPLE_RAW_MATERIALS = [
  { sku: "RM-CHEM-001", name: "Sodium Hydroxide Caustic Soda Flakes", uom: "KG" },
  { sku: "RM-CHEM-002", name: "Linear Alkylbenzene Sulfonic Acid (LABSA)", uom: "KG" },
  { sku: "RM-CHEM-003", name: "Sodium Lauryl Ether Sulfate (SLES)", uom: "KG" },
  { sku: "RM-CHEM-004", name: "Deionized Water", uom: "L" },
  { sku: "RM-SCENT-101", name: "Lemon Fragrance Essential Oil", uom: "KG" },
  { sku: "RM-SCENT-102", name: "Pine Essential Oil Concentrate", uom: "KG" },
  { sku: "RM-SCENT-103", name: "Lavender Essential Oil", uom: "KG" },
];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<ProductRecipe[]>([
    {
      id: "rec-1",
      product_sku: "FG-CHEM-500",
      product_name: "JRC Heavy Duty Industrial Degreaser",
      standard_batch_size: 500,
      standard_uom: "L (Liters)",
      version: "v2.1",
      ingredients: [
        { id: "i1", raw_material_sku: "RM-CHEM-002", raw_material_name: "LABSA 96%", quantity_required: 45.0, uom: "KG", is_scent_additive: false },
        { id: "i2", raw_material_sku: "RM-CHEM-001", raw_material_name: "Sodium Hydroxide Caustic Soda Flakes", quantity_required: 18.5, uom: "KG", is_scent_additive: false },
        { id: "i3", raw_material_sku: "RM-CHEM-004", raw_material_name: "Deionized Water", quantity_required: 436.5, uom: "L", is_scent_additive: false },
        { id: "i4", raw_material_sku: "RM-SCENT-101", raw_material_name: "Lemon Fragrance Essential Oil", quantity_required: 2.5, uom: "KG", is_scent_additive: true, scent_variant_name: "Lemon Fresh" },
      ],
    },
  ]);

  const [selectedRecipe, setSelectedRecipe] = useState<ProductRecipe>(recipes[0]);
  const [targetBatchSize, setTargetBatchSize] = useState<number>(1000);
  const [selectedScent, setSelectedScent] = useState<string>("Lemon Fresh");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Recipe Form State
  const [newProductSku, setNewProductSku] = useState("FG-CHEM-501");
  const [newProductName, setNewProductName] = useState("JRC Commercial Disinfectant");
  const [newBatchSize, setNewBatchSize] = useState(500);
  const [newBatchUom, setNewBatchUom] = useState("L (Liters)");

  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([
    { id: "ri-1", raw_material_sku: "RM-CHEM-003", raw_material_name: "SLES 70%", quantity_required: 30, uom: "KG", is_scent_additive: false },
    { id: "ri-2", raw_material_sku: "RM-SCENT-103", raw_material_name: "Lavender Essential Oil", quantity_required: 1.5, uom: "KG", is_scent_additive: true, scent_variant_name: "Lavender Floral" },
  ]);

  const handleAddIngredientRow = () => {
    const defaultRm = SAMPLE_RAW_MATERIALS[0];
    const newIng: RecipeIngredient = {
      id: `ri-${Date.now()}`,
      raw_material_sku: defaultRm.sku,
      raw_material_name: defaultRm.name,
      quantity_required: 5,
      uom: defaultRm.uom,
      is_scent_additive: false,
    };
    setRecipeIngredients([...recipeIngredients, newIng]);
  };

  const handleRemoveIngredientRow = (id: string) => {
    setRecipeIngredients(recipeIngredients.filter((i) => i.id !== id));
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ProductRecipe = {
      id: `rec-${Date.now()}`,
      product_sku: newProductSku,
      product_name: newProductName,
      standard_batch_size: newBatchSize,
      standard_uom: newBatchUom,
      version: "v1.0",
      ingredients: recipeIngredients,
    };

    setRecipes([created, ...recipes]);
    setSelectedRecipe(created);
    setIsModalOpen(false);
  };

  const scaleFactor = targetBatchSize / (selectedRecipe.standard_batch_size || 1);

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
              <FlaskConical className="w-6 h-6 text-amber-400" />
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">Bill of Materials (BoM) & Chemical Formula Builder</h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">Link raw chemical ingredients, scents, and UOM conversions to finished product formulas</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-yellow-500/20 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Build Product Recipe / Formula</span>
        </button>
      </div>

      {/* WORKSPACE GRID: RECIPE SELECTION & BATCH CALCULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: RECIPE SELECTOR */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider">Product Formula Master</h2>
          <div className="space-y-3">
            {recipes.map((rec) => (
              <button
                key={rec.id}
                onClick={() => setSelectedRecipe(rec)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedRecipe.id === rec.id
                    ? "bg-[#0b132b] border-amber-400 shadow-lg shadow-yellow-500/10"
                    : "bg-[#0b132b]/60 border-[#1c2541] hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-extrabold text-amber-400">{rec.product_sku}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#131c35] text-slate-300">{rec.version}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{rec.product_name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Standard Batch: <span className="font-mono font-bold text-slate-200">{rec.standard_batch_size} {rec.standard_uom}</span> ({rec.ingredients.length} ingredients)
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: BATCH SCALER & INGREDIENT BREAKDOWN */}
        <div className="lg:col-span-2 space-y-5 bg-[#0b132b] p-5 sm:p-6 rounded-2xl border border-[#1c2541] shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c2541] pb-4">
            <div>
              <span className="font-mono text-xs font-bold text-amber-400">{selectedRecipe.product_sku}</span>
              <h2 className="text-lg font-extrabold text-white">{selectedRecipe.product_name}</h2>
              <p className="text-xs text-slate-400">Standard Formula Base: {selectedRecipe.standard_batch_size} {selectedRecipe.standard_uom}</p>
            </div>

            {/* BATCH PRODUCTION SCALER */}
            <div className="bg-[#131c35] p-3 rounded-xl border border-[#1c2541] flex items-center gap-3">
              <Calculator className="w-5 h-5 text-amber-400" />
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Scale Production Batch</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="50"
                    value={targetBatchSize}
                    onChange={(e) => setTargetBatchSize(Number(e.target.value))}
                    className="w-24 px-2 py-1 bg-[#0b132b] border border-[#1c2541] rounded-lg text-xs font-mono font-extrabold text-white text-center"
                  />
                  <span className="text-xs font-mono text-slate-300">{selectedRecipe.standard_uom}</span>
                </div>
              </div>
            </div>
          </div>

          {/* INGREDIENT RATIOS & SCENT ADDITIVES TABLE */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Factory className="w-4 h-4" />
              <span>Scaled Chemical Consumption ({scaleFactor.toFixed(2)}x Multiplier)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1c2541] text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Raw Material SKU</th>
                    <th className="py-2.5 px-3">Ingredient Name</th>
                    <th className="py-2.5 px-3">Standard Ratio</th>
                    <th className="py-2.5 px-3 font-extrabold text-amber-400">Scaled Requirement ({targetBatchSize}L Batch)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1c2541] text-slate-200">
                  {selectedRecipe.ingredients.map((ing) => {
                    const scaledQty = ing.quantity_required * scaleFactor;
                    return (
                      <tr key={ing.id} className="hover:bg-[#131c35]/50">
                        <td className="py-3 px-3 font-mono font-bold text-amber-400">{ing.raw_material_sku}</td>
                        <td className="py-3 px-3 font-semibold text-white">
                          {ing.raw_material_name}
                          {ing.is_scent_additive && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-400/20 text-amber-400 border border-amber-400/40">
                              Scent Additive ({ing.scent_variant_name})
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">
                          {ing.quantity_required} {ing.uom}
                        </td>
                        <td className="py-3 px-3 font-mono font-extrabold text-white bg-amber-400/5">
                          {scaledQty.toFixed(2)} {ing.uom}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE RECIPE FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0b132b] border border-[#1c2541] rounded-2xl w-full max-w-2xl p-5 sm:p-6 space-y-4 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-[#1c2541] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-amber-400" />
                <span>Build New Bill of Materials (BoM) Recipe</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-200 font-bold block mb-1">Finished Product SKU</label>
                  <input
                    type="text"
                    required
                    value={newProductSku}
                    onChange={(e) => setNewProductSku(e.target.value)}
                    className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-xs font-mono font-bold text-amber-400"
                  />
                </div>

                <div>
                  <label className="text-slate-200 font-bold block mb-1">Standard Batch Yield</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      value={newBatchSize}
                      onChange={(e) => setNewBatchSize(Number(e.target.value))}
                      className="w-1/2 p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-xs font-mono font-bold text-white"
                    />
                    <select
                      value={newBatchUom}
                      onChange={(e) => setNewBatchUom(e.target.value)}
                      className="w-1/2 p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-xs text-slate-100 font-semibold"
                    >
                      <option value="L (Liters)">L (Liters)</option>
                      <option value="KG (Kilograms)">KG (Kilograms)</option>
                      <option value="Drums (200L)">Drums (200L)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-200 font-bold block mb-1">Product Formula Name</label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full p-2.5 bg-[#131c35] border border-[#1c2541] rounded-xl text-xs text-slate-100 font-semibold"
                />
              </div>

              {/* INGREDIENT LIST FORM BUILDER */}
              <div className="border-t border-b border-[#1c2541] py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                    Raw Chemical Ingredients ({recipeIngredients.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Ingredient</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {recipeIngredients.map((ing) => (
                    <div key={ing.id} className="p-3 rounded-xl bg-[#131c35] border border-[#1c2541] flex flex-col sm:flex-row items-center gap-2 text-xs">
                      <select
                        value={ing.raw_material_sku}
                        onChange={(e) => {
                          const rm = SAMPLE_RAW_MATERIALS.find((r) => r.sku === e.target.value);
                          if (rm) {
                            setRecipeIngredients(
                              recipeIngredients.map((item) =>
                                item.id === ing.id
                                  ? { ...item, raw_material_sku: rm.sku, raw_material_name: rm.name, uom: rm.uom }
                                  : item
                              )
                            );
                          }
                        }}
                        className="w-full sm:w-1/2 p-2 bg-[#0b132b] border border-[#1c2541] rounded-lg text-slate-100"
                      >
                        {SAMPLE_RAW_MATERIALS.map((rm) => (
                          <option key={rm.sku} value={rm.sku}>{rm.name} ({rm.sku})</option>
                        ))}
                      </select>

                      <div className="flex items-center gap-2 w-full sm:w-1/2">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Qty"
                          value={ing.quantity_required}
                          onChange={(e) => {
                            setRecipeIngredients(
                              recipeIngredients.map((item) =>
                                item.id === ing.id ? { ...item, quantity_required: Number(e.target.value) } : item
                              )
                            );
                          }}
                          className="w-20 p-2 bg-[#0b132b] border border-[#1c2541] rounded-lg text-slate-100 font-mono font-bold"
                        />
                        <span className="text-xs font-mono text-amber-400 font-bold">{ing.uom}</span>

                        <button
                          type="button"
                          onClick={() => handleRemoveIngredientRow(ing.id)}
                          className="text-rose-400 p-1.5 ml-auto hover:text-rose-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
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
                  Save Chemical Formula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
