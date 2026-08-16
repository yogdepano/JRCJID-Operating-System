"use client";

import React, { useState } from "react";
import { Plus, Trash2, Wand2, ChevronDown, Check } from "lucide-react";
import { ComboboxInput } from "@/components/ui/ComboboxInput";

export interface FormulaIngredientItem {
  id?: string;
  raw_material_sku?: string;
  name: string;
  ratio_qty: number;
  uom: string;
}

export interface SizeFormula {
  production_size: string;
  retail_price: number;
  ingredients: FormulaIngredientItem[];
}

export interface ProductFormData {
  id?: string;
  code: string;
  product_name: string;
  product_type: string;
  product_class: string;
  final_product_name: string;
  active_size: string;
  size_formulas: Record<string, SizeFormula>;
}

export const SUPPORTED_PRODUCTION_SIZES = [
  "1 DRUM",
  "1 PAIL",
  "1 GALLON",
  "1 LITER",
  "1 BOTTLE (1L)",
  "1 KG",
];

export const INGREDIENT_UNITS = [
  "Liters (L)",
  "Milliliters (ML)",
  "Kilograms (KG)",
  "Grams (G)",
  "Pcs",
];

export const COMMON_PRODUCT_TYPES = [
  "Wood Preservative",
  "Heavy Duty Degreaser",
  "Multi-Surface Sanitizer",
  "Industrial Detergent",
  "Acid Cleaner / Descaler",
  "Carpet & Fabric Shampoo",
  "Insecticide / Termiticide",
  "Disinfectant Concentrate",
  "Hand Soap & Sanitizer",
  "Bleach & Chlorine Solution",
];

