"use client";

import React, { useState } from "react";
import { FlaskConical, Plus, Search, Scale, Factory, ArrowRight } from "lucide-react";
import Link from "next/link";
import { TopNavbar } from "@/components/Navigation/TopNavbar";

interface IngredientItem {
  raw_material_sku: string;
  name: string;
  ratio_qty: number;
  uom: string;
  is_scent?: boolean;
  scent_name?: string;
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

const INITIAL_RECIPES: BoMRecipe[] = [
  {
    id: "bom-1",
    finished_product_sku: "FG-CHEM-500",
    finished_product_name: "JRC Heavy Duty Industrial Degreaser",
    batch_yield_qty: 500,
    batch_yield_uom: "L (Liters)",
    version: "v2.1",
    ingredients: [
      { raw_material_sku: "RM-CHEM-002", name: "LABSA 96%", ratio_qty: 45, uom: "KG" },
      { raw_material_sku: "RM-CHEM-001", name: "Sodium Hydroxide Caustic Soda Flakes", ratio_qty: 18.5, uom: "KG" },
      { raw_material_sku: "RM-CHEM-004", name: "Deionized Water", ratio_qty: 436.5, uom: "L" },
      { raw_material_sku: "RM-SCENT-101", name: "Lemon Fragrance Essential Oil", ratio_qty: 2.5, uom: "KG", is_scent: true, scent_name: "Lemon Fresh" },
    ],
  },
];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<BoMRecipe[]>(INITIAL_RECIPES);
  const [selectedRecipe, setSelectedRecipe] = useState<BoMRecipe>(INITIAL_RECIPES[0]);
  const [targetBatchQty, setTargetBatchQty] = useState<number>(1000);

  const scalingMultiplier = selectedRecipe ? targetBatchQty / selectedRecipe.batch_yield_qty : 1;

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

          <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-500 text-slate-950 font-extrabold text-sm shadow-md shadow-yellow-500/20 active:scale-95 transition-all">
            <Plus className="w-5 h-5 text-slate-950" />
            <span>+ Build Product Recipe / Formula</span>
          </button>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* RECIPE MASTER LIST */}
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">Product Formula Master</h3>
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
                          <th className="py-2.5 px-3">Scaled Requirement ({targetBatchQty}L Batch)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                        {selectedRecipe.ingredients.map((ing) => (
                          <tr key={ing.raw_material_sku} className="hover:bg-blue-50/50 transition-colors">
                            <td className="py-3 px-3 font-mono font-extrabold text-blue-700">{ing.raw_material_sku}</td>
                            <td className="py-3 px-3 font-extrabold text-slate-900 flex items-center gap-2">
                              <span>{ing.name}</span>
                              {ing.is_scent && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                                  Scent Additive ({ing.scent_name})
                                </span>
                              )}
                            </td>
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
      </main>
    </div>
  );
}
