"use client";

import React, { useState } from "react";
import { FlaskConical, Plus, ArrowLeft, CheckCircle2, AlertTriangle, Calculator, Layers } from "lucide-react";
import Link from "next/link";

interface Ingredient {
  raw_material_name: string;
  sku: string;
  qty_per_batch: number;
  uom: string;
  current_stock: number;
}

interface Recipe {
  id: string;
  product_name: string;
  version: string;
  standard_batch_size: number;
  uom: string;
  ingredients: Ingredient[];
}

const mockRecipes: Recipe[] = [
  {
    id: "r1",
    product_name: "JRC Heavy Duty Industrial Degreaser",
    version: "v1.2",
    standard_batch_size: 500,
    uom: "L",
    ingredients: [
      { raw_material_name: "Sodium Hydroxide (Caustic Soda Flakes)", sku: "RM-CHEM-001", qty_per_batch: 80, uom: "KG", current_stock: 450 },
      { raw_material_name: "Linear Alkylbenzene Sulfonic Acid (LABSA)", sku: "RM-CHEM-002", qty_per_batch: 60, uom: "KG", current_stock: 120 },
      { raw_material_name: "Surfactant A-40 Emulsifier", sku: "RM-CHEM-003", qty_per_batch: 25, uom: "KG", current_stock: 10 }, // INSUFFICIENT
      { raw_material_name: "Deionized Water Base", sku: "RM-CHEM-000", qty_per_batch: 335, uom: "L", current_stock: 5000 },
    ],
  },
  {
    id: "r2",
    product_name: "JRC Commercial Hand Sanitizer & Disinfectant",
    version: "v2.0",
    standard_batch_size: 1000,
    uom: "L",
    ingredients: [
      { raw_material_name: "Isopropanol Ethyl Alcohol 99%", sku: "RM-CHEM-010", qty_per_batch: 700, uom: "L", current_stock: 2500 },
      { raw_material_name: "Hydrogen Peroxide 3%", sku: "RM-CHEM-011", qty_per_batch: 40, uom: "L", current_stock: 200 },
      { raw_material_name: "Glycerol 98% Pure", sku: "RM-CHEM-012", qty_per_batch: 15, uom: "L", current_stock: 90 },
      { raw_material_name: "Purified Water Base", sku: "RM-CHEM-000", qty_per_batch: 245, uom: "L", current_stock: 5000 },
    ],
  },
];

export default function RecipesPage() {
  const [recipes] = useState<Recipe[]>(mockRecipes);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(mockRecipes[0]);
  const [targetBatchSize, setTargetBatchSize] = useState<number>(500);

  const multiplier = targetBatchSize / (selectedRecipe.standard_batch_size || 1);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-6 space-y-6 font-sans">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-purple-400" />
              <h1 className="text-xl font-bold tracking-tight text-white">Recipe & Bill of Materials (BoM)</h1>
            </div>
            <p className="text-xs text-slate-400">Formulation ratios, batch scaling calculator, and raw material availability</p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-500/20">
          <Plus className="w-4 h-4" />
          <span>New Chemical Formula</span>
        </button>
      </div>

      {/* TWO COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: RECIPE SELECTOR */}
        <div className="p-4 rounded-xl bg-[#0f172a]/60 border border-slate-800 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Chemical Formulas</h2>
          <div className="space-y-2">
            {recipes.map((rec) => {
              const isSelected = selectedRecipe.id === rec.id;
              return (
                <button
                  key={rec.id}
                  onClick={() => {
                    setSelectedRecipe(rec);
                    setTargetBatchSize(rec.standard_batch_size);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-purple-500/10 border-purple-500/50 text-white shadow-md shadow-purple-500/10"
                      : "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{rec.product_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 font-semibold">
                      {rec.version}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Standard Batch: <span className="text-slate-200 font-semibold">{rec.standard_batch_size} {rec.uom}</span>
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: BATCH SCALER & INGREDIENTS BREAKDOWN */}
        <div className="lg:col-span-2 space-y-6">
          {/* BATCH SCALER CALCULATOR CARD */}
          <div className="p-5 rounded-xl bg-[#0f172a]/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-purple-400" />
                  <span>Batch Production Calculator</span>
                </h3>
                <p className="text-xs text-slate-400">Adjust target yield to scale raw chemical requirements automatically</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Formula {selectedRecipe.version}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Target Production Volume ({selectedRecipe.uom})</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={targetBatchSize}
                  onChange={(e) => setTargetBatchSize(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl font-mono text-sm font-bold text-sky-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[10px]">Scaling Factor Ratio</span>
                <span className="text-lg font-bold font-mono text-purple-400">{multiplier.toFixed(2)}x</span>
                <span className="text-slate-500 block text-[10px]">Standard base is {selectedRecipe.standard_batch_size} {selectedRecipe.uom}</span>
              </div>
            </div>
          </div>

          {/* INGREDIENTS TABLE */}
          <div className="p-5 rounded-xl bg-[#0f172a]/60 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Bill of Materials (Required Ingredients)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Raw Material SKU</th>
                    <th className="py-2.5 px-3">Chemical Description</th>
                    <th className="py-2.5 px-3">Required Qty</th>
                    <th className="py-2.5 px-3">In-Stock Balance</th>
                    <th className="py-2.5 px-3 text-right">Feasibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                  {selectedRecipe.ingredients.map((ing, idx) => {
                    const scaledQty = ing.qty_per_batch * multiplier;
                    const hasStock = ing.current_stock >= scaledQty;

                    return (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-medium text-sky-400">{ing.sku}</td>
                        <td className="py-3 px-3 font-semibold text-slate-100">{ing.raw_material_name}</td>
                        <td className="py-3 px-3 font-mono font-bold text-purple-300">
                          {scaledQty.toFixed(2)} {ing.uom}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {ing.current_stock.toLocaleString()} {ing.uom}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {hasStock ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> AVAILABLE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3" /> SHORTAGE ({ (scaledQty - ing.current_stock).toFixed(1) } {ing.uom})
                            </span>
                          )}
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
    </div>
  );
}