interface ProductFormulaEditorProps {
  initialData?: Partial<ProductFormData>;
  availableRawMaterials?: Array<{ sku: string; name: string; uom?: string }>;
  onSave: (data: ProductFormData) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function ProductFormulaEditor({
  initialData,
  availableRawMaterials = [],
  onSave,
  onCancel,
  isSaving = false,
}: ProductFormulaEditorProps) {
  // 1. TOP PRODUCT INFO STATE
  const [code, setCode] = useState(initialData?.code || "JRC-1012");
  const [productName, setProductName] = useState(initialData?.product_name || "TERMITEX");
  const [productType, setProductType] = useState(initialData?.product_type || "Wood Preservative");
  const [productClass, setProductClass] = useState(initialData?.product_class || "Finished Product");

  // 2. ACTIVE PRODUCTION SIZE
  const [activeSize, setActiveSize] = useState<string>(
    initialData?.active_size || SUPPORTED_PRODUCTION_SIZES[0]
  );

  // 3. MULTIPLE FORMULA SIZES MAP
  const [sizeFormulas, setSizeFormulas] = useState<Record<string, SizeFormula>>(() => {
    if (initialData?.size_formulas && Object.keys(initialData.size_formulas).length > 0) {
      return initialData.size_formulas;
    }

    // Default template matching reference screenshot
    return {
      "1 DRUM": {
        production_size: "1 DRUM",
        retail_price: 18500,
        ingredients: [
          { name: "Dimethrin", ratio_qty: 2, uom: "Liters (L)", raw_material_sku: "RM-DIM-01" },
          { name: "Kerosene", ratio_qty: 18, uom: "Liters (L)", raw_material_sku: "RM-KER-01" },
          { name: "Isopropyl Alcohol", ratio_qty: 20, uom: "Liters (L)", raw_material_sku: "RM-IPA-01" },
          { name: "Scent", ratio_qty: 200, uom: "Milliliters (ML)", raw_material_sku: "RM-SCN-01" },
        ],
      },
      "1 PAIL": {
        production_size: "1 PAIL",
        retail_price: 2100,
        ingredients: [
          { name: "Dimethrin", ratio_qty: 0.2, uom: "Liters (L)", raw_material_sku: "RM-DIM-01" },
          { name: "Kerosene", ratio_qty: 1.8, uom: "Liters (L)", raw_material_sku: "RM-KER-01" },
          { name: "Isopropyl Alcohol", ratio_qty: 2.0, uom: "Liters (L)", raw_material_sku: "RM-IPA-01" },
          { name: "Scent", ratio_qty: 20, uom: "Milliliters (ML)", raw_material_sku: "RM-SCN-01" },
        ],
      },
      "1 LITER": {
        production_size: "1 LITER",
        retail_price: 150,
        ingredients: [
          { name: "Dimethrin", ratio_qty: 0.01, uom: "Liters (L)", raw_material_sku: "RM-DIM-01" },
          { name: "Kerosene", ratio_qty: 0.09, uom: "Liters (L)", raw_material_sku: "RM-KER-01" },
          { name: "Isopropyl Alcohol", ratio_qty: 0.10, uom: "Liters (L)", raw_material_sku: "RM-IPA-01" },
          { name: "Scent", ratio_qty: 1, uom: "Milliliters (ML)", raw_material_sku: "RM-SCN-01" },
        ],
      },
      "1 GALLON": {
        production_size: "1 GALLON",
        retail_price: 520,
        ingredients: [
          { name: "Dimethrin", ratio_qty: 0.04, uom: "Liters (L)", raw_material_sku: "RM-DIM-01" },
          { name: "Kerosene", ratio_qty: 0.36, uom: "Liters (L)", raw_material_sku: "RM-KER-01" },
          { name: "Isopropyl Alcohol", ratio_qty: 0.40, uom: "Liters (L)", raw_material_sku: "RM-IPA-01" },
          { name: "Scent", ratio_qty: 4, uom: "Milliliters (ML)", raw_material_sku: "RM-SCN-01" },
        ],
      },
      "1 BOTTLE (1L)": {
        production_size: "1 BOTTLE (1L)",
        retail_price: 150,
        ingredients: [
          { name: "Dimethrin", ratio_qty: 0.01, uom: "Liters (L)", raw_material_sku: "RM-DIM-01" },
          { name: "Kerosene", ratio_qty: 0.09, uom: "Liters (L)", raw_material_sku: "RM-KER-01" },
          { name: "Isopropyl Alcohol", ratio_qty: 0.10, uom: "Liters (L)", raw_material_sku: "RM-IPA-01" },
          { name: "Scent", ratio_qty: 1, uom: "Milliliters (ML)", raw_material_sku: "RM-SCN-01" },
        ],
      },
    };
  });

  // Current active formula & retail price
  const currentFormula: SizeFormula = sizeFormulas[activeSize] || {
    production_size: activeSize,
    retail_price: 0,
    ingredients: [],
  };

  // AUTO-GENERATED FINAL PRODUCT NAME: `CODE - PRODUCT NAME - TYPE`
  const computedFinalName = [code.trim(), productName.trim(), productType.trim()]
    .filter(Boolean)
    .join(" - ") || "JRC-1012 - TERMITEX - Wood Preservative";

  // Auto SKU generator helper
  const handleAutoGenerateCode = () => {
    if (!productName.trim()) {
      setCode(`JRC-${Math.floor(1000 + Math.random() * 9000)}`);
      return;
    }
    const cleanWords = productName.trim().split(/\s+/).filter(Boolean);
    const initials = cleanWords.map((w) => w[0]).join("").toUpperCase().slice(0, 4);
    const randNum = Math.floor(100 + Math.random() * 900);
    setCode(`JRC-${initials || "PROD"}-${randNum}`);
  };

  // Switch production size without losing other size data
  const handleSelectSize = (newSize: string) => {
    if (newSize === activeSize) return;

    if (!sizeFormulas[newSize]) {
      setSizeFormulas((prev) => ({
        ...prev,
        [newSize]: {
          production_size: newSize,
          retail_price: 0,
          ingredients: currentFormula.ingredients.map((ing) => ({ ...ing })),
        },
      }));
    }
    setActiveSize(newSize);
  };

  // Update retail price for current active size
  const handleUpdateRetailPrice = (price: number) => {
    setSizeFormulas((prev) => ({
      ...prev,
      [activeSize]: {
        ...(prev[activeSize] || { production_size: activeSize, ingredients: [] }),
        retail_price: price,
      },
    }));
  };

  // Ingredient list handlers for current active size
  const handleAddIngredient = () => {
    const defaultRm = availableRawMaterials[0];
    const newIng: FormulaIngredientItem = {
      name: defaultRm?.name || "",
      ratio_qty: 1,
      uom: defaultRm?.uom || "Liters (L)",
      raw_material_sku: defaultRm?.sku || "",
    };

    setSizeFormulas((prev) => {
      const existing = prev[activeSize] || { production_size: activeSize, retail_price: 0, ingredients: [] };
      return {
        ...prev,
        [activeSize]: {
          ...existing,
          ingredients: [...existing.ingredients, newIng],
        },
      };
    });
  };

  const handleRemoveIngredient = (index: number) => {
    setSizeFormulas((prev) => {
      const existing = prev[activeSize] || { production_size: activeSize, retail_price: 0, ingredients: [] };
      return {
        ...prev,
        [activeSize]: {
          ...existing,
          ingredients: existing.ingredients.filter((_, i) => i !== index),
        },
      };
    });
  };

  const handleUpdateIngredient = (index: number, field: keyof FormulaIngredientItem, value: any) => {
    setSizeFormulas((prev) => {
      const existing = prev[activeSize] || { production_size: activeSize, retail_price: 0, ingredients: [] };
      const updatedIngredients = existing.ingredients.map((ing, i) => {
        if (i === index) {
          const updated = { ...ing, [field]: value };
          if (field === "name") {
            const matched = availableRawMaterials.find(
              (rm) => rm.name.toLowerCase() === String(value).toLowerCase() || rm.sku.toLowerCase() === String(value).toLowerCase()
            );
            if (matched) {
              updated.raw_material_sku = matched.sku;
              if (matched.uom) updated.uom = matched.uom;
            }
          }
          return updated;
        }
        return ing;
      });

      return {
        ...prev,
        [activeSize]: {
          ...existing,
          ingredients: updatedIngredients,
        },
      };
    });
  };

  // Submit complete product & formulas
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      id: initialData?.id,
      code: code.trim(),
      product_name: productName.trim(),
      product_type: productType.trim(),
      product_class: productClass.trim(),
      final_product_name: computedFinalName,
      active_size: activeSize,
      size_formulas: sizeFormulas,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans text-slate-900">
      {/* ========================================================================= */}
      {/* 1. TOP PRODUCT INFORMATION SECTION (MATCHING SCREENSHOT VISUAL HIERARCHY) */}
      {/* ========================================================================= */}
      <div className="overflow-x-auto rounded-xl border border-blue-600 bg-white shadow-md">
        <table className="w-full min-w-[700px] border-collapse text-left">
          <thead>
            <tr className="bg-[#2563eb] text-white text-xs font-black uppercase tracking-wider divide-x divide-blue-500">
              <th className="py-2.5 px-3 w-[15%] text-center">CODE</th>
              <th className="py-2.5 px-3 w-[25%] text-center">PRODUCT NAME</th>
              <th className="py-2.5 px-3 w-[22%] text-center">TYPE</th>
              <th className="py-2.5 px-3 w-[18%] text-center">CLASS</th>
              <th className="py-2.5 px-3 w-[20%] text-center">FINAL PRODUCT NAME</th>
            </tr>
          </thead>
          <tbody>
            <tr className="divide-x divide-slate-200 bg-white text-xs font-semibold">
              {/* CODE */}
              <td className="p-2 align-middle">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="JRC-1012"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full py-1.5 px-2 font-mono font-bold text-center text-slate-900 border border-slate-300 rounded-md focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={handleAutoGenerateCode}
                    title="Auto-generate Code"
                    className="absolute right-1 text-slate-400 hover:text-blue-600 p-1"
                  >
                    <Wand2 className="w-3 h-3" />
                  </button>
                </div>
              </td>

              {/* PRODUCT NAME */}
              <td className="p-2 align-middle">
                <input
                  type="text"
                  required
                  placeholder="TERMITEX"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full py-1.5 px-2.5 font-extrabold text-slate-900 text-center uppercase tracking-wide border border-slate-300 rounded-md focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
                />
              </td>

              {/* TYPE */}
              <td className="p-2 align-middle">
                <ComboboxInput
                  value={productType}
                  onChange={(val) => setProductType(val)}
                  placeholder="Wood Preservative"
                  className="py-1.5 px-2.5 text-center font-bold text-slate-800 border border-slate-300 rounded-md focus:border-blue-600 focus:outline-none bg-slate-50/50"
                  options={COMMON_PRODUCT_TYPES}
                />
              </td>

              {/* CLASS (PILL DROPDOWN AS IN SCREENSHOT) */}
              <td className="p-2 align-middle text-center">
                <div className="relative inline-block w-full">
                  <select
                    value={productClass}
                    onChange={(e) => setProductClass(e.target.value)}
                    className="w-full py-1.5 px-3 bg-[#0d47a1] text-white font-extrabold rounded-full text-xs text-center appearance-none cursor-pointer hover:bg-[#1565c0] focus:ring-2 focus:ring-blue-400 focus:outline-none pr-7 shadow-xs"
                  >
                    <option value="Finished Product">Finished Product</option>
                    <option value="Raw Material">Raw Material</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Pest Control Supply">Pest Control Supply</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-white absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
                </div>
              </td>

              {/* FINAL PRODUCT NAME (AUTO-GENERATED & READ-ONLY) */}
              <td className="p-2 align-middle">
                <div
                  className="w-full py-1.5 px-2.5 bg-slate-100/90 border border-slate-300 rounded-md font-extrabold text-slate-800 text-center text-xs truncate"
                  title={computedFinalName}
                >
                  {computedFinalName}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* GOLD/AMBER SEPARATOR BAR (MATCHING SCREENSHOT VISUAL ACCENT)              */}
      {/* ========================================================================= */}
      <div className="w-full h-2.5 sm:h-3 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 border border-amber-500/80 shadow-xs" />

      {/* ========================================================================= */}
      {/* 2. FORMULA SECTION (5 LOGICAL COLUMNS: MATERIAL, QTY, UNIT, SIZE, PRICE) */}
      {/* ========================================================================= */}
      <div className="rounded-xl border-2 border-blue-600 bg-white overflow-hidden shadow-lg">
        {/* FORMULA BANNER HEADER */}
        <div className="bg-[#2563eb] text-white font-black text-xs sm:text-sm py-2 px-4 text-center uppercase tracking-widest border-b border-blue-700">
          FORMULA
        </div>

        {/* 5-COLUMN SPREADSHEET-STYLE TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-900 text-xs font-extrabold uppercase tracking-wider border-b-2 border-slate-300 divide-x divide-slate-200">
                <th className="py-2.5 px-3 w-[32%] text-center">MATERIAL</th>
                <th className="py-2.5 px-3 w-[16%] text-center">QTY./VOLUME</th>
                <th className="py-2.5 px-3 w-[18%] text-center">UNIT</th>
                <th className="py-2.5 px-3 w-[18%] text-center">PRODUCTION SIZE</th>
                <th className="py-2.5 px-3 w-[16%] text-center">RETAIL PRICE</th>
              </tr>
            </thead>
            <tbody>
              {currentFormula.ingredients.length === 0 ? (
                <tr className="divide-x divide-slate-200">
                  <td colSpan={3} className="p-6 text-center text-slate-400 font-semibold text-xs">
                    No materials added for <span className="font-bold text-blue-700">{activeSize}</span> yet. Click &quot;+ Add Material Row&quot; below.
                  </td>
                  {/* PRODUCTION SIZE CONTROL CELL */}
                  <td className="p-3 align-middle text-center bg-slate-50/50 border-b border-slate-200">
                    <div className="relative inline-block w-full max-w-[140px]">
                      <select
                        value={activeSize}
                        onChange={(e) => handleSelectSize(e.target.value)}
                        className="w-full py-1.5 px-3 bg-[#0d47a1] text-white font-black rounded-full text-xs text-center appearance-none cursor-pointer hover:bg-[#1565c0] focus:ring-2 focus:ring-blue-400 focus:outline-none pr-7 shadow-xs uppercase tracking-wide"
                      >
                        {SUPPORTED_PRODUCTION_SIZES.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-white absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
                    </div>
                  </td>
                  {/* RETAIL PRICE INPUT CELL */}
                  <td className="p-3 align-middle text-center bg-slate-50/50 border-b border-slate-200">
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-slate-500 font-bold text-xs">₱</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={currentFormula.retail_price || ""}
                        onChange={(e) => handleUpdateRetailPrice(Number(e.target.value))}
                        className="w-full py-1.5 pl-6 pr-2 font-mono font-black text-right text-slate-900 border border-slate-300 rounded-md focus:border-blue-600 focus:outline-none bg-white text-xs"
                      />
                    </div>
                  </td>
                </tr>
              ) : (
                currentFormula.ingredients.map((ing, idx) => {
                  const isFirstRow = idx === 0;
                  const rowCount = currentFormula.ingredients.length;

                  return (
                    <tr key={idx} className="divide-x divide-slate-200 border-b border-slate-200 hover:bg-blue-50/20 transition-colors">
                      {/* MATERIAL */}
                      <td className="p-2 align-middle">
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1">
                            <ComboboxInput
                              value={ing.name}
                              onChange={(val) => handleUpdateIngredient(idx, "name", val)}
                              placeholder="e.g. Dimethrin, Kerosene..."
                              className="py-1.5 px-2.5 font-bold text-xs text-slate-900 border border-slate-300 rounded-md focus:border-blue-600 focus:outline-none bg-white"
                              options={availableRawMaterials.map((rm) => ({
                                value: rm.name,
                                label: rm.name,
                                sublabel: rm.sku,
                              }))}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(idx)}
                            className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Remove material row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* QTY./VOLUME */}
                      <td className="p-2 align-middle">
                        <input
                          type="number"
                          step="0.001"
                          required
                          placeholder="0"
                          value={ing.ratio_qty || ""}
                          onChange={(e) => handleUpdateIngredient(idx, "ratio_qty", Number(e.target.value))}
                          className="w-full py-1.5 px-2.5 font-mono font-bold text-right text-slate-900 border border-slate-300 rounded-md focus:border-blue-600 focus:outline-none text-xs bg-white"
                        />
                      </td>

                      {/* UNIT */}
                      <td className="p-2 align-middle">
                        <ComboboxInput
                          value={ing.uom}
                          onChange={(val) => handleUpdateIngredient(idx, "uom", val)}
                          placeholder="Liters (L)"
                          className="py-1.5 px-2.5 font-semibold text-xs text-slate-800 border border-slate-300 rounded-md focus:border-blue-600 focus:outline-none bg-white"
                          options={INGREDIENT_UNITS}
                        />
                      </td>

                      {/* PRODUCTION SIZE (ROWSPAN FIRST CELL OR DISPLAY PER ROW) */}
                      {isFirstRow && (
                        <td
                          rowSpan={rowCount}
                          className="p-3 align-middle text-center bg-slate-50/70 border-l border-r border-slate-200"
                        >
                          <div className="space-y-2 max-w-[150px] mx-auto">
                            <div className="relative inline-block w-full">
                              <select
                                value={activeSize}
                                onChange={(e) => handleSelectSize(e.target.value)}
                                className="w-full py-1.5 px-3 bg-[#0d47a1] text-white font-black rounded-full text-xs text-center appearance-none cursor-pointer hover:bg-[#1565c0] focus:ring-2 focus:ring-blue-400 focus:outline-none pr-7 shadow-sm uppercase tracking-wider"
                              >
                                {SUPPORTED_PRODUCTION_SIZES.map((size) => (
                                  <option key={size} value={size}>
                                    {size}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 text-white absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
                            </div>
                            <span className="text-[10px] text-slate-500 font-semibold block leading-tight">
                              Formula applies to: <br /><strong className="text-blue-900">{activeSize}</strong>
                            </span>
                          </div>
                        </td>
                      )}

                      {/* RETAIL PRICE (ROWSPAN FIRST CELL OR DISPLAY PER ROW) */}
                      {isFirstRow && (
                        <td
                          rowSpan={rowCount}
                          className="p-3 align-middle text-center bg-slate-50/70 border-l border-slate-200"
                        >
                          <div className="space-y-1.5 max-w-[140px] mx-auto">
                            <div className="relative flex items-center">
                              <span className="absolute left-2.5 text-slate-500 font-bold text-xs">₱</span>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={currentFormula.retail_price || ""}
                                onChange={(e) => handleUpdateRetailPrice(Number(e.target.value))}
                                className="w-full py-1.5 pl-6 pr-2.5 font-mono font-black text-right text-blue-900 border border-slate-300 rounded-md focus:border-blue-600 focus:outline-none bg-white text-xs shadow-2xs"
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 font-semibold block">
                              Selling Price ({activeSize})
                            </span>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* BOTTOM FORMULA CONTROLS: ADD ROW & SIZE QUICK SWITCH TABS */}
        <div className="bg-slate-50 border-t border-slate-200 p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleAddIngredient}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 font-extrabold text-xs transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-blue-700" />
            <span>+ Add Material Row</span>
          </button>

          {/* Quick-toggle pill tabs for multiple sizes */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
            <span className="text-[11px] font-black text-slate-500 uppercase mr-1">Switch Size:</span>
            {SUPPORTED_PRODUCTION_SIZES.map((size) => {
              const isActive = activeSize === size;
              const hasDefinedFormula = sizeFormulas[size]?.ingredients?.length > 0;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSelectSize(size)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#0d47a1] text-white shadow-xs ring-2 ring-blue-300"
                      : hasDefinedFormula
                      ? "bg-blue-100 text-blue-900 hover:bg-blue-200 border border-blue-300"
                      : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-300"
                  }`}
                >
                  {size} {hasDefinedFormula && !isActive ? "•" : ""}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FOOTER ACTION CONTROLS (CANCEL / SAVE FINISHED PRODUCT)                */}
      {/* ========================================================================= */}
      <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-extrabold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <Check className="w-4 h-4 text-amber-300 stroke-[3]" />
          <span>{isSaving ? "Saving Finished Product..." : "Save Finished Product & Formula"}</span>
        </button>
      </div>
    </form>
  );
}
